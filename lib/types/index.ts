export interface JobStatus {
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
