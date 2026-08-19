'use server';

import db from '@/lib/db';
import { sendOrderReceivedAdminEmail, sendOrderConfirmedEmail } from '@/lib/mail';
import { CartItem } from '@/components/storefront/CartProvider';
import { auth } from '@/auth';

export async function processCheckout(formData: FormData, cart: CartItem[], total: number) {
  try {
    const session = await auth();
    
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const street = formData.get('street') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const zipCode = formData.get('zipCode') as string;
    const country = formData.get('country') as string;

    const shippingAddress = `${name}, ${street}, ${city}, ${state} ${zipCode}, ${country}`;

    // 1. Determine User ID
    let userId = session?.user?.id;
    
    if (!userId) {
      // Find or create user by email for guest checkout
      let user = await db.user.findUnique({ where: { email } });
      if (!user) {
        user = await db.user.create({
          data: { email, name }
        });
      }
      userId = user.id;
    }

    // 2. Create Order
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: userId,
        total,
        subtotal: total,
        shippingAddress,
        billingAddress: shippingAddress,
        status: 'PENDING',
        items: {
          create: cart.map(item => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            image: item.image,
          }))
        }
      },
      include: {
        items: true
      }
    });

    // 3. Send Emails (Non-blocking)
    sendOrderReceivedAdminEmail(order);
    sendOrderConfirmedEmail(email, order);

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Checkout Error:", error);
    return { success: false, message: "Failed to process checkout" };
  }
}
