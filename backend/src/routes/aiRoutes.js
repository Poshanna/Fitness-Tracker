import express from 'express';
import { chat, workoutPlan, nutritionPlan, insights } from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/chat', chat);
router.post('/workout-plan', workoutPlan);
router.post('/nutrition-plan', nutritionPlan);
router.get('/insights', insights);

export default router;
