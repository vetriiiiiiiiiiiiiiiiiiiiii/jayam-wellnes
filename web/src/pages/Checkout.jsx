import React, { useEffect } from 'react';
import { useCart } from '../components/storefront/CartProvider';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { createOrder, verifyPayment } from '../services/api';

import { useApp } from '../context/Appcontext';

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { cart, cartTotal, cartCount, clearCart } = useCart();
  const { refreshOrders } = useApp();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const navigate = useNavigate();

  useEffect(() => {
    loadScript('https://checkout.razorpay.com/v1/checkout.js');
  }, []);

  if (cartCount === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-brand-pearl pt-24">
        <h1 className="text-3xl font-serif text-brand-forest-700 mb-4">Your cart is empty</h1>
        <button onClick={() => navigate('/shop')} className="px-8 py-3 bg-brand-forest-700 text-white rounded-full text-sm uppercase tracking-widest">
          Continue Shopping
        </button>
      </div>
    );
  }

  const handleCheckoutSuccess = async () => {
    console.log('[Checkout] Success! Clearing cart and refreshing orders...');
    clearCart();
    localStorage.removeItem('miracletree_cart');
    await refreshOrders();
    navigate('/checkout/success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const orderData = {
        email: formData.get('email'),
        name: formData.get('name'),
        address: {
          street: formData.get('street'),
          city: formData.get('city'),
          state: formData.get('state'),
          zipCode: formData.get('zipCode'),
          country: formData.get('country'),
        },
        items: cart,
        total: cartTotal,
        paymentMethod: paymentMethod,
      };

      console.log('[Checkout] Initiating order creation:', orderData);
      const res = await createOrder(orderData);
      console.log('[Checkout] Order creation response:', res);
      
      if (!res.success) {
         console.error('[Checkout] Order creation failed:', res.message);
         alert('Checkout failed: ' + res.message);
         setLoading(false);
         return;
      }

      if (paymentMethod === 'RAZORPAY' && res.razorpayOrderId) {
        console.log('[Checkout] Initializing Razorpay modal with order ID:', res.razorpayOrderId);
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder', // Enter the Key ID generated from the Dashboard
          amount: res.amount * 100,
          currency: res.currency,
          name: 'MiracleTree',
          description: 'Purchase Checkout',
          order_id: res.razorpayOrderId,
          handler: async function (response) {
            console.log('[Checkout] Razorpay payment success handler called. Response:', response);
            const paymentData = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId: res.orderId
            };
            console.log('[Checkout] Verifying payment with backend:', paymentData);
            const verifyRes = await verifyPayment(paymentData);
            console.log('[Checkout] Payment verification response:', verifyRes);
            if (verifyRes.success) {
              await handleCheckoutSuccess();
            } else {
              console.error('[Checkout] Payment verification failed on backend');
              alert('Payment Verification Failed!');
            }
          },
          prefill: {
            name: formData.get('name'),
            email: formData.get('email'),
          },
          theme: {
            color: '#1c3d31', // brand-forest-700
          },
          modal: {
            ondismiss: function() {
              console.log('[Checkout] Razorpay modal dismissed by user');
              setLoading(false);
            }
          }
        };
        const paymentObject = new window.Razorpay(options);
        
        paymentObject.on('payment.failed', function (response){
          console.error('[Checkout] Razorpay payment.failed event triggered:', response.error);
          alert(`Payment Failed: ${response.error.description}`);
          setLoading(false);
        });

        paymentObject.open();
      } else {
         console.log('[Checkout] COD selected or Razorpay not configured. Proceeding to success.');
         await handleCheckoutSuccess();
      }
    } catch (err) {
      console.error('[Checkout] Unexpected error during checkout:', err);
      alert('Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-pearl pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h1 className="text-4xl font-serif text-brand-forest-700 mb-8">Checkout</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-sm font-medium uppercase tracking-widest text-brand-forest-700">Contact Information</h2>
              <input type="email" name="email" placeholder="Email Address *" required className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:border-brand-green-500 outline-none" />
              <input type="text" name="name" placeholder="Full Name *" required className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:border-brand-green-500 outline-none" />
            </div>

            <div className="space-y-4 pt-6">
              <h2 className="text-sm font-medium uppercase tracking-widest text-brand-forest-700">Shipping Address</h2>
              <input type="text" name="street" placeholder="Street Address *" required className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:border-brand-green-500 outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="city" placeholder="City *" required className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:border-brand-green-500 outline-none" />
                <input type="text" name="state" placeholder="State *" required className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:border-brand-green-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="zipCode" placeholder="ZIP / Postal Code *" required className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:border-brand-green-500 outline-none" />
                <input type="text" name="country" placeholder="Country *" required className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:border-brand-green-500 outline-none" />
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <h2 className="text-sm font-medium uppercase tracking-widest text-brand-forest-700">Payment Options</h2>
              <div className="flex flex-col space-y-3">
                <label className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl cursor-pointer">
                  <input type="radio" name="paymentMethod" value="RAZORPAY" checked={paymentMethod === 'RAZORPAY'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-brand-forest-700" />
                  <span className="font-medium text-gray-800">Pay Online (Razorpay)</span>
                </label>
                <label className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl cursor-pointer">
                  <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-brand-forest-700" />
                  <span className="font-medium text-gray-800">Cash on Delivery (COD)</span>
                </label>
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-brand-forest-700 text-white py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-brand-forest-900 transition-colors disabled:opacity-50 mt-8">
              {loading ? 'Processing...' : (paymentMethod === 'RAZORPAY' ? `Pay ₹${cartTotal.toFixed(2)}` : 'Confirm Order')}
            </button>
          </form>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-fit">
          <h2 className="text-sm font-medium uppercase tracking-widest text-brand-forest-700 mb-6">Order Summary</h2>
          <div className="space-y-6 mb-8">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative">
                    <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                    <span className="absolute -top-2 -right-2 bg-brand-forest-700 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px]">{item.quantity}</span>
                  </div>
                  <span className="font-serif text-brand-forest-700">{item.name}</span>
                </div>
                <span className="font-mono text-sm text-gray-600">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-6 space-y-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span><span className="font-mono">₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Shipping</span><span className="font-mono">Free</span>
            </div>
            <div className="flex justify-between font-serif text-xl text-brand-forest-700 pt-4 border-t border-gray-100">
              <span>Total</span><span>₹{cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
