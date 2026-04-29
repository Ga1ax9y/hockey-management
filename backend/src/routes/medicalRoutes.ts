import { Router } from "express";
import authenticateToken from "../middlewares/authMiddleware"
import { checkRole } from "../middlewares/roleMiddleware";
import { addMedicalRecord, getMedicalHistory, markPlayerRecovered } from "../controllers/medicalController";

const router = Router()

router.get("/:id", authenticateToken, checkRole(['ADMIN', 'DOCTOR', 'COACH']), getMedicalHistory)
router.patch("/:id/recover", authenticateToken, checkRole(['ADMIN', 'DOCTOR']), markPlayerRecovered)
router.post("/add/:id", authenticateToken, checkRole(['ADMIN', 'DOCTOR']), addMedicalRecord)

export default router
