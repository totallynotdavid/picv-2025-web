import { useState, useCallback } from 'react';
import { GenerateFormData, JobStatus, SourceParameters } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type CalculationStage =
  | 'idle'
  | 'calculating'
  | 'processing'
  | 'complete'
  | 'error';

export const useTsunamiCalculator = () => {
  const [state, setState] = useState({
    isLoading: false,
    error: null as string | null,
    currentStage: 'idle' as CalculationStage,
    progress: 0,
    sourceParams: null as SourceParameters | null,
    jobStatus: null as JobStatus | null,
  });

  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/job-status/${jobId}`);
      if (!response.ok) {
        throw new Error('Error al obtener el estado del trabajo');
      }

      const data = await response.json();

      setState((prev) => ({
        ...prev,
        jobStatus: data,
        progress:
          data.status === 'completed' ? 100 : Math.min(prev.progress + 10, 90),
        currentStage: data.status === 'completed' ? 'complete' : 'processing',
        isLoading: data.status === 'completed' ? false : prev.isLoading,
      }));

      if (data.status !== 'completed') {
        setTimeout(() => pollJobStatus(jobId), 5000);
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: 'Error al verificar el estado del trabajo',
        currentStage: 'error',
        isLoading: false,
      }));
    }
  }, []);

  const calculateTsunami = useCallback(
    async (values: GenerateFormData) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        currentStage: 'calculating',
        progress: 0,
      }));

      try {
        // Step 1: Calculate source parameters
        const calculateRes = await fetch(`${API_BASE_URL}/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });

        if (!calculateRes.ok) {
          throw new Error('Error en cálculo inicial');
        }

        const sourceParams = await calculateRes.json();
        setState((prev) => ({ ...prev, sourceParams, progress: 30 }));

        // Step 2: Calculate tsunami travel times
        const travelRes = await fetch(`${API_BASE_URL}/tsunami-travel-times`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });

        if (!travelRes.ok) {
          throw new Error('Error en tiempos de viaje');
        }

        setState((prev) => ({ ...prev, progress: 50 }));

        // Step 3: Run TSDHN simulation
        const jobRes = await fetch(`${API_BASE_URL}/run-tsdhn`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });

        if (!jobRes.ok) {
          throw new Error('Error al iniciar TSDHN');
        }

        const jobData = await jobRes.json();
        setState((prev) => ({ ...prev, progress: 70 }));
        pollJobStatus(jobData.job_id);
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.message,
          currentStage: 'error',
          isLoading: false,
        }));
      }
    },
    [pollJobStatus],
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      currentStage: 'idle',
      progress: 0,
      sourceParams: null,
      jobStatus: null,
    });
  }, []);

  return { ...state, calculateTsunami, reset };
};
