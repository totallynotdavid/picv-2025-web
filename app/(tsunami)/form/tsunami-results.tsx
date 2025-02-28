import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/app/_components/ui/templates/alert';
import { TsunamiResultsProps } from '@/lib/types';

export const TsunamiResults = ({ jobStatus }: TsunamiResultsProps) => {
  if (!jobStatus) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'processing':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-purple-800 mb-2">
          Resultados de la simulación
        </h2>
      </div>

      <Alert>
        <AlertTitle className="text-lg font-bold">
          Estado de la simulación
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p className={getStatusColor(jobStatus.status)}>
            Estado: {jobStatus.status}
          </p>
          {jobStatus.download_url && (
            <a
              className="text-blue-600 hover:underline block py-2"
              href={jobStatus.download_url}
              rel="noopener noreferrer"
              target="_blank"
            >
              Descargar reporte
            </a>
          )}
          {jobStatus.error && (
            <p className="text-red-600">Error: {jobStatus.error}</p>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};
