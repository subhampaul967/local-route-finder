'use client';

import { useEffect, useRef } from 'react';
import type { RouteDTO } from "@local/shared";

interface Props {
  routes: RouteDTO[];
}

declare global {
  interface Window {
    google: any;
  }
}

const GoogleRouteMap: React.FC<Props> = ({ routes }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.google || routes.length === 0) return;

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (!mapRef.current) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: {
          lat: routes[0].fromLocation.lat || 19.8762,
          lng: routes[0].fromLocation.lng || 75.3433,
        },
        zoom: 12,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      // Draw routes on map
      routes.forEach((route) => {
        if (!route.fromLocation.lat || !route.fromLocation.lng || !route.toLocation.lat || !route.toLocation.lng) {
          console.log('Route missing coordinates:', route);
          return;
        }

        // Add markers for from and to locations
        const fromMarker = new window.google.maps.Marker({
          position: {
            lat: route.fromLocation.lat,
            lng: route.fromLocation.lng,
          },
          map: map,
          title: route.fromLocation.name,
          label: 'F',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#3b82f6',
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        const toMarker = new window.google.maps.Marker({
          position: {
            lat: route.toLocation.lat,
            lng: route.toLocation.lng,
          },
          map: map,
          title: route.toLocation.name,
          label: 'T',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#ef4444',
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        // Add info windows
        const fromInfoWindow = new window.google.maps.InfoWindow({
          content: `<div style="padding: 8px;"><strong>${route.fromLocation.name}</strong><br>From</div>`,
        });

        const toInfoWindow = new window.google.maps.InfoWindow({
          content: `<div style="padding: 8px;"><strong>${route.toLocation.name}</strong><br>To</div>`,
        });

        fromMarker.addListener('click', () => {
          fromInfoWindow.open(map, fromMarker);
        });

        toMarker.addListener('click', () => {
          toInfoWindow.open(map, toMarker);
        });

        // Draw route line
        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          draggable: true,
          panel: null,
        });

        const request = {
          origin: {
            lat: route.fromLocation.lat,
            lng: route.fromLocation.lng,
          },
          destination: {
            lat: route.toLocation.lat,
            lng: route.toLocation.lng,
          },
          travelMode: window.google.maps.TravelMode.DRIVING,
        };

        directionsService.route(request, (result: any, status: any) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
          }
        });
      });

      // Fit map to show all routes
      const bounds = new window.google.maps.LatLngBounds();
      routes.forEach(route => {
        if (route.fromLocation.lat && route.fromLocation.lng) {
          bounds.extend({
            lat: route.fromLocation.lat,
            lng: route.fromLocation.lng,
          });
        }
        if (route.toLocation.lat && route.toLocation.lng) {
          bounds.extend({
            lat: route.toLocation.lat,
            lng: route.toLocation.lng,
          });
        }
      });
      
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
      }
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [routes]);

  if (!routes || routes.length === 0) {
    return (
      <div className="mt-3 h-72 overflow-hidden rounded-lg border border-slate-800 flex items-center justify-center text-slate-400">
        No routes to display
      </div>
    );
  }

  return (
    <div className="mt-3 h-72 overflow-hidden rounded-lg border border-slate-800">
      <div 
        ref={mapRef} 
        className="h-full w-full"
        style={{ height: '300px' }}
      />
    </div>
  );
};

export default GoogleRouteMap;
