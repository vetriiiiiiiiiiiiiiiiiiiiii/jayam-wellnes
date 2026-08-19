import { auth } from "@/auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AccountDashboard() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true }
  });
  
  return (
    <div>
      <h1 className="text-3xl font-serif mb-4 text-brand-forest-700">Welcome back, {session?.user?.name || "Customer"}!</h1>
      <p className="text-gray-600 mb-8">From your account dashboard you can view your recent orders and manage your account details.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-xl mb-4 text-brand-forest-700 font-serif">Recent Orders</h3>
          
          {orders.length === 0 ? (
            <div className="border border-gray-200 p-8 rounded-2xl bg-white text-center">
              <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
              <a href="/shop" className="inline-block px-6 py-2 bg-brand-forest-700 text-white rounded-full text-sm uppercase tracking-widest">Start shopping</a>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="border border-gray-200 p-6 rounded-2xl bg-white shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-gray-100 pb-4 mb-4 gap-2">
                    <div>
                      <span className="font-mono text-sm font-bold block">{order.orderNumber}</span>
                      <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-medium">₹{order.total.toFixed(2)}</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{item.quantity}x {item.productName}</span>
                        <span className="font-mono text-gray-500">₹{item.unitPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="h-fit border border-gray-200 p-6 rounded-2xl bg-white shadow-sm">
          <h3 className="font-bold text-xl mb-4 text-brand-forest-700 font-serif">Account Info</h3>
          <div className="space-y-2 mb-6">
            <p className="text-gray-800 font-medium">{session?.user?.name}</p>
            <p className="text-gray-500 text-sm">{session?.user?.email}</p>
          </div>
          <a href="/api/auth/signout" className="text-sm text-red-600 underline">Sign out</a>
        </div>
      </div>
    </div>
  )
}
