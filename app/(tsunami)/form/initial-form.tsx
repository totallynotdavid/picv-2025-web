import { Form } from '@/app/_components/ui/templates/form';
import { InitialFormProps } from '@/lib/types/form';
import { FormInput } from '@/app/(tsunami)/form/form-input';

export const InitialForm = ({ form }: InitialFormProps) => (
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

    <Form {...form}>
      <form className="space-y-6">
        <FormInput
          name="magnitude"
          label="Magnitud (Mw)"
          type="number"
          step="0.1"
          placeholder="Mínimo 6.5 Mw"
          transform={parseFloat}
        />

        <FormInput
          name="depth"
          label="Profundidad (km)"
          type="number"
          step="0.1"
          placeholder="Profundidad en kilómetros"
          transform={parseFloat}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            name="latitude"
            label="Latitud"
            type="number"
            step="0.1"
            placeholder="-90 a 90"
            transform={parseFloat}
          />
          <FormInput
            name="longitude"
            label="Longitud"
            type="number"
            step="0.1"
            placeholder="-180 a 180"
            transform={parseFloat}
          />
        </div>

        <FormInput
          name="datetime"
          label="Fecha y hora del evento"
          type="datetime-local"
          transform={(v) => new Date(v)}
        />
      </form>
    </Form>
  </div>
);
