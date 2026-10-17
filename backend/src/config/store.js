// Store-wide commerce settings (United States only, priced in USD)

const CURRENCY = 'USD';
const SHIPPING_FEE = 5.99;
const FREE_SHIPPING_THRESHOLD = 49;

// 50 states, DC and U.S. territories (same shipping rates for now)
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY',
  'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH',
  'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'PR', 'GU', 'VI', 'AS', 'MP',
];

const ZIP_PATTERN = /^\d{5}(-\d{4})?$/;

const roundMoney = (value) => Math.round(value * 100) / 100;

const shippingFor = (subtotal) => (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE);

module.exports = {
  CURRENCY,
  SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
  US_STATES,
  ZIP_PATTERN,
  roundMoney,
  shippingFor,
};
