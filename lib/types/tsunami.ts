export interface CalculateResponse {
  azimuth: number;
  dip: number;
  dislocation: number;
  distance_to_coast: number;
  epicenter_location: string;
  length: number;
  rectangle_corners: {
    lat: number;
    lon: number;
  }[];
  rectangle_parameters: {
    a1: number;
    alfa: number;
    b1: number;
    beta: number;
    h1: number;
    L1: number;
    W1: number;
    xo: number;
    yo: number;
  };
  seismic_moment: number;
  tsunami_warning: string;
  width: number;
}

export interface CalculationResponse {
  calculation_time_ms: number;
  result: {
    arrival_time: string;
    estimated_height: number;
    risk_level: string;
  };
}

export interface JobResponse {
  job_id: string;
  message: string;
  status: string;
}

export interface JobStatus {
  created_at: string;
  details: string;
  download_url: string | undefined;
  ended_at: null | string;
  error: string | undefined;
  started_at: string;
  status: 'completed' | 'failed' | 'queued' | 'running';
}

export interface Location {
  lat: number;
  lng: number;
}

export interface SourceParameters {
  dislocation: number;
  lat0: number;
  length: number;
  lon0: number;
  seismic_moment: number;
  width: number;
}

export interface TravelTimeResponse {
  arrival_times: Record<string, string>;
  distances: Record<string, number>;
  epicenter_info: {
    date: string;
    depth: string;
    latitude: string;
    longitude: string;
    magnitude: string;
    time: string;
  };
}

export declare namespace Tsunami {
  // eslint-disable-next-line no-unused-vars
  interface Location {
    lat: number;
    lng: number;
  }
}

export interface MapContentProps {
  // eslint-disable-next-line no-unused-vars
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLocation: Location | null;
}

export interface SourceParametersProps {
  parameters: null | SourceParameters;
}

export interface SourceParams {
  dislocation: number;
  lat0: number;
  length: number;
  lon0: number;
  seismic_moment: number;
  width: number;
}

export interface TsunamiResultsProps {
  jobStatus: JobStatus | null;
}
