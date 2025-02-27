import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCoordinate = (value: number): number => {
  return parseFloat(value.toFixed(4));
};

export const getRiskLevelClass = (riskLevel: string): string => {
  switch (riskLevel.toLowerCase()) {
    case 'bajo':
      return 'bg-green-50 text-green-800 border-green-300';
    case 'moderado':
      return 'bg-yellow-50 text-yellow-800 border-yellow-300';
    case 'alto':
      return 'bg-orange-50 text-orange-800 border-orange-300';
    case 'severo':
      return 'bg-red-50 text-red-800 border-red-300';
    default:
      return 'bg-blue-50 text-blue-800 border-blue-300';
  }
};

export const formatDateForApi = (date: Date): { dia: string; hhmm: string } => {
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return {
    dia: day,
    hhmm: `${hours}${minutes}`,
  };
};
