import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { AtSign, Check, Clock, HelpCircle, Mail, MessageCircle } from 'lucide-react';
import PageHead from '../components/storefront/PageHead';
import { CONTACT, ENQUIRY_CATEGORIES } from '../lib/store';
import usePageMeta from '../lib/usePageMeta';

const ORDER_CATEGORIES = ['ORDER_SUPPORT', 'SHIPPING', 'RETURNS'];

export default function ContactPage() {
  usePageMeta({ title: 'Contact us', description: 'Questions about an ingredient, an order, shipping or returns? Send Jayam a message — we reply within 1 business day.' });
  const [searchParams] = useSearchParams();
  const initialCategory = ENQUIRY_CATEGORIES.some(({ value }) => value === searchParams.get('category'))
    ? searchParams.get('category')
    : 'PRODUCT_QUESTION';
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedName, setSubmittedName] = useState('');

  const channels = [
    CONTACT.email && { label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}`, icon: Mail, tone: 'wheat' },
    CONTACT.whatsapp && { label: 'WhatsApp', value: 'Message us', href: `https://wa.me/${CONTACT.whatsapp}`, icon: MessageCircle, tone: 'earth' },
    CONTACT.instagram && { label: 'Instagram', value: 'Follow along', href: CONTACT.instagram, icon: AtSign, tone: 'cherry' },
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
    <main className="pg ct">
      <PageHead
        eyebrow="Contact"
        title="We’re here"
        accent="to help."
        sub="Questions about an ingredient, your order, shipping or returns — or interested in carrying Jayam? Send us a note."
      />

      <ul className="ct-channels">
        <li className="ct-channel ct-channel--fern">
          <Clock size={22} strokeWidth={1.7} aria-hidden="true" />
          <span>Response time</span>
          <b>Within 1 business day</b>
        </li>
        {channels.map(({ label, value, href, icon: Icon, tone }) => (
          <li key={label} className={`ct-channel ct-channel--${tone}`}>
            <Icon size={22} strokeWidth={1.7} aria-hidden="true" />
            <span>{label}</span>
            <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{value}</a>
          </li>
        ))}
        <li className="ct-channel ct-channel--hay">
          <HelpCircle size={22} strokeWidth={1.7} aria-hidden="true" />
          <span>Quick answers</span>
          <Link to="/faq">Read the FAQ</Link>
        </li>
      </ul>

      {status === 'sent' ? (
        <section className="pg-tile ct-card ct-success" role="status">
          <span className="ct-success-mark" aria-hidden="true"><Check size={28} strokeWidth={2} /></span>
          <h2>Thank you{submittedName ? `, ${submittedName}` : ''}.</h2>
          <p>We’ve received your enquiry and sent a confirmation to your email. We’ll get back to you within 1 business day.</p>
          <Link to="/shop" className="ap-pill">Continue shopping</Link>
        </section>
      ) : (
        <form className="pg-tile ct-card" onSubmit={handleSubmit}>
          <h2>Send us a message</h2>
          <div className="pg-row">
            <label className="pg-field">Name
              <input type="text" name="name" autoComplete="name" required maxLength={120} />
            </label>
            <label className="pg-field">Email
              <input type="email" name="email" autoComplete="email" required maxLength={200} />
            </label>
          </div>
          <div className="pg-row">
            <label className="pg-field">Topic
              <select name="category" value={category} onChange={(event) => setCategory(event.target.value)}>
                {ENQUIRY_CATEGORIES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            {ORDER_CATEGORIES.includes(category) ? (
              <label className="pg-field">Order number <small>(if you have one)</small>
                <input type="text" name="orderNumber" placeholder="ORD-…" maxLength={40} />
              </label>
            ) : (
              <label className="pg-field">Phone <small>(optional)</small>
                <input type="tel" name="phone" autoComplete="tel" maxLength={40} />
              </label>
            )}
          </div>
          <label className="pg-field">Subject
            <input type="text" name="subject" required maxLength={200} />
          </label>
          <label className="pg-field">Message
            <textarea name="message" rows={6} required maxLength={5000} />
          </label>
          {/* Spam trap — hidden from people, filled in by bots */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
          {errorMessage && <p className="pg-error" role="alert">{errorMessage}</p>}
          <button type="submit" className="ap-pill ap-pill--block" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </button>
        </form>
      )}
    </main>
  );
}
