export type FormInputProps = {
  description?: string;
  label: string;
  name: keyof GenerateFormData;
  placeholder?: string;
  step?: string;
  // eslint-disable-next-line no-unused-vars
  transform?: (value: string) => any;
  type?: string;
};

export interface GenerateFormData {
  datetime: Date;
  depth: number;
  latitude: number;
  longitude: number;
  magnitude: number;
}
