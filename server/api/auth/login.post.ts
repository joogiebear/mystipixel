import bcrypt from 'bcryptjs';
import { prisma } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    const { email, password } = await readBody(event);

    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Invalid email or password'
      });
    }

    // Check if user is banned
    if (user.isBanned) {
      throw createError({
        statusCode: 403,
        message: 'Your account has been banned. Please contact support.'
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw createError({
        statusCode: 401,
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw createError({
        statusCode: 403,
        message: 'Please verify your email before logging in'
      });
    }

    // Create session
    await setUserSession(event, {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };

  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    console.error('Login error:', error);
    throw createError({
      statusCode: 500,
      message: 'Login failed. Please try again.'
    });
  }
});
