import prisma from '../services/prisma.js';

export const getExercises = async (req, res, next) => {
  try {
    const { search, muscleGroup, difficulty } = req.query;

    const whereClause = {
      OR: [
        { isCustom: false },
        { isCustom: true } // In a multi-user app, you would filter by custom exercises created by this user or public ones
      ]
    };

    if (search) {
      whereClause.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        }
      ];
    }

    if (muscleGroup) {
      if (!whereClause.AND) whereClause.AND = [];
      whereClause.AND.push({ muscleGroup: { equals: muscleGroup, mode: 'insensitive' } });
    }

    if (difficulty) {
      if (!whereClause.AND) whereClause.AND = [];
      whereClause.AND.push({ difficulty: { equals: difficulty, mode: 'insensitive' } });
    }

    const exercises = await prisma.exercise.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    });

    res.json(exercises);
  } catch (err) {
    next(err);
  }
};

export const createExercise = async (req, res, next) => {
  try {
    const { name, description, muscleGroup, difficulty, equipment, image, videoUrl, instructions } = req.body;

    const existing = await prisma.exercise.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ message: 'Exercise with this name already exists' });
    }

    const exercise = await prisma.exercise.create({
      data: {
        name,
        description: description || '',
        muscleGroup,
        difficulty: difficulty || 'BEGINNER',
        equipment: equipment || 'Bodyweight',
        image,
        videoUrl,
        instructions: instructions || '',
        isCustom: req.user.role !== 'ADMIN' // Default to custom if not created by admin
      }
    });

    res.status(201).json({
      message: 'Exercise added successfully',
      exercise
    });
  } catch (err) {
    next(err);
  }
};
