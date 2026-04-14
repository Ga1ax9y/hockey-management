import { Router } from "express";
import authenticateToken from "../middlewares/authMiddleware"
import { checkRole } from "../middlewares/roleMiddleware";
import { createMatchStats, deleteMatchStats, updateMatchStats } from "../controllers/matchStatsController";

const router = Router()

router.post("/", authenticateToken, checkRole(['ADMIN', 'MANAGER']), createMatchStats)
router.patch("/:id", authenticateToken, checkRole(['ADMIN', 'MANAGER']), updateMatchStats)
router.delete("/:id", authenticateToken, checkRole(['ADMIN', 'MANAGER']), deleteMatchStats)

export default router
