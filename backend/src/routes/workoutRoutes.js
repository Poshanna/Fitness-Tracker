import express from 'express';
import { getWorkouts, createWorkout, updateWorkout, deleteWorkout } from '../controllers/workoutController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getWorkouts);
router.post('/', createWorkout);
router.put('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);

export default router;
