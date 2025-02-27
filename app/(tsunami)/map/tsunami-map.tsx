'use client';

import { useMap } from '../hooks/use-map';
import { useEffect, useRef } from 'react';
import { Location } from '@/lib/types/tsunami';

const TsunamiMap = ({
  selectedLocation,
  onLocationSelect,
}: {
  selectedLocation?: Location | null;
  onLocationSelect: (lat: number, lng: number) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { initializeMap, updateMarkers } = useMap(
    selectedLocation || undefined,
  );

  useEffect(() => {
    if (containerRef.current && !containerRef.current.children.length) {
      const map = initializeMap(containerRef.current);
      map.on('click', (e) => onLocationSelect(e.latlng.lat, e.latlng.lng));
    }
  }, [initializeMap, onLocationSelect]);

  useEffect(() => {
    if (selectedLocation) {
      updateMarkers(selectedLocation);
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

export default TsunamiMap;
