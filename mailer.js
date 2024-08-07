const nodemailer = require('nodemailer');
const crypto = require('crypto');
const db = require('./data/database');

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ghoomeinofficial@gmail.com', // Your Gmail email address
    pass: 'gefehvrpikfrcwom', // App Password generated from your Google Account settings
  },
});

// Function to send verification email
async function sendVerificationEmail(email, verificationToken) {
  let url = process.env.MY_APP_URL || 'localhost:8000';

  const mailOptions = {
    from: 'ghoomeinofficial@gmail.com', // Your Gmail email address
    to: email,
    subject: 'Ghoomein Login Email Verification',
    text: `Please click on the following link to verify your email: https://${url}/verify/${verificationToken}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
}

// Function to generate reset token
function generateResetToken() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(20, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        const resetToken = buffer.toString('hex');
        resolve(resetToken);
      }
    });
  });
}

// Function to send reset password email
async function sendResetPasswordEmail(email, resetToken) {
  let url = process.env.MY_APP_URL || 'localhost:8000';

  const mailOptions = {
    from: 'ghoomeinofficial@gmail.com', // Your Gmail email address
    to: email,
    subject: 'Ghoomein Login Password Reset',
    text: `Please click on the following link to reset your password: https://${url}/reset-password/${resetToken}`,
  };

  await db.getDb().collection('users').updateOne({ email: email }, { $set: { resetToken: resetToken } });

  try {
    await transporter.sendMail(mailOptions);
    console.log('Reset password email sent successfully');
  } catch (error) {
    console.error('Error sending reset password email:', error);
  }
}

module.exports = {
  sendVerificationEmail,
  generateResetToken,
  sendResetPasswordEmail,
};