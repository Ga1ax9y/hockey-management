import { Router } from "express";
import authenticateToken from "../middlewares/authMiddleware"
import { checkRole } from "../middlewares/roleMiddleware";
import { getAllPhysicalData } from "../controllers/physicalController";

const router = Router()

 router.get("/:id", authenticateToken, checkRole(['ADMIN', 'DOCTOR', 'COACH']), getAllPhysicalData)

export default router
