'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Map as LeafletMap } from 'leaflet';
import L from 'leaflet';

interface MapContentProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number } | null;
}

const MapContent = ({
  onLocationSelect,
  selectedLocation,
}: MapContentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const marker = useRef<any | null>(null);
  const rectangle = useRef<any | null>(null);

  const updateMapMarkers = (lat: number, lng: number) => {
    if (!mapInstance.current) return;

    if (marker.current) marker.current.remove();
    if (rectangle.current) rectangle.current.remove();

    marker.current = L.marker([lat, lng]).addTo(mapInstance.current);

    rectangle.current = L.rectangle(
      [
        [lat - 0.5, lng - 0.5],
        [lat + 0.5, lng + 0.5],
      ],
      { color: 'red', weight: 2, fillOpacity: 0.1 },
    ).addTo(mapInstance.current);

    mapInstance.current.setView([lat, lng], 8);
  };

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    let isMapValid = true;

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        const markerIcon = (await import('leaflet/dist/images/marker-icon.png'))
          .default;
        const markerIcon2x = (
          await import('leaflet/dist/images/marker-icon-2x.png')
        ).default;
        const markerShadow = (
          await import('leaflet/dist/images/marker-shadow.png')
        ).default;

        if (!isMapValid || !mapRef.current) return;

        L.Icon.Default.mergeOptions({
          iconUrl: markerIcon.src,
          iconRetinaUrl: markerIcon2x.src,
          shadowUrl: markerShadow.src,
        });

        mapInstance.current = L.map(mapRef.current).setView([0, 0], 2);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors',
        }).addTo(mapInstance.current);

        mapInstance.current.on('click', ({ latlng: { lat, lng } }) => {
          onLocationSelect?.(lat, lng);
        });

        // If there's an initial location, show it
        if (selectedLocation) {
          updateMapMarkers(selectedLocation.lat, selectedLocation.lng);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    return () => {
      isMapValid = false;
      if (marker.current) marker.current.remove();
      if (rectangle.current) rectangle.current.remove();
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update markers when selectedLocation changes
  useEffect(() => {
    if (selectedLocation) {
      updateMapMarkers(selectedLocation.lat, selectedLocation.lng);
    }
  }, [selectedLocation]);

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden" ref={mapRef} />
  );
};

const TsunamiMap = dynamic(() => Promise.resolve(MapContent), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
      Cargando mapa...
    </div>
  ),
});

export default TsunamiMap;
