import { Router } from "express";
import { crearSubscripcion, eliminarSubscripcion, obtenerSubscripciones, actualizarSubscripcion } from "../controllers/subscripciones.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.post("/", crearSubscripcion);
router.get("/", obtenerSubscripciones);
router.put("/:id", actualizarSubscripcion);
router.delete("/:id", eliminarSubscripcion);

export default router;