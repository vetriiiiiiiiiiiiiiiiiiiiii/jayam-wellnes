import { auth } from "@/auth"

export default async function AccountDashboard() {
  const session = await auth()
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-black">Welcome back, {session?.user?.name || "Customer"}!</h1>
      <p className="text-gray-600 mb-8">From your account dashboard you can view your recent orders, manage your shipping and billing addresses, and edit your password and account details.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 p-6 rounded">
          <h3 className="font-bold text-lg mb-2 text-black">Recent Orders</h3>
          <p className="text-gray-500 mb-4 text-sm">You haven't placed any orders yet.</p>
          <a href="/shop" className="text-black underline">Start shopping</a>
        </div>
        <div className="border border-gray-200 p-6 rounded">
          <h3 className="font-bold text-lg mb-2 text-black">Account Info</h3>
          <p className="text-gray-500 mb-1">{session?.user?.name}</p>
          <p className="text-gray-500 mb-4">{session?.user?.email}</p>
          <a href="/account/profile" className="text-black underline">Edit profile</a>
        </div>
      </div>
    </div>
  )
}
