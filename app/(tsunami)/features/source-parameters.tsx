import { SourceParameters as SourceParametersType } from '@/app/utils/types';

interface SourceParametersProps {
  parameters: SourceParametersType | null;
}

const SourceParameters = ({ parameters }: SourceParametersProps) => {
  if (!parameters) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-green-800 mb-2">
          Paso 2: Parámetros de la Fuente
        </h2>
        <p className="text-green-600">
          Revisión de los parámetros calculados para la fuente sísmica.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg shadow">
        <div className="space-y-2">
          <p className="font-semibold">Largo:</p>
          <p>{parameters.Largo.toFixed(2)} km</p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold">Ancho:</p>
          <p>{parameters.Ancho.toFixed(2)} km</p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold">Dislocación:</p>
          <p>{parameters.Dislocación.toFixed(2)} m</p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold">Momento sísmico:</p>
          <p>{parameters.Momento_sísmico.toFixed(2)}</p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold">Latitud del epicentro:</p>
          <p>{parameters.lat0.toFixed(4)}°</p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold">Longitud del epicentro:</p>
          <p>{parameters.lon0.toFixed(4)}°</p>
        </div>
      </div>
    </div>
  );
};

export default SourceParameters;
