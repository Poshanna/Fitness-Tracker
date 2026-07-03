import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../services/prisma.js';

// Helper to generate access tokens
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'supersecretaccessjwtkey_987654321_fitness',
    { expiresIn: '1d' } // Expanded to 1 day for easier developer testing, normally 15m
  );
};

// Helper to generate refresh tokens
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'supersecretrefreshjwtkey_123456789_fitness',
    { expiresIn: '7d' }
  );
};

export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Default target metrics
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: email.toLowerCase() === 'admin@fitness.com' ? 'ADMIN' : 'USER',
        age: 25,
        gender: 'MALE',
        height: 175.0,
        weight: 70.0,
        activityLevel: 'MODERATELY_ACTIVE',
        goal: 'MAINTAIN_WEIGHT',
        targetWeight: 70.0
      }
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Don't send back password
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      refreshToken,
      user: userWithoutPassword
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: userWithoutPassword
    });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }

    jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || 'supersecretrefreshjwtkey_123456789_fitness',
      async (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: 'Invalid or expired refresh token' });
        }

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        const newAccessToken = generateAccessToken(user.id);
        const newRefreshToken = generateRefreshToken(user.id);

        res.json({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        });
      }
    );
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    // Standard stateless logout. In a production environment, you can blacklist tokens in Redis.
    res.json({ message: 'Logout successful' });
  } catch (err) {
    next(err);
  }
};
