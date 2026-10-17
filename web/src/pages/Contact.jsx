import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CONTACT, ENQUIRY_CATEGORIES } from '../lib/store';

const ORDER_CATEGORIES = ['ORDER_SUPPORT', 'SHIPPING', 'RETURNS'];

export default function ContactPage() {
  const [searchParams] = useSearchParams();
  const initialCategory = ENQUIRY_CATEGORIES.some(({ value }) => value === searchParams.get('category'))
    ? searchParams.get('category')
    : 'PRODUCT_QUESTION';
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedName, setSubmittedName] = useState('');

  const channels = [
    CONTACT.email && { label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    CONTACT.whatsapp && { label: 'WhatsApp', value: 'Message us', href: `https://wa.me/${CONTACT.whatsapp}` },
    CONTACT.instagram && { label: 'Instagram', value: 'Follow along', href: CONTACT.instagram },
  ].filter(Boolean);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('sending');
    setErrorMessage('');
    const form = new FormData(event.currentTarget);
    const enquiry = Object.fromEntries(form.entries());

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/enquiries`, enquiry);
      setSubmittedName(String(enquiry.name).split(' ')[0]);
      setStatus('sent');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'We could not send your message. Please try again.');
      setStatus('idle');
    }
  };

  return (
    <main className="jayam-contact">
      <div className="jayam-contact-layout">
        <header className="jayam-contact-intro">
          <p className="jayam-eyebrow">Contact us</p>
          <h1>We’re here<br /><em>to help.</em></h1>
          <p>Questions about an ingredient, your order, shipping or returns — or interested in carrying Jayam? Send us a note and we’ll respond within 1 business day.</p>
          <p>You may also find a quick answer in our <Link to="/faq" className="underline underline-offset-4">FAQ</Link>.</p>
          <ul className="jayam-contact-channels">
            <li><span>Response time</span>Within 1 business day</li>
            {channels.map(({ label, value, href }) => (
              <li key={label}>
                <span>{label}</span>
                <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{value}</a>
              </li>
            ))}
          </ul>
        </header>

        {status === 'sent' ? (
          <section className="jayam-contact-success" role="status">
            <p className="jayam-eyebrow">Message received</p>
            <h2>Thank you{submittedName ? `, ${submittedName}` : ''}.</h2>
            <p>We’ve received your enquiry and sent a confirmation to your email. Our team will get back to you within 1 business day.</p>
            <Link to="/shop" className="jayam-primary-link">Continue shopping <span aria-hidden="true">↗</span></Link>
          </section>
        ) : (
          <form className="jayam-contact-form" onSubmit={handleSubmit}>
            <div className="jayam-contact-row">
              <label>Name
                <input type="text" name="name" autoComplete="name" required maxLength={120} />
              </label>
              <label>Email
                <input type="email" name="email" autoComplete="email" required maxLength={200} />
              </label>
            </div>
            <div className="jayam-contact-row">
              <label>Topic
                <select name="category" value={category} onChange={(event) => setCategory(event.target.value)}>
                  {ENQUIRY_CATEGORIES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              {ORDER_CATEGORIES.includes(category) ? (
                <label>Order number <small>(if you have one)</small>
                  <input type="text" name="orderNumber" placeholder="ORD-…" maxLength={40} />
                </label>
              ) : (
                <label>Phone <small>(optional)</small>
                  <input type="tel" name="phone" autoComplete="tel" maxLength={40} />
                </label>
              )}
            </div>
            <label>Subject
              <input type="text" name="subject" required maxLength={200} />
            </label>
            <label>Message
              <textarea name="message" rows={6} required maxLength={5000} />
            </label>
            {/* Spam trap — hidden from people, filled in by bots */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
            {errorMessage && <p className="jayam-contact-error" role="alert">{errorMessage}</p>}
            <button type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
