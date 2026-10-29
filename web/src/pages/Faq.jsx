import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PageHead from '../components/storefront/PageHead';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, formatPrice } from '../lib/store';
import usePageMeta from '../lib/usePageMeta';

const sections = [
  {
    id: 'products',
    title: 'Our products',
    questions: [
      {
        q: 'What ingredients do you use?',
        a: (
          <>
            <p>Each Jayam product has a short, plant-based ingredient list, sourced from India:</p>
            <ul>
              <li><strong>Moringa Leaf + Amla Tablets</strong> — organic Moringa leaf powder and Amla powder (500 mg per tablet)</li>
              <li><strong>Moringa Leaf Capsules</strong> — organic Moringa leaf powder (500 mg per capsule)</li>
              <li><strong>Moringa Flower Tablets</strong> — organic Moringa flower powder (500 mg per tablet)</li>
              <li><strong>Moringa Seed Capsules</strong> — organic Moringa seed powder (500 mg per capsule)</li>
              <li><strong>Beauty Drops</strong> — Moringa root extract, Moringa seed oil, Sweet orange seed oil and virgin coconut oil</li>
            </ul>
            <p>Our supplements are made without fillers, binders, artificial colors or preservatives.</p>
          </>
        ),
      },
      {
        q: 'Are your products clean and safe?',
        a: (
          <>
            <p>We keep our products simple: carefully selected plant ingredients and nothing unnecessary. Our supplements are vegan and Non-GMO, and Beauty Drops is free from paraffins, fillers and artificial fragrance.</p>
            <p>Our products contain no intentionally added major allergens, but they are manufactured in a facility that also processes peanuts. If you are pregnant or nursing, taking medication, or have a medical condition, please consult your healthcare provider before use.</p>
          </>
        ),
      },
      {
        q: 'Are your products lab tested?',
        a: <p>Yes. Our supplements are manufactured in GMP-certified facilities and third-party lab tested for purity and potency.</p>,
      },
      {
        q: 'What makes Jayam different?',
        a: <p>Jayam focuses on simple, clean products made with carefully selected, plant-based ingredients — without unnecessary complexity. We care about quality and transparency, and we only offer products we would feel comfortable giving to our own families. Our focus is long-term everyday wellness, not quick fixes.</p>,
      },
      {
        q: 'What benefits can I expect?',
        a: <p>Each product page describes what that product is designed to support, from everyday energy and digestion to skin radiance. Our products are made to complement an everyday wellness routine over time. Our supplements are not intended to diagnose, treat, cure, or prevent any disease.</p>,
      },
    ],
  },
  {
    id: 'using',
    title: 'Using our products',
    questions: [
      {
        q: 'How do I take Jayam supplements?',
        a: <p>Take 2 tablets or capsules daily — one in the morning and one in the evening — preferably with food, or as directed by a healthcare practitioner. Swallow with water.</p>,
      },
      {
        q: 'How do I use Beauty Drops?',
        a: <p>Apply a few drops to clean, dry skin and gently massage into the face and neck until absorbed. Use in the morning and/or evening as part of your skincare routine. Beauty Drops is for external use only — avoid contact with eyes, and we recommend a patch test before first use.</p>,
      },
      {
        q: 'Can I use them every day?',
        a: <p>Yes — our supplements are designed to be part of your daily routine at the recommended serving of 2 per day, and each pack is a 2-month supply. If you are pregnant or nursing, taking medication, or have a medical condition, please check with your physician first.</p>,
      },
      {
        q: 'Who are your products for?',
        a: <p>Our products are for adults only. Please keep them out of reach of children.</p>,
      },
      {
        q: 'How should I store them?',
        a: <p>Store in a cool, dry place away from direct sunlight, heat and moisture. Supplements have a shelf life of 2 years from the date of manufacture; Beauty Drops has a shelf life of 3 years.</p>,
      },
    ],
  },
  {
    id: 'shipping',
    title: 'Shipping & delivery',
    questions: [
      {
        q: 'Where do you ship?',
        a: <p>We ship across the United States, including U.S. territories. We don’t offer international shipping at this time.</p>,
      },
      {
        q: 'How much does shipping cost?',
        a: <p>Standard shipping is {formatPrice(SHIPPING_FEE)}. Orders of {formatPrice(FREE_SHIPPING_THRESHOLD)} and above ship free. The same rates currently apply to U.S. territories.</p>,
      },
      {
        q: 'How long will my order take to arrive?',
        a: <p>Delivery usually takes 2–7 business days. Delivery to Alaska, Hawaii and U.S. territories may take longer.</p>,
      },
      {
        q: 'Which carriers do you use?',
        a: <p>We ship with USPS and UPS.</p>,
      },
      {
        q: 'Can I track my order?',
        a: <p>Yes. When your order ships, we’ll email you the carrier and tracking number. You can also check the status any time on our <Link to="/track-order">Track your order</Link> page using your order number and email.</p>,
      },
    ],
  },
  {
    id: 'orders',
    title: 'Orders',
    questions: [
      {
        q: 'Do I need an account to order?',
        a: <p>No. You can check out as a guest. If you <Link to="/register">create an account</Link> — or sign in with Google — your orders, receipts and tracking stay together in <Link to="/account">your account</Link>.</p>,
      },
      {
        q: 'Will I receive an order confirmation and receipt?',
        a: <p>Yes. You’ll receive an order confirmation by email with a link to your receipt, which you can print or save as a PDF. The receipt is also available on the <Link to="/track-order">Track your order</Link> page.</p>,
      },
      {
        q: 'What if I need help with a return?',
        a: <p>We accept unopened products within 30 days of delivery, and we replace or refund anything that arrives damaged or incorrect. See our <Link to="/shipping-returns">Shipping &amp; Returns</Link> policy, then <Link to="/contact?category=RETURNS">contact us</Link> and choose “Returns” — we’ll reply within 1 business day.</p>,
      },
    ],
  },
  {
    id: 'support',
    title: 'Getting in touch',
    questions: [
      {
        q: 'How can I contact Jayam?',
        a: <p>The easiest way is our <Link to="/contact">contact form</Link>. Choose a topic — product question, order support, shipping, returns, or wholesale — and we’ll respond within 1 business day. You’ll get an automatic confirmation as soon as your message is received.</p>,
      },
    ],
  },
];

export default function FaqPage() {
  usePageMeta({ title: 'FAQ', description: 'Answers about Jayam ingredients, how to take our supplements, shipping across the U.S., orders and returns.' });
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  return (
    <main className="pg fq">
      <PageHead
        eyebrow="Help"
        title="Questions?"
        accent="Clear answers."
        sub="Everything you’d want to know before choosing Jayam — what’s inside, how to use it, and how your order reaches you."
      >
        <nav aria-label="FAQ sections" className="pg-chips fq-nav">
          {sections.map(({ id, title }) => <a key={id} href={`#${id}`}>{title}</a>)}
        </nav>
      </PageHead>

      <div className="fq-body">
        {sections.map(({ id, title, questions }) => (
          <section key={id} id={id} className="fq-section" aria-labelledby={`${id}-title`}>
            <h2 id={`${id}-title`}>{title}</h2>
            <div className="fq-list">
              {questions.map(({ q, a }) => (
                <details key={q} className="fq-item">
                  <summary>
                    {q}
                    <Plus size={20} strokeWidth={1.6} aria-hidden="true" />
                  </summary>
                  <div className="fq-answer">{a}</div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="fq-cta">
        <h2>Still have a question?</h2>
        <p>We’re happy to help — we reply within 1 business day.</p>
        <Link to="/contact" className="ap-pill">Contact us</Link>
      </section>
    </main>
  );
}
