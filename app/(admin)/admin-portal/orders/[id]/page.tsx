import db from "@/lib/db"
import { updateOrderStatusAction } from "@/lib/actions/order.actions"

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, events: { orderBy: { createdAt: 'desc' } }, user: true }
  })

  if (!order) return <div>Order not found</div>

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Order #{order.orderNumber}</h1>
        <span className="px-3 py-1 bg-gray-200 text-sm font-semibold rounded-full text-black">
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-black">Items</h2>
            <ul className="divide-y divide-gray-100">
              {order.items.map(item => (
                <li key={item.id} className="py-4 flex justify-between">
                  <div>
                    <p className="font-medium text-black">{item.productName}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-black">₹{item.unitPrice * item.quantity}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-black">Timeline Events</h2>
            <div className="space-y-4">
              {order.events.map(event => (
                <div key={event.id} className="flex gap-4 border-l-2 border-black pl-4">
                  <div className="text-sm text-gray-500 w-32 shrink-0">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <p className="font-semibold text-black">{event.status}</p>
                    {event.message && <p className="text-sm text-gray-600">{event.message}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-black">Update Status</h2>
            <form action={async (formData) => {
              "use server"
              const status = formData.get("status") as any
              const message = formData.get("message") as string
              await updateOrderStatusAction(order.id, status, message)
            }} className="space-y-4">
              <select name="status" className="w-full border p-2 rounded text-black">
                <option value="CONFIRMED">Confirm Order</option>
                <option value="PACKED">Mark as Packed</option>
                <option value="SHIPPED">Mark as Shipped</option>
                <option value="DELIVERED">Mark as Delivered</option>
              </select>
              <textarea name="message" placeholder="Optional message to customer..." className="w-full border p-2 rounded text-black text-sm"></textarea>
              <button type="submit" className="w-full bg-black text-white p-2 rounded hover:bg-gray-800">
                Update Order
              </button>
            </form>
          </div>

          <div className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-black">Customer Details</h2>
            <p className="text-black font-medium">{order.user?.name}</p>
            <p className="text-gray-600 text-sm">{order.user?.email}</p>
            <p className="text-gray-600 text-sm mt-4 font-mono">{(order.shippingAddress as any)?.street}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
