import { Router } from "express";
import authenticateToken from "../middlewares/authMiddleware"
import { checkRole } from "../middlewares/roleMiddleware";
import { createTrainingStats, deleteTrainingStats, updateTrainingStats, upsertTrainingStats } from "../controllers/trainingStatsController";

const router = Router()

router.post("/", authenticateToken, checkRole(['ADMIN', 'MANAGER']), createTrainingStats)
router.patch("/:id", authenticateToken, checkRole(['ADMIN', 'MANAGER']), updateTrainingStats)
router.put("/sync", authenticateToken, checkRole(['ADMIN', 'COACH']), upsertTrainingStats);
router.delete("/:id", authenticateToken, checkRole(['ADMIN', 'MANAGER']), deleteTrainingStats)

export default router
