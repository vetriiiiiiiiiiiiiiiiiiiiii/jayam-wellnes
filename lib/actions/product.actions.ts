"use server"
import db from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createProductAction(formData: FormData) {
  const session = await auth()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const slug = name.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '')
  const description = formData.get("description") as string
  const price = parseFloat(formData.get("price") as string)
  const imageUrl = formData.get("imageUrl") as string
  const isPublished = formData.get("isPublished") === "on"

  const product = await db.product.create({
    data: {
      name,
      slug,
      description,
      price,
      isPublished,
      images: imageUrl ? {
        create: [{ url: imageUrl, position: 0 }]
      } : undefined
    }
  })

  revalidatePath("/admin-portal/products")
  revalidatePath("/shop")
  redirect("/admin-portal/products")
}
