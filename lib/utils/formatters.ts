import { es } from 'date-fns/locale';
import { format } from 'date-fns';

export const formatCoordinate = (coord: number) => Number(coord.toFixed(4));
export const formatRiskLevel = (level: string) =>
  level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();

export const formatArrivalTime = (isoString: string) =>
  format(new Date(isoString), "d 'de' MMMM 'a las' HH:mm", { locale: es });

export const formatDuration = (minutes: number) => {
  if (minutes < 1) return 'menos de un minuto';

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);

  const parts = [];
  if (hours > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`);
  if (remainingMinutes > 0)
    parts.push(
      `${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''}`,
    );

  return `aproximadamente ${parts.join(' y ')}`;
};
