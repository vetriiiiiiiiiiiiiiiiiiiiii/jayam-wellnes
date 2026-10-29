const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const prisma = require("../config/prisma");
const generateTokenAndSetCookie = require("../utils/generateToken");
const { clearAuthCookie } = require("../utils/generateToken");
const { serializeUser } = require("../utils/serialize");
const { sendEmail } = require("../services/mailService");
const { findOrCreateGoogleUser, isAdminEmail } = require("../services/authService");
const { escapeHtml } = require("../services/orderEmails");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESET_TTL_MS = 60 * 60 * 1000;
const frontendUrl = () => (process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
const normaliseEmail = (email) => String(email || "").trim().toLowerCase();

// At least 8 characters with a letter and a number
const passwordProblem = (password) => {
  if (typeof password !== "string" || password.length < 8) return "Use at least 8 characters";
  if (password.length > 200) return "Use 200 characters or fewer";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "Include at least one letter and one number";
  return null;
};

const publicUser = (user) => {
  const { resetTokenHash, resetTokenExpires, googleId, ...rest } = serializeUser(user);
  return { ...rest, hasPassword: Boolean(user.password), hasGoogle: Boolean(googleId) };
};

// Simple in-memory limit on sign-in attempts per IP + email (10 per 15 minutes)
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const tooManyAttempts = (key) => {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.start > WINDOW_MS) {
    attempts.set(key, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > 10;
};

// ==============================================
// SIGN UP (email and password)
// ==============================================
exports.Signup = async (req, res) => {
  try {
    const email = normaliseEmail(req.body.email);
    const fullname = String(req.body.fullname || "").trim().slice(0, 120);
    const { password } = req.body;

    if (!EMAIL_PATTERN.test(email)) return res.status(400).json({ message: "Enter a valid email address" });
    if (!fullname) return res.status(400).json({ message: "Enter your name" });
    const problem = passwordProblem(password);
    if (problem) return res.status(400).json({ message: problem });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({
        message: existing.googleId && !existing.password
          ? "This email signs in with Google — use “Continue with Google”."
          : "An account with this email already exists. Try signing in.",
      });
    }

    const user = await prisma.user.create({
      data: {
        fullname,
        username: email.split("@")[0],
        email,
        password: await bcrypt.hash(password, 12),
        role: isAdminEmail(email) ? "admin" : "user",
      },
    });

    generateTokenAndSetCookie(res, user.id);
    res.status(201).json({ success: true, message: "Account created", user: publicUser(user) });
  } catch (error) {
    console.error("[Auth] Signup error:", error);
    res.status(500).json({ message: "We couldn’t create your account. Please try again." });
  }
};

// ==============================================
// SIGN IN
// ==============================================
exports.Login = async (req, res) => {
  try {
    const email = normaliseEmail(req.body.email);
    const { password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Enter your email and password" });

    if (tooManyAttempts(`${req.ip}:${email}`)) {
      return res.status(429).json({ message: "Too many attempts. Please wait 15 minutes and try again." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    const match = user?.password ? await bcrypt.compare(password, user.password).catch(() => false) : false;
    if (!match) {
      return res.status(401).json({
        message: user?.googleId && !user.password
          ? "This account signs in with Google — use “Continue with Google”."
          : "Email or password is incorrect",
      });
    }

    attempts.delete(`${req.ip}:${email}`);
    generateTokenAndSetCookie(res, user.id);
    res.status(200).json({ success: true, message: "Signed in", user: publicUser(user) });
  } catch (error) {
    console.error("[Auth] Login error:", error);
    res.status(500).json({ message: "We couldn’t sign you in. Please try again." });
  }
};

// ==============================================
// SIGN OUT
// ==============================================
exports.Logout = (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ success: true, message: "Signed out" });
};

// ==============================================
// CURRENT USER
// ==============================================
exports.Me = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(401).json({ message: "Not signed in" });
  res.status(200).json({ success: true, user: publicUser(user) });
};

// Which sign-in methods are available (the frontend hides Google when it is not set up)
exports.Providers = (req, res) => {
  const { googleConfigured } = require("../config/passport");
  res.json({ google: googleConfigured(), googleClientId: process.env.GOOGLE_CLIENT_ID || null });
};

// ==============================================
// FORGOT PASSWORD — emails a one-hour reset link
// ==============================================
exports.forgotPassword = async (req, res) => {
  const email = normaliseEmail(req.body.email);
  // Same answer whether or not the account exists, so emails can't be probed
  const reply = { success: true, message: "If an account exists for that email, we’ve sent a link to reset the password." };
  try {
    if (!EMAIL_PATTERN.test(email)) return res.status(400).json({ message: "Enter a valid email address" });
    if (tooManyAttempts(`reset:${req.ip}:${email}`)) return res.json(reply);

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetTokenHash: crypto.createHash("sha256").update(token).digest("hex"),
          resetTokenExpires: new Date(Date.now() + RESET_TTL_MS),
        },
      });
      const link = `${frontendUrl()}/reset-password?token=${token}`;
      const store = process.env.STORE_NAME || "Jayam Wellness";
      sendEmail(
        user.email,
        `Reset your ${store} password`,
        `<p>Hi ${escapeHtml(user.fullname || "there")},</p>
         <p>We received a request to reset your password. This link works for one hour:</p>
         <p><a href="${link}" style="display:inline-block;background:#2c6975;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none">Choose a new password</a></p>
         <p>If you didn’t ask for this, you can ignore this email — your password won’t change.</p>
         <p>— The Jayam team</p>`
      ).catch((error) => console.error("[Auth] Reset email failed:", error.message));
    }
    res.json(reply);
  } catch (error) {
    console.error("[Auth] Forgot password error:", error);
    res.json(reply);
  }
};

// ==============================================
// RESET PASSWORD — with the token from the email
// ==============================================
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || typeof token !== "string") return res.status(400).json({ message: "This reset link is invalid" });
    const problem = passwordProblem(password);
    if (problem) return res.status(400).json({ message: problem });

    const user = await prisma.user.findFirst({
      where: {
        resetTokenHash: crypto.createHash("sha256").update(token).digest("hex"),
        resetTokenExpires: { gt: new Date() },
      },
    });
    if (!user) return res.status(400).json({ message: "This reset link has expired. Please request a new one." });

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(password, 12), resetTokenHash: null, resetTokenExpires: null },
    });
    generateTokenAndSetCookie(res, updated.id);
    res.json({ success: true, message: "Your password has been updated", user: publicUser(updated) });
  } catch (error) {
    console.error("[Auth] Reset password error:", error);
    res.status(500).json({ message: "We couldn’t update your password. Please try again." });
  }
};

// ==============================================
// GOOGLE ONE TAP (token from the Google button on the page)
// ==============================================
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.GoogleOneTap = async (req, res) => {
  try {
    const ticket = await client.verifyIdToken({ idToken: req.body.token, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const user = await findOrCreateGoogleUser({
      sub: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified,
      name: payload.name,
      picture: payload.picture,
    });
    generateTokenAndSetCookie(res, user.id);
    res.status(200).json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error("[Auth] One Tap error:", error.message);
    res.status(401).json({ success: false, message: "Google sign-in failed" });
  }
};

exports.publicUser = publicUser;
