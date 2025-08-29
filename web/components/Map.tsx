'use client';
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

function FlyOnChange({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  const prev = useRef<[number, number] | null>(null);
  useEffect(() => {
    const next: [number, number] = [lat, lon];
    if (!prev.current) {
      map.setView(next, 10);
      prev.current = next;
      return;
    }
    // Zoom out slightly then fly in
    map.setView(prev.current, 3, { animate: true });
    setTimeout(() => {
      map.flyTo(next, 10, { duration: 1.3 });
      prev.current = next;
    }, 200);
  }, [lat, lon, map]);
  return null;
}

export function MapView({ lat, lon }: { lat?: number; lon?: number }) {
  if (lat == null || lon == null) return <div className="w-full h-full flex items-center justify-center text-sm">No location</div>;
  const position: [number, number] = [lat, lon];
  const icon = L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconSize: [25,41], iconAnchor:[12,41] });
  return (
    <MapContainer center={position} zoom={10} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FlyOnChange lat={lat} lon={lon} />
      <Marker position={position} icon={icon}>
        <Popup>{lat}, {lon}</Popup>
      </Marker>
    </MapContainer>
  );
}
