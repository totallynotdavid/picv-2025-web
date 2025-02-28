import { JobStatus } from '@/lib/types';
import { SourceParameters, TsunamiFormData } from '@/lib/types/tsunami';
import { useCallback, useRef, useState } from 'react';

type CalculationStage =
  | 'calculating'
  | 'complete'
  | 'error'
  | 'idle'
  | 'processing';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'localhost:8000';

export const useTsunamiCalculator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [currentStage, setCurrentStage] = useState<CalculationStage>('idle');
  const [progress, setProgress] = useState(0);
  const [sourceParams, setSourceParams] = useState<null | SourceParameters>(
    null,
  );
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanupPolling = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const pollJobStatus = useCallback(
    async (jobId: string) => {
      try {
        if (!abortControllerRef.current) {
          abortControllerRef.current = new AbortController();
        }

        const response = await fetch(`${API_BASE_URL}/job-status/${jobId}`, {
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error('Error al obtener el estado del trabajo');
        }

        const data = await response.json();

        setJobStatus(data);
        setProgress((prev) =>
          data.status === 'completed' ? 100 : Math.min(prev + 5, 90),
        );

        if (data.status === 'completed') {
          setCurrentStage('complete');
          setIsLoading(false);
          cleanupPolling();
        } else if (data.status === 'error') {
          setError(data.error || 'Error en la simulación');
          setCurrentStage('error');
          setIsLoading(false);
          cleanupPolling();
        } else {
          pollingTimeoutRef.current = setTimeout(
            () => pollJobStatus(jobId),
            5000,
          );
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          setError('Error al verificar el estado del trabajo');
          setCurrentStage('error');
          setIsLoading(false);
        }
      }
    },
    [cleanupPolling],
  );

  const calculateTsunami = useCallback(
    async (values: TsunamiFormData) => {
      cleanupPolling();

      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);
      setCurrentStage('calculating');
      setProgress(0);

      try {
        // Step 1: Calculate source parameters
        const calculateRes = await fetch(`${API_BASE_URL}/calculate`, {
          body: JSON.stringify(values),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          signal: abortControllerRef.current.signal,
        });

        if (!calculateRes.ok) {
          const errorData = await calculateRes.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error en cálculo inicial');
        }

        const sourceParams = await calculateRes.json();
        setSourceParams(sourceParams);
        setProgress(30);

        // Step 2: Calculate tsunami travel times
        const travelRes = await fetch(`${API_BASE_URL}/tsunami-travel-times`, {
          body: JSON.stringify(values),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          signal: abortControllerRef.current.signal,
        });

        if (!travelRes.ok) {
          const errorData = await travelRes.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error en tiempos de viaje');
        }

        setProgress(50);

        // Step 3: Run TSDHN simulation
        const jobRes = await fetch(`${API_BASE_URL}/run-tsdhn`, {
          body: JSON.stringify(values),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          signal: abortControllerRef.current.signal,
        });

        if (!jobRes.ok) {
          const errorData = await jobRes.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error al iniciar TSDHN');
        }

        const jobData = await jobRes.json();
        setProgress(70);
        setCurrentStage('processing');

        pollJobStatus(jobData.job_id);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          setError(error.message || 'Error en la simulación');
          setCurrentStage('error');
          setIsLoading(false);
        }
      }
    },
    [cleanupPolling, pollJobStatus],
  );

  const reset = useCallback(() => {
    cleanupPolling();
    setIsLoading(false);
    setError(null);
    setCurrentStage('idle');
    setProgress(0);
    setSourceParams(null);
    setJobStatus(null);
  }, [cleanupPolling]);

  return {
    calculateTsunami,
    currentStage,
    error,
    isLoading,
    jobStatus,
    progress,
    reset,
    sourceParams,
  };
};
