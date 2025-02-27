import { Progress } from '@/app/_components/ui/templates/progress';
import { formatDuration } from '@/lib/utils/formatters';

interface ProgressIndicatorProps {
  stage:
    | 'idle'
    | 'calculating'
    | 'travelTimes'
    | 'processing'
    | 'complete'
    | 'error';
  progress: number;
  estimatedTimeRemaining: number | null;
}

const stageMessages = {
  calculating: 'Calculando parámetros iniciales...',
  travelTimes: 'Calculando tiempos de viaje del tsunami...',
  processing: 'Ejecutando simulación TSDHN...',
  complete: 'Simulación completada',
  error: 'Error en la simulación',
};

const ProgressIndicator = ({
  stage,
  progress,
  estimatedTimeRemaining,
}: ProgressIndicatorProps) => {
  if (stage === 'idle') return null;

  return (
    <div className="space-y-2 my-4">
      <div className="flex justify-between text-sm text-gray-600">
        <span>{stageMessages[stage] || ''}</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />

      {stage === 'processing' && estimatedTimeRemaining !== null && (
        <p className="text-sm text-gray-500 mt-2">
          Tiempo estimado restante: {formatDuration(estimatedTimeRemaining)}
        </p>
      )}

      {stage === 'processing' && (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md mt-2">
          <p className="font-medium">
            La simulación puede tardar entre 25-50 minutos
          </p>
          <p>
            Puede mantener esta ventana abierta o volver más tarde para ver los
            resultados.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;
