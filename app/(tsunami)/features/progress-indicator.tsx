import { Progress } from '@/app/components/ui/progress';

interface ProgressIndicatorProps {
  stage: 'idle' | 'calculating' | 'travelTimes' | 'processing' | 'complete' | 'error';
  progress: number;
  estimatedTimeRemaining: number | null;
}

const ProgressIndicator = ({
  stage,
  progress,
  estimatedTimeRemaining,
}: ProgressIndicatorProps) => {
  const getStageMessage = () => {
    switch (stage) {
      case 'calculating':
        return 'Calculando parámetros iniciales...';
      case 'travelTimes':
        return 'Calculando tiempos de viaje del tsunami...';
      case 'processing':
        return 'Ejecutando simulación TSDHN...';
      case 'complete':
        return 'Simulación completada';
      case 'error':
        return 'Error en la simulación';
      default:
        return '';
    }
  };

  const formatTimeRemaining = (minutes: number) => {
    if (minutes < 1) {
      return 'menos de un minuto';
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.floor(minutes % 60);
    
    if (hours > 0) {
      return `aproximadamente ${hours} hora${hours > 1 ? 's' : ''} y ${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''}`;
    }
    
    return `aproximadamente ${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''}`;
  };

  if (stage === 'idle') {
    return null;
  }

  return (
    <div className="space-y-2 my-4">
      <div className="flex justify-between text-sm text-gray-600">
        <span>{getStageMessage()}</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      
      {stage === 'processing' && estimatedTimeRemaining !== null && (
        <p className="text-sm text-gray-500 mt-2">
          Tiempo estimado restante: {formatTimeRemaining(estimatedTimeRemaining)}
        </p>
      )}
      
      {stage === 'processing' && (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md mt-2">
          <p className="font-medium">La simulación puede tardar entre 25-50 minutos</p>
          <p>Puede mantener esta ventana abierta o volver más tarde para ver los resultados.</p>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;