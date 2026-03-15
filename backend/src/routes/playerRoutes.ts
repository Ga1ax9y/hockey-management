import { Router } from "express";
import authenticateToken from "../middlewares/authMiddleware"
import { checkRole } from "../middlewares/roleMiddleware";
import { addMedicalRecord, createPlayer, deletePlayer, getAllPlayers, getPlayerById, updatePlayer } from "../controllers/playerController";
const router = Router()

router.get("/", authenticateToken, getAllPlayers)
router.get("/:id", authenticateToken, getPlayerById)
router.post("/", authenticateToken, checkRole(['ADMIN', 'MANAGER']), createPlayer)
router.put("/:id", authenticateToken, checkRole(['ADMIN', 'MANAGER']), updatePlayer)
router.delete("/:id", authenticateToken, checkRole(['ADMIN', 'MANAGER']), deletePlayer)
router.post("/:id/addMedical", authenticateToken, checkRole(['ADMIN', 'DOCTOR']), addMedicalRecord)

export default router
