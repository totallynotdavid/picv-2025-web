'use client';

import { MapMarkers } from '@/app/(tsunami)/map/markers';
import { MapContentProps } from '@/lib/types/tsunami';
import L from 'leaflet';
import dynamic from 'next/dynamic';
import { memo, useEffect, useRef } from 'react';

const LeafletCSS = () => (
  <link
    crossOrigin=""
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    rel="stylesheet"
  />
);

const MapContent = memo(
  ({ onLocationSelect, selectedLocation }: MapContentProps) => {
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<MapMarkers | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (typeof window === 'undefined' || mapRef.current) return;

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/markers/marker-icon-2x.png',
        iconUrl: '/markers/marker-icon.png',
        shadowUrl: '/markers/marker-shadow.png',
      });

      if (!containerRef.current) {
        containerRef.current = document.getElementById(
          'map-container',
        ) as HTMLDivElement;
      }

      if (!containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [20, 0],
        maxZoom: 18,
        minZoom: 2,
        zoom: 2,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      markersRef.current = new MapMarkers(map);

      map.on('click', (e) => onLocationSelect(e.latlng.lat, e.latlng.lng));

      mapRef.current = map;

      return () => {
        if (markersRef.current) {
          markersRef.current.destroy();
          markersRef.current = null;
        }

        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }, [onLocationSelect]);

    useEffect(() => {
      if (selectedLocation && mapRef.current && markersRef.current) {
        markersRef.current.updateMarkers(
          selectedLocation.lat,
          selectedLocation.lng,
        );

        mapRef.current.flyTo([selectedLocation.lat, selectedLocation.lng], 8, {
          duration: 1.5,
        });
      }
    }, [selectedLocation]);

    return (
      <>
        <LeafletCSS />
        <div
          className="w-full h-[600px] rounded-lg overflow-hidden"
          id="map-container"
        />
      </>
    );
  },
);

MapContent.displayName = 'MapContent';

export default dynamic(() => Promise.resolve(MapContent), {
  loading: () => (
    <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
      Cargando mapa...
    </div>
  ),
  ssr: false,
});
