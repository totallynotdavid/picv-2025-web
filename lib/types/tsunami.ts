export interface Location {
  lat: number;
  lng: number;
}

export interface SourceParameters {
  length: number;
  width: number;
  dislocation: number;
  seismic_moment: number;
  lat0: number;
  lon0: number;
}

export interface CalculateResponse {
  length: number;
  width: number;
  dislocation: number;
  seismic_moment: number;
  tsunami_warning: string;
  distance_to_coast: number;
  azimuth: number;
  dip: number;
  epicenter_location: string;
  rectangle_parameters: {
    L1: number;
    W1: number;
    beta: number;
    alfa: number;
    h1: number;
    a1: number;
    b1: number;
    xo: number;
    yo: number;
  };
  rectangle_corners: {
    lon: number;
    lat: number;
  }[];
}

export interface TravelTimeResponse {
  arrival_times: Record<string, string>;
  distances: Record<string, number>;
  epicenter_info: {
    date: string;
    time: string;
    latitude: string;
    longitude: string;
    depth: string;
    magnitude: string;
  };
}

export interface JobResponse {
  status: string;
  job_id: string;
  message: string;
}

export interface JobStatus {
  status: 'queued' | 'running' | 'completed' | 'failed';
  details: string;
  error: string | undefined;
  created_at: string;
  started_at: string;
  ended_at: string | null;
  download_url: string | undefined;
}

export interface CalculationResponse {
  result: {
    estimated_height: number;
    arrival_time: string;
    risk_level: string;
  };
  calculation_time_ms: number;
}

export declare namespace Tsunami {
  // eslint-disable-next-line no-unused-vars
  interface Location {
    lat: number;
    lng: number;
  }
}

export interface Location {
  lat: number;
  lng: number;
}

export interface TsunamiResultsProps {
  jobStatus: JobStatus | null;
}

export interface SourceParametersProps {
  parameters: SourceParameters | null;
}
