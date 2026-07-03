import express from 'express';
import { getExercises, createExercise } from '../controllers/exerciseController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getExercises);
router.post('/', authenticateToken, createExercise);

export default router;
