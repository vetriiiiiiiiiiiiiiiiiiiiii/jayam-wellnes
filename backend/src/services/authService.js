const prisma = require("../config/prisma");

const adminEmails = () =>
  [process.env.SUPERADMIN_EMAILS || "", process.env.DEFAULT_SUPERADMIN_EMAIL || ""]
    .join(",")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

const isAdminEmail = (email) => Boolean(email) && adminEmails().includes(String(email).toLowerCase());

// Guest orders placed with this (verified) email become visible in the customer's account
async function linkGuestOrders(userId, email) {
  if (!email) return 0;
  const { count } = await prisma.order.updateMany({
    where: { userId: null, email: { equals: email, mode: "insensitive" } },
    data: { userId },
  });
  return count;
}

/**
 * Find or create the account for a Google sign-in.
 * profile: { sub, email, emailVerified, name, picture } — shared by the redirect
 * flow (passport) and Google One Tap.
 */
async function findOrCreateGoogleUser({ sub, email, emailVerified = true, name, picture }) {
  const normalisedEmail = email ? String(email).trim().toLowerCase() : null;

  let user = await prisma.user.findUnique({ where: { googleId: sub } });

  // Link to an existing account only when Google has verified the email
  if (!user && normalisedEmail && emailVerified) {
    const existing = await prisma.user.findUnique({ where: { email: normalisedEmail } });
    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          googleId: sub,
          ...(!existing.profilePicture && picture && { profilePicture: picture }),
        },
      });
    }
  }

  if (!user) {
    if (!normalisedEmail || !emailVerified) throw new Error("Google account has no verified email");
    user = await prisma.user.create({
      data: {
        googleId: sub,
        email: normalisedEmail,
        fullname: name || normalisedEmail.split("@")[0],
        username: normalisedEmail.split("@")[0],
        profilePicture: picture || null,
        password: null,
        role: isAdminEmail(normalisedEmail) ? "admin" : "user",
      },
    });
  } else if (isAdminEmail(user.email) && user.role !== "admin") {
    user = await prisma.user.update({ where: { id: user.id }, data: { role: "admin" } });
  }

  if (emailVerified) await linkGuestOrders(user.id, user.email);
  return user;
}

module.exports = { findOrCreateGoogleUser, isAdminEmail, linkGuestOrders };
