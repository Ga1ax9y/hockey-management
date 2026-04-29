import { Router } from "express";
import authenticateToken from "../middlewares/authMiddleware"
import { checkRole } from "../middlewares/roleMiddleware";
import { addPhysicalRecord, getAllPhysicalData } from "../controllers/physicalController";

const router = Router()

router.get("/:id", authenticateToken, checkRole(['ADMIN', 'DOCTOR', 'COACH']), getAllPhysicalData)
router.post("/add/:id", authenticateToken, checkRole(['ADMIN', 'DOCTOR', 'COACH']), addPhysicalRecord)

export default router
