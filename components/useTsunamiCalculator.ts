import { useState } from 'react';
import { CalculationResponse, SourceParameters } from '@/utils/types';
import { GenerateFormType } from '@/utils/schema';
import { formatCoordinate } from '@/utils/utils';
import { toast } from 'react-hot-toast';
import va from '@vercel/analytics';

export const useTsunamiCalculator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [calculationResult, setCalculationResult] =
    useState<CalculationResponse | null>(null);
  const [sourceParams, setSourceParams] = useState<SourceParameters | null>(
    null,
  );

  const fetchSourceParameters = async (values: GenerateFormType) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tsunami/source_params`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Mw: values.magnitude,
            h: values.depth,
            lat0: values.latitude,
            lon0: values.longitude,
          }),
        },
      );

      if (!response.ok) throw new Error('Error fetching source parameters');
      const data = await response.json();
      setSourceParams(data);
      return data;
    } catch (error) {
      toast.error('Error fetching source parameters');
      throw error;
    }
  };

  const calculateTsunami = async (values: GenerateFormType) => {
    setIsLoading(true);
    setError(null);

    try {
      await fetchSourceParameters(values);

      const response = await fetch('/api/calculate-tsunami', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          datetime: values.datetime.toISOString(),
          latitude: formatCoordinate(values.latitude),
          longitude: formatCoordinate(values.longitude),
        }),
      });

      if (!response.ok) throw new Error('Error en el cálculo del tsunami');

      const data: CalculationResponse = await response.json();
      setCalculationResult(data);

      va.track('Tsunami Calculado', {
        magnitude: values.magnitude,
        location: `${values.latitude},${values.longitude}`,
      });

      toast.success('¡Cálculo completado exitosamente!', {
        icon: '🌊',
        duration: 4000,
      });

      return data;
    } catch (error) {
      va.track('Error en Cálculo', {
        magnitude: values.magnitude,
        location: `${values.latitude},${values.longitude}`,
      });

      if (error instanceof Error) {
        setError(error);
        toast.error(`Error: ${error.message}`, {
          icon: '⚠️',
          duration: 5000,
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    calculationResult,
    sourceParams,
    calculateTsunami,
  };
};
