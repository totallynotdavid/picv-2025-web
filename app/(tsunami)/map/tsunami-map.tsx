'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Location } from '../types';

// Component for loading Leaflet CSS
const LeafletCSS = () => {
  return (
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      crossOrigin=""
    />
  );
};

interface MapContentProps {
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLocation: Location | null;
}

const MapContent = ({
  onLocationSelect,
  selectedLocation,
}: MapContentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [leaflet, setLeaflet] = useState<any>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<{
    marker: any | null;
    rectangle: any | null;
  }>({
    marker: null,
    rectangle: null,
  });

  // Initialize Leaflet
  useEffect(() => {
    import('leaflet').then((L) => {
      setLeaflet(L.default);
    });
  }, []);

  // Clear map elements
  const clearMapElements = useCallback(() => {
    if (markers.current.marker) {
      markers.current.marker.remove();
      markers.current.marker = null;
    }
    if (markers.current.rectangle) {
      markers.current.rectangle.remove();
      markers.current.rectangle = null;
    }
  }, []);

  // Update map markers
  const updateMapMarkers = useCallback(
    (lat: number, lng: number) => {
      if (!mapInstance.current || !leaflet) return;

      // Clear existing markers
      clearMapElements();

      // Add new marker
      markers.current.marker = leaflet
        .marker([lat, lng])
        .addTo(mapInstance.current);

      // Add new rectangle
      const bounds = leaflet.latLngBounds(
        [lat - 0.5, lng - 0.5],
        [lat + 0.5, lng + 0.5],
      );

      markers.current.rectangle = leaflet
        .rectangle(bounds, {
          color: '#2563eb',
          weight: 2,
          fillOpacity: 0.1,
          opacity: 0.8,
        })
        .addTo(mapInstance.current);

      // Fly to the location
      mapInstance.current.flyTo([lat, lng], 8, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    },
    [leaflet, clearMapElements],
  );

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !leaflet) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
    }

    // Initialize map
    mapInstance.current = leaflet.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
    });

    // Add tile layer
    leaflet
      .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      })
      .addTo(mapInstance.current);

    // Add zoom control
    leaflet.control.zoom({ position: 'topright' }).addTo(mapInstance.current);

    // Set up click handler
    mapInstance.current.on('click', (e: any) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    });

    // Clean up on unmount
    return () => {
      clearMapElements();
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [leaflet, onLocationSelect, clearMapElements]);

  // Update markers when selected location changes
  useEffect(() => {
    if (
      selectedLocation &&
      leaflet &&
      mapInstance.current &&
      (selectedLocation.lat !== 0 || selectedLocation.lng !== 0)
    ) {
      updateMapMarkers(selectedLocation.lat, selectedLocation.lng);
    }
  }, [selectedLocation, updateMapMarkers, leaflet]);

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

// Use dynamic import to load the map on the client side
const TsunamiMap = dynamic(() => Promise.resolve(MapContent), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
      Cargando mapa...
    </div>
  ),
});

export default TsunamiMap;
