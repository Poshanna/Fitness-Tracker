import express from 'express';
import { getUsers, deleteUser, getChatbotLogs, getSystemAnalytics } from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken, requireAdmin);

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/chatbot-logs', getChatbotLogs);
router.get('/analytics', getSystemAnalytics);

export default router;
