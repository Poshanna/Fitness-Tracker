import prisma from '../services/prisma.js';

export const getMeals = async (req, res, next) => {
  try {
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    
    // Set range to cover the entire day in local timezone or UTC
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await prisma.meal.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        foods: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.json(meals);
  } catch (err) {
    next(err);
  }
};

export const createMeal = async (req, res, next) => {
  try {
    const { date, type, foods } = req.body;

    if (!type || !foods || !Array.isArray(foods) || foods.length === 0) {
      return res.status(400).json({ message: 'Meal type and at least one food item are required' });
    }

    const mealDate = date ? new Date(date) : new Date();

    const formattedFoods = foods.map(food => ({
      name: food.name || 'Unknown Food',
      calories: parseFloat(food.calories) || 0,
      protein: parseFloat(food.protein) || 0,
      carbs: parseFloat(food.carbs) || 0,
      fat: parseFloat(food.fat) || 0,
      fiber: parseFloat(food.fiber) || 0
    }));

    const newMeal = await prisma.meal.create({
      data: {
        userId: req.user.id,
        date: mealDate,
        type,
        foods: {
          create: formattedFoods
        }
      },
      include: {
        foods: true
      }
    });

    res.status(201).json({
      message: 'Meal logged successfully',
      meal: newMeal
    });
  } catch (err) {
    next(err);
  }
};

export const deleteMeal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mealId = parseInt(id);

    const meal = await prisma.meal.findUnique({
      where: { id: mealId }
    });

    if (!meal || meal.userId !== req.user.id) {
      return res.status(404).json({ message: 'Meal not found or access denied' });
    }

    await prisma.meal.delete({
      where: { id: mealId }
    });

    res.json({ message: 'Meal deleted successfully' });
  } catch (err) {
    next(err);
  }
};
