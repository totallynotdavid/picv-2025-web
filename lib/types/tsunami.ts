import { JobStatus } from '@/lib/types/index';

export interface Location {
  lat: number;
  lng: number;
}

export interface MapContentProps {
  // eslint-disable-next-line no-unused-vars
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLocation: Location | null;
}

export interface SourceParameters {
  dislocation: number;
  lat0: number;
  length: number;
  lon0: number;
  seismic_moment: number;
  width: number;
}

export interface SourceParametersProps {
  parameters: null | SourceParameters;
}

export interface TsunamiFormData {
  datetime: Date;
  depth: number;
  latitude: number;
  longitude: number;
  magnitude: number;
}

export interface TsunamiFormProps {
  // eslint-disable-next-line no-unused-vars
  onLocationUpdate: (location: Location) => void;
  selectedLocation: Location | null;
}

export interface TsunamiResultsProps {
  jobStatus: JobStatus | null;
}
