import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-brand-pearl px-6 text-center pt-24">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-4xl font-serif text-brand-forest-700 mb-4">Order Confirmed!</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        Thank you for your purchase. We have received your order and have sent a confirmation email with your order details.
      </p>
      <div className="flex gap-4">
        <Link href="/shop" className="px-8 py-3 bg-brand-forest-700 text-white rounded-full text-sm uppercase tracking-widest hover:bg-brand-forest-900 transition-colors">
          Continue Shopping
        </Link>
        <Link href="/account" className="px-8 py-3 bg-white text-brand-forest-700 border border-brand-forest-700 rounded-full text-sm uppercase tracking-widest hover:bg-gray-50 transition-colors">
          View Account
        </Link>
      </div>
    </div>
  );
}
