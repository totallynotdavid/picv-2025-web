'use client';

import { TsunamiForm } from '@/app/(tsunami)/form/tsunami-form';
import TsunamiMap from '@/app/(tsunami)/map/tsunami-map';
import { Location } from '@/lib/types/tsunami';
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { Toaster } from 'react-hot-toast';

export default function TsunamiPage() {
  const [selectedLocation, setSelectedLocation] = useState<Location>({
    lat: -20.5,
    lng: -70.5,
  });

  const handleLocationUpdate = useCallback((location: Location) => {
    setSelectedLocation(location);
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  }, []);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="flex justify-center items-center flex-col w-full lg:p-0 p-4 mb-0"
      initial={{ opacity: 0 }}
    >
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
        <div className="col-span-1">
          <TsunamiForm
            onLocationUpdate={handleLocationUpdate}
            selectedLocation={selectedLocation}
          />
        </div>

        <div className="col-span-1">
          <motion.div
            animate={{ opacity: 1 }}
            className="flex flex-col justify-center relative h-auto items-center bg-gray-50 rounded-lg p-4"
            initial={{ opacity: 0 }}
          >
            <TsunamiMap
              onLocationSelect={handleMapClick}
              selectedLocation={selectedLocation}
            />
            <p className="text-sm text-gray-600 mt-2 text-center">
              Haga clic en el mapa para seleccionar la ubicación del epicentro
            </p>
          </motion.div>
        </div>
      </div>
      <Toaster position="top-center" />
    </motion.div>
  );
}
