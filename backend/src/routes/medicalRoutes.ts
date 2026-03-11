import { Router } from "express";
import authenticateToken from "../middlewares/authMiddleware"
import { checkRole } from "../middlewares/roleMiddleware";
import { markPlayerRecovered } from "../controllers/medicalController";

const router = Router()

router.patch("/:id/recover", authenticateToken, checkRole(['ADMIN', 'DOCTOR']), markPlayerRecovered)


export default router
