import { Link } from 'react-router-dom';
import PageHead from '../components/storefront/PageHead';
import usePageMeta from '../lib/usePageMeta';
import { CONTACT, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, formatPrice } from '../lib/store';

// Privacy Policy, Terms of Sale, and Shipping & Returns.
// DRAFT wording for a U.S. online store — the business should review it (ideally with
// counsel) before launch, and update LAST_UPDATED whenever the policies change.
const LAST_UPDATED = 'October 29, 2026';
const BUSINESS = import.meta.env.VITE_LEGAL_NAME || 'Jayam Wellness';
const contactLine = CONTACT.email
  ? <>email us at <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or use our <Link to="/contact">contact form</Link></>
  : <>use our <Link to="/contact">contact form</Link></>;

const PAGES = {
  privacy: {
    eyebrow: 'Legal',
    title: 'Privacy',
    accent: 'Policy.',
    sections: [
      ['Who we are', <p key="a">This policy explains how {BUSINESS} (“Jayam”, “we”) collects, uses and protects personal information when you visit our website or buy from us. Questions? {contactLine}.</p>],
      ['What we collect', <>
        <p>We collect only what we need to run the store:</p>
        <ul>
          <li><b>Order details</b> — your name, email, phone (optional), shipping address and what you ordered.</li>
          <li><b>Account details</b> — if you create an account: your name, email and a securely hashed password, or your Google profile name, email and picture if you sign in with Google.</li>
          <li><b>Messages</b> — what you send through our contact form.</li>
          <li><b>Reviews</b> — the name and review you choose to publish.</li>
          <li><b>Technical data</b> — basic information your browser sends, such as IP address and device type, used for security and to keep the site working.</li>
        </ul>
        <p>Card details are entered directly with our payment processor, Stripe. We never see or store your full card number.</p>
      </>],
      ['How we use it', <ul key="c">
        <li>To process, ship and support your orders, including order confirmation and shipping emails.</li>
        <li>To reply to your enquiries.</li>
        <li>To keep your account secure and let you see your orders.</li>
        <li>To prevent fraud and meet legal obligations, such as tax records.</li>
      </ul>],
      ['Who we share it with', <>
        <p>We do not sell your personal information. We share it only with service providers who help us run the store, under contracts that limit their use of it:</p>
        <ul>
          <li><b>Stripe</b> — payment processing.</li>
          <li><b>USPS and UPS</b> — delivering your order.</li>
          <li><b>Resend</b> — sending order and account emails.</li>
          <li><b>Google</b> — only if you choose to sign in with Google.</li>
          <li>Our hosting provider, which stores the website and its data.</li>
        </ul>
        <p>We may also disclose information when the law requires it.</p>
      </>],
      ['Cookies', <p key="e">We use a single essential cookie to keep you signed in, and your browser’s local storage to remember your bag. We do not use advertising or tracking cookies.</p>],
      ['How long we keep it', <p key="f">We keep order records for as long as needed for accounting and tax purposes (generally seven years). You can delete your account at any time by contacting us; past order records are kept as the law requires.</p>],
      ['Your rights', <p key="g">Depending on where you live (for example, California under the CCPA/CPRA), you may have the right to know what personal information we hold about you, to correct it, to delete it, and to opt out of its sale — which we do not do. To make a request, {contactLine}. We will not treat you differently for exercising these rights.</p>],
      ['Children', <p key="h">Our products are for adults. We do not knowingly collect information from children under 13.</p>],
      ['Changes', <p key="i">If we change this policy, we will update the date at the top of this page.</p>],
    ],
  },
  terms: {
    eyebrow: 'Legal',
    title: 'Terms of',
    accent: 'Sale.',
    sections: [
      ['About these terms', <p key="a">These terms apply when you use this website or buy from {BUSINESS}. By placing an order you agree to them. Questions? {contactLine}.</p>],
      ['Our products', <>
        <p>Our supplements are intended for adults and are meant to complement a balanced diet and lifestyle. <b>These statements have not been evaluated by the Food and Drug Administration. Our products are not intended to diagnose, treat, cure, or prevent any disease.</b></p>
        <p>Please read each product’s ingredients, directions and warnings before use. If you are pregnant or nursing, taking medication, or have a medical condition, consult your healthcare provider first. Our products are manufactured in a facility that also processes peanuts.</p>
      </>],
      ['Orders and prices', <p key="c">All prices are in U.S. dollars. We may correct pricing errors and may cancel an order if a product is unavailable or a price was listed in error — if we do, we will refund any amount you paid. Your order is confirmed when payment succeeds and you receive our confirmation email.</p>],
      ['Payment', <p key="d">Payments are processed securely by Stripe. By paying you confirm you are authorised to use the payment method.</p>],
      ['Shipping, returns and refunds', <p key="e">See our <Link to="/shipping-returns">Shipping &amp; Returns</Link> policy.</p>],
      ['Accounts', <p key="f">You are responsible for keeping your sign-in details secure. We may suspend accounts that are misused.</p>],
      ['Reviews', <p key="g">Reviews you post must be honest and about your own experience. We may remove reviews that are offensive, misleading or off-topic. Reviews must not make medical claims.</p>],
      ['Our content', <p key="h">The text, images, illustrations and Jayam name and logo on this site belong to {BUSINESS} and may not be copied without permission.</p>],
      ['Limitation of liability', <p key="i">To the extent the law allows, our liability for any claim relating to a product is limited to the amount you paid for it. Nothing in these terms limits rights you have under consumer protection law.</p>],
      ['Changes', <p key="j">We may update these terms; the version on this page at the time of your order applies to that order.</p>],
    ],
  },
  shipping: {
    eyebrow: 'Help',
    title: 'Shipping',
    accent: '& Returns.',
    sections: [
      ['Where we ship', <p key="a">We ship across the United States, including U.S. territories. We don’t offer international shipping at this time.</p>],
      ['Shipping costs', <p key="b">Standard shipping is {formatPrice(SHIPPING_FEE)}. Orders of {formatPrice(FREE_SHIPPING_THRESHOLD)} and above ship free.</p>],
      ['Delivery times', <p key="c">Orders usually arrive in 2–7 business days with USPS or UPS. Delivery to Alaska, Hawaii and U.S. territories may take longer. When your order ships we email you the carrier and tracking number, and you can follow it on our <Link to="/track-order">Track your order</Link> page.</p>],
      ['Damaged or wrong items', <p key="d">If something arrives damaged or isn’t what you ordered, {contactLine} within 7 days of delivery with your order number and a photo. We’ll send a replacement or a full refund — you won’t need to return it.</p>],
      ['Returns', <>
        <p>We accept returns of <b>unopened, sealed</b> products within <b>30 days of delivery</b>. For safety, we can’t accept returns of opened supplements or skincare unless they were damaged or incorrect.</p>
        <p>To start a return, <Link to="/contact?category=RETURNS">contact us and choose “Returns”</Link>. Return shipping is paid by the customer unless the item was damaged or incorrect.</p>
      </>],
      ['Refunds', <p key="f">Once we receive and check your return, we refund the product price to your original payment method. Refunds usually appear within 5–10 business days, depending on your bank. Original shipping charges are not refunded unless the item was damaged or incorrect.</p>],
      ['Cancelling an order', <p key="g">Need to change or cancel? Contact us as soon as possible — we can cancel and fully refund any order that hasn’t shipped yet.</p>],
    ],
  },
};

export default function Legal({ page }) {
  const content = PAGES[page] || PAGES.privacy;
  usePageMeta({ title: `${content.title} ${content.accent}`.replace(/\.$/, '') });
  return (
    <main className="pg lg">
      <PageHead eyebrow={content.eyebrow} title={content.title} accent={content.accent} sub={`Last updated ${LAST_UPDATED}`} />
      <article className="lg-body">
        {content.sections.map(([heading, body]) => (
          <section key={heading}>
            <h2>{heading}</h2>
            {body}
          </section>
        ))}
      </article>
      <nav className="lg-nav" aria-label="Policies">
        <Link to="/shipping-returns">Shipping &amp; Returns</Link>
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms of Sale</Link>
      </nav>
    </main>
  );
}
