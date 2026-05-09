import { Router } from "express";
import { createUser, getAllUsers, getUserById, updateUser } from "../controllers/userController";
import authenticateToken from "../middlewares/authMiddleware"
import { upload } from "../config/cloudinary"

const router = Router();

router.get("/",authenticateToken, getAllUsers);
router.get("/:id", authenticateToken, getUserById);
router.post("/", authenticateToken, upload.single('avatar'), createUser)
router.patch("/:id", authenticateToken, updateUser)

export default router;
