import { Router } from "express";
import authenticateToken from "../middlewares/authMiddleware"
import { checkRole } from "../middlewares/roleMiddleware";
import { addMedicalRecord, createPlayer, deletePlayer, getAllPlayers, getPlayerById, updatePlayer } from "../controllers/playerController";
const router = Router()

router.get("/", getAllPlayers)
router.get("/:id", getPlayerById)
router.post("/", authenticateToken, checkRole(['ADMIN']), createPlayer)
router.put("/:id", authenticateToken, checkRole(['ADMIN']), updatePlayer)
router.delete("/:id", authenticateToken, checkRole(['ADMIN']), deletePlayer)
router.post("/:id/addMedical", authenticateToken, checkRole(['ADMIN', 'DOCTOR']), addMedicalRecord)

export default router
