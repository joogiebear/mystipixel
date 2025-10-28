import { prisma } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  try {
    const { token } = await readBody(event);

    if (!token) {
      throw createError({
        statusCode: 400,
        message: 'Verification token is required'
      });
    }

    // Find token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!verificationToken) {
      throw createError({
        statusCode: 404,
        message: 'Invalid verification token'
      });
    }

    // Check if expired
    if (new Date() > verificationToken.expiresAt) {
      throw createError({
        statusCode: 410,
        message: 'Verification token has expired'
      });
    }

    // Update user
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true }
    });

    // Delete used token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    });

    // Create session
    await setUserSession(event, {
      user: {
        id: verificationToken.user.id,
        username: verificationToken.user.username,
        email: verificationToken.user.email,
        role: verificationToken.user.role
      }
    });

    return {
      success: true,
      message: 'Email verified successfully!'
    };

  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    console.error('Email verification error:', error);
    throw createError({
      statusCode: 500,
      message: 'Email verification failed. Please try again.'
    });
  }
});
