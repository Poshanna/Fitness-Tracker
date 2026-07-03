import express from 'express';
import { getWater, createWater } from '../controllers/waterController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getWater);
router.post('/', createWater);

export default router;
