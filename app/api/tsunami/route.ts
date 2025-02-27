// app/api/tsunami/calculate/route.ts
import { NextRequest } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface CalculateRequest {
  Mw: number;
  h: number;
  lat0: number;
  lon0: number;
  dia: string;
  hhmm: string;
}

const validateRequest = (request: CalculateRequest) => {
  if (!request.Mw) throw new Error('Magnitude is required');
  if (!request.h) throw new Error('Depth is required');
  if (!request.lat0) throw new Error('Latitude is required');
  if (!request.lon0) throw new Error('Longitude is required');
  if (!request.dia) throw new Error('Day is required');
  if (!request.hhmm) throw new Error('Time is required');
};

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json() as CalculateRequest;

    // Validate request
    validateRequest(reqBody);

    const startTime = performance.now();

    // Make request to your API
    const response = await fetch(`${API_BASE_URL}/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(JSON.stringify(errorData), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const data = await response.json();
    const endTime = performance.now();

    return new Response(JSON.stringify({
      ...data,
      calculation_time_ms: Math.round(endTime - startTime),
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({
        message: 'Error processing request',
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
