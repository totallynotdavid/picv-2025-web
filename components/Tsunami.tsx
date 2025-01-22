'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Map as LeafletMap } from 'leaflet';

const MapContent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const marker = useRef<any | null>(null);
  const rectangle = useRef<any | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Prevent multiple initializations
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    let isMapValid = true; // Flag to track component mount state

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

        // Fix for missing marker icons in Leaflet
        // https://github.com/PaulLeCam/react-leaflet/issues/808
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
          if (!mapInstance.current) return;

          if (marker.current) marker.current.remove();
          if (rectangle.current) rectangle.current.remove();

          marker.current = L.marker([lat, lng]).addTo(mapInstance.current);

          // Add new rectangle (50km buffer)
          // TODO: The rectangle should be calculated using the API data
          rectangle.current = L.rectangle(
            [
              [lat - 0.5, lng - 0.5],
              [lat + 0.5, lng + 0.5],
            ],
            { color: 'red', weight: 2, fillOpacity: 0.1 },
          ).addTo(mapInstance.current);

          mapInstance.current.setView([lat, lng], 8);
        });
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

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden" ref={mapRef} />
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
