import { z } from 'zod';

// --- Módulo 3: Clientes y Productos ---
export const createCustomerSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
});
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export const createProductSchema = z.object({
  name: z.string().min(2, 'El nombre del producto es obligatorio'),
  price: z.number().positive('El precio debe ser mayor a cero'),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

// --- Módulo 4: Cotizaciones ---
export const quoteItemSchema = z.object({
  productId: z.string().uuid('ID de producto inválido'),
  quantity: z.number().int().positive('La cantidad debe ser un entero positivo'),
  unitPrice: z.number().positive('El precio unitario debe ser mayor a cero'),
});

export const createQuoteSchema = z.object({
  customerId: z.string().uuid('ID de cliente inválido'),
  items: z.array(quoteItemSchema).min(1, 'La cotización debe tener al menos un producto'),
});
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;