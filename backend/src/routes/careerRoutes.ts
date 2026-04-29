import { Router } from "express";
import authenticateToken from "../middlewares/authMiddleware"
import { checkRole } from "../middlewares/roleMiddleware";
import { changePlayerTeam } from "../controllers/careerController";

const router = Router()

router.patch("/add/:id", authenticateToken, checkRole(['ADMIN', 'DOCTOR', 'COACH']), changePlayerTeam )

export default router
