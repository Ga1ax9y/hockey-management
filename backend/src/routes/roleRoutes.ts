import { Router } from "express";
import { createRole, deleteRole, getAllRoles, getRoleById, updateRole } from "../controllers/roleController";
import authenticateToken from "../middlewares/authMiddleware"
import { checkRole } from "../middlewares/roleMiddleware";
const router = Router()

router.get("/", getAllRoles)
router.get("/:id", getRoleById)
router.post("/", authenticateToken, checkRole(['ADMIN']), createRole)
router.put("/:id", authenticateToken, checkRole(['ADMIN']), updateRole)
router.delete("/:id", authenticateToken, checkRole(['ADMIN']), deleteRole)

export default router
