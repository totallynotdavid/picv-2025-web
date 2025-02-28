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
import { useFormContext } from 'react-hook-form';

export const FormInput = ({
  description,
  label,
  name,
  placeholder,
  step,
  transform = (value: string) => value,
  type = 'text',
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
              placeholder={placeholder}
              step={step}
              type={type}
              {...field}
              onChange={(e) => field.onChange(transform(e.target.value))}
              value={
                field.value instanceof Date
                  ? field.value.toISOString().slice(0, 16)
                  : (field.value ?? '')
              }
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
