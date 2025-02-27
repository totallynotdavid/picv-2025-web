import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Alert, AlertTitle, AlertDescription } from '@/app/components/ui/alert';
import { CalculationResponse } from '@/app/utils/types';
import { getRiskLevelClass } from '@/app/utils/utils';

interface TsunamiResultsProps {
  result: CalculationResponse | null;
}

const TsunamiResults = ({ result }: TsunamiResultsProps) => {
  if (!result) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-purple-800 mb-2">
          Paso 3: Resultados del Tsunami
        </h2>
        <p className="text-purple-600">
          Resultados finales de la simulación del tsunami.
        </p>
      </div>

      <Alert className={getRiskLevelClass(result.result.risk_level)}>
        <AlertTitle className="text-lg font-bold">
          Resultados de la Simulación
        </AlertTitle>
        <AlertDescription className="mt-2">
          <div className="space-y-2">
            <p className="flex items-center">
              <span className="font-semibold mr-2">Altura estimada:</span>
              {result.result.estimated_height} metros
            </p>
            <p className="flex items-center">
              <span className="font-semibold mr-2">Tiempo de llegada:</span>
              {format(
                new Date(result.result.arrival_time),
                "d 'de' MMMM 'a las' HH:mm",
                { locale: es },
              )}
            </p>
            <p className="flex items-center">
              <span className="font-semibold mr-2">Nivel de riesgo:</span>
              <span
                className={`px-2 py-1 rounded-full ${getRiskLevelClass(
                  result.result.risk_level,
                )}`}
              >
                {result.result.risk_level}
              </span>
            </p>
            <p className="flex items-center text-sm text-gray-600">
              <span className="font-semibold mr-2">Tiempo de cálculo:</span>
              {(result.calculation_time_ms / 1000).toFixed(2)} segundos
            </p>
          </div>
        </AlertDescription>
      </Alert>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-md font-semibold text-blue-800 mb-2">
          Recomendaciones de Seguridad
        </h3>
        <ul className="list-disc list-inside space-y-2 text-blue-700">
          <li>Manténgase alejado de las zonas costeras</li>
          <li>Siga las instrucciones de las autoridades locales</li>
          <li>Esté atento a las alertas y actualizaciones oficiales</li>
          <li>Tenga preparado un plan de evacuación</li>
        </ul>
      </div>
    </div>
  );
};

export default TsunamiResults;
