'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { money } from '@/lib/catalog';
import { useCommerce } from '@/components/commerce-provider';

export default function CheckoutForm() {
  const { items, subtotal } = useCommerce();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const shipping = subtotal >= 499 || subtotal === 0 ? 0 : 60;
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!items.length) { setError('Your bag is empty. Add a ritual before checking out.'); return; } setSubmitted(true); };
  if (submitted) return <section className="confirmation"><p className="eyebrow">Order received</p><h1>Thank you for<br/><em>choosing good.</em></h1><p>Your order is being prepared with care. We&apos;ll send confirmation and tracking details to your email.</p><Link className="button dark-button" href="/shop">Continue shopping <span>↗</span></Link></section>;
  return <section className="checkout-shell"><form className="checkout-form" onSubmit={submit}><div><p className="eyebrow">01 / Contact</p><label>Email address<input name="email" type="email" autoComplete="email" required /></label></div><div><p className="eyebrow">02 / Delivery</p><div className="form-row"><label>First name<input name="firstName" autoComplete="given-name" required /></label><label>Last name<input name="lastName" autoComplete="family-name" required /></label></div><label>Address<input name="address" autoComplete="street-address" required /></label><div className="form-row"><label>City<input name="city" autoComplete="address-level2" required /></label><label>PIN code<input name="postal" inputMode="numeric" pattern="[0-9]{6}" autoComplete="postal-code" required /></label></div></div><div><p className="eyebrow">03 / Payment</p><div className="payment-note">Online payment is securely processed after you place your order.</div></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="purchase-button">Place secure order <span>→</span></button></form><aside className="checkout-summary"><p className="eyebrow">Order summary</p>{items.length ? items.map((item) => <div className="summary-line" key={item.slug}><span>{item.name} × {item.quantity}</span><b>{money(item.price * item.quantity)}</b></div>) : <p className="summary-empty">Your bag is empty.</p>}<div className="summary-total"><span>Subtotal</span><b>{money(subtotal)}</b><span>Shipping</span><b>{shipping ? money(shipping) : 'Complimentary'}</b><strong>Total <b>{money(subtotal + shipping)}</b></strong></div></aside></section>;
}
