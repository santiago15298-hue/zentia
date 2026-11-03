import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// 1. Ruta para listar todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el inventario' });
  }
});

// 2. Ruta para crear un producto nuevo
router.post('/', async (req, res) => {
  try {
    const { name, price } = req.body;
    
    const newProduct = await prisma.product.create({
      data: { 
        name, 
        price: Number(price) // Nos aseguramos de que se guarde como número
      }
    });
    res.status(201).json(newProduct);
  } catch (error: any) {
    console.error("Error de Prisma:", error);
    res.status(500).json({ 
      error: 'Error al guardar el producto',
      detalles: error.message || "Error desconocido"
    });
  }
});
// Actualizar un producto (Ej: cambiar el stock)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, name, price } = req.body;
    
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        // Solo actualizamos lo que nos envíen
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(name && { name }),
        ...(price && { price: Number(price) })
      }
    });
    
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error actualizando producto:", error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});
export const productsRouter = router;