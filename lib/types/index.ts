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

export interface TsunamiFormData {
  datetime: Date;
  depth: number;
  latitude: number;
  longitude: number;
  magnitude: number;
}

export interface TsunamiResultsProps {
  jobStatus: JobStatus | null;
}
