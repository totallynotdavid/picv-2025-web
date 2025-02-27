'use client';

import { useCallback, useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapMarkers } from '@/app/(tsunami)/map/markers';
import { config } from '@/lib/config';

export const MapContent = ({
  selectedLocation,
  onLocationSelect,
}: {
  selectedLocation?: Tsunami.Location | null;
  onLocationSelect: (lat: number, lng: number) => void;
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<MapMarkers | null>(null);

  const initializeMap = useCallback((container: HTMLDivElement) => {
    const map = L.map(container, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
    });

    L.tileLayer(config.NEXT_PUBLIC_MAP_TILE_URL, {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);
    markersRef.current = new MapMarkers(map);

    map.on('click', (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    });

    return map;
  }, [onLocationSelect]);

  useEffect(() => {
    const container = document.createElement('div');
    container.className = 'h-[600px] w-full rounded-lg';
    const map = initializeMap(container);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [initializeMap]);

  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      markersRef.current?.updateMarkers(
        selectedLocation.lat,
        selectedLocation.lng
      );
      mapRef.current.flyTo([selectedLocation.lat, selectedLocation.lng], 8, {
        duration: 1.5,
      });
    }
  }, [selectedLocation]);

  return <div ref={(el) => el?.appendChild(mapRef.current?.getContainer()!)} />;
};