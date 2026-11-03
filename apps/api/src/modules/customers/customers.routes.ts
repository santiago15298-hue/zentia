import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// 1. Ruta para listar todos los clientes
router.get('/', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' } // Los más recientes primero
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la lista de clientes' });
  }
});

// 2. Ruta para crear un cliente nuevo
// 2. Ruta para crear un cliente nuevo
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, document } = req.body;
    
    // Si llegan vacíos (""), los pasamos a undefined para no romper las reglas de campos únicos
    const newCustomer = await prisma.customer.create({
      data: { 
        name, 
        email: email !== '' ? email : undefined, 
        phone: phone !== '' ? phone : undefined, 
        document: document !== '' ? document : undefined 
      }
    });
    res.status(201).json(newCustomer);
  } catch (error: any) {
    console.error("Error exacto de Prisma:", error);
    res.status(500).json({ 
      error: 'Error al guardar el cliente en la base de datos',
      detalles: error.message || "Error desconocido"
    });
  }
});

export const customersRouter = router;