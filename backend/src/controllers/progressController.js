import prisma from '../services/prisma.js';

export const getProgress = async (req, res, next) => {
  try {
    const { duration } = req.query; // weekly, monthly, yearly

    let gteDate = new Date();
    
    if (duration === 'weekly') {
      gteDate.setDate(gteDate.getDate() - 7);
    } else if (duration === 'monthly') {
      gteDate.setMonth(gteDate.getMonth() - 1);
    } else if (duration === 'yearly') {
      gteDate.setFullYear(gteDate.getFullYear() - 1);
    } else {
      // Default to 30 days
      gteDate.setMonth(gteDate.getMonth() - 1);
    }

    const logs = await prisma.progressLog.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: gteDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    res.json(logs);
  } catch (err) {
    next(err);
  }
};

export const createProgress = async (req, res, next) => {
  try {
    const { date, weight, bodyFat, muscleMass, waist, chest, arms, thighs } = req.body;

    if (weight === undefined || isNaN(weight)) {
      return res.status(400).json({ message: 'Weight is required' });
    }

    const logDate = date ? new Date(date) : new Date();

    const log = await prisma.progressLog.create({
      data: {
        userId: req.user.id,
        date: logDate,
        weight: parseFloat(weight),
        bodyFat: bodyFat ? parseFloat(bodyFat) : null,
        muscleMass: muscleMass ? parseFloat(muscleMass) : null,
        waist: waist ? parseFloat(waist) : null,
        chest: chest ? parseFloat(chest) : null,
        arms: arms ? parseFloat(arms) : null,
        thighs: thighs ? parseFloat(thighs) : null
      }
    });

    // Also update the main weight in User profile to keep it in sync!
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        weight: parseFloat(weight)
      }
    });

    res.status(201).json({
      message: 'Progress logged successfully',
      log
    });
  } catch (err) {
    next(err);
  }
};
