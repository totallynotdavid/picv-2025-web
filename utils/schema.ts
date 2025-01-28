import * as z from 'zod';

export const generateFormSchema = z.object({
  magnitude: z
    .number()
    .min(6.5, 'La magnitud debe ser al menos 6.5 Mw')
    .max(10, 'La magnitud no puede exceder 10 Mw'),
  depth: z
    .number()
    .min(0, 'La profundidad no puede ser negativa')
    .max(1000, 'La profundidad no puede exceder 1000 km'),
  latitude: z
    .number()
    .min(-90, 'La latitud debe estar entre -90 y 90')
    .max(90, 'La latitud debe estar entre -90 y 90'),
  longitude: z
    .number()
    .min(-180, 'La longitud debe estar entre -180 y 180')
    .max(180, 'La longitud debe estar entre -180 y 180'),
  datetime: z.date(),
});

export type GenerateFormType = z.infer<typeof generateFormSchema>;
