import type { Request, Response } from "express";
import prisma from "../prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import type { AuthRequest } from "../middleware/auth.middleware";
import { logger } from "../utils/logger";

const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // Validación de entrada
  if (!email || !password) {
    logger.warn('Intento de registro sin email o contraseña');
    return res.status(400).json({ error: "Email y contraseña son requeridos" });
  }
  
  if (password.length < 6) {
    logger.warn(`Intento de registro con contraseña débil: ${email}`);
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    logger.info(`Nuevo usuario registrado: ${email}`);
    res.status(201).json({ id: newUser.id, email: newUser.email });
  } catch (error: any) {
    // Si el email ya existe
    if (error.code === 'P2002') {
      logger.warn(`Intento de registro con email existente: ${email}`);
      return res.status(400).json({ error: "Este email ya está registrado" });
    }
    logger.error(`Error al registrar usuario: ${email}`, error);
    res.status(500).json({ error: "Error al registrar el usuario" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son requeridos" });
  }
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    
    if (!JWT_SECRET) {
      return res.status(500).json({ error: "Configuración del servidor incompleta" });
    }
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.status(200).json({ id: user.id, email: user.email });
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
};
