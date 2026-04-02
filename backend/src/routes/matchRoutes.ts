import { Router } from "express";
import authenticateToken from "../middlewares/authMiddleware"
import { checkRole } from "../middlewares/roleMiddleware";
import { createMatch, deleteMatch, getAllMatches, getMatchById, updateMatch } from "../controllers/matchController";
const router = Router()

router.get("/", authenticateToken, getAllMatches)
router.get("/:id", authenticateToken, getMatchById)
router.post("/", authenticateToken, checkRole(['ADMIN', 'MANAGER']), createMatch)
router.put("/:id", authenticateToken, checkRole(['ADMIN', 'MANAGER']), updateMatch)
router.delete("/:id", authenticateToken, checkRole(['ADMIN', 'MANAGER']), deleteMatch)

export default router
