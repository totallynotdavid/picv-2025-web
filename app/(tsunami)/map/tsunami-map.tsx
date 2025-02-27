'use client';

import { useEffect, useRef } from 'react';
import { useMap } from '@/app/(tsunami)/hooks/use-map';

export const TsunamiMap = ({
  selectedLocation,
  onLocationSelect,
}: {
  selectedLocation?: { lat: number; lng: number } | null;
  onLocationSelect: (lat: number, lng: number) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { initialize, updateMarkers, mapRef } = useMap();

  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      const map = initialize(containerRef.current);
      map.on('click', (e) => onLocationSelect(e.latlng.lat, e.latlng.lng));
    }
  }, [initialize, onLocationSelect]);

  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      updateMarkers(selectedLocation.lat, selectedLocation.lng);
    }
  }, [selectedLocation, updateMarkers]);

  return (
    <div className="h-[600px] w-full rounded-lg" ref={containerRef}>
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        Cargando mapa...
      </div>
    </div>
  );
};
