const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const generateTokenAndSetCookie = require("../utils/generateToken");
const { serializeUser } = require("../utils/serialize");

// ==============================================
// 1. SIGNUP
// ==============================================
exports.Signup = async (req, res) => {
  try {
    // 1. Get Confirm Password from body
    const { fullname, username, email, password, confirmPassword, phone } =
      req.body;

    // 2. Fallback: If username is missing, generate it from email
    const finalUsername = username || email.split("@")[0];
    const finalFullname = fullname || "User"; // Fallback if name is missing

    if (!email || !password || !finalUsername) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 3. BACKEND MATCH CHECK
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // 4. BACKEND STRENGTH CHECK
    // Regex: At least 8 chars, 1 upper, 1 lower, 1 number, 1 special char
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 chars long and include uppercase, lowercase, number, and symbol.",
      });
    }

    // 5. Check duplicate email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Auto-assign admin if email matches
    const superAdminEmails = (process.env.SUPERADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    const defaultAdminEmail = (process.env.DEFAULT_SUPERADMIN_EMAIL || "").trim().toLowerCase();
    const isSuperAdmin = superAdminEmails.includes(email.toLowerCase()) || email.toLowerCase() === defaultAdminEmail;

    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ message: `${phone} is not a valid 10-digit Indian mobile number!` });
    }

    const newUser = await prisma.user.create({
      data: {
        fullname: finalFullname,
        username: finalUsername,
        email,
        password: hashedPassword,
        phone,
        role: isSuperAdmin ? "admin" : "user",
      },
    });

    generateTokenAndSetCookie(res, newUser.id);

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: newUser.id,
        email: newUser.email,
        fullname: newUser.fullname,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================================
// 2. LOGIN
// ==============================================
exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify Password
    const match = user.password ? await bcrypt.compare(password, user.password) : false;
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    // Generate Token & Set Cookie
    generateTokenAndSetCookie(res, user.id);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        username: user.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================================
// 3. LOGOUT
// ==============================================
exports.Logout = (req, res) => {
  // Clear the cookie by setting it to expire immediately
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
};

// ==============================================
// 4. ME (Check Auth Status)
// ==============================================
exports.Me = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { addresses: true },
  });
  const { updatedAt, ...safeUser } = serializeUser(user);

  res.status(200).json({
    success: true,
    user: safeUser,
  });
};

// ==============================================
// 5. reset-password (Forgot Password)
// ==============================================
exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // TODO: Generate OTP or Reset Token and send email
    // Example:
    // const token = crypto.randomBytes(32).toString("hex");
    // await saveTokenToDBOrRedis(token);
    // sendEmail(user.email, token);

    return res.status(200).json({
      success: true,
      message: "Password reset instructions sent to email",
      user: {
        id: user.id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==============================================
// 6. GOOGLE ONE TAP
// ==============================================
const { OAuth2Client } = require("google-auth-library");
const { findOrCreateGoogleUser } = require("../services/authService");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.GoogleOneTap = async (req, res) => {
  const { token } = req.body;

  try {
    // A. Verify the ID Token sent from Frontend
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload(); // { email, name, picture, sub, ... }

    // B. Find or Create User (Reusing the logic)
    const user = await findOrCreateGoogleUser(payload);

    // C. Set the Cookie (CRITICAL: Matches your existing auth logic)
    generateTokenAndSetCookie(res, user.id);

    // D. Respond with User Data (Frontend updates state immediately)
    res.status(200).json({
      success: true,
      user: serializeUser(user),
      message: "Google One Tap Login Successful",
    });
  } catch (error) {
    console.error("One Tap Error:", error);
    res.status(401).json({ success: false, message: "Invalid Google Token" });
  }
};
