import type { Request, Response } from "express";
import prisma from "../prisma";
import type { AuthRequest } from "../middleware/auth.middleware";

type Subscripcion = {
  id:                number,
  nombre:            string,
  precio:            number,
  fechaRenovacion:   Date,
  userId:            number,
  createdAt:         Date,
  updatedAt:         Date
}

export const crearSubscripcion = async (req: AuthRequest, res: Response) => {
  const { nombre, precio, fechaRenovacion } = req.body;
  const userId = req.userId;
  
  if (!nombre || !precio || !fechaRenovacion) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }
  
  try {
    const nuevaSubscripcion = await prisma.subscripcion.create({
      data: { 
        nombre, 
        precio: parseFloat(precio), 
        fechaRenovacion: new Date(fechaRenovacion), 
        userId: userId! 
      },
    });
    res.status(201).json(nuevaSubscripcion);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la subscripción" });
  }
};

export const obtenerSubscripciones = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  
  try {
    const subscripciones = await prisma.subscripcion.findMany({ 
      where: { userId: userId! }
    });
    res.status(200).json(subscripciones);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las subscripciones" });
  }
};

export const actualizarSubscripcion = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { nombre, precio, fechaRenovacion } = req.body;
  const userId = req.userId;
  
  try {
    // Verificar que la suscripción pertenece al usuario
    const subscripcion = await prisma.subscripcion.findUnique({
      where: { id: Number(id) }
    });
    
    if (!subscripcion || subscripcion.userId !== userId) {
      return res.status(403).json({ error: "No autorizado para actualizar esta suscripción" });
    }
    
    const actualizada = await prisma.subscripcion.update({
      where: { id: Number(id) },
      data: {
        ...(nombre && { nombre }),
        ...(precio && { precio: parseFloat(precio) }),
        ...(fechaRenovacion && { fechaRenovacion: new Date(fechaRenovacion) })
      }
    });
    
    res.status(200).json(actualizada);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la subscripción" });
  }
};

export const eliminarSubscripcion = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;
  
  try {
    // Verificar que la suscripción pertenece al usuario
    const subscripcion = await prisma.subscripcion.findUnique({
      where: { id: Number(id) }
    });
    
    if (!subscripcion || subscripcion.userId !== userId) {
      return res.status(403).json({ error: "No autorizado para eliminar esta suscripción" });
    }
    
    await prisma.subscripcion.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la subscripción" });
  }
};