import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.SITE_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@mystipixel.com',
    to: email,
    subject: 'Verify Your Email - MystiPixel Resources',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to MystiPixel Resources!</h1>
            </div>
            <div class="content">
              <p>Hi there!</p>
              <p>Thanks for registering. Please verify your email address to start uploading resources.</p>
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </p>
              <p>Or copy this link into your browser:</p>
              <p style="background: white; padding: 10px; border-radius: 4px; word-break: break-all;">
                ${verificationUrl}
              </p>
              <p><strong>This link expires in 24 hours.</strong></p>
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>MystiPixel Resources - Plugin Configurations & Downloads</p>
              <p>© ${new Date().getFullYear()} MystiPixel. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.SITE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@mystipixel.com',
    to: email,
    subject: 'Reset Your Password - MystiPixel Resources',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi there!</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>Or copy this link into your browser:</p>
              <p style="background: white; padding: 10px; border-radius: 4px; word-break: break-all;">
                ${resetUrl}
              </p>
              <p><strong>This link expires in 1 hour.</strong></p>
              <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>MystiPixel Resources - Plugin Configurations & Downloads</p>
              <p>© ${new Date().getFullYear()} MystiPixel. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}
