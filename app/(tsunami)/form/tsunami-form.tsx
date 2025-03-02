import { InitialForm } from '@/app/(tsunami)/form/initial-form';
import { SourceParameters } from '@/app/(tsunami)/form/source-parameters';
import { TsunamiResults } from '@/app/(tsunami)/form/tsunami-results';
import { useTsunamiCalculator } from '@/app/(tsunami)/hooks/use-tsunami-calculator';
import { ProgressIndicator } from '@/app/_components/ui/progress-indicator';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/app/_components/ui/templates/alert';
import { Button } from '@/app/_components/ui/templates/button';
import { TsunamiFormData, TsunamiFormProps } from '@/lib/types/tsunami';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

const tsunamiFormSchema = z.object({
  datetime: z.date(),
  depth: z.number().min(0, { message: 'La profundidad no puede ser negativa' }),
  latitude: z
    .number()
    .min(-90)
    .max(90, { message: 'Latitud debe estar entre -90 y 90' }),
  longitude: z
    .number()
    .min(-180)
    .max(180, { message: 'Longitud debe estar entre -180 y 180' }),
  magnitude: z.number().min(6.5, { message: 'La magnitud mínima es 6.5 Mw' }),
});

export const TsunamiForm = ({
  onLocationUpdate,
  selectedLocation,
}: TsunamiFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const {
    calculateTsunami,
    currentStage,
    error,
    isLoading,
    jobStatus,
    progress,
    reset,
    sourceParams,
  } = useTsunamiCalculator();

  const form = useForm<TsunamiFormData>({
    defaultValues: {
      datetime: new Date(),
      depth: 10.0,
      latitude: -20.5,
      longitude: -70.5,
      magnitude: 7.5,
    },
    resolver: zodResolver(tsunamiFormSchema),
  });

  useEffect(() => {
    if (selectedLocation) {
      form.setValue('latitude', selectedLocation.lat);
      form.setValue('longitude', selectedLocation.lng);
    }
  }, [selectedLocation, form]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      const { latitude, longitude } = values;
      if (
        typeof latitude === 'number' &&
        typeof longitude === 'number' &&
        !isNaN(latitude) &&
        !isNaN(longitude)
      ) {
        onLocationUpdate({ lat: latitude, lng: longitude });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onLocationUpdate]);

  useEffect(() => {
    if (currentStage === 'complete') {
      setCurrentStep(2);
    }
  }, [currentStage]);

  const handleSubmit = async (values: TsunamiFormData) => {
    await calculateTsunami(values);
    setCurrentStep(1);
  };

  const transitions = {
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: '-100%' },
    initial: { opacity: 0, x: '100%' },
    transition: { duration: 0.3 },
  };

  const getStepLabel = () => {
    if (!jobStatus?.details) return 'Procesando...';
    const { current_step, total_steps } = jobStatus.details;
    if (current_step && total_steps) {
      return `Paso ${current_step} de ${total_steps}`;
    }
    if (current_step) {
      return `Procesando: ${current_step}`;
    }
    return 'Procesando...';
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <FormProvider {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} {...transitions}>
              {currentStep === 0 && <InitialForm />}
              {currentStep === 1 && (
                <>
                  <SourceParameters parameters={sourceParams} />
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      {getStepLabel()}
                    </p>
                    <ProgressIndicator
                      progress={progress}
                      stage={currentStage}
                    />
                  </div>
                </>
              )}
              {currentStep === 2 && <TsunamiResults jobStatus={jobStatus} />}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between gap-4 mt-6">
            <Button
              disabled={currentStep === 0 || isLoading}
              onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
              type="button"
              variant="outline"
            >
              Anterior
            </Button>

            {currentStep === 2 ? (
              <Button
                onClick={() => {
                  reset();
                  setCurrentStep(0);
                }}
                type="button"
              >
                Nueva simulación
              </Button>
            ) : (
              <Button disabled={isLoading} type="submit">
                {isLoading ? 'Procesando...' : 'Continuar'}
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
