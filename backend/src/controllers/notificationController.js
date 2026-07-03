import prisma from '../services/prisma.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50 // limit to last 50
    });
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notificationId = parseInt(id);

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification || notification.userId !== req.user.id) {
      return res.status(404).json({ message: 'Notification not found or access denied' });
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const { title, message, type, scheduledTime } = req.body;

    if (!title || !message || !type) {
      return res.status(400).json({ message: 'Title, message, and type are required' });
    }

    const newNotification = await prisma.notification.create({
      data: {
        userId: req.user.id,
        title,
        message,
        type, // WORKOUT, WATER, MEAL, SLEEP, GENERAL
        scheduledTime: scheduledTime ? new Date(scheduledTime) : null
      }
    });

    res.status(201).json(newNotification);
  } catch (err) {
    next(err);
  }
};
