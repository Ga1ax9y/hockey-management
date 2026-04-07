import { Router } from "express";
import authenticateToken from "../middlewares/authMiddleware"
import { checkRole } from "../middlewares/roleMiddleware";
import { addMedicalRecord, addPhysicalRecord, changePlayerTeam, createPlayer, deletePlayer, getAllPlayers, getPlayerById, updatePlayer } from "../controllers/playerController";
const router = Router()

router.get("/", authenticateToken, getAllPlayers)
router.get("/:id", authenticateToken, getPlayerById)
router.post("/", authenticateToken, checkRole(['ADMIN', 'MANAGER']), createPlayer)
router.put("/:id", authenticateToken, checkRole(['ADMIN', 'MANAGER']), updatePlayer)
router.delete("/:id", authenticateToken, checkRole(['ADMIN', 'MANAGER']), deletePlayer)
router.post("/:id/medicals", authenticateToken, checkRole(['ADMIN', 'DOCTOR']), addMedicalRecord)
router.post("/:id/physicals", authenticateToken, checkRole(['ADMIN', 'DOCTOR', 'COACH']), addPhysicalRecord)
router.patch("/:id/transfer", authenticateToken, checkRole(['ADMIN', 'MANAGER']), changePlayerTeam)

export default router
