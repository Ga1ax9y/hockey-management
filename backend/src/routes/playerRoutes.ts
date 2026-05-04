import { Router } from "express";
import authenticateToken from "../middlewares/authMiddleware"
import { checkRole } from "../middlewares/roleMiddleware";
import { createPlayer, deletePlayer, getAllPlayers, getPlayerById, updatePlayer } from "../controllers/playerController";
import { upload } from "../config/cloudinary"

const router = Router()

router.get("/", authenticateToken, getAllPlayers)
router.get("/:id", authenticateToken, getPlayerById)
router.post("/", authenticateToken, checkRole(['ADMIN', 'MANAGER']),upload.single('photo'), createPlayer)
router.put("/:id", authenticateToken, checkRole(['ADMIN', 'MANAGER']),upload.single('photo'), updatePlayer)
router.delete("/:id", authenticateToken, checkRole(['ADMIN', 'MANAGER']), deletePlayer)

export default router
