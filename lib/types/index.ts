export interface JobStatus {
  status: string;
  download_url?: string;
  error?: string;
}

export interface ProgressIndicatorProps {
  stage:
    | 'idle'
    | 'calculating'
    | 'travelTimes'
    | 'processing'
    | 'complete'
    | 'error';
  progress: number;
}
