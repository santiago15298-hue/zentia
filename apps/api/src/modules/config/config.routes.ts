import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// 1. Obtener los datos de la empresa (solo debe haber una)
router.get('/', async (req, res) => {
  try {
    let config = await prisma.companyConfig.findFirst();
    
    // Si es la primera vez y no hay datos, creamos unos por defecto
    if (!config) {
      config = await prisma.companyConfig.create({
        data: {
          name: 'Mi Empresa SAS',
          nit: '900.000.000-1',
          address: 'Calle Principal 123, Medellín',
          phone: '3000000000',
          email: 'contacto@miempresa.com'
        }
      });
    }
    res.json(config);
  } catch (error) {
    console.error("Error al cargar configuración:", error);
    res.status(500).json({ error: 'Error al obtener la configuración' });
  }
});

// 2. Actualizar los datos de la empresa
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, nit, address, phone, email, logoUrl } = req.body;
    
    const updatedConfig = await prisma.companyConfig.update({
      where: { id },
      data: { name, nit, address, phone, email, logoUrl }
    });
    
    res.json({ message: 'Configuración actualizada', config: updatedConfig });
  } catch (error) {
    console.error("Error al actualizar:", error);
    res.status(500).json({ error: 'Error al actualizar la configuración' });
  }
});

export const configRouter = router;