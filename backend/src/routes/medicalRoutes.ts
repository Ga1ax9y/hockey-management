import { Router } from "express";
import authenticateToken from "../middlewares/authMiddleware"
import { checkRole } from "../middlewares/roleMiddleware";
import { getMedicalHistory, markPlayerRecovered } from "../controllers/medicalController";

const router = Router()

router.get("/:id", authenticateToken, checkRole(['ADMIN', 'DOCTOR', 'COACH']), getMedicalHistory)
router.patch("/:id/recover", authenticateToken, checkRole(['ADMIN', 'DOCTOR']), markPlayerRecovered)


export default router
