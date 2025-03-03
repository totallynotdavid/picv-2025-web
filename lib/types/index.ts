export interface JobStatus {
  details?: {
    current_step: number;
    total_steps: string;
  };
  download_url?: string;
  error?: string;
  status: string;
}

export interface ProgressIndicatorProps {
  progress: number;
  stage:
    | 'calculating'
    | 'complete'
    | 'error'
    | 'idle'
    | 'processing'
    | 'travelTimes';
}
