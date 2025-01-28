import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import useMeasure from 'react-use-measure';
import { Button } from '@/components/ui/button';
import LoadingDots from '@/components/ui/loadingdots';
import { generateFormSchema, GenerateFormType } from '@/utils/schema';
import { useTsunamiCalculator } from '@/components/useTsunamiCalculator';
import { Location } from '@/utils/types';
import { formatCoordinate } from '@/utils/utils';
import StepOneForm from '@/components/tsunami/StepOneForm';
import SourceParameters from '@/components/tsunami/SourceParameters';
import TsunamiResults from '@/components/tsunami/TsunamiResults';

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

  const { isLoading, calculationResult, sourceParams, calculateTsunami } =
    useTsunamiCalculator();

  const form = useForm<GenerateFormType>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      magnitude: 6.5,
      depth: 0,
      latitude: 0,
      longitude: 0,
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
  }, [latitude, longitude, onLocationUpdate]);

  const handleSubmit = async (values: GenerateFormType) => {
    try {
      await calculateTsunami(values);
      setCurrentStep((prev) => prev + 1);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <StepOneForm form={form} />;
      case 1:
        return <SourceParameters parameters={sourceParams} />;
      case 2:
        return <TsunamiResults result={calculationResult} />;
      default:
        return null;
    }
  };

  return (
    <>
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
    </>
  );
};

export default TsunamiForm;
