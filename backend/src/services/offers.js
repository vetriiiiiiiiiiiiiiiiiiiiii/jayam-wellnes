const { roundMoney } = require('../config/store');

// Product offers from Admin → Products → Offer: a percentage or dollar amount off one
// product (and all its options) for a set time. The shop shows the offer price with the
// old price struck through, and checkout charges the offer price.

const OFFER_TYPES = ['PERCENT', 'FIXED'];

const validDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

// The offer if it is switched on and running now, else null
const activeOffer = (offer, now = new Date()) => {
  if (!offer || typeof offer !== 'object' || !offer.active) return null;
  const value = Number(offer.value);
  if (!OFFER_TYPES.includes(offer.type) || !Number.isFinite(value) || value <= 0) return null;
  const startsAt = validDate(offer.startsAt);
  const endsAt = validDate(offer.endsAt);
  if (startsAt && startsAt > now) return null;
  if (endsAt && endsAt < now) return null;
  return { ...offer, value };
};

// A price with the offer taken off; never below one cent
const offerPrice = (offer, price) => {
  if (!offer || !Number.isFinite(price)) return price;
  const reduced = offer.type === 'PERCENT' ? price * (1 - offer.value / 100) : price - offer.value;
  return roundMoney(Math.max(reduced, 0.01));
};

const offerSummary = (offer) => ({
  type: offer.type,
  value: offer.value,
  label: typeof offer.label === 'string' && offer.label.trim() ? offer.label.trim() : null,
  endsAt: offer.endsAt || null,
});

// Shop view of a product: an active offer lowers the price (and each option's price) and
// keeps the old price as the struck-through compare-at price
const withOffer = (product, now = new Date()) => {
  if (!product) return product;
  const offer = activeOffer(product.offer, now);
  if (!offer) return { ...product, offer: null };
  const strike = (price, compareAt) => Math.max(price, Number(compareAt) || 0);
  return {
    ...product,
    price: offerPrice(offer, product.price),
    compareAtPrice: strike(product.price, product.compareAtPrice),
    variants: (product.variants || []).map((variant) => {
      const base = variant.price ?? product.price;
      return { ...variant, price: offerPrice(offer, base), compareAtPrice: strike(base, variant.compareAtPrice) };
    }),
    offer: offerSummary(offer),
  };
};

// Check an offer sent from the admin panel; returns { offer } or { error }
const cleanOffer = (raw) => {
  if (raw === null || raw === '' || raw === undefined) return { offer: null };
  if (typeof raw !== 'object' || Array.isArray(raw)) return { error: 'The offer is not valid' };
  const type = raw.type === 'FIXED' ? 'FIXED' : 'PERCENT';
  const value = raw.value === '' || raw.value == null ? 0 : Number(raw.value);
  const active = Boolean(raw.active);
  if (active) {
    if (!Number.isFinite(value) || value <= 0) return { error: type === 'PERCENT' ? 'Enter the offer percentage' : 'Enter the dollars off for the offer' };
    if (type === 'PERCENT' && value >= 100) return { error: 'An offer percentage must be under 100' };
  }
  const startsAt = validDate(raw.startsAt);
  const endsAt = validDate(raw.endsAt);
  if (startsAt === undefined || endsAt === undefined) return { error: 'Enter valid offer dates' };
  if (startsAt && endsAt && endsAt <= startsAt) return { error: 'The offer must end after it starts' };
  return {
    offer: {
      active,
      type,
      value: Number.isFinite(value) ? roundMoney(value) : 0,
      label: String(raw.label || '').trim().slice(0, 60),
      startsAt: startsAt ? startsAt.toISOString() : null,
      endsAt: endsAt ? endsAt.toISOString() : null,
    },
  };
};

module.exports = { activeOffer, offerPrice, withOffer, cleanOffer };
