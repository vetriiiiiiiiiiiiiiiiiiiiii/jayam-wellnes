// Store-wide settings shared by the storefront (keep in sync with backend/src/config/store.js)

export const SHIPPING_FEE = 5.99;
export const FREE_SHIPPING_THRESHOLD = 49;

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export const formatPrice = (value) => usd.format(Number(value) || 0);

export const shippingFor = (subtotal) => (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE);

// How customers reach Jayam. Set these in web/.env.local; empty values are hidden on the site.
export const CONTACT = {
  email: import.meta.env.VITE_SUPPORT_EMAIL || '',
  whatsapp: (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/[^\d]/g, ''), // international format, e.g. 15551234567
  instagram: import.meta.env.VITE_INSTAGRAM_URL || '',
};

export const ENQUIRY_CATEGORIES = [
  { value: 'PRODUCT_QUESTION', label: 'Product question' },
  { value: 'ORDER_SUPPORT', label: 'Order support' },
  { value: 'SHIPPING', label: 'Shipping' },
  { value: 'RETURNS', label: 'Returns' },
  { value: 'WHOLESALE', label: 'Wholesale / business' },
  { value: 'OTHER', label: 'Other' },
];

export const CATEGORY_LABELS = {
  SUPPLEMENT: 'Herbal Supplements',
  SKINCARE: 'Beauty & Facial Care',
  BUNDLE: 'Collections',
  OTHER: 'Other',
};

export const US_STATES = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'],
  ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'],
  ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'],
  ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'],
  ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'],
  ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
  ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'],
  ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'],
  ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
  ['PR', 'Puerto Rico'], ['GU', 'Guam'], ['VI', 'U.S. Virgin Islands'], ['AS', 'American Samoa'],
  ['MP', 'Northern Mariana Islands'],
];
