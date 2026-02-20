import { Router } from "express";
import authenticateToken from "../middlewares/authMiddleware"
import { checkRole } from "../middlewares/roleMiddleware";
import { createPlayer, deletePlayer, getAllPlayers, getPlayerById, updatePlayer } from "../controllers/playerController";
const router = Router()

router.get("/", getAllPlayers)
router.get("/:id", getPlayerById)
router.post("/", authenticateToken, checkRole(['ADMIN']), createPlayer)
router.put("/:id", authenticateToken, checkRole(['ADMIN']), updatePlayer)
router.delete("/:id", authenticateToken, checkRole(['ADMIN']), deletePlayer)

export default router
