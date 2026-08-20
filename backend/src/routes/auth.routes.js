const express = require("express");
const router = express.Router();
const passport = require("passport");
const generateTokenAndSetCookie = require("../utils/generateToken");
const { protect } = require("../middleware/authMiddleware");
const {
  Login,
  Signup,
  Logout,
  Me,
  resetPassword,
  GoogleOneTap
} = require("../controllers/authControllers");

// ==============================================
// 1. MANUAL AUTH ROUTES
// ==============================================
router.post("/signup", Signup);
router.post("/login", Login);
router.get("/logout", Logout);
router.get("/me", protect(), Me);
router.post("/reset-password", resetPassword);

// ==============================================
// 2. GOOGLE OAUTH ROUTES (Standard Redirect)
// ==============================================

// A. Trigger Route
router.get(
  "/google",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  })
);

// B. Callback Route
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),
  (req, res) => {
    // req.user is populated by Passport strategy
    console.log("[Auth Backend] Google authentication successful for user:", req.user.email);

    // 1. Use Utility to Set Cookie
    generateTokenAndSetCookie(res, req.user._id);
    console.log("[Auth Backend] Cookie set for user. Redirecting to frontend.");

    // 2. Redirect to Frontend (Dashboard/Home)
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(clientUrl);
  }
);

// ==============================================
// 3. GOOGLE ONE TAP ROUTE (Popup/No-Redirect)
// ==============================================
router.post("/google/onetap", GoogleOneTap);

module.exports = router;
