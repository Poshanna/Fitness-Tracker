import prisma from '../services/prisma.js';

export const getWorkouts = async (req, res, next) => {
  try {
    const { startDate, endDate, muscleGroup, name } = req.query;

    const whereClause = {
      userId: req.user.id
    };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.date.lte = new Date(endDate);
      }
    }

    if (name) {
      whereClause.name = { contains: name, mode: 'insensitive' };
    }

    if (muscleGroup) {
      whereClause.exercises = {
        some: {
          muscleGroup: { equals: muscleGroup, mode: 'insensitive' }
        }
      };
    }

    const workouts = await prisma.workout.findMany({
      where: whereClause,
      include: {
        exercises: {
          include: {
            exercise: {
              select: {
                image: true,
                difficulty: true,
                instructions: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.json(workouts);
  } catch (err) {
    next(err);
  }
};

export const createWorkout = async (req, res, next) => {
  try {
    const { name, date, completed, notes, duration, caloriesBurned, exercises } = req.body;

    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ message: 'At least one exercise is required' });
    }

    // Process nested exercises
    const workoutExercisesData = exercises.map(ex => ({
      exerciseId: ex.exerciseId ? parseInt(ex.exerciseId) : null,
      exerciseName: ex.exerciseName || 'Custom Exercise',
      muscleGroup: ex.muscleGroup || 'Full Body',
      sets: parseInt(ex.sets) || 1,
      reps: parseInt(ex.reps) || 10,
      weight: parseFloat(ex.weight) || 0,
      restTime: ex.restTime ? parseInt(ex.restTime) : null,
      notes: ex.notes || ''
    }));

    // Start a Prisma transaction
    const newWorkout = await prisma.$transaction(async (tx) => {
      const workout = await tx.workout.create({
        data: {
          userId: req.user.id,
          name: name || 'Custom Workout',
          date: date ? new Date(date) : new Date(),
          completed: completed ?? false,
          notes: notes || '',
          duration: duration ? parseInt(duration) : 0,
          caloriesBurned: caloriesBurned ? parseInt(caloriesBurned) : 0,
          exercises: {
            create: workoutExercisesData
          }
        },
        include: {
          exercises: true
        }
      });

      return workout;
    });

    res.status(201).json({
      message: 'Workout logged successfully',
      workout: newWorkout
    });
  } catch (err) {
    next(err);
  }
};

export const updateWorkout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, date, completed, notes, duration, caloriesBurned, exercises } = req.body;

    const workoutId = parseInt(id);

    // Verify ownership
    const existingWorkout = await prisma.workout.findUnique({
      where: { id: workoutId }
    });

    if (!existingWorkout || existingWorkout.userId !== req.user.id) {
      return res.status(404).json({ message: 'Workout not found or access denied' });
    }

    const updatedWorkout = await prisma.$transaction(async (tx) => {
      // 1. Delete all existing exercises in this workout
      await tx.workoutExercise.deleteMany({
        where: { workoutId }
      });

      // 2. Prepare new exercise data
      const workoutExercisesData = (exercises || []).map(ex => ({
        workoutId,
        exerciseId: ex.exerciseId ? parseInt(ex.exerciseId) : null,
        exerciseName: ex.exerciseName || 'Custom Exercise',
        muscleGroup: ex.muscleGroup || 'Full Body',
        sets: parseInt(ex.sets) || 1,
        reps: parseInt(ex.reps) || 10,
        weight: parseFloat(ex.weight) || 0,
        restTime: ex.restTime ? parseInt(ex.restTime) : null,
        notes: ex.notes || ''
      }));

      // 3. Update the main workout record
      const workout = await tx.workout.update({
        where: { id: workoutId },
        data: {
          name: name || existingWorkout.name,
          date: date ? new Date(date) : existingWorkout.date,
          completed: completed ?? existingWorkout.completed,
          notes: notes !== undefined ? notes : existingWorkout.notes,
          duration: duration !== undefined ? parseInt(duration) : existingWorkout.duration,
          caloriesBurned: caloriesBurned !== undefined ? parseInt(caloriesBurned) : existingWorkout.caloriesBurned,
          exercises: {
            create: workoutExercisesData
          }
        },
        include: {
          exercises: true
        }
      });

      return workout;
    });

    res.json({
      message: 'Workout updated successfully',
      workout: updatedWorkout
    });
  } catch (err) {
    next(err);
  }
};

export const deleteWorkout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workoutId = parseInt(id);

    const workout = await prisma.workout.findUnique({
      where: { id: workoutId }
    });

    if (!workout || workout.userId !== req.user.id) {
      return res.status(404).json({ message: 'Workout not found or access denied' });
    }

    await prisma.workout.delete({
      where: { id: workoutId }
    });

    res.json({ message: 'Workout deleted successfully' });
  } catch (err) {
    next(err);
  }
};
