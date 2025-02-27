'use client';
import { useCallback, useRef, useState, useEffect } from 'react';

export const useMap = (initialCenter?: { lat: number; lng: number }) => {
  const [leaflet, setLeaflet] = useState<any>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<{ marker?: any; area?: any }>({});

  // Dynamically import Leaflet after mount
  useEffect(() => {
    import('leaflet').then((L) => {
      setLeaflet(L);
    });
  }, []);

  const initialize = useCallback(
    (container: HTMLDivElement) => {
      if (!leaflet) return;
      const map = leaflet.map(container, {
        center: initialCenter || [0, 0],
        zoom: initialCenter ? 8 : 2,
        zoomControl: false,
      });
      leaflet.control.zoom({ position: 'topright' }).addTo(map);
      mapRef.current = map;
      return map;
    },
    [leaflet, initialCenter],
  );

  const updateMarkers = useCallback(
    (lat: number, lng: number) => {
      if (!leaflet || !mapRef.current) return;
      markersRef.current.marker?.remove();
      markersRef.current.area?.remove();

      const marker = leaflet.marker([lat, lng]).addTo(mapRef.current);
      const bounds = leaflet.latLngBounds(
        [lat - 0.5, lng - 0.5],
        [lat + 0.5, lng + 0.5],
      );
      const area = leaflet
        .rectangle(bounds, {
          color: '#2563eb',
          weight: 2,
          fillOpacity: 0.1,
        })
        .addTo(mapRef.current);

      markersRef.current = { marker, area };
      mapRef.current.flyTo([lat, lng], 8, { duration: 1 });
    },
    [leaflet],
  );

  return { initialize, updateMarkers, mapRef };
};
