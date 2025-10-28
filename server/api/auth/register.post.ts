import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { prisma } from '../../utils/prisma';
import { sendVerificationEmail } from '../../utils/email';

export default defineEventHandler(async (event) => {
  try {
    const { username, email, password } = await readBody(event);

    // Validation
    if (!username || !email || !password) {
      throw createError({
        statusCode: 400,
        message: 'Username, email, and password are required'
      });
    }

    // Username validation
    if (username.length < 3 || username.length > 20) {
      throw createError({
        statusCode: 400,
        message: 'Username must be between 3 and 20 characters'
      });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      throw createError({
        statusCode: 400,
        message: 'Username can only contain letters, numbers, hyphens, and underscores'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid email address'
      });
    }

    // Password validation
    if (password.length < 8) {
      throw createError({
        statusCode: 400,
        message: 'Password must be at least 8 characters'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      throw createError({
        statusCode: 409,
        message: existingUser.email === email.toLowerCase()
          ? 'Email already registered'
          : 'Username already taken'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'USER'
      }
    });

    // Generate verification token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    });

    // Send verification email
    await sendVerificationEmail(user.email, token);

    return {
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      userId: user.id
    };

  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    console.error('Registration error:', error);
    throw createError({
      statusCode: 500,
      message: 'Registration failed. Please try again.'
    });
  }
});
