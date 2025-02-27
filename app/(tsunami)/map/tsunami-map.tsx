'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Map as LeafletMap, Layer, LatLngBounds } from 'leaflet';
import LeafletCSS from '@/app/_components/ui/leaflet-css';

interface MapContentProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number } | null;
}

interface LeafletElements {
  marker: Layer | null;
  rectangle: Layer | null;
}

const MapContent = ({
  onLocationSelect,
  selectedLocation,
}: MapContentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const leafletElements = useRef<LeafletElements>({
    marker: null,
    rectangle: null,
  });

  const clearMapElements = () => {
    if (leafletElements.current.marker) {
      leafletElements.current.marker.remove();
      leafletElements.current.marker = null;
    }
    if (leafletElements.current.rectangle) {
      leafletElements.current.rectangle.remove();
      leafletElements.current.rectangle = null;
    }
  };

  const updateMapMarkers = async (lat: number, lng: number) => {
    if (!mapInstance.current) return;

    try {
      const L = (await import('leaflet')).default;

      // Clear existing markers
      clearMapElements();

      // Add new marker
      leafletElements.current.marker = L.marker([lat, lng]).addTo(
        mapInstance.current,
      );

      // Add new rectangle
      const bounds: LatLngBounds = L.latLngBounds(
        [lat - 0.5, lng - 0.5],
        [lat + 0.5, lng + 0.5],
      );

      leafletElements.current.rectangle = L.rectangle(bounds, {
        color: '#2563eb',
        weight: 2,
        fillOpacity: 0.1,
        opacity: 0.8,
      }).addTo(mapInstance.current);

      mapInstance.current.flyTo([lat, lng], 8, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    } catch (error) {
      console.error('Error updating map markers:', error);
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Cleanup existing map instance
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

        // Configure default marker icon
        L.Icon.Default.mergeOptions({
          iconUrl: markerIcon.src,
          iconRetinaUrl: markerIcon2x.src,
          shadowUrl: markerShadow.src,
        });

        mapInstance.current = L.map(mapRef.current, {
          center: [20, 0],
          zoom: 2,
          minZoom: 2,
          maxZoom: 18,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors',
        }).addTo(mapInstance.current);

        mapInstance.current.on('click', (e) => {
          const { lat, lng } = e.latlng;
          onLocationSelect?.(lat, lng);
        });

        if (
          selectedLocation &&
          (selectedLocation.lat !== 0 || selectedLocation.lng !== 0)
        ) {
          updateMapMarkers(selectedLocation.lat, selectedLocation.lng);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    return () => {
      isMapValid = false;
      clearMapElements();
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update markers when selected location changes
  useEffect(() => {
    if (
      selectedLocation &&
      (selectedLocation.lat !== 0 || selectedLocation.lng !== 0)
    ) {
      updateMapMarkers(selectedLocation.lat, selectedLocation.lng);
    }
  }, [selectedLocation]);

  return (
    <>
      <LeafletCSS />
      <div
        className="w-full h-[600px] rounded-lg overflow-hidden"
        ref={mapRef}
      />
    </>
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
