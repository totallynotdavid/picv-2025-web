'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import useMeasure from 'react-use-measure';
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
import { useCallback, useState, useEffect, useMemo } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import LoadingDots from '@/components/ui/loadingdots';
import TsunamiMap from '@/components/Tsunami';
import va from '@vercel/analytics';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { CalculationResponse, SourceParameters } from '@/utils/types';
import { getRiskLevelClass, formatCoordinate } from '@/utils/utils';

// Schema definition
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

const Body = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [ref, bounds] = useMeasure();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [calculationResult, setCalculationResult] =
    useState<CalculationResponse | null>(null);
  const [sourceParams, setSourceParams] = useState<SourceParameters | null>(
    null,
  );
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const router = useRouter();

  // Form initialization
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

  // Location handling
  const handleLocationSelect = useCallback(
    (lat: number, lng: number) => {
      const formattedLat = formatCoordinate(lat);
      const formattedLng = formatCoordinate(lng);

      setSelectedLocation({ lat: formattedLat, lng: formattedLng });
      form.setValue('latitude', formattedLat, { shouldValidate: true });
      form.setValue('longitude', formattedLng, { shouldValidate: true });

      toast.success('Ubicación actualizada', {
        icon: '📍',
        duration: 2000,
      });
    },
    [form],
  );

  // Watch form values
  const latitude = form.watch('latitude');
  const longitude = form.watch('longitude');

  // Update map on form changes
  useEffect(() => {
    if (
      selectedLocation === null ||
      formatCoordinate(latitude) !== selectedLocation.lat ||
      formatCoordinate(longitude) !== selectedLocation.lng
    ) {
      setSelectedLocation({
        lat: formatCoordinate(latitude),
        lng: formatCoordinate(longitude),
      });
    }
  }, [latitude, longitude]);

  // API calls
  const fetchSourceParameters = async (
    values: z.infer<typeof generateFormSchema>,
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tsunami/source_params`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Mw: values.magnitude,
            h: values.depth,
            lat0: values.latitude,
            lon0: values.longitude,
          }),
        },
      );

      if (!response.ok) throw new Error('Error fetching source parameters');
      const data = await response.json();
      setSourceParams(data);
      setCurrentStep(1);
    } catch (error) {
      toast.error('Error fetching source parameters');
      console.error(error);
      throw error;
    }
  };

  const handleSubmit = useCallback(
    async (values: z.infer<typeof generateFormSchema>) => {
      setIsLoading(true);
      setError(null);

      try {
        // First get source parameters
        await fetchSourceParameters(values);

        // Then calculate tsunami
        const response = await fetch('/api/calculate-tsunami', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...values,
            datetime: values.datetime.toISOString(),
            latitude: formatCoordinate(values.latitude),
            longitude: formatCoordinate(values.longitude),
          }),
        });

        if (!response.ok) throw new Error('Error en el cálculo del tsunami');

        const data: CalculationResponse = await response.json();
        setCalculationResult(data);
        setCurrentStep(2);

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

  // Step content
  const content = useMemo(() => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">
                Paso 1: Parámetros Iniciales
              </h2>
              <p className="text-blue-600">
                Ingrese los datos del evento sísmico o seleccione una ubicación
                en el mapa.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
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
                            step="0.1"
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
                            step="0.1"
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
                      <FormLabel>Fecha y hora del evento</FormLabel>
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
              </form>
            </Form>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                Paso 2: Parámetros de la Fuente
              </h2>
              <p className="text-green-600">
                Revisión de los parámetros calculados para la fuente sísmica.
              </p>
            </div>

            {sourceParams && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg shadow">
                <div className="space-y-2">
                  <p className="font-semibold">Largo:</p>
                  <p>{sourceParams.Largo.toFixed(2)} km</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">Ancho:</p>
                  <p>{sourceParams.Ancho.toFixed(2)} km</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">Dislocación:</p>
                  <p>{sourceParams.Dislocación.toFixed(2)} m</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">Momento sísmico:</p>
                  <p>{sourceParams.Momento_sísmico.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-purple-800 mb-2">
                Paso 3: Resultados del Tsunami
              </h2>
              <p className="text-purple-600">
                Resultados finales de la simulación del tsunami.
              </p>
            </div>

            {calculationResult && (
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
                        className={`px-2 py-1 rounded-full ${getRiskLevelClass(
                          calculationResult.result.risk_level,
                        )}`}
                      >
                        {calculationResult.result.risk_level}
                      </span>
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      default:
        return null;
    }
  }, [currentStep, sourceParams, calculationResult, form]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-center items-center flex-col w-full lg:p-0 p-4 mb-0"
    >
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
        <div className="col-span-1">
          <MotionConfig
            transition={{ duration: 0.5, type: 'spring', bounce: 0 }}
          >
            <motion.div
              animate={{ height: bounds.height }}
              className="relative overflow-hidden"
            >
              <div ref={ref}>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={currentStep}
                    initial={{ x: '110%', opacity: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ x: '-110%', opacity: 0 }}
                  >
                    {content}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </MotionConfig>

          <motion.div layout className="flex justify-between mt-6 gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((prev) => prev - 1)}
            >
              Anterior
            </Button>
            <Button
              type="button"
              disabled={currentStep === 2 || isLoading}
              onClick={() => {
                if (currentStep < 2) {
                  form.handleSubmit(handleSubmit)();
                }
              }}
            >
              {isLoading ? <LoadingDots color="white" /> : 'Continuar'}
            </Button>
          </motion.div>
        </div>

        <div className="col-span-1">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col justify-center relative h-auto items-center bg-gray-50 rounded-lg p-4"
          >
            <TsunamiMap
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation}
            />
            <p className="text-sm text-gray-600 mt-2 text-center">
              Haga clic en el mapa para seleccionar la ubicación del epicentro
            </p>
          </motion.div>
        </div>
      </div>
      <Toaster position="top-center" />
    </motion.div>
  );
};

export default Body;
