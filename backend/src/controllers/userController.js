import prisma from '../services/prisma.js';
import { calculateBMI, calculateBMR, calculateTDEE } from '../services/healthCalculations.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;

    // Calculations
    const bmi = calculateBMI(user.weight, user.height);
    const bmr = calculateBMR(user.weight, user.height, user.age, user.gender);
    const dailyCalorieRequirement = calculateTDEE(bmr, user.activityLevel);

    res.json({
      ...userWithoutPassword,
      calculatedMetrics: {
        bmi,
        bmr,
        dailyCalorieRequirement
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, age, gender, height, weight, goal, activityLevel, targetWeight } = req.body;
    
    let profilePic = undefined;
    if (req.file) {
      profilePic = `/uploads/${req.file.filename}`;
    }

    // Validate conversions
    const updateData = {
      ...(name && { name }),
      ...(age && { age: parseInt(age) }),
      ...(gender && { gender }),
      ...(height && { height: parseFloat(height) }),
      ...(weight && { weight: parseFloat(weight) }),
      ...(goal && { goal }),
      ...(activityLevel && { activityLevel }),
      ...(targetWeight && { targetWeight: parseFloat(targetWeight) }),
      ...(profilePic && { profilePic })
    };

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    const bmi = calculateBMI(updatedUser.weight, updatedUser.height);
    const bmr = calculateBMR(updatedUser.weight, updatedUser.height, updatedUser.age, updatedUser.gender);
    const dailyCalorieRequirement = calculateTDEE(bmr, updatedUser.activityLevel);

    // After updating profile, also log this weight to the progress logs for tracking trends!
    if (weight) {
      await prisma.progressLog.create({
        data: {
          userId: req.user.id,
          weight: parseFloat(weight),
          date: new Date()
        }
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        ...userWithoutPassword,
        calculatedMetrics: {
          bmi,
          bmr,
          dailyCalorieRequirement
        }
      }
    });
  } catch (err) {
    next(err);
  }
};
