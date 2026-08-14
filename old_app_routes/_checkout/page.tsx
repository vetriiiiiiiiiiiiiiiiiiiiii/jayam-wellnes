import type { Metadata } from 'next';
import CheckoutForm from './checkout-form';

export const metadata: Metadata = { title: 'Secure Checkout | Miracle Tree', robots: { index: false, follow: false } };
export default function CheckoutPage() { return <main className="checkout-page"><header className="checkout-nav"><a className="wordmark dark" href="/">miracle<span>tree</span><i /></a><p>Secure checkout</p><span>Encrypted · India</span></header><CheckoutForm /></main>; }
