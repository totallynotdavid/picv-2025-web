import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/_components/ui/templates/form';
import { Input } from '@/app/_components/ui/templates/input';
import { Control } from 'react-hook-form';
import { GenerateFormData } from '../types';

type FormInputProps = {
  control: Control<GenerateFormData>;
  name: keyof GenerateFormData;
  label: string;
  type?: string;
  placeholder?: string;
  description?: string;
  step?: string;
  transform?: (value: string) => any;
};

export const FormInput = ({
  control,
  name,
  label,
  type = 'text',
  placeholder,
  description,
  step,
  transform = (v) => v,
}: FormInputProps) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input
            type={type}
            step={step}
            placeholder={placeholder}
            {...field}
            value={
              field.value instanceof Date
                ? field.value.toISOString()
                : field.value || ''
            }
            onChange={(e) => field.onChange(transform(e.target.value))}
          />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);
