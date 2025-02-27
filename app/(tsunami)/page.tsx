'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { TsunamiForm } from '@/app/(tsunami)/form/tsunami-form';
import TsunamiMap from '@/app/(tsunami)/map/tsunami-map';
import { Toaster } from 'react-hot-toast';
import { Location } from '@/lib/types/tsunami';

export default function Page() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-center items-center flex-col w-full lg:p-0 p-4 mb-0"
    >
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
        <div className="col-span-1">
          <TsunamiForm
            selectedLocation={selectedLocation}
            onLocationUpdate={setSelectedLocation}
          />
        </div>

        <div className="col-span-1">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col justify-center relative h-auto items-center bg-gray-50 rounded-lg p-4"
          >
            <TsunamiMap
              onLocationSelect={(lat, lng) => setSelectedLocation({ lat, lng })}
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
