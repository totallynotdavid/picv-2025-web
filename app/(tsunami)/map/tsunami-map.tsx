'use client';

import { memo, useEffect, useState } from 'react';
import { MapContentProps } from '@/lib/types/map';

const MapContent = memo(
  ({ onLocationSelect, selectedLocation }: MapContentProps) => {
    const [LeafletComponents, setLeafletComponents] = useState<null | {
      MapContainer: any;
      Marker: any;
      TileLayer: any;
      useMap: any;
      ZoomControl: any;
    }>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);

      if (typeof window === 'undefined') return;

      (async () => {
        const { MapContainer, Marker, TileLayer, useMap, ZoomControl } =
          await import('react-leaflet');
        const L = await import('leaflet');

        L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/markers/marker-icon-2x.png',
          iconUrl: '/markers/marker-icon.png',
          shadowUrl: '/markers/marker-shadow.png',
        });

        setLeafletComponents({
          MapContainer,
          Marker,
          TileLayer,
          useMap,
          ZoomControl,
        });
      })();
    }, []);

    if (!isClient || !LeafletComponents) {
      return (
        <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
          Cargando mapa...
        </div>
      );
    }

    const { MapContainer, Marker, TileLayer, useMap, ZoomControl } =
      LeafletComponents;

    const MapClickHandler = ({
      onLocationSelect,
    }: {
      onLocationSelect: (lat: number, lng: number) => void;
    }) => {
      const map = useMap();
      useEffect(() => {
        const handleMapClick = (e: any) => {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        };
        map.on('click', handleMapClick);
        return () => {
          map.off('click', handleMapClick);
        };
      }, [map, onLocationSelect]);
      return null;
    };

    const FlyToLocation = ({
      selectedLocation,
    }: {
      selectedLocation: { lat: number; lng: number };
    }) => {
      const map = useMap();
      useEffect(() => {
        if (selectedLocation) {
          map.flyTo([selectedLocation.lat, selectedLocation.lng], 8, {
            duration: 1.5,
          });
        }
      }, [map, selectedLocation]);
      return null;
    };

    return (
      <div className="w-full h-[600px] rounded-lg overflow-hidden">
        <MapContainer
          center={[20, 0]}
          maxZoom={18}
          minZoom={2}
          style={{ height: '100%', width: '100%' }}
          zoom={2}
          zoomControl={false}
        >
          <TileLayer
            maxZoom={19}
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="topright" />
          <MapClickHandler onLocationSelect={onLocationSelect} />
          {selectedLocation && (
            <>
              <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
              <FlyToLocation selectedLocation={selectedLocation} />
            </>
          )}
        </MapContainer>
      </div>
    );
  },
);

MapContent.displayName = 'MapContent';

export default MapContent;
