import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'zentia_secreto_seguro_2026';

// 1. Ruta temporal para crear tu primer Administrador
router.post('/setup', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const adminUser = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'ADMIN' // Rol en inglés como quedó en la base de datos
      }
    });
    
    res.status(201).json({ message: 'Administrador creado con éxito', email: adminUser.email });
  } catch (error) {
    console.error("Error en setup:", error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

// 2. Ruta oficial de Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Credenciales inválidas o usuario inactivo' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: 'Error en el servidor al intentar iniciar sesión' });
  }
});

export const authRouter = router;