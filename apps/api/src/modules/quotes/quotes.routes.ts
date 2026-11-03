import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { createQuoteSchema } from '@zentia/shared';

const router = Router();
const prisma = new PrismaClient();

// ==========================================
// 1. Obtener datos para el formulario
// ==========================================
router.get('/form-data', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany();
    const products = await prisma.product.findMany();
    res.json({ customers, products });
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar datos del formulario' });
  }
});

// ==========================================
// 2. Crear una nueva cotización
// ==========================================
router.post('/', async (req, res) => {
  try {
    // Validar los datos de entrada con el esquema compartido de Zod
    const validatedData = createQuoteSchema.parse(req.body);

    // Guardar en la base de datos con Prisma
    const newQuote = await prisma.quote.create({
      data: {
        customerId: validatedData.customerId,
        items: {
          create: validatedData.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice
          }))
        },
        // Calculamos el total de la cotización sumando los subtotales
        total: validatedData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)
      },
      include: {
        items: true // Para que la respuesta incluya los productos guardados
      }
    });

    res.status(201).json(newQuote);
  } catch (error: any) {
    res.status(400).json({ 
      error: 'Error al crear la cotización', 
      details: error.errors || error.message 
    });
  }
});

// ==========================================
// 3. Obtener todas las cotizaciones
// ==========================================
router.get('/', async (req, res) => {
  try {
    const quotes = await prisma.quote.findMany({
      include: { 
        customer: true,
        items: { include: { product: true } } // Fundamental para que el PDF lea los nombres
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el historial de cotizaciones' });
  }
});

export const quotesRouter = router;