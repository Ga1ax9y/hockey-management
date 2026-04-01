import { Router } from "express";
import authenticateToken from "../middlewares/authMiddleware"
import { checkRole } from "../middlewares/roleMiddleware";
import { createTraining, deleteTraining, getAllTrainings, getTrainingById, updateTraining } from "../controllers/trainingController";
const router = Router()

router.get("/", authenticateToken, getAllTrainings)
router.get("/:id", authenticateToken, getTrainingById)
router.post("/", authenticateToken, checkRole(['ADMIN', 'COACH']), createTraining)
router.put("/:id", authenticateToken, checkRole(['ADMIN', 'COACH']), updateTraining)
router.delete("/:id", authenticateToken, checkRole(['ADMIN', 'COACH']), deleteTraining)

export default router
