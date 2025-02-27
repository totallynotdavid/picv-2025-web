import { useState, useCallback } from 'react';
import { GenerateFormType } from '@/lib/schemas';
import { SourceParameters, CalculationResponse, TravelTimeResponse, JobResponse, JobStatus } from '@/lib/types/tsunami';

// Polling interval in milliseconds
const POLLING_INTERVAL = 10000; // 10 seconds
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const useTsunamiCalculator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<
    'idle' | 'calculating' | 'travelTimes' | 'processing' | 'complete' | 'error'
  >('idle');
  const [progress, setProgress] = useState(0);
  const [sourceParams, setSourceParams] = useState<SourceParameters | null>(null);
  const [calculationResult, setCalculationResult] = useState<CalculationResponse | null>(null);
  const [travelTimes, setTravelTimes] = useState<TravelTimeResponse | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);

  // Format date to match API requirements
  const formatDate = (date: Date): { dia: string; hhmm: string } => {
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return {
      dia: day,
      hhmm: `${hours}${minutes}`
    };
  };

  // Function to poll job status
  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/job-status/${jobId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get job status');
      }
      
      const data = await response.json();
      setJobStatus(data);
      
      if (data.status === 'completed') {
        setCurrentStage('complete');
        
        setCalculationResult({
          result: {
            estimated_height: 2.5,
            arrival_time: new Date().toISOString(),
            risk_level: 'Alto',
          },
          calculation_time_ms: 1200000, // 20 minutes in ms
        });
        
        setProgress(100);
        setIsLoading(false);
      } else if (data.status === 'failed') {
        setCurrentStage('error');
        setError(data.error || 'La simulación ha fallado');
        setIsLoading(false);
      } else {
        // Calculate progress based on time elapsed
        if (data.started_at) {
          const startTime = new Date(data.started_at).getTime();
          const currentTime = new Date().getTime();
          const elapsedMinutes = (currentTime - startTime) / (1000 * 60);
          
          // Assuming average processing time of 35 minutes
          const estimatedTotalTime = 35;
          const progressPercentage = Math.min(Math.round((elapsedMinutes / estimatedTotalTime) * 90), 90);
          
          setProgress(progressPercentage);
          setEstimatedTimeRemaining(Math.max(estimatedTotalTime - elapsedMinutes, 0));
        }
        
        // Continue polling
        setTimeout(() => pollJobStatus(jobId), POLLING_INTERVAL);
      }
    } catch (error) {
      console.error('Error polling job status:', error);
      setCurrentStage('error');
      setError('No se pudo verificar el estado de la simulación');
      setIsLoading(false);
    }
  }, []);

  // Main function to calculate tsunami
  const calculateTsunami = useCallback(async (values: GenerateFormType) => {
    setIsLoading(true);
    setError(null);
    setCurrentStage('calculating');
    setProgress(5);
    
    try {
      // Step 1: Call /calculate endpoint
      const dateFormatted = formatDate(values.datetime);
      
      const calculatePayload = {
        Mw: values.magnitude,
        h: values.depth,
        lat0: values.latitude,
        lon0: values.longitude,
        dia: dateFormatted.dia,
        hhmm: dateFormatted.hhmm
      };
      
      const calculateResponse = await fetch(`${API_BASE_URL}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calculatePayload)
      });
      
      if (!calculateResponse.ok) {
        const errorData = await calculateResponse.json();
        throw new Error(errorData.message || 'Error en el cálculo inicial');
      }
      
      const calculateData = await calculateResponse.json();
      
      // Set source parameters from the response
      setSourceParams({
        Largo: calculateData.length / 1000, // Convert to km
        Ancho: calculateData.width / 1000, // Convert to km
        Dislocación: calculateData.dislocation,
        Momento_sísmico: calculateData.seismic_moment,
        tsunami_warning: calculateData.tsunami_warning,
        lat0: values.latitude,
        lon0: values.longitude
      });
      
      setProgress(20);
      setCurrentStage('travelTimes');
      
      // Step 2: Call /tsunami-travel-times endpoint
      const travelTimesResponse = await fetch(`${API_BASE_URL}/tsunami-travel-times`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calculatePayload) // Uses the same payload as calculate
      });
      
      if (!travelTimesResponse.ok) {
        const errorData = await travelTimesResponse.json();
        throw new Error(errorData.message || 'Error en el cálculo de tiempos de viaje');
      }
      
      const travelTimesData = await travelTimesResponse.json();
      setTravelTimes(travelTimesData);
      
      setProgress(40);
      setCurrentStage('processing');
      
      // Step 3: Call /run-tsdhn endpoint
      const runTsdhnResponse = await fetch(`${API_BASE_URL}/run-tsdhn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calculatePayload) // Uses the same payload as calculate
      });
      
      if (!runTsdhnResponse.ok) {
        const errorData = await runTsdhnResponse.json();
        throw new Error(errorData.message || 'Error al iniciar la simulación');
      }
      
      const jobData = await runTsdhnResponse.json();
      setJobId(jobData.job_id);
      
      // Start polling for job status
      pollJobStatus(jobData.job_id);
      
    } catch (error: any) {
      console.error('Error calculating tsunami:', error);
      setCurrentStage('error');
      setError(error.message || 'Ha ocurrido un error inesperado');
      setIsLoading(false);
    }
  }, [pollJobStatus]);

  // Reset state
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setCurrentStage('idle');
    setProgress(0);
    setSourceParams(null);
    setCalculationResult(null);
    setTravelTimes(null);
    setJobId(null);
    setJobStatus(null);
    setEstimatedTimeRemaining(null);
  }, []);

  return {
    isLoading,
    error,
    currentStage,
    progress,
    sourceParams,
    calculationResult,
    travelTimes,
    jobId,
    jobStatus,
    estimatedTimeRemaining,
    calculateTsunami,
    reset
  };
};