import { authApi, errorMessage } from './auth';

// Every call the admin panel makes. Each returns { ok, data } or { ok: false, message }.
const call = async (request, fallback) => {
  try {
    const { data } = await request();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, status: error.response?.status, message: errorMessage(error, fallback) };
  }
};

export const adminApi = {
  dashboard: () => call(() => authApi.get('admin/dashboard'), 'Could not load the dashboard'),

  orders: () => call(() => authApi.get('admin/orders/all'), 'Could not load orders'),
  updateOrder: (id, body) => call(() => authApi.put(`admin/orders/${id}`, body), 'Could not update the order'),
  refundOrder: (id, amount) => call(() => authApi.post(`admin/orders/${id}/refund`, amount == null ? {} : { amount }), 'Could not refund the order'),

  discounts: () => call(() => authApi.get('admin/discounts'), 'Could not load discount codes'),
  saveDiscount: (id, body) => call(() => (id ? authApi.put(`admin/discounts/${id}`, body) : authApi.post('admin/discounts', body)), 'Could not save the discount'),
  deleteDiscount: (id) => call(() => authApi.delete(`admin/discounts/${id}`), 'Could not delete the discount'),

  setup: () => call(() => authApi.get('admin/setup'), 'Could not load the setup check'),
  sendTestEmail: () => call(() => authApi.post('admin/setup/test-email'), 'Could not send the test email'),

  products: () => call(() => authApi.get('admin/products'), 'Could not load products'),
  createProduct: (form) => call(() => authApi.post('admin/products', form), 'Could not create the product'),
  updateProduct: (id, form) => call(() => authApi.put(`admin/products/${id}`, form), 'Could not save the product'),
  deleteProduct: (id) => call(() => authApi.delete(`admin/products/${id}`), 'Could not delete the product'),
  addDefaultProducts: () => call(() => authApi.post('admin/products/add-defaults'), 'Could not add the Jayam products'),

  uploadImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return call(() => authApi.post('admin/uploads', form), 'Could not upload the image. Please try a smaller JPEG or PNG.');
  },

  assets: () => call(() => authApi.get('admin/assets'), 'Could not load the photo library'),
  cropAsset: (body) => call(() => authApi.post('admin/assets/crop', body), 'Could not crop that photo'),
  deleteAsset: (url) => call(() => authApi.delete('admin/assets', { params: { url } }), 'Could not delete that photo'),

  enquiries: (status) => call(() => authApi.get('admin/enquiries', { params: status ? { status } : {} }), 'Could not load enquiries'),
  updateEnquiry: (id, status) => call(() => authApi.put(`admin/enquiries/${id}`, { status }), 'Could not update the enquiry'),

  reviews: () => call(() => authApi.get('admin/reviews'), 'Could not load reviews'),
  deleteReview: (id) => call(() => authApi.delete(`admin/reviews/${id}`), 'Could not delete the review'),

  users: () => call(() => authApi.get('admin/users/all'), 'Could not load users'),
  updateRole: (id, role) => call(() => authApi.put(`admin/users/role/${id}`, { role }), 'Could not change the role'),
  deleteUser: (id) => call(() => authApi.delete(`admin/users/${id}`), 'Could not delete the user'),

  saveContent: (key, data) => call(() => authApi.put(`admin/content/${key}`, { data }), 'Could not save the content'),
};

export { mediaUrl } from './media';

export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';
