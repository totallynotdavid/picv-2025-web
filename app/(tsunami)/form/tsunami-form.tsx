import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/app/_components/ui/templates/button';
import { Alert, AlertTitle, AlertDescription } from '@/app/_components/ui/templates/alert';
import { Form } from '@/app/_components/ui/templates/form';
import { z } from 'zod';
import { useTsunamiCalculator } from '@/app/(tsunami)/hooks/use-tsunami-calculator';
import { InitialForm } from './initial-form';
import { SourceParameters } from './source-parameters';
import { TsunamiResults } from './tsunami-results';
import { ProgressIndicator } from '@/app/_components/ui/progress-indicator';
import { GenerateFormData, TsunamiFormProps } from '@/lib/types/form';

const generateFormSchema = z.object({
  magnitude: z.number().min(6.5, { message: 'La magnitud mínima es 6.5 Mw' }),
  depth: z.number().min(0, { message: 'La profundidad no puede ser negativa' }),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  datetime: z.date(),
});

export const TsunamiForm = ({ selectedLocation }: TsunamiFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { isLoading, error, currentStage, progress, sourceParams, jobStatus, calculateTsunami, reset } = useTsunamiCalculator();
  const form = useForm<GenerateFormData>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      magnitude: 7.5,
      depth: 10.0,
      latitude: -20.5,
      longitude: -70.5,
      datetime: new Date(),
    },
  });

  useEffect(() => {
    if (selectedLocation) {
      form.setValue('latitude', selectedLocation.lat);
      form.setValue('longitude', selectedLocation.lng);
    }
  }, [selectedLocation, form]);

  useEffect(() => {
    if (currentStage === 'complete') setCurrentStep(2);
  }, [currentStage]);

  const handleSubmit = async (values: GenerateFormData) => {
    await calculateTsunami(values);
    setCurrentStep(1);
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && <InitialForm form={form} />}
              {currentStep === 1 && (
                <>
                  <SourceParameters parameters={sourceParams} />
                  <ProgressIndicator stage={currentStage} progress={progress} />
                </>
              )}
              {currentStep === 2 && <TsunamiResults jobStatus={jobStatus} />}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between gap-4 mt-6">
            <Button
              variant="outline"
              disabled={currentStep === 0 || isLoading}
              onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
            >
              Anterior
            </Button>

            {currentStep === 2 ? (
              <Button onClick={() => { reset(); setCurrentStep(0); }}>
                Nueva simulación
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Procesando...' : 'Continuar'}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};