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

export interface JobStatus {
  status: string;
  download_url?: string;
  error?: string;
}

export interface GenerateFormData {
  magnitude: number;
  depth: number;
  latitude: number;
  longitude: number;
  datetime: Date;
}
