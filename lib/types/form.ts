import { Control, FieldPath, FieldValues } from 'react-hook-form';

export interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  type?: string;
  placeholder?: string;
  description?: string;
  step?: string;
  transform?: (value: string) => any;
}
