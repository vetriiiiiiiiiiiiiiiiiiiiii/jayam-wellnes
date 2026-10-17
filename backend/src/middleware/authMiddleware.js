const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { serializeUser } = require("../utils/serialize");
const generateTokenAndSetCookie = require("../utils/generateToken");

// 1. Change function signature to accept options (admin and staff)
const protect =
  ({ admin = false, staff = false } = {}) =>
  async (req, res, next) => {
    try {
      // 2. Read token from cookie
      const token = req.cookies.token;

      if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
      }

      // 3. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find user
      const user = await prisma.user.findUnique({ where: { id: String(decoded.id) } });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      req.user = serializeUser(user);

      // ============================================================
      // 4.5 AUTO-UPGRADE TO ADMIN IF IN SUPERADMIN_EMAILS
      // ============================================================
      const superAdminEmails = (process.env.SUPERADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
      const defaultAdminEmail = (process.env.DEFAULT_SUPERADMIN_EMAIL || "").trim().toLowerCase();

      if (
        (superAdminEmails.includes(req.user.email.toLowerCase()) || req.user.email.toLowerCase() === defaultAdminEmail) &&
        req.user.role !== "admin" && req.user.role !== "SUPER_ADMIN"
      ) {
        await prisma.user.update({ where: { id: req.user.id }, data: { role: "admin" } });
        req.user.role = "admin";
      }

      // ============================================================
      // 5. ROLE CHECKS (Admin & Staff)
      // ============================================================

      // A. ADMIN CHECK
      // If admin:true is required, the user MUST be an admin.
      if (admin && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized as admin" });
      }

      // B. STAFF CHECK
      // If staff:true is required, allow "staff" OR "admin".
      // (Admins should generally be able to access staff routes).
      if (staff && req.user.role !== "staff" && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized as staff" });
      }

      // ============================================================
      // 6. ROLLING SESSION / AUTO-REFRESH
      // ============================================================
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      const timeRemaining = decoded.exp - nowInSeconds;

      if (timeRemaining < sevenDaysInSeconds) {
        generateTokenAndSetCookie(res, req.user.id);
      }

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);
      res.status(401).json({ message: "Not authorized, invalid token" });
    }
  };

module.exports = { protect };
