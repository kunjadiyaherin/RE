const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

const sendOtpEmail = async (toEmail, otp, username) => {
  const mailOptions = {
    from: `"Property Intelligence" <${process.env.GMAIL_USER || 'no-reply@propertyintel.com'}>`,
    to: toEmail,
    subject: `Verify Your Account - Property Intelligence [OTP: ${otp}]`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff; color: #1f2937;">
        <div style="text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 25px;">
          <h2 style="color: #3b82f6; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">PROPERTY INTELLIGENCE</h2>
          <p style="font-size: 12px; color: #6b7280; margin: 5px 0 0 0; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Official Records & Analytics Portal</p>
        </div>
        <p style="font-size: 15px; line-height: 1.5; color: #374151;">Dear <strong>${username}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.5; color: #374151;">Thank you for registering on the Property Intelligence Portal. To complete your identity verification, please use the following secure 6-digit One-Time Password (OTP) verification code:</p>
        
        <div style="text-align: center; margin: 35px 0;">
          <div style="display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #1e3a8a; background-color: #f3f4f6; padding: 15px 30px; border-radius: 8px; border: 1px dashed #9ca3af; font-family: monospace;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #ef4444; margin-top: 12px; font-weight: 600;">This verification code is valid for exactly 10 minutes.</p>
        </div>
        
        <p style="font-size: 14px; line-height: 1.5; color: #4b5563;">If you did not make this request, you can safely ignore this email. Your password security is guarded by strong hashing encryptions.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 11px; color: #9ca3af;">
          <p style="margin: 0 0 5px 0;">Property Intelligence Development Node - INDIA-01</p>
          <p style="margin: 0;">© 2026 Property Intelligence. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Nodemailer] Secure OTP email dispatched to ${toEmail}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[Nodemailer ERROR] Transporter failed to deliver OTP email:', error);
    return false;
  }
};

module.exports = { sendOtpEmail };
