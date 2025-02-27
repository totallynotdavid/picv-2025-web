import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/app/_components/ui/templates/alert';
import { TsunamiResultsProps } from '@/lib/types/tsunami';

export const TsunamiResults = ({ jobStatus }: TsunamiResultsProps) => {
  if (!jobStatus) return null;

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
          <p>Estado: {jobStatus.status}</p>
          {jobStatus.download_url && (
            <a
              href={jobStatus.download_url}
              className="text-blue-600 hover:underline"
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
