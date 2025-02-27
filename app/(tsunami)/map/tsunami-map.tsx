'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import { MapMarkers } from '@/app/(tsunami)/map/markers';

const LeafletCSS = () => (
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossOrigin=""
  />
);

interface MapContentProps {
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLocation: { lat: number; lng: number } | null;
}

const MapContent = ({ onLocationSelect, selectedLocation }: MapContentProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markers = useRef<MapMarkers | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeMap = () => {
      const container = document.createElement('div');
      container.className = 'h-[600px] w-full rounded-lg';
      
      const map = L.map(container, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);
      markers.current = new MapMarkers(map);

      map.on('click', (e) => onLocationSelect(e.latlng.lat, e.latlng.lng));
      mapRef.current = map;

      return container;
    };

    const mapContainer = initializeMap();
    document.getElementById('map-container')?.appendChild(mapContainer);

    return () => {
      mapRef.current?.remove();
      document.getElementById('map-container')?.removeChild(mapContainer);
    };
  }, [onLocationSelect]);

  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      markers.current?.updateMarkers(selectedLocation.lat, selectedLocation.lng);
      mapRef.current.flyTo([selectedLocation.lat, selectedLocation.lng], 8, {
        duration: 1.5,
      });
    }
  }, [selectedLocation]);

  return (
    <>
      <LeafletCSS />
      <div id="map-container" className="w-full h-[600px] rounded-lg overflow-hidden" />
    </>
  );
};

export default dynamic(() => Promise.resolve(MapContent), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
      Cargando mapa...
    </div>
  ),
});