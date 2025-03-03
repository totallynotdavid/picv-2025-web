'use client';

import { FormInput } from '@/app/(tsunami)/form/form-input';

export const InitialForm = () => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">
          Paso 1: Parámetros iniciales
        </h2>
        <p className="text-blue-600">
          Ingrese los datos del evento sísmico o seleccione una ubicación en el
          mapa.
        </p>
      </div>

      <div className="space-y-6">
        <FormInput
          label="Magnitud (Mw)"
          name="magnitude"
          placeholder="Mínimo 6.5 Mw"
          step="0.1"
          transform={parseFloat}
          type="number"
        />

        <FormInput
          label="Profundidad (km)"
          name="depth"
          placeholder="Profundidad en kilómetros"
          step="0.1"
          transform={parseFloat}
          type="number"
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Latitud"
            name="latitude"
            placeholder="-90 a 90"
            step="0.1"
            transform={parseFloat}
            type="number"
          />
          <FormInput
            label="Longitud"
            name="longitude"
            placeholder="-180 a 180"
            step="0.1"
            transform={parseFloat}
            type="number"
          />
        </div>

        <FormInput
          label="Fecha y hora del evento"
          name="datetime"
          transform={(v) => new Date(v)}
          type="datetime-local"
        />
      </div>
    </div>
  );
};
