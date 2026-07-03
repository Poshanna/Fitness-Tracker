import express from 'express';
import { getSteps, createSteps } from '../controllers/stepsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getSteps);
router.post('/', createSteps);

export default router;
