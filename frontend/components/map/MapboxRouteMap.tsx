'use client';

import { useEffect, useRef } from 'react';
import type { RouteDTO } from "@local/shared";

// @ts-ignore
declare global {
  interface Window {
    mapboxgl: any;
  }
}

interface Props {
  routes: RouteDTO[];
}

export const MapboxRouteMap: React.FC<Props> = ({ routes }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainer.current || routes.length === 0) return;

    // Load Mapbox GL JS
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.3.1/mapbox-gl.js';
    script.async = true;
    script.onload = () => {
      if (!window.mapboxgl || !mapContainer.current) return;

      // Initialize Mapbox map
      const mapInstance = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [routes[0].fromLocation.lng || 75.3433, routes[0].fromLocation.lat || 19.8762],
        zoom: 12,
        accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      });

      mapRef.current = mapInstance;

      // Add routes to map
      routes.forEach((route) => {
        if (!route.fromLocation.lat || !route.fromLocation.lng || !route.toLocation.lat || !route.toLocation.lng) {
          console.log('Route missing coordinates:', route);
          return;
        }

        // Add route line
        mapInstance.addLayer({
          id: `route-${route.id}`,
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [route.fromLocation.lng, route.fromLocation.lat],
                  ...route.via?.map((v: any) => [v.lng || 0, v.lat || 0]) || [],
                  [route.toLocation.lng, route.toLocation.lat]
                ]
              }
            }
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 4
          }
        });

        // Create custom markers
        const createMarker = (color: string, text: string) => {
          const el = document.createElement('div');
          el.className = 'marker';
          el.style.backgroundColor = color;
          el.style.width = '12px';
          el.style.height = '12px';
          el.style.borderRadius = '50%';
          el.style.border = '2px solid white';
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          el.style.color = 'white';
          el.style.fontSize = '8px';
          el.style.fontWeight = 'bold';
          el.textContent = text;
          return el;
        };

        // From marker
        new window.mapboxgl.Marker({
          element: createMarker('#3b82f6', 'F'),
          anchor: 'bottom',
          offset: [0, 6]
        })
          .setLngLat([route.fromLocation.lng, route.fromLocation.lat])
          .addTo(mapInstance)
          .setPopup(new window.mapboxgl.Popup({ offset: 25 }).setHTML(`<strong>${route.fromLocation.name}</strong>`));

        // To marker
        new window.mapboxgl.Marker({
          element: createMarker('#ef4444', 'T'),
          anchor: 'bottom',
          offset: [0, 6]
        })
          .setLngLat([route.toLocation.lng, route.toLocation.lat])
          .addTo(mapInstance)
          .setPopup(new window.mapboxgl.Popup({ offset: 25 }).setHTML(`<strong>${route.toLocation.name}</strong>`));
      });

      // Fit map to show all routes
      const bounds = new window.mapboxgl.LngLatBounds();
      routes.forEach(route => {
        if (route.fromLocation.lat && route.fromLocation.lng) {
          bounds.extend([route.fromLocation.lng, route.fromLocation.lat]);
        }
        if (route.toLocation.lat && route.toLocation.lng) {
          bounds.extend([route.toLocation.lng, route.toLocation.lat]);
        }
      });
      
      if (bounds.isEmpty()) {
        // Fallback to first route
        mapInstance.setCenter([routes[0].fromLocation.lng || 75.3433, routes[0].fromLocation.lat || 19.8762]);
      } else {
        mapInstance.fitBounds(bounds, { padding: 50 });
      }
    };

    document.head.appendChild(script);
  }, [routes]);

  return (
    <div className="mt-3 h-72 overflow-hidden rounded-lg border border-slate-800">
      <div 
        ref={mapContainer} 
        className="h-full w-full"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
};
