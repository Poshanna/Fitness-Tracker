import { getAIChatResponse, getAIWorkoutPlan, getAINutritionPlan, getAIProgressInsights } from '../services/aiService.js';

export const chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message is required' });
    }

    const reply = await getAIChatResponse(req.user.id, message);
    res.json({ reply });
  } catch (err) {
    next(err);
  }
};

export const workoutPlan = async (req, res, next) => {
  try {
    const { age, gender, height, weight, goal, fitnessLevel, equipment, daysPerWeek } = req.body;

    // Validate inputs or fall back to user's profile info
    const params = {
      age: age || req.user.age || 25,
      gender: gender || req.user.gender || 'MALE',
      height: height || req.user.height || 175,
      weight: weight || req.user.weight || 70,
      goal: goal || req.user.goal || 'MAINTAIN_WEIGHT',
      fitnessLevel: fitnessLevel || 'BEGINNER',
      equipment: equipment || 'bodyweight',
      daysPerWeek: daysPerWeek || 3
    };

    const plan = await getAIWorkoutPlan(params);
    res.json(plan);
  } catch (err) {
    next(err);
  }
};

export const nutritionPlan = async (req, res, next) => {
  try {
    const { goal, calories, dietType, allergies, budget } = req.body;

    const params = {
      goal: goal || req.user.goal || 'MAINTAIN_WEIGHT',
      calories: calories || 2000,
      dietType: dietType || 'NON_VEGETARIAN',
      allergies: allergies || 'None',
      budget: budget || 'MEDIUM'
    };

    const plan = await getAINutritionPlan(params);
    res.json(plan);
  } catch (err) {
    next(err);
  }
};

export const insights = async (req, res, next) => {
  try {
    const analysis = await getAIProgressInsights(req.user.id);
    res.json(analysis);
  } catch (err) {
    next(err);
  }
};
