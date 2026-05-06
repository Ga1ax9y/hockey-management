import { Router } from "express";
import authenticateToken from "../middlewares/authMiddleware"
import { checkRole } from "../middlewares/roleMiddleware";
import { changePlayerTeam, getTransfers } from "../controllers/careerController";

const router = Router()

router.get("/:id", authenticateToken, checkRole(['ADMIN', 'MANAGER', 'COACH']), getTransfers)
router.patch("/add/:id", authenticateToken, checkRole(['ADMIN', 'DOCTOR', 'COACH']), changePlayerTeam )

export default router
