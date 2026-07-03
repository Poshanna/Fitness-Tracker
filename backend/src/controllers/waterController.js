import prisma from '../services/prisma.js';

export const getWater = async (req, res, next) => {
  try {
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await prisma.waterLog.findMany({
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

    const totalAmount = logs.reduce((sum, log) => sum + log.amount, 0);

    res.json({
      logs,
      totalAmount
    });
  } catch (err) {
    next(err);
  }
};

export const createWater = async (req, res, next) => {
  try {
    const { amount, date } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Valid water amount in ml is required' });
    }

    const logDate = date ? new Date(date) : new Date();

    const newLog = await prisma.waterLog.create({
      data: {
        userId: req.user.id,
        amount: parseInt(amount),
        date: logDate
      }
    });

    res.status(201).json({
      message: 'Water log added successfully',
      log: newLog
    });
  } catch (err) {
    next(err);
  }
};
