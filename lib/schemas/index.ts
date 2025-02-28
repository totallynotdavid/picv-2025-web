import { z } from 'zod';

export const generateFormSchema = z.object({
  datetime: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      return new Date(arg);
    }
    return arg;
  }, z.date()),
  depth: z
    .number()
    .min(0, { message: 'La profundidad mínima es 0 km' })
    .max(100, { message: 'La profundidad máxima es 100 km' }),
  latitude: z
    .number()
    .min(-90, { message: 'La latitud mínima es -90' })
    .max(90, { message: 'La latitud máxima es 90' }),
  longitude: z
    .number()
    .min(-180, { message: 'La longitud mínima es -180' })
    .max(180, { message: 'La longitud máxima es 180' }),
  magnitude: z
    .number()
    .min(6.5, { message: 'La magnitud mínima es 6.5' })
    .max(9.5, { message: 'La magnitud máxima es 9.5' }),
});

export type GenerateFormType = z.infer<typeof generateFormSchema>;
