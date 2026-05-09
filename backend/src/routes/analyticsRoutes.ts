import { Router } from "express";
import authenticateToken from "../middlewares/authMiddleware"
import { createIndexRecord, getPlayerHistory, getTeamStatus, previewIndex, updateTeamAnalytics } from "../controllers/analyticsController";
import { checkRole } from "../middlewares/roleMiddleware";

const router = Router();

router.get('/readiness/history/:playerId', authenticateToken, checkRole(['ADMIN', 'ANALYST', 'COACH', 'MANAGER']),getPlayerHistory);
router.get('/readiness/team/:teamId', authenticateToken, checkRole(['ADMIN', 'ANALYST', 'COACH', 'MANAGER']),getTeamStatus);
router.get('/readiness/preview/:playerId', authenticateToken, checkRole(['ADMIN', 'ANALYST', 'COACH', 'MANAGER']), previewIndex);
router.post('/readiness/save', authenticateToken, checkRole(['ADMIN', 'ANALYST']), createIndexRecord);
router.post('/readiness/refresh-team', authenticateToken, checkRole(['ADMIN', 'ANALYST']),updateTeamAnalytics);

export default router;
