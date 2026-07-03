import prisma from '../services/prisma.js';

export const getSteps = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await prisma.stepsLog.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const totalSteps = logs.reduce((sum, log) => sum + log.steps, 0);

    res.json({
      logs,
      totalSteps
    });
  } catch (err) {
    next(err);
  }
};

export const createSteps = async (req, res, next) => {
  try {
    const { steps, date } = req.body;

    if (!steps || isNaN(steps) || steps <= 0) {
      return res.status(400).json({ message: 'Valid step count is required' });
    }

    const logDate = date ? new Date(date) : new Date();

    const newLog = await prisma.stepsLog.create({
      data: {
        userId: req.user.id,
        steps: parseInt(steps),
        date: logDate
      }
    });

    res.status(201).json({
      message: 'Steps logged successfully',
      log: newLog
    });
  } catch (err) {
    next(err);
  }
};
