import prisma from '../services/prisma.js';
import { calculateBMI, calculateBMR, calculateTDEE } from '../services/healthCalculations.js';

export const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // 1. Fetch Today's Logs
    const workoutsToday = await prisma.workout.findMany({
      where: { userId, date: { gte: startOfToday, lte: endOfToday } },
      include: { exercises: true }
    });

    const mealsToday = await prisma.meal.findMany({
      where: { userId, date: { gte: startOfToday, lte: endOfToday } },
      include: { foods: true }
    });

    const waterToday = await prisma.waterLog.findMany({
      where: { userId, date: { gte: startOfToday, lte: endOfToday } }
    });

    const stepsToday = await prisma.stepsLog.findMany({
      where: { userId, date: { gte: startOfToday, lte: endOfToday } }
    });

    // 2. Sum up totals
    const caloriesBurnedToday = workoutsToday
      .filter(w => w.completed)
      .reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

    const caloriesConsumedToday = mealsToday.reduce((sum, m) => {
      return sum + m.foods.reduce((fSum, f) => fSum + f.calories, 0);
    }, 0);

    const proteinConsumedToday = mealsToday.reduce((sum, m) => {
      return sum + m.foods.reduce((fSum, f) => fSum + f.protein, 0);
    }, 0);

    const carbsConsumedToday = mealsToday.reduce((sum, m) => {
      return sum + m.foods.reduce((fSum, f) => fSum + f.carbs, 0);
    }, 0);

    const fatConsumedToday = mealsToday.reduce((sum, m) => {
      return sum + m.foods.reduce((fSum, f) => fSum + f.fat, 0);
    }, 0);

    const waterIntakeToday = waterToday.reduce((sum, w) => sum + w.amount, 0);
    const stepsTodayCount = stepsToday.reduce((sum, s) => sum + s.steps, 0);

    // Get latest weight
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const currentWeight = user.weight || 70.0;
    const targetWeight = user.targetWeight || 70.0;

    // Health metrics
    const bmi = calculateBMI(currentWeight, user.height);
    const bmr = calculateBMR(currentWeight, user.height, user.age, user.gender);
    const dailyCalorieRequirement = calculateTDEE(bmr, user.activityLevel);

    // 3. Compute Streak
    // Fetch all completed workouts ordered by date descending
    const completedWorkouts = await prisma.workout.findMany({
      where: { userId, completed: true },
      orderBy: { date: 'desc' },
      select: { date: true }
    });

    let streak = 0;
    if (completedWorkouts.length > 0) {
      const uniqueWorkoutDates = Array.from(
        new Set(completedWorkouts.map(w => new Date(w.date).toDateString()))
      ).map(d => new Date(d));

      const checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);
      
      // Check if they worked out today or yesterday to continue streak
      let workedOutToday = uniqueWorkoutDates.some(d => d.toDateString() === checkDate.toDateString());
      
      const yesterday = new Date(checkDate);
      yesterday.setDate(yesterday.getDate() - 1);
      let workedOutYesterday = uniqueWorkoutDates.some(d => d.toDateString() === yesterday.toDateString());

      if (workedOutToday || workedOutYesterday) {
        let currentStreakDate = workedOutToday ? new Date(checkDate) : new Date(yesterday);
        
        while (true) {
          const match = uniqueWorkoutDates.some(d => d.toDateString() === currentStreakDate.toDateString());
          if (match) {
            streak++;
            currentStreakDate.setDate(currentStreakDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    // 4. Weekly progress (Last 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(today.getDate() - i);
      day.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const dayWorkouts = await prisma.workout.findMany({
        where: { userId, completed: true, date: { gte: day, lte: dayEnd } }
      });
      const dayMeals = await prisma.meal.findMany({
        where: { userId, date: { gte: day, lte: dayEnd } },
        include: { foods: true }
      });
      const dayWater = await prisma.waterLog.findMany({
        where: { userId, date: { gte: day, lte: dayEnd } }
      });
      const daySteps = await prisma.stepsLog.findMany({
        where: { userId, date: { gte: day, lte: dayEnd } }
      });

      const burned = dayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
      const consumed = dayMeals.reduce((sum, m) => sum + m.foods.reduce((fSum, f) => fSum + f.calories, 0), 0);
      const water = dayWater.reduce((sum, w) => sum + w.amount, 0);
      const steps = daySteps.reduce((sum, s) => sum + s.steps, 0);

      weeklyData.push({
        date: day.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: day.toISOString().split('T')[0],
        caloriesBurned: burned,
        caloriesConsumed: consumed,
        waterIntake: water,
        steps
      });
    }

    // 5. Exercise Distribution (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const workoutExercises = await prisma.workoutExercise.findMany({
      where: {
        workout: {
          userId,
          date: { gte: thirtyDaysAgo }
        }
      },
      select: {
        muscleGroup: true
      }
    });

    const muscleGroupMap = {};
    workoutExercises.forEach(ex => {
      const mg = ex.muscleGroup || 'Other';
      muscleGroupMap[mg] = (muscleGroupMap[mg] || 0) + 1;
    });

    const exerciseDistribution = Object.keys(muscleGroupMap).map(mg => ({
      name: mg,
      value: muscleGroupMap[mg]
    }));

    // 6. Goals Progress
    const goals = await prisma.goal.findMany({
      where: { userId, status: 'IN_PROGRESS' }
    });

    const formattedGoals = goals.map(g => {
      // Calculate completion percentage
      let progress = 0;
      if (g.type === 'LOSE_WEIGHT' && user.weight) {
        // e.g. start from registered user weight, approach target weight
        // If target weight was 60 and start was 70, progress goes from 0 to 100 as user drops weight
        const totalToLose = Math.abs(70 - g.targetValue); // dummy start weight 70
        const currentLost = Math.abs(70 - currentWeight);
        progress = totalToLose > 0 ? Math.min(100, Math.round((currentLost / totalToLose) * 100)) : 0;
      } else {
        progress = g.targetValue > 0 ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) : 0;
      }

      return {
        ...g,
        progress
      };
    });

    res.json({
      dailySummary: {
        caloriesBurned: caloriesBurnedToday,
        caloriesConsumed: caloriesConsumedToday,
        proteinConsumed: proteinConsumedToday,
        carbsConsumed: carbsConsumedToday,
        fatConsumed: fatConsumedToday,
        waterIntake: waterIntakeToday,
        steps: stepsTodayCount,
        weight: currentWeight,
        targetWeight,
        calculatedMetrics: {
          bmi,
          bmr,
          dailyCalorieRequirement
        },
        workoutStreak: streak,
        goalCompletionPercentage: formattedGoals.length > 0 ? Math.round(formattedGoals.reduce((sum, g) => sum + g.progress, 0) / formattedGoals.length) : 0
      },
      weeklyProgress: weeklyData,
      exerciseDistribution,
      goals: formattedGoals,
      todayWorkout: workoutsToday.length > 0 ? workoutsToday[0] : null
    });

  } catch (err) {
    next(err);
  }
};
