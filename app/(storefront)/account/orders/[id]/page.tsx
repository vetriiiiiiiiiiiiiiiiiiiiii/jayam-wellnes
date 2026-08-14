import db from "@/lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function CustomerOrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth()
  if (!session) redirect("/login")

  const order = await db.order.findUnique({
    where: { id, userId: session.user.id },
    include: { items: true, events: { orderBy: { createdAt: 'asc' } } }
  })

  if (!order) return <div>Order not found</div>

  const timelineStages = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"]
  const currentStageIndex = timelineStages.indexOf(order.status)

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white p-8 shadow-sm border border-gray-200 rounded-lg">
        <h1 className="text-2xl font-bold mb-2 text-black">Order #{order.orderNumber}</h1>
        <p className="text-gray-500 mb-8">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>

        {/* Amazon-style Timeline */}
        <div className="relative mb-16 px-4">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-green-500 -z-10 transition-all duration-1000"
            style={{ width: `${Math.max(0, (currentStageIndex / (timelineStages.length - 1)) * 100)}%` }}
          ></div>
          
          <div className="flex justify-between">
            {timelineStages.map((stage, index) => (
              <div key={stage} className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full border-4 ${index <= currentStageIndex ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}></div>
                <p className={`mt-2 text-xs font-semibold ${index <= currentStageIndex ? 'text-black' : 'text-gray-400'}`}>
                  {stage}
                </p>
              </div>
            ))}
          </div>
        </div>

        <h2 className="text-lg font-bold mb-4 text-black">Tracking History</h2>
        <div className="space-y-6 pl-4 border-l-2 border-gray-100 mb-12">
          {order.events.map((event) => (
            <div key={event.id} className="relative">
               <div className="absolute -left-[21px] top-1 w-3 h-3 bg-black rounded-full"></div>
               <p className="text-sm font-bold text-black">{event.status}</p>
               <p className="text-xs text-gray-500">{new Date(event.createdAt).toLocaleString()}</p>
               {event.message && <p className="text-sm text-gray-700 mt-1">{event.message}</p>}
            </div>
          ))}
        </div>

        <h2 className="text-lg font-bold mb-4 text-black">Items ordered</h2>
        <div className="border border-gray-200 rounded p-4 divide-y">
          {order.items.map(item => (
            <div key={item.id} className="py-2 flex justify-between">
              <span className="text-black">{item.quantity}x {item.productName}</span>
              <span className="font-medium text-black">₹{item.unitPrice}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
