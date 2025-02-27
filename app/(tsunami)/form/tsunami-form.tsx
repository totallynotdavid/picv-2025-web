import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import useMeasure from 'react-use-measure';
import { Button } from '@/app/_components/ui/templates/button';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/app/_components/ui/templates/alert';
import LoadingDots from '@/app/_components/ui/templates/loadingdots';
import { generateFormSchema, GenerateFormType } from '@/lib/schemas';
import { useTsunamiCalculator } from '@/app/(tsunami)/hooks/use-tsunami-calculator';
import { Location } from '@/lib/types/tsunami';
import { formatCoordinate } from '@/lib/utils';
import StepOneForm from '@/app/(tsunami)/form/initial-form';
import SourceParameters from '@/app/(tsunami)/form/source-parameters';
import TsunamiResults from '@/app/(tsunami)/form/tsunami-results';
import ProgressIndicator from '@/app/_components/ui/progress-indicator';

interface TsunamiFormProps {
  selectedLocation: Location | null;
  onLocationUpdate: (location: Location) => void;
}

const TsunamiForm = ({
  selectedLocation,
  onLocationUpdate,
}: TsunamiFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [ref, bounds] = useMeasure();

  const {
    isLoading,
    error,
    currentStage,
    progress,
    sourceParams,
    calculationResult,
    estimatedTimeRemaining,
    calculateTsunami,
    reset,
  } = useTsunamiCalculator();

  const form = useForm<GenerateFormType>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      magnitude: 9.0,
      depth: 12.0,
      latitude: 56,
      longitude: -156,
      datetime: new Date(),
    },
  });

  const { watch, setValue } = form;
  const latitude = watch('latitude');
  const longitude = watch('longitude');

  // Update form when map location changes
  useEffect(() => {
    if (selectedLocation) {
      setValue('latitude', selectedLocation.lat, { shouldValidate: true });
      setValue('longitude', selectedLocation.lng, { shouldValidate: true });
    }
  }, [selectedLocation, setValue]);

  // Update map when form changes
  useEffect(() => {
    if (
      !selectedLocation ||
      formatCoordinate(latitude) !== selectedLocation.lat ||
      formatCoordinate(longitude) !== selectedLocation.lng
    ) {
      onLocationUpdate({
        lat: formatCoordinate(latitude),
        lng: formatCoordinate(longitude),
      });
    }
  }, [latitude, longitude, onLocationUpdate, selectedLocation]);

  // Reset the form when the component unmounts
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Move to results when calculation is complete
  useEffect(() => {
    if (currentStage === 'complete' && calculationResult) {
      setCurrentStep(2);
    }
  }, [currentStage, calculationResult]);

  const handleSubmit = async (values: GenerateFormType) => {
    try {
      await calculateTsunami(values);
      setCurrentStep(1); // Move to parameters view
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <StepOneForm form={form} />;
      case 1:
        return (
          <>
            <SourceParameters parameters={sourceParams} />
            <ProgressIndicator
              stage={currentStage}
              progress={progress}
              estimatedTimeRemaining={estimatedTimeRemaining}
            />
          </>
        );
      case 2:
        return <TsunamiResults result={calculationResult} />;
      default:
        return null;
    }
  };

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <MotionConfig transition={{ duration: 0.5, type: 'spring', bounce: 0 }}>
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
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </MotionConfig>

      <motion.div layout className="flex justify-between mt-6 gap-4">
        <Button
          type="button"
          variant="outline"
          disabled={currentStep === 0 || isLoading}
          onClick={() => {
            if (currentStep > 0) {
              setCurrentStep((prev) => prev - 1);
            }
          }}
        >
          Anterior
        </Button>

        {currentStep === 2 ? (
          <Button
            type="button"
            onClick={() => {
              reset();
              setCurrentStep(0);
              form.reset();
            }}
          >
            Nueva Simulación
          </Button>
        ) : (
          <Button
            type="button"
            disabled={currentStep === 1 && isLoading}
            onClick={() => {
              if (currentStep < 2) {
                form.handleSubmit(handleSubmit)();
              }
            }}
          >
            {isLoading ? <LoadingDots color="white" /> : 'Continuar'}
          </Button>
        )}
      </motion.div>
    </>
  );
};

export default TsunamiForm;
