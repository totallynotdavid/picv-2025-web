import { useCallback, useRef, useState } from 'react';
import L from 'leaflet';
import { config } from '@/lib/config';

type Location = { lat: number; lng: number };

export const useMap = (initialLocation?: Location) => {
  const mapRef = useRef<L.Map | null>(null);
  const [markers, setMarkers] = useState<{
    main?: L.Marker;
    area?: L.Rectangle;
  }>({});

  const initializeMap = useCallback(
    (container: HTMLDivElement) => {
      const map = L.map(container, {
        center: initialLocation || [20, 0],
        zoom: initialLocation ? 8 : 2,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: false,
      });

      L.tileLayer(config.NEXT_PUBLIC_MAP_TILE_URL, {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);
      return map;
    },
    [initialLocation],
  );

  const updateMarkers = useCallback(
    (location: Location) => {
      if (!mapRef.current) return;

      // Clear existing markers
      markers.main?.remove();
      markers.area?.remove();

      // Create new markers
      const newMarker = L.marker([location.lat, location.lng]).addTo(
        mapRef.current,
      );
      const bounds = L.latLngBounds(
        [location.lat - 0.5, location.lng - 0.5],
        [location.lat + 0.5, location.lng + 0.5],
      );
      const newArea = L.rectangle(bounds, {
        color: '#2563eb',
        weight: 2,
        fillOpacity: 0.1,
      }).addTo(mapRef.current);

      setMarkers({ main: newMarker, area: newArea });
      mapRef.current.flyTo([location.lat, location.lng], 8, { duration: 1.5 });
    },
    [markers],
  );

  return { initializeMap, updateMarkers, mapRef };
};
