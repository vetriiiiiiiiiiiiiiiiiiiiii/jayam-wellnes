// Uploaded files live on the API server; turn their stored path into a full address
const base = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '');

export const mediaUrl = (url) => (url && url.startsWith('/uploads/') ? `${base}${url}` : url);
