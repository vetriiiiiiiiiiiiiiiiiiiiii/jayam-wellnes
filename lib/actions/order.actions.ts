"use server"
import db from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function updateOrderStatusAction(orderId: string, newStatus: string, message?: string) {
  const session = await auth()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized")
  }

  // Update order status
  await db.order.update({
    where: { id: orderId },
    data: { status: newStatus }
  })

  // Create timeline event
  await db.orderEvent.create({
    data: {
      orderId,
      status: newStatus,
      message,
    }
  })

  revalidatePath(`/admin-portal/orders/${orderId}`)
  revalidatePath(`/account/orders/${orderId}`)
}
