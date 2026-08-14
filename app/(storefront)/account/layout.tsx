import { auth } from "@/auth"
import { logoutAction } from "@/lib/actions/auth.actions"

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-64 shrink-0">
        <h2 className="text-2xl font-serif mb-6 text-black">My Account</h2>
        <nav className="space-y-3">
          <a href="/account/dashboard" className="block text-gray-600 hover:text-black">Dashboard</a>
          <a href="/account/orders" className="block text-gray-600 hover:text-black">Order History</a>
          <a href="/account/wishlist" className="block text-gray-600 hover:text-black">Wishlist</a>
          <a href="/account/profile" className="block text-gray-600 hover:text-black">Profile Details</a>
          
          <form action={logoutAction} className="pt-4 mt-4 border-t border-gray-200">
            <button type="submit" className="text-red-600 hover:text-red-800">Log out</button>
          </form>
        </nav>
      </aside>
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
