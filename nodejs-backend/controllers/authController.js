const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { pool } = require("../config/db");
const { sendEmail } = require("../utils/emailSender");

// Token generation
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });

const generateResetToken = () => crypto.randomBytes(32).toString('hex');

// Input validation helper
const validateRegistration = (data) => {
  const { email, password, account_type } = data;
  const errors = [];
  
  if (!email) errors.push("Email is required");
  if (!password) errors.push("Password is required");
  if (!account_type) errors.push("Account type is required");
  if (password && password.length < 8) errors.push("Password must be at least 8 characters");
  
  return errors.length ? errors : null;
};

// Updated registerUser function with proper field handling

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const validationErrors = validateRegistration(req.body);
  if (validationErrors) {
    return res.status(400).json({ 
      success: false,
      errors: validationErrors 
    });
  }

  const { email, password, account_type } = req.body;
  let connection;

  try {
    // Check if user exists
    const [existingUser] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ 
        success: false,
        message: "Email already registered" 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Set role based on account type
    const role = account_type === "business" ? "seller" : "user";

    // Generate a unique user_id (since it's required in your schema)
    const userId = crypto.randomBytes(16).toString('hex');

    // Start transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Create user with all required fields
    const [userResult] = await connection.execute(
      `INSERT INTO users 
       (email, password_hash, account_type, role, user_id, labels, subscribe, comment) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email, 
        hashedPassword, 
        account_type, 
        role, 
        userId, 
        JSON.stringify([]), // Empty array for labels
        JSON.stringify({}), // Empty object for subscribe
        '' // Empty string for comment
      ]
    );

    // Create profile based on account type
    if (account_type === "personal") {
      const { first_name, last_name, phone, country } = req.body;
      await connection.execute(
        "INSERT INTO profiles (user_id, first_name, last_name, phone, country) VALUES (?, ?, ?, ?, ?)",
        [userResult.insertId, first_name, last_name, phone, country]
      );
    } else if (account_type === "business") {
      const businessData = req.body;
      await connection.execute(
        `INSERT INTO business_profiles 
         (user_id, business_name, business_email, tax_id, website, business_type, 
          product_category, owner_name, owner_phone, id_number, bank_name, account_number, swift_code) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userResult.insertId,
          businessData.business_name,
          businessData.business_email,
          businessData.tax_id,
          businessData.website,
          businessData.business_type,
          businessData.product_category,
          businessData.owner_name,
          businessData.owner_phone,
          businessData.id_number,
          businessData.bank_name,
          businessData.account_number,
          businessData.swift_code
        ]
      );
    }

    // Commit transaction
    await connection.commit();

    // Generate token
    const token = generateToken(userResult.insertId);

    return res.status(201).json({ 
      success: true, 
      message: "User registered successfully", 
      token,
      user: {
        id: userResult.insertId,
        email,
        account_type,
        role
      }
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Registration error:", error);

    return res.status(500).json({ 
      success: false,
      message: "Registration failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user
    const [user] = await pool.execute(
      "SELECT id, email, password_hash, role, account_type FROM users WHERE email = ?",
      [email]
    );

    if (user.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Auto-update role if business account doesn't have seller role
    if (user[0].account_type === "business" && user[0].role !== "seller") {
      await pool.execute(
        "UPDATE users SET role = 'seller' WHERE id = ?",
        [user[0].id]
      );
      user[0].role = "seller"; // Update the local object
    }

    // Generate token
    const token = generateToken(user[0].id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(200).json({
      success: true,
      token,
      role: user[0].role,
      account_type: user[0].account_type,
      user: {
        id: user[0].id,
        email: user[0].email,
        role: user[0].role,
        account_type: user[0].account_type
      }
    });
    
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ 
    success: true,
    message: "Logged out successfully" 
  });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const [user] = await pool.execute(
      `SELECT u.id, u.email, u.role, u.account_type,
       p.first_name, p.last_name, p.phone, p.country,
       b.business_name, b.business_email, b.tax_id, b.website, 
       b.business_type, b.product_category, b.owner_name, b.owner_phone,
       b.id_number, b.bank_name, b.account_number, b.swift_code
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       LEFT JOIN business_profiles b ON u.id = b.user_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (user.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Auto-update role if business account doesn't have seller role
    if (user[0].account_type === "business" && user[0].role !== "seller") {
      await pool.execute(
        "UPDATE users SET role = 'seller' WHERE id = ?",
        [user[0].id]
      );
      user[0].role = "seller"; // Update the local object
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user[0].id,
        email: user[0].email,
        role: user[0].role,
        account_type: user[0].account_type,
        // Include profile data based on account type
        ...(user[0].account_type === "personal" ? {
          first_name: user[0].first_name,
          last_name: user[0].last_name,
          phone: user[0].phone,
          country: user[0].country
        } : {
          business_name: user[0].business_name,
          business_email: user[0].business_email,
          tax_id: user[0].tax_id,
          website: user[0].website,
          business_type: user[0].business_type,
          product_category: user[0].product_category,
          owner_name: user[0].owner_name,
          owner_phone: user[0].owner_phone
        })
      }
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching user information"
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // 1. Check if user exists
    const [user] = await pool.execute(
      "SELECT id, email FROM users WHERE email = ?",
      [email]
    );

    if (user.length === 0) {
      return res.status(200).json({ 
        success: true,
        message: "If the email exists, a reset link has been sent" 
      });
    }

    // 2. Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // 3. Delete any existing tokens and save new one
    await pool.execute(
      "DELETE FROM password_resets WHERE user_id = ?",
      [user[0].id]
    );

    await pool.execute(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user[0].id, resetToken, expiresAt]
    );

    // 4. Create professional email template
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Password Reset Request</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { color: #2c3e50; text-align: center; }
            .logo { max-width: 150px; margin-bottom: 20px; }
            .content { background-color: #f9f9f9; padding: 25px; border-radius: 5px; }
            .button { 
                display: inline-block; padding: 12px 24px; 
                background-color: #3498db; color: white !important; 
                text-decoration: none; border-radius: 5px; margin: 20px 0;
                font-weight: bold;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #7f8c8d; text-align: center; }
            .code { 
                background-color: #f0f0f0; padding: 12px; 
                border-radius: 4px; font-family: monospace;
                word-break: break-all; margin: 15px 0;
            }
            .expiry-notice { color: #e74c3c; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>Password Reset Request</h2>
        </div>
        
        <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your password for your IntelliCart account.</p>
            
            <p>Please click the button below to reset your password:</p>
            
            <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset My Password</a>
            </p>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <div class="code">${resetUrl}</div>
            
            <p class="expiry-notice">This link will expire in 1 hour.</p>
            
            <p>If you didn't request this password reset, please ignore this email or 
            contact our support team at <a href="mailto:${process.env.SMTP_USER}">${process.env.SMTP_USER}</a>.</p>
            
            <p>Thanks,<br>The IntelliCart Team</p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} IntelliCart. All rights reserved.</p>
            <p>This email was sent to ${user[0].email} because you requested a password reset.</p>
        </div>
    </body>
    </html>
    `;

    const text = `Password Reset Request\n\n` +
    `Hello,\n\n` +
    `We received a request to reset your password for your IntelliCart account.\n\n` +
    `Please use the following link to reset your password:\n${resetUrl}\n\n` +
    `This link will expire in 1 hour.\n\n` +
    `If you didn't request this password reset, please ignore this email.\n\n` +
    `Thanks,\nThe IntelliCart Team`;

    // 5. Send email
    await sendEmail({
      email: user[0].email,
      subject: 'Password Reset Request - IntelliCart',
      message: text,
      html: html
    });

    res.status(200).json({ 
      success: true,
      message: "If the email exists, a reset link has been sent" 
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ 
      success: false,
      message: "Failed to process password reset request"
    });
  }
}; 

 // @desc    Reset password
  // @route   PUT /api/auth/resetpassword/:resettoken
  // @access  Public
  const resetPassword = async (req, res) => {
    const { resettoken } = req.params;
    const { password } = req.body;
  
    try {
      // 1. Find the valid reset token
      const [resetRecord] = await pool.execute(
        `SELECT r.*, u.email 
         FROM password_resets r
         JOIN users u ON r.user_id = u.id
         WHERE r.token = ? AND r.expires_at > NOW()`,
        [resettoken]
      );
  
      if (resetRecord.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid or expired token" 
        });
      }
  
      const userRecord = resetRecord[0];
  
      // 2. Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // 3. Update user password
      await pool.execute(
        "UPDATE users SET password_hash = ? WHERE id = ?",
        [hashedPassword, userRecord.user_id]
      );
  
      // 4. Delete all reset tokens for this user
      await pool.execute(
        "DELETE FROM password_resets WHERE user_id = ?",
        [userRecord.user_id]
      );
  
      // 5. Send confirmation email
      const message = `Your password has been successfully changed.\n\nIf you didn't make this change, please contact support immediately.`;
  
      await sendEmail({
        email: userRecord.email,
        subject: 'Password Changed Successfully',
        message
      });
  
      res.status(200).json({ 
        success: true,
        message: "Password reset successful" 
      });
    } catch (err) {
      console.error('Reset password error:', err);
      res.status(500).json({ 
        success: false,
        message: "Server error" 
      });
    }
  };

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  forgotPassword,
  resetPassword
};