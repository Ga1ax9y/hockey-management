import { Router } from "express";
import { createUser, getAllUsers, getUserById } from "../controllers/userController";
import authenticateToken from "../middlewares/authMiddleware"

const router = Router();

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", authenticateToken, createUser)
export default router;
