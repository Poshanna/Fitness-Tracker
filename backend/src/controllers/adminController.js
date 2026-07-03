import prisma from '../services/prisma.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        goal: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (userId === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const getChatbotLogs = async (req, res, next) => {
  try {
    const logs = await prisma.aIChatHistory.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Last 100 chat exchanges
    });
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

export const getSystemAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalWorkouts = await prisma.workout.count();
    const totalMeals = await prisma.meal.count();
    const totalWaterLogs = await prisma.waterLog.count();
    const totalStepsLogs = await prisma.stepsLog.count();

    res.json({
      totalUsers,
      totalWorkouts,
      totalMeals,
      totalWaterLogs,
      totalStepsLogs
    });
  } catch (err) {
    next(err);
  }
};
