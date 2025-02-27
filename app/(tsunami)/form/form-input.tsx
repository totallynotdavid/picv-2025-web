import { FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/_components/ui/templates/form';
import { Input } from '@/app/_components/ui/templates/input';

type FormInputProps<T extends FieldValues> = {
  control: any;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  description?: string;
  step?: string;
  transform?: (value: string) => any;
};

export const FormInput = <T extends FieldValues>({
  control,
  name,
  label,
  type = 'text',
  placeholder,
  description,
  step,
  transform = (v) => v,
}: FormInputProps<T>) => (
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
            onChange={(e) => field.onChange(transform(e.target.value))}
          />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);
