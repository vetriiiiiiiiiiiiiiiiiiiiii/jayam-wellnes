const GoogleStrategy = require("passport-google-oauth20").Strategy;
const prisma = require("../config/prisma");

module.exports = (passport) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn("⚠️  GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET not set — Google login disabled");
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
          console.log("--------------- GOOGLE AUTH START ---------------");

          // Helper to get the photo URL safely
          const googlePhoto =
            profile.photos && profile.photos[0]
              ? profile.photos[0].value
              : null;

          // 1. Check existing user by Google ID
          let user = await prisma.user.findUnique({ where: { googleId: profile.id } });
          if (user) {
            console.log("User found by Google ID:", user.email);
            return done(null, user);
          }

          // 2. Check existing user by Email (Account Linking)
          if (profile.emails && profile.emails.length > 0) {
            user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } });
            if (user) {
              console.log("User found by Email. Linking account...");

              // Link Google ID (and use the Google photo if the user has none yet)
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  googleId: profile.id,
                  ...(!user.profilePicture && googlePhoto && { profilePicture: googlePhoto }),
                },
              });
              return done(null, user);
            }
          }

          // 3. Prepare New User Object
          const newUserObj = {
            googleId: profile.id,
            email:
              profile.emails && profile.emails[0]
                ? profile.emails[0].value
                : "no-email-" + profile.id,

            fullname:
              profile.displayName || profile.name?.givenName || "Google User",

            username:
              profile.emails && profile.emails[0]
                ? profile.emails[0].value.split("@")[0]
                : "user" + Date.now(),

            password: "google-auth-" + Date.now(),

            // --- NEW: SAVE PROFILE PICTURE ---
            profilePicture: googlePhoto,
          };

          console.log(
            "ATTEMPTING TO CREATE USER WITH PHOTO:",
            newUserObj.profilePicture
          );

          const newUser = await prisma.user.create({ data: newUserObj });
          console.log("USER CREATED SUCCESSFULLY:", newUser.id);

          return done(null, newUser);
        } catch (err) {
          console.error("CRITICAL DB ERROR:", err);
          return done(err, null);
        }
      }
    )
  );
};
