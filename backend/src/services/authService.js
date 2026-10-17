const prisma = require("../config/prisma");

async function findOrCreateGoogleUser(profile) {
  // 1. Check by Google ID
  let user = await prisma.user.findUnique({ where: { googleId: profile.sub } }); // Note: Google calls ID 'sub' in JWTs
  if (user) return user;

  // 2. Check by Email
  if (profile.email) {
    user = await prisma.user.findUnique({ where: { email: profile.email } });
    if (user) {
      return prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: profile.sub,
          ...(!user.profilePicture && profile.picture && { profilePicture: profile.picture }),
        },
      });
    }
  }

  // 3. Create New
  const superAdminEmails = (process.env.SUPERADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const defaultAdminEmail = (process.env.DEFAULT_SUPERADMIN_EMAIL || "").trim().toLowerCase();
  const isSuperAdmin = profile.email && (superAdminEmails.includes(profile.email.toLowerCase()) || profile.email.toLowerCase() === defaultAdminEmail);

  return await prisma.user.create({
    data: {
      googleId: profile.sub,
      email: profile.email,
      fullname: profile.name,
      username: profile.email.split("@")[0],
      profilePicture: profile.picture,
      password: "google-onetap-" + Date.now(),
      role: isSuperAdmin ? "admin" : "user",
    },
  });
}

module.exports = { findOrCreateGoogleUser };
