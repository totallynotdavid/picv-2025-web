// Existing Location type (referenced in the code)
export interface Location {
  lat: number;
  lng: number;
}

// Source Parameters after calculation
export interface SourceParameters {
  Largo: number;
  Ancho: number;
  Dislocación: number;
  Momento_sísmico: number;
  tsunami_warning?: string;
  lat0: number;
  lon0: number;
}

// Response from the first API endpoint (/calculate)
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

// Travel Time Response from the second API endpoint (/tsunami-travel-times)
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

// Job Response from the third API endpoint (/run-tsdhn)
export interface JobResponse {
  status: string;
  job_id: string;
  message: string;
}

// Job Status Response from the fourth API endpoint (/job-status/{job_id})
export interface JobStatus {
  status: 'queued' | 'running' | 'completed' | 'failed';
  details: string;
  error: string | null;
  created_at: string;
  started_at: string;
  ended_at: string | null;
  download_url: string | null;
}

// Final calculation result (simplified for the UI)
export interface CalculationResponse {
  result: {
    estimated_height: number;
    arrival_time: string;
    risk_level: string;
  };
  calculation_time_ms: number;
}