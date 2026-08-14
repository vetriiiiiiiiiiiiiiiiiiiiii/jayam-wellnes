"use server"
import { signIn, signOut } from "@/auth"
import db from "@/lib/db"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  try {
    await signIn("credentials", { email, password, redirectTo: "/account" })
  } catch (error) {
    if (error instanceof AuthError) return { error: "Invalid credentials." }
    throw error
  }
}

export async function registerAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return { error: "Email already in use." }

  const passwordHash = await bcrypt.hash(password, 10)
  await db.user.create({ data: { email, passwordHash, name } })
  
  try {
    await signIn("credentials", { email, password, redirectTo: "/account" })
  } catch (error) {
    throw error
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" })
}
