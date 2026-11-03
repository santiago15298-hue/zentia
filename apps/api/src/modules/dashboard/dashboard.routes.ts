import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/stats', async (req, res) => {
  try {
    // 1. Contar clientes y productos
    const totalCustomers = await prisma.customer.count();
    const totalProducts = await prisma.product.count();
    
    // 2. Contar cotizaciones y sumar todo el dinero cotizado
    const totalQuotes = await prisma.quote.count();
    const quotesSum = await prisma.quote.aggregate({
      _sum: { total: true }
    });

    // 3. Traer las últimas 5 cotizaciones recientes para la tabla rápida
    const recentQuotes = await prisma.quote.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { name: true } } }
    });

    res.json({
      customers: totalCustomers,
      products: totalProducts,
      quotes: totalQuotes,
      revenue: quotesSum._sum.total || 0,
      recentQuotes
    });
  } catch (error) {
    console.error("Error en dashboard:", error);
    res.status(500).json({ error: 'Error al cargar métricas' });
  }
});

export const dashboardRouter = router;