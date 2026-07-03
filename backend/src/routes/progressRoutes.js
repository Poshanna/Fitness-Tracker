import express from 'express';
import { getProgress, createProgress } from '../controllers/progressController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getProgress);
router.post('/', createProgress);

export default router;
