'use client';

import dynamic from 'next/dynamic';
const MapContent = dynamic(
  () => import('@/app/(tsunami)/map/map-content').then((mod) => mod.MapContent),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        Cargando mapa...
      </div>
    ),
  },
);

export const TsunamiMap = (props: {
  selectedLocation?: Tsunami.Location | null;
  onLocationSelect: (lat: number, lng: number) => void;
}) => <MapContent {...props} />;
