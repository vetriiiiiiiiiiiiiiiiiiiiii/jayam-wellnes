import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import StatusDropdown from "./StatusDropdown";
import Image from "next/image";

export default async function OrderDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) notFound();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/orders" className="text-gray-500 hover:text-gray-900">← Back to Orders</Link>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-serif text-gray-900">Order #{order.orderNumber}</h1>
          <p className="text-gray-500 mt-1">Placed on {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}</p>
        </div>
        <div className="flex items-center gap-4">
          <StatusDropdown orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
            <h2 className="text-xl font-serif text-gray-900 mb-4">Items</h2>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={item.product.images[0] || "/placeholder.jpg"} alt={item.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
            <h2 className="text-xl font-serif text-gray-900 mb-4">Payment Summary</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between font-medium text-lg text-gray-900 pt-4 border-t border-gray-100">
                <span>Total</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
            <h2 className="text-xl font-serif text-gray-900 mb-4">Customer</h2>
            {order.user ? (
              <div>
                <p className="font-medium text-gray-900">{order.user.name}</p>
                <p className="text-gray-500 text-sm mt-1">{order.user.email}</p>
              </div>
            ) : (
              <p className="text-gray-500">Guest Checkout</p>
            )}
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
            <h2 className="text-xl font-serif text-gray-900 mb-4">Shipping Address</h2>
            {/* Using a placeholder address since we don't have this in the schema fully populated yet */}
            <p className="text-gray-600 text-sm leading-relaxed">
              {order.user?.name || 'Guest User'}<br />
              123 Miracle Tree Lane<br />
              Organic City, TN 600001<br />
              India
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
