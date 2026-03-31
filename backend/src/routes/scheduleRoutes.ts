import { Router } from "express";
import authenticateToken from "../middlewares/authMiddleware"
import { checkRole } from "../middlewares/roleMiddleware";
import { getSchedule } from "../controllers/scheduleController";
const router = Router()

router.get("/:teamId", authenticateToken, getSchedule)


export default router
