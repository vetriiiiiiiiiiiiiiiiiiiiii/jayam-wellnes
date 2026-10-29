const express = require("express");
const passport = require("passport");
const generateTokenAndSetCookie = require("../utils/generateToken");
const { protect } = require("../middleware/authMiddleware");
const { googleConfigured } = require("../config/passport");
const {
  Login,
  Signup,
  Logout,
  Me,
  Providers,
  forgotPassword,
  resetPassword,
  GoogleOneTap,
} = require("../controllers/authControllers");

const router = express.Router();
const frontendUrl = () => (process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");

// Email and password
router.post("/signup", Signup);
router.post("/login", Login);
router.get("/logout", Logout);
router.post("/logout", Logout);
router.get("/me", protect(), Me);
router.get("/providers", Providers);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// "Continue with Google" — redirect flow
router.get("/google", (req, res, next) => {
  if (!googleConfigured()) return res.redirect(`${frontendUrl()}/login?error=google-unavailable`);
  passport.authenticate("google", { session: false, scope: ["profile", "email"], prompt: "select_account" })(req, res, next);
});

router.get(
  "/google/callback",
  (req, res, next) => {
    if (!googleConfigured()) return res.redirect(`${frontendUrl()}/login?error=google-unavailable`);
    passport.authenticate("google", { session: false, failureRedirect: `${frontendUrl()}/login?error=google` })(req, res, next);
  },
  (req, res) => {
    generateTokenAndSetCookie(res, req.user.id);
    // Admins land on the dashboard, customers on their account
    res.redirect(`${frontendUrl()}${req.user.role === "admin" ? "/admin" : "/account"}`);
  }
);

// Google One Tap
router.post("/google/onetap", GoogleOneTap);

module.exports = router;
