import { useCallback, useRef } from 'react';
import L from 'leaflet';

export const useMap = (initialCenter?: { lat: number; lng: number }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{
    marker?: L.Marker;
    area?: L.Rectangle;
  }>({});

  const initialize = useCallback(
    (container: HTMLDivElement) => {
      const map = L.map(container, {
        center: initialCenter || [0, 0],
        zoom: initialCenter ? 8 : 2,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);
      return map;
    },
    [initialCenter],
  );

  const updateMarkers = useCallback((lat: number, lng: number) => {
    if (!mapRef.current) return;

    markersRef.current.marker?.remove();
    markersRef.current.area?.remove();

    const marker = L.marker([lat, lng]).addTo(mapRef.current);
    const bounds = L.latLngBounds(
      [lat - 0.5, lng - 0.5],
      [lat + 0.5, lng + 0.5],
    );
    const area = L.rectangle(bounds, {
      color: '#2563eb',
      weight: 2,
      fillOpacity: 0.1,
    }).addTo(mapRef.current);

    markersRef.current = { marker, area };
    mapRef.current.flyTo([lat, lng], 8, { duration: 1 });
  }, []);

  return { initialize, updateMarkers, mapRef };
};
