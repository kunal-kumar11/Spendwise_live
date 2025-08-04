const bcrypt = require('bcrypt');
const User=require('../model/User')
const jwt = require('jsonwebtoken');  // Make sure JWT is imported
const crypto = require('crypto');
const nodemailer = require("nodemailer");

require('dotenv').config();
// Sign up details
const signupdetails = async (req, res) => {
  const { username, useremail, userpassword } = req.body;

  try {
    const existingUser = await User.findOne({ email: useremail });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userpassword, saltRounds);

    const newUser = new User({
      username,
      email: useremail,
      password: hashedPassword
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: 'User signed up successfully!',
      userId: savedUser._id
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
};

const logindetails = async (req, res) => {
  const { useremaillogin, userpasswordlogin } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email: useremaillogin });
    if (!user) {
      return res.status(404).json({ message: 'User does not exist' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(userpasswordlogin, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong password', success: false });
    }

    // ✅ Set session values
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.email = user.email;
    req.session.premiumUser = user.premiumUser;

    // ✅ Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        premiumUser: user.premiumUser
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // ✅ Send both session-backed response and token
    res.status(200).json({
      message: 'Login successful',
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        premiumUser: user.premiumUser
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};





  // Setup API key
const sendEmail = async (req, res) => {
  const { to } = req.body;

  if (!to) {
    return res.status(400).json({ error: "Missing required field: to (email)" });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email: to });
    if (!user) {
      return res.status(404).json({ error: "Email not found" });
    }

    // Generate reset token and expiration
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpires = Date.now() + 3600000; // 1 hour from now

    // Update user document
    user.resetToken = resetToken;
    user.resetTokenExpires = resetTokenExpires;
    await user.save();

    // Reset link
    const resetUrl = `https://spendwise-livepoint.onrender.com/${resetToken}`;

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // your app password
      },
    });

    // Mail options
    const mailOptions = {
      from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.username},</p>
        <p>We received a request to reset your password. Click the link below to reset it:</p>
        <a href="${resetUrl}">Reset Your Password</a>
        <p>If you didn't request a password reset, please ignore this email.</p>
      `,
    };

    // Send email
    const response = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", response);

    res.status(200).json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Error in sendEmail:", error);
    res.status(500).json({ error: "Failed to send email", details: error.message });
  }
};
  

const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    return res
      .status(400)
      .json({ error: "Missing required fields: resetToken or newPassword" });
  }

  try {
    // Find user by resetToken and check expiry
    const user = await User.findOne({
      resetToken,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(404).json({ error: "Invalid or expired token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token fields
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password successfully reset" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Failed to reset password", details: err.message });
  }
};
  

module.exports = {
  signupdetails,
  logindetails,
  sendEmail,
  resetPassword
};

