export interface CalculationResponse {
  id: string;
  calculation_time_ms: number;
  result: {
    estimated_height: number;
    arrival_time: string;
    risk_level: 'Bajo' | 'Moderado' | 'Alto' | 'Extremo';
  };
}

export interface SourceParameters {
  Largo: number;
  Ancho: number;
  Dislocación: number;
  Momento_sísmico: number;
  lat0: number;
  lon0: number;
}

export interface Location {
  lat: number;
  lng: number;
}
