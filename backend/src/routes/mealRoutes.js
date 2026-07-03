import express from 'express';
import { getMeals, createMeal, deleteMeal } from '../controllers/mealController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getMeals);
router.post('/', createMeal);
router.delete('/:id', deleteMeal);

export default router;
