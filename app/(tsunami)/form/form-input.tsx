import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/_components/ui/templates/form';
import { Input } from '@/app/_components/ui/templates/input';
import { FormInputProps } from '@/lib/types/form';

export const FormInput = ({
  name,
  label,
  type = 'text',
  placeholder,
  description,
  step,
  transform = (value: string) => value,
}: FormInputProps) => {
  const { control } = useFormContext();

  return (
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
                  ? field.value.toISOString().slice(0, 16)
                  : (field.value ?? '')
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
};
