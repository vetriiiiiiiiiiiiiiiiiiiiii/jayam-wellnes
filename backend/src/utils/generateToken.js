const jwt = require("jsonwebtoken");

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// "lax" keeps the cookie on the redirect back from Google while still blocking
// cross-site form posts; "secure" in production so it only travels over HTTPS.
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
});

const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("token", token, { ...cookieOptions(), expires: new Date(Date.now() + SEVEN_DAYS_MS) });
  return token;
};

const clearAuthCookie = (res) => {
  res.cookie("token", "", { ...cookieOptions(), expires: new Date(0) });
};

module.exports = generateTokenAndSetCookie;
module.exports.clearAuthCookie = clearAuthCookie;
