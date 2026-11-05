import { useEffect, useState } from 'react';
import { CheckCircle2, CircleAlert, CircleDashed } from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { useNotice } from './adminBits';

// A checklist of the keys the store needs, read from the server (never shows a secret)

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const publishableMode = !publishableKey ? null : publishableKey.startsWith('pk_live_') ? 'live' : 'test';

function Check({ state, title, children }) {
  const Icon = state === 'ok' ? CheckCircle2 : state === 'warn' ? CircleAlert : CircleDashed;
  return (
    <li className={`ad-check-item ad-check-item--${state}`}>
      <Icon size={20} aria-hidden="true" />
      <div>
        <b>{title}</b>
        <div className="ad-muted ad-small">{children}</div>
      </div>
    </li>
  );
}

const Key = ({ children }) => <code className="ad-code">{children}</code>;

export default function AdminSetup() {
  const [setup, setSetup] = useState(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, notify] = useNotice();

  useEffect(() => {
    adminApi.setup().then((result) => (result.ok ? setSetup(result.data) : setError(result.message)));
  }, []);

  const testEmail = async () => {
    setSending(true);
    const result = await adminApi.sendTestEmail();
    setSending(false);
    notify(result.ok ? result.data.message : result.message, result.ok ? 'ok' : 'error');
  };

  if (error) return <p className="ad-error">{error}</p>;
  if (!setup) return <p className="ad-muted">Checking the setup…</p>;

  const { stripe, email } = setup;
  const modesMatch = !stripe.mode || !publishableMode || stripe.mode === publishableMode;

  return (
    <div className="ad-page">
      {notice}
      <div className="ad-head">
        <div>
          <h1>Setup</h1>
          <p className="ad-muted">What the store needs to take payments and send email. Keys go in <Key>backend/.env</Key> and <Key>web/.env.local</Key>; restart the API (and rebuild the site) after changing them.</p>
        </div>
      </div>

      <section className="ad-card">
        <h2>Payments (Stripe)</h2>
        <ul className="ad-checklist">
          <Check state={stripe.secretKey ? (stripe.account?.ok === false ? 'warn' : 'ok') : 'todo'} title="Secret key">
            {!stripe.secretKey && <>Add <Key>STRIPE_SECRET_KEY</Key> (Stripe Dashboard → Developers → API keys).</>}
            {stripe.secretKey && stripe.account?.ok && <>Connected to <b>{stripe.account.name}</b> in {stripe.mode} mode{stripe.account.chargesEnabled ? '' : '. Stripe hasn’t enabled payments on this account yet: finish activating it in the Dashboard'}.</>}
            {stripe.secretKey && stripe.account?.ok === false && <>Stripe rejected the key: {stripe.account.error}</>}
          </Check>
          <Check state={publishableKey ? (modesMatch ? 'ok' : 'warn') : 'todo'} title="Publishable key">
            {!publishableKey && <>Add <Key>VITE_STRIPE_PUBLISHABLE_KEY</Key> to <Key>web/.env.local</Key>, then rebuild the site.</>}
            {publishableKey && modesMatch && <>Set ({publishableMode} mode).</>}
            {publishableKey && !modesMatch && <>This is a {publishableMode} key but the secret key is {stripe.mode}. Use keys from the same mode.</>}
          </Check>
          <Check state={stripe.webhookSecret ? 'ok' : 'todo'} title="Webhook">
            {stripe.webhookUrl && <>Endpoint: <Key>{stripe.webhookUrl}</Key><br /></>}
            Events: <Key>payment_intent.succeeded</Key> <Key>payment_intent.payment_failed</Key> <Key>payment_intent.canceled</Key> <Key>charge.refunded</Key> <Key>charge.dispute.created</Key>
            <br />{stripe.webhookSecret ? 'Signing secret is set.' : <>Then add its signing secret as <Key>STRIPE_WEBHOOK_SECRET</Key>.</>}
          </Check>
          <Check state="ok" title="Payment methods">
            Cards, Apple Pay, Google Pay and Link appear automatically when they’re turned on in Stripe Dashboard → Settings → Payment methods. For Apple Pay, also add your domain there.
          </Check>
        </ul>
      </section>

      <section className="ad-card">
        <div className="ad-card-head">
          <h2>Email (Resend)</h2>
          <button type="button" className="ad-btn ad-btn--ghost ad-btn--small" onClick={testEmail} disabled={sending}>{sending ? 'Sending…' : 'Send me a test email'}</button>
        </div>
        <ul className="ad-checklist">
          <Check state={email.configured ? 'ok' : 'todo'} title="API key">
            {email.configured ? `Sending through ${email.provider === 'resend' ? 'Resend' : 'SMTP'}.` : <>Add <Key>RESEND_API_KEY</Key>. Until then emails are only written to the server log.</>}
          </Check>
          <Check state={email.fromIsTestAddress ? 'warn' : 'ok'} title="Sender address">
            {email.from ? <>Sending as <Key>{email.from}</Key>. </> : null}
            {email.fromIsTestAddress
              ? <>Verify your domain in Resend → Domains, then set <Key>MAIL_FROM</Key>, e.g. <Key>Jayam Wellness &lt;orders@yourdomain.com&gt;</Key>. Resend’s test address only delivers to your own inbox.</>
              : 'Make sure this domain shows as verified in Resend → Domains.'}
          </Check>
          <Check state={email.supportEmail ? 'ok' : 'todo'} title="Support inbox">
            {email.supportEmail ? <>Customer replies and contact-form messages go to <b>{email.supportEmail}</b>.</> : <>Add <Key>SUPPORT_EMAIL</Key>: replies and contact-form messages go there.</>}
          </Check>
          <Check state={email.alertRecipients.length ? 'ok' : 'todo'} title="Store alerts">
            {email.alertRecipients.length
              ? <>New orders, low stock (at {setup.lowStockThreshold} or fewer) and payment disputes go to <b>{email.alertRecipients.join(', ')}</b>.</>
              : <>Add <Key>ORDER_ALERT_EMAIL</Key> (or <Key>SUPPORT_EMAIL</Key>) to get new-order, low-stock and dispute emails.</>}
          </Check>
        </ul>
        <p className="ad-muted ad-small">Customers get: order confirmation with receipt, shipped with tracking, delivered, refunds, cancellations, welcome, password reset and a reply to contact-form messages.</p>
      </section>

      <section className="ad-card">
        <h2>Sign-in and site</h2>
        <ul className="ad-checklist">
          <Check state={setup.google ? 'ok' : 'todo'} title="Google sign-in">
            {setup.google ? 'Set.' : <>Optional. Add <Key>GOOGLE_CLIENT_ID</Key> and <Key>GOOGLE_CLIENT_SECRET</Key> to show “Continue with Google”.</>}
          </Check>
          <Check state={setup.urls.frontend && setup.urls.backend ? 'ok' : 'todo'} title="Site addresses">
            <Key>FRONTEND_URL</Key> {setup.urls.frontend || 'not set'} · <Key>BACKEND_URL</Key> {setup.urls.backend || 'not set'}. Email links and the webhook use these.
          </Check>
          <Check state="ok" title="Unpaid checkouts">
            Cancelled after {setup.orderHoldMinutes} minutes so their stock goes back on sale (<Key>ORDER_HOLD_MINUTES</Key>).
          </Check>
        </ul>
      </section>
    </div>
  );
}
