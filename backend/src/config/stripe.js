const Stripe = require('stripe');

let client;

// Shared Stripe client, or null until STRIPE_SECRET_KEY is set
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
};

module.exports = { getStripe };
