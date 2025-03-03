'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
import { MapContentProps } from '@/lib/types/map';
import { useEffect, useRef } from 'react';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  ZoomControl,
} from 'react-leaflet';

const DEFAULT_POSITION: [number, number] = [-20.5, -70.5];

const TsunamiMap = ({
  onLocationSelect,
  selectedLocation,
}: MapContentProps) => {
  const position = selectedLocation
    ? [selectedLocation.lat, selectedLocation.lng]
    : DEFAULT_POSITION;

  const prevLocationRef = useRef(selectedLocation);

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden">
      <MapContainer
        center={position as [number, number]}
        maxZoom={18}
        minZoom={2}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        zoom={4}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ZoomControl position="topright" />
        <MapClickHandler onLocationSelect={onLocationSelect} />
        {selectedLocation && (
          <>
            <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
            <LocationUpdater
              prevLocation={prevLocationRef.current}
              selectedLocation={selectedLocation}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};

function LocationUpdater({
  prevLocation,
  selectedLocation,
}: {
  prevLocation?: { lat: number; lng: number };
  selectedLocation: { lat: number; lng: number };
}) {
  const map = useMap();

  useEffect(() => {
    // Only update if location has actually changed
    if (
      !prevLocation ||
      prevLocation.lat !== selectedLocation.lat ||
      prevLocation.lng !== selectedLocation.lng
    ) {
      map.setView([selectedLocation.lat, selectedLocation.lng], 8);
    }
  }, [map, selectedLocation, prevLocation]);

  return null;
}

function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    function handleClick(e: any) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onLocationSelect]);

  return null;
}

export default TsunamiMap;
