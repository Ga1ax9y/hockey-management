import { Router } from "express";
import { createUser, getAllUsers, getUserById } from "../controllers/userController";
import authenticateToken from "../middlewares/authMiddleware"

const router = Router();

router.get("/",authenticateToken, getAllUsers);
router.get("/:id", authenticateToken, getUserById);
router.post("/", authenticateToken, createUser)
export default router;
