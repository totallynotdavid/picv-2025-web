'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCallback, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import LoadingDots from '@/components/ui/loadingdots';
import TsunamiMap from '@/components/Tsunami';
import va from '@vercel/analytics';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

// Form Schema
const generateFormSchema = z.object({
  magnitude: z.number()
    .min(6.5, "Magnitude must be at least 6.5 Mw")
    .max(10, "Magnitude cannot exceed 10 Mw"),
  depth: z.number()
    .min(0, "Depth cannot be negative")
    .max(1000, "Depth cannot exceed 1000 km"),
  latitude: z.number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z.number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  time: z.string()
    .regex(/^([01]\d|2[0-3])[0-5]\d$/, "Time must be in HHMM format")
});

type GenerateFormValues = z.infer<typeof generateFormSchema>;

interface CalculationResponse {
  id: string;
  calculation_time_ms: number;
  result: {
    estimated_height: number;
    arrival_time: string;
    risk_level: string;
  };
}

const Body = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [calculationResult, setCalculationResult] = useState<CalculationResponse | null>(null);
  const router = useRouter();

  const form = useForm<GenerateFormValues>({
    resolver: zodResolver(generateFormSchema),
    mode: 'onChange',
    defaultValues: {
      magnitude: 6.5,
      depth: 0,
      latitude: 0,
      longitude: 0,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }).replace(':', '')
    },
  });

  const handleSubmit = useCallback(async (values: GenerateFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/calculate-tsunami', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate tsunami parameters');
      }

      const data = await response.json();
      setCalculationResult(data);

      va.track('Calculated Tsunami', {
        magnitude: values.magnitude,
        location: `${values.latitude},${values.longitude}`,
      });

      toast.success('Calculation completed successfully!');
    } catch (error) {
      va.track('Calculation Failed', {
        magnitude: values.magnitude,
        location: `${values.latitude},${values.longitude}`,
      });
      
      if (error instanceof Error) {
        setError(error);
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex justify-center items-center flex-col w-full lg:p-0 p-4 sm:mb-28 mb-0">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mt-10">
        <div className="col-span-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="magnitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Magnitud (Mw)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="Mínimo 6.5 Mw" 
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Ingrese la magnitud del sismo en escala de Momento (Mw)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="depth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profundidad (km)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.1"
                        placeholder="Profundidad en kilómetros"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitud</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.000001"
                          placeholder="-90 a 90"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitud</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.000001"
                          placeholder="-180 a 180"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora (HHMM)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="1430"
                        pattern="[0-2][0-9][0-5][0-9]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Formato 24 horas (ejemplo: 1430 para 2:30 PM)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full max-w-[200px] mx-auto"
              >
                {isLoading ? (
                  <LoadingDots color="white" />
                ) : (
                  'Calcular'
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}

              {calculationResult && (
                <Alert className="bg-green-50">
                  <AlertTitle>Resultado del Cálculo</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2">
                      <p>Altura estimada: {calculationResult.result.estimated_height}m</p>
                      <p>Tiempo de llegada: {calculationResult.result.arrival_time}</p>
                      <p>Nivel de riesgo: {calculationResult.result.risk_level}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </Form>
        </div>
        
        <div className="col-span-1">
          <div className="flex flex-col justify-center relative h-auto items-center">
            <TsunamiMap />
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Body;
