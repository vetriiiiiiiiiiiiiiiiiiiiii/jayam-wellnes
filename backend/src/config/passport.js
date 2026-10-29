const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { findOrCreateGoogleUser } = require("../services/authService");

const googleConfigured = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

// "Continue with Google" (redirect flow). Needs GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET and,
// in the Google Cloud console, the redirect URI {BACKEND_URL}/api/auth/google/callback.
const setupPassport = (passport) => {
  if (!googleConfigured()) {
    console.warn("⚠️  GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET not set — Google sign-in disabled");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0];
          const user = await findOrCreateGoogleUser({
            sub: profile.id,
            email: email?.value,
            emailVerified: email?.verified !== false,
            name: profile.displayName || profile.name?.givenName,
            picture: profile.photos?.[0]?.value,
          });
          done(null, user);
        } catch (error) {
          console.error("[Auth] Google sign-in failed:", error.message);
          done(null, false);
        }
      }
    )
  );
};

module.exports = setupPassport;
module.exports.googleConfigured = googleConfigured;
