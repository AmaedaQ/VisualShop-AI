const nodemailer = require('nodemailer');
const logger = require('./logger'); // Optional, but recommended

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verify connection
transporter.verify((error) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

// Email sending function
const sendEmail = async ({ email, subject, message, html }) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || `"IntelliCart" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      text: message,
      html: html || message
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = { sendEmail }; 