import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

// 1. Obtener todos los usuarios registrados (Para tu panel de Admin)
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      // Seleccionamos qué datos enviar al frontend (NUNCA enviamos la contraseña)
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Primero borramos cualquier token de sesión vinculado a este usuario para romper el amarre
    await prisma.refreshToken.deleteMany({
      where: { userId: id }
    });

    // 2. Ahora sí, la base de datos está libre y nos dejará borrar al usuario
    await prisma.user.delete({
      where: { id: id }
    });

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo eliminar el usuario' });
  }
});
// 2. Crear un nuevo usuario (Solo lo hará el Admin)
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificar si el correo ya existe para no duplicar empleados
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Este correo ya está registrado en Zentia.' });
    }

    // Encriptar la contraseña de forma segura
    const hashedPassword = await bcrypt.hash(password, 10);

    // Guardar en la base de datos
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: role || 'SELLER' // Si no se envía rol, por defecto es Vendedor
      },
      select: { id: true, name: true, email: true, role: true }
    });

    res.status(201).json({ message: 'Empleado registrado exitosamente', user: newUser });
  } catch (error) {
    console.error("Error creando usuario:", error);
    res.status(500).json({ error: 'Error interno al crear el empleado' });
  }
});

export const usersRouter = router;