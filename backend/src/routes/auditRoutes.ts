import { Router } from "express";
import  authenticateToken  from "../middlewares/authMiddleware";
import { checkRole } from "../middlewares/roleMiddleware";
import { getAllLogs } from "../controllers/auditController";

const router = Router();

router.get('/',authenticateToken,checkRole(['ADMIN']), getAllLogs);

export default router;
