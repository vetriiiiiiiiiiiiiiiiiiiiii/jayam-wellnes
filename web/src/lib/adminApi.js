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
  refundOrder: (id) => call(() => authApi.post(`admin/orders/${id}/refund`), 'Could not refund the order'),

  products: () => call(() => authApi.get('admin/products'), 'Could not load products'),
  createProduct: (form) => call(() => authApi.post('admin/products', form), 'Could not create the product'),
  updateProduct: (id, form) => call(() => authApi.put(`admin/products/${id}`, form), 'Could not save the product'),
  deleteProduct: (id) => call(() => authApi.delete(`admin/products/${id}`), 'Could not delete the product'),

  uploadImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return call(() => authApi.post('admin/uploads', form), 'Could not upload the image');
  },

  enquiries: (status) => call(() => authApi.get('admin/enquiries', { params: status ? { status } : {} }), 'Could not load enquiries'),
  updateEnquiry: (id, status) => call(() => authApi.put(`admin/enquiries/${id}`, { status }), 'Could not update the enquiry'),

  reviews: () => call(() => authApi.get('admin/reviews'), 'Could not load reviews'),
  deleteReview: (id) => call(() => authApi.delete(`admin/reviews/${id}`), 'Could not delete the review'),

  users: () => call(() => authApi.get('admin/users/all'), 'Could not load users'),
  updateRole: (id, role) => call(() => authApi.put(`admin/users/role/${id}`, { role }), 'Could not change the role'),
  deleteUser: (id) => call(() => authApi.delete(`admin/users/${id}`), 'Could not delete the user'),

  saveContent: (key, data) => call(() => authApi.put(`admin/content/${key}`, { data }), 'Could not save the content'),
};

// Product images and uploads are stored on the API server; show them from there
const base = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
export const mediaUrl = (url) => (url && url.startsWith('/uploads/') ? `${base}${url}` : url);

export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';
