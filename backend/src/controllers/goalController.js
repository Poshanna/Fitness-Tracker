import prisma from '../services/prisma.js';

export const getGoals = async (req, res, next) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    const formattedGoals = goals.map(g => {
      let progress = g.targetValue > 0 ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) : 0;
      return {
        ...g,
        progress
      };
    });

    res.json(formattedGoals);
  } catch (err) {
    next(err);
  }
};

export const createGoal = async (req, res, next) => {
  try {
    const { type, targetValue, currentValue, description, endDate } = req.body;

    if (!type || targetValue === undefined || isNaN(targetValue)) {
      return res.status(400).json({ message: 'Goal type and numeric target value are required' });
    }

    const goal = await prisma.goal.create({
      data: {
        userId: req.user.id,
        type,
        targetValue: parseFloat(targetValue),
        currentValue: currentValue ? parseFloat(currentValue) : 0.0,
        description: description || '',
        endDate: endDate ? new Date(endDate) : null
      }
    });

    res.status(201).json({
      message: 'Goal created successfully',
      goal: {
        ...goal,
        progress: goal.targetValue > 0 ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : 0
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentValue, status, description, targetValue } = req.body;
    const goalId = parseInt(id);

    const existingGoal = await prisma.goal.findUnique({
      where: { id: goalId }
    });

    if (!existingGoal || existingGoal.userId !== req.user.id) {
      return res.status(404).json({ message: 'Goal not found or access denied' });
    }

    const updated = await prisma.goal.update({
      where: { id: goalId },
      data: {
        currentValue: currentValue !== undefined ? parseFloat(currentValue) : undefined,
        targetValue: targetValue !== undefined ? parseFloat(targetValue) : undefined,
        status: status || undefined,
        description: description !== undefined ? description : undefined
      }
    });

    res.json({
      message: 'Goal updated successfully',
      goal: {
        ...updated,
        progress: updated.targetValue > 0 ? Math.min(100, Math.round((updated.currentValue / updated.targetValue) * 100)) : 0
      }
    });
  } catch (err) {
    next(err);
  }
};

export const deleteGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const goalId = parseInt(id);

    const goal = await prisma.goal.findUnique({
      where: { id: goalId }
    });

    if (!goal || goal.userId !== req.user.id) {
      return res.status(404).json({ message: 'Goal not found or access denied' });
    }

    await prisma.goal.delete({
      where: { id: goalId }
    });

    res.json({ message: 'Goal deleted successfully' });
  } catch (err) {
    next(err);
  }
};
