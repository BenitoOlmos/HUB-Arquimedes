import { z } from 'zod';

export const partStatusSchema = z.enum(['Operational', 'Inspect', 'Replace']);

export const maintenanceLogSchema = z.object({
  tech: z.string().min(1, "El nombre del técnico es requerido"),
  desc: z.string().min(1, "La descripción del mantenimiento es requerida"),
  status: partStatusSchema.optional()
});

export type PartStatus = z.infer<typeof partStatusSchema>;

export type MaintenanceLogInput = z.infer<typeof maintenanceLogSchema>;
