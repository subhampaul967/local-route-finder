'use client';

import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { RouteDTO } from "@local/shared";
import "leaflet/dist/leaflet.css";

// Fix default icon URLs for Leaflet in Next.js environment.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DefaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconAnchor: [12, 41],
});
(L.Marker as any).prototype.options.icon = DefaultIcon;

interface Props {
  routes: RouteDTO[];
}

export const RouteMap: React.FC<Props> = ({ routes }) => {
  const first = routes[0];
  const center: [number, number] = [
    first.fromLocation.lat || 19.8762,
    first.fromLocation.lng || 75.3433,
  ];

  return (
    <div className="mt-3 h-72 overflow-hidden rounded-lg border border-slate-800">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {routes.map((route) => {
          const points: [number, number][] = [];
          points.push([route.fromLocation.lat, route.fromLocation.lng]);
          if (route.via) {
            for (const v of route.via) {
              points.push([v.lat, v.lng]);
            }
          }
          points.push([route.toLocation.lat, route.toLocation.lng]);

          return (
            <>
              <Polyline
                key={`poly-${route.id}`}
                positions={points}
                pathOptions={{ color: "#22c55e", weight: 4 }}
              />
              <Marker
                key={`from-${route.id}`}
                position={[route.fromLocation.lat, route.fromLocation.lng]}
              >
                <Popup>{route.fromLocation.name}</Popup>
              </Marker>
              <Marker
                key={`to-${route.id}`}
                position={[route.toLocation.lat, route.toLocation.lng]}
              >
                <Popup>{route.toLocation.name}</Popup>
              </Marker>
            </>
          );
        })}
      </MapContainer>
    </div>
  );
};
