import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// 1. Obtener todos los pedidos
router.get('/', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { customer: true, quote: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// 2. Convertir Cotización a Pedido y Descontar Inventario
router.post('/from-quote/:quoteId', async (req, res) => {
  try {
    const { quoteId } = req.params;
    
    // Traemos la cotización CON los productos de la bodega para ver el stock real
    const quote = await prisma.quote.findUnique({ 
      where: { id: quoteId },
      include: { 
        items: { 
          include: { product: true } 
        } 
      } 
    });
    
    if (!quote) return res.status(404).json({ error: 'Cotización no encontrada' });
    if (quote.status === 'ACCEPTED') return res.status(400).json({ error: 'Esta cotización ya es un pedido' });

    // 🚨 GUARDIA DE SEGURIDAD ESTRICTO
    for (const item of quote.items) {
      if (item.quantity > item.product.stock) {
        // Bloqueamos la operación inmediatamente y enviamos el error al frontend
        return res.status(400).json({ 
          error: `Stock insuficiente para "${item.product.name}". Intentas vender ${item.quantity}, pero solo quedan ${item.product.stock} unidades.` 
        });
      }
    }

    // Si hay stock suficiente, preparamos las operaciones
    const operations: any[] = [
      prisma.quote.update({
        where: { id: quoteId },
        data: { status: 'ACCEPTED' }
      }),
      prisma.order.create({
        data: {
          total: quote.total,
          quoteId: quote.id,
          customerId: quote.customerId,
          status: 'PENDING'
        }
      })
    ];

    // Restamos el inventario exactamente por la cantidad vendida
    for (const item of quote.items) {
      operations.push(
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } } 
        })
      );
    }

    // Ejecutamos todo como una Transacción (si algo falla, se cancela todo)
    const results = await prisma.$transaction(operations);

    res.status(201).json({ message: 'Pedido creado exitosamente', order: results[1] });
  } catch (error) {
    console.error("Error al crear pedido:", error);
    res.status(500).json({ error: 'Error interno al procesar el pedido' });
  }
});
// 3. Actualizar el estado del pedido (Cobranza / Caja)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Esperamos recibir 'PAID' (Pagado), 'DELIVERED' (Entregado), etc.
    
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });
    
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error);
    res.status(500).json({ error: 'Error al actualizar el cobro' });
  }
});
export const ordersRouter = router;