const { Resend } = require('resend');
const { RESEND_API_KEY, EMAIL_FROM, FRONTEND_URL } = require('../config/envConfig');

const resend = new Resend(RESEND_API_KEY);

const sendPasswordResetEmail = async (adminEmail, userInfo, resetToken) => {
  try {
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(userInfo.email)}`;
    
    const emailContent = {
      from: EMAIL_FROM,
      to: adminEmail,
      subject: 'Password Reset Request - Anura Opticians IMS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c5aa0; margin-bottom: 10px;">Anura Opticians</h1>
            <p style="color: #666; font-size: 16px;">Inventory Management System</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #666; line-height: 1.6;">
              A password reset has been requested for the following user:
            </p>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Name:</strong> ${userInfo.name}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${userInfo.email}</p>
              <p style="margin: 5px 0;"><strong>Role:</strong> ${userInfo.role}</p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              As the administrator, you can reset this user's password by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #2c5aa0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; line-height: 1.6;">
              This link will expire in 15 minutes for security reasons. If you did not request this password reset, please ignore this email.
            </p>
            
            <p style="color: #999; font-size: 14px; line-height: 1.6;">
              If the button above doesn't work, you can copy and paste this link into your browser:<br>
              <span style="word-break: break-all;">${resetUrl}</span>
            </p>
          </div>
          
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">
              This email was sent from Anura Opticians Inventory Management System
            </p>
          </div>
        </div>
      `
    };

    const result = await resend.emails.send(emailContent);
    console.log('✅ Password reset email sent successfully:', result);
    return { success: true, messageId: result.id };
    
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendPasswordResetEmail
}; 