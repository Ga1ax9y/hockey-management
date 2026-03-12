import { Router } from "express";
import authenticateToken from "../middlewares/authMiddleware"
import { checkRole } from "../middlewares/roleMiddleware";
import { addUserToTeam, createTeam, deleteTeam, getAllTeams, getTeamById, removeUserFromTeam, updateTeam } from "../controllers/teamController";
const router = Router()

router.get("/", authenticateToken, getAllTeams)
router.get("/:id", authenticateToken, getTeamById)
router.post("/:id/users", authenticateToken, checkRole(['ADMIN', 'MANAGER']), addUserToTeam)
router.post("/", authenticateToken, checkRole(['ADMIN', 'MANAGER']), createTeam)
router.put("/:id", authenticateToken, checkRole(['ADMIN', 'MANAGER']), updateTeam)
router.delete("/:id/users/:userId", authenticateToken, checkRole(['ADMIN', 'MANAGER']), removeUserFromTeam)
router.delete("/:id", authenticateToken, checkRole(['ADMIN', 'MANAGER']), deleteTeam)

export default router
