'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
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
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import LoadingDots from '@/components/ui/loadingdots';
import TsunamiMap from '@/components/Tsunami';
import va from '@vercel/analytics';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const generateFormSchema = z.object({
  magnitude: z
    .number()
    .min(6.5, 'La magnitud debe ser al menos 6.5 Mw')
    .max(10, 'La magnitud no puede exceder 10 Mw'),
  depth: z
    .number()
    .min(0, 'La profundidad no puede ser negativa')
    .max(1000, 'La profundidad no puede exceder 1000 km'),
  latitude: z
    .number()
    .min(-90, 'La latitud debe estar entre -90 y 90')
    .max(90, 'La latitud debe estar entre -90 y 90'),
  longitude: z
    .number()
    .min(-180, 'La longitud debe estar entre -180 y 180')
    .max(180, 'La longitud debe estar entre -180 y 180'),
  datetime: z.date(),
});

interface CalculationResponse {
  id: string;
  calculation_time_ms: number;
  result: {
    estimated_height: number;
    arrival_time: string;
    risk_level: 'Bajo' | 'Moderado' | 'Alto' | 'Extremo';
  };
}

const getRiskLevelClass = (level: string) => {
  const levels: Record<string, string> = {
    Bajo: 'bg-green-50 text-green-700',
    Moderado: 'bg-yellow-50 text-yellow-700',
    Alto: 'bg-red-50 text-red-700',
    Extremo: 'bg-purple-50 text-purple-700',
  };
  return levels[level] || 'bg-gray-50 text-gray-700';
};

const Body = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [calculationResult, setCalculationResult] =
    useState<CalculationResponse | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof generateFormSchema>>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      magnitude: 6.5,
      depth: 0,
      latitude: 0,
      longitude: 0,
      datetime: new Date(),
    },
  });

  const handleSubmit = useCallback(
    async (values: z.infer<typeof generateFormSchema>) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/calculate-tsunami', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...values,
            datetime: values.datetime.toISOString(),
          }),
        });

        if (!response.ok) throw new Error('Error en el cálculo del tsunami');

        const data = await response.json();
        setCalculationResult(data);

        va.track('Tsunami Calculado', {
          magnitude: values.magnitude,
          location: `${values.latitude},${values.longitude}`,
        });

        toast.success('¡Cálculo completado exitosamente!', {
          icon: '🌊',
          duration: 4000,
        });
      } catch (error) {
        va.track('Error en Cálculo', {
          magnitude: values.magnitude,
          location: `${values.latitude},${values.longitude}`,
        });

        if (error instanceof Error) {
          setError(error);
          toast.error(`Error: ${error.message}`, {
            icon: '⚠️',
            duration: 5000,
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-center items-center flex-col w-full lg:p-0 p-4 sm:mb-28 mb-0"
    >
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mt-10">
        <div className="col-span-1">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 p-4 rounded-lg mb-6"
              >
                <h2 className="text-xl font-semibold text-blue-800 mb-2">
                  Simulador de Tsunami
                </h2>
                <p className="text-blue-600">
                  Complete los datos del evento sísmico para calcular la posible
                  generación de un tsunami.
                </p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.01 }} className="space-y-6">
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
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormDescription>
                        Ingrese la magnitud del sismo en escala de momento (Mw)
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
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormDescription>
                        Profundidad del epicentro en kilómetros
                      </FormDescription>
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
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                            className="focus:ring-2 focus:ring-blue-500"
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
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                            className="focus:ring-2 focus:ring-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="datetime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha y hora del Evento</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={
                            field.value
                              ? new Date(field.value).toISOString().slice(0, 16)
                              : ''
                          }
                          onChange={(e) =>
                            field.onChange(new Date(e.target.value))
                          }
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormDescription>
                        Seleccione la fecha y hora del evento sísmico
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  {isLoading ? (
                    <LoadingDots color="white" />
                  ) : (
                    'Calcular Tsunami'
                  )}
                </Button>
              </motion.div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </form>
          </Form>
        </div>

        <div className="col-span-1">
          <AnimatePresence>
            {calculationResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6"
              >
                <Alert
                  className={getRiskLevelClass(
                    calculationResult.result.risk_level,
                  )}
                >
                  <AlertTitle className="text-lg font-bold">
                    Resultados de la Simulación
                  </AlertTitle>
                  <AlertDescription className="mt-2">
                    <div className="space-y-2">
                      <p className="flex items-center">
                        <span className="font-semibold mr-2">
                          Altura estimada:
                        </span>
                        {calculationResult.result.estimated_height} metros
                      </p>
                      <p className="flex items-center">
                        <span className="font-semibold mr-2">
                          Tiempo de llegada:
                        </span>
                        {format(
                          new Date(calculationResult.result.arrival_time),
                          "d 'de' MMMM 'a las' HH:mm",
                          { locale: es },
                        )}
                      </p>
                      <p className="flex items-center">
                        <span className="font-semibold mr-2">
                          Nivel de riesgo:
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full ${getRiskLevelClass(calculationResult.result.risk_level)}`}
                        >
                          {calculationResult.result.risk_level}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Tiempo de cálculo:{' '}
                        {(calculationResult.calculation_time_ms / 1000).toFixed(
                          2,
                        )}{' '}
                        segundos
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col justify-center relative h-auto items-center bg-gray-50 rounded-lg p-4"
          >
            <TsunamiMap />
          </motion.div>
        </div>
      </div>
      <Toaster position="top-center" />
    </motion.div>
  );
};

export default Body;
