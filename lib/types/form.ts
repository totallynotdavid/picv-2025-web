import { Control, UseFormReturn } from 'react-hook-form';
import { Location } from './tsunami';
import { Dispatch, SetStateAction } from 'react';

export interface InitialFormProps {
  form: UseFormReturn<GenerateFormData>;
}

export interface GenerateFormData {
  magnitude: number;
  depth: number;
  latitude: number;
  longitude: number;
  datetime: Date;
}

export type FormInputProps = {
  control: Control<GenerateFormData>;
  name: keyof GenerateFormData;
  label: string;
  type?: string;
  placeholder?: string;
  description?: string;
  step?: string;
  // eslint-disable-next-line no-unused-vars
  transform?: (value: string) => any;
};

export interface TsunamiFormProps {
  selectedLocation: Location | null;
  onLocationUpdate: Dispatch<SetStateAction<Location | null>>;
}
