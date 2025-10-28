import { randomBytes } from 'crypto';
import { prisma } from '../../utils/prisma';
import { sendVerificationEmail } from '../../utils/email';

export default defineEventHandler(async (event) => {
  try {
    const { email } = await readBody(event);

    if (!email) {
      throw createError({
        statusCode: 400,
        message: 'Email is required'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Don't reveal if email exists
      return {
        success: true,
        message: 'If an account exists with this email, a verification link has been sent.'
      };
    }

    if (user.emailVerified) {
      throw createError({
        statusCode: 400,
        message: 'Email is already verified'
      });
    }

    // Delete old tokens
    await prisma.verificationToken.deleteMany({
      where: { userId: user.id }
    });

    // Generate new token
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
      message: 'Verification email sent! Please check your inbox.'
    };

  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    console.error('Resend verification error:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to send verification email. Please try again.'
    });
  }
});
