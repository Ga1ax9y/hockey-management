import { Router } from "express";
import authenticateToken from "../middlewares/authMiddleware"
import { checkRole } from "../middlewares/roleMiddleware";
import { createTeam, deleteTeam, getAllTeams, getTeamById, updateTeam } from "../controllers/teamController";
const router = Router()

router.get("/", getAllTeams)
router.get("/:id", getTeamById)
router.post("/", authenticateToken, checkRole(['ADMIN', 'MANAGER']), createTeam)
router.put("/:id", authenticateToken, checkRole(['ADMIN', 'MANAGER']), updateTeam)
router.delete("/:id", authenticateToken, checkRole(['ADMIN', 'MANAGER']), deleteTeam)

export default router
