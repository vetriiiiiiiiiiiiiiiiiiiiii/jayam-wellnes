import { redirect } from "next/navigation"
import { auth } from "@/auth"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/admin-login")
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-xl font-bold mb-8">Miracle Tree Admin</h2>
        <nav className="space-y-4">
          <a href="/admin-portal" className="block text-gray-300 hover:text-white">Dashboard</a>
          <a href="/admin-portal/products" className="block text-gray-300 hover:text-white">Products</a>
          <a href="/admin-portal/orders" className="block text-gray-300 hover:text-white">Orders</a>
          <a href="/admin-portal/content" className="block text-gray-300 hover:text-white">CMS</a>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
