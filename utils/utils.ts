import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { customAlphabet } from 'nanoid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7,
);

export const getRiskLevelClass = (level: string) => {
  const levels: Record<string, string> = {
    Bajo: 'bg-green-50 text-green-700',
    Moderado: 'bg-yellow-50 text-yellow-700',
    Alto: 'bg-red-50 text-red-700',
    Extremo: 'bg-purple-50 text-purple-700',
  };
  return levels[level] || 'bg-gray-50 text-gray-700';
};

export const formatCoordinate = (
  value: number,
  decimals: number = 6,
): number => {
  return Number(value.toFixed(decimals));
};
