const prisma = require('../config/prisma');

// Content blocks the dashboard may edit
const KEYS = ['home', 'product-stories'];
const MAX_BYTES = 200 * 1024;

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

// Public: the storefront reads saved text and merges it over its defaults
exports.getContent = async (req, res) => {
  const { key } = req.params;
  if (!KEYS.includes(key)) return res.status(404).json({ success: false, message: 'Unknown content block' });
  try {
    const row = await prisma.siteContent.findUnique({ where: { key } });
    res.json({ success: true, data: row?.data || {}, updatedAt: row?.updatedAt || null });
  } catch (error) {
    console.error('[Content] read failed:', error.message);
    res.status(500).json({ success: false, message: 'Could not load content' });
  }
};

// Admin: replace a content block
exports.updateContent = async (req, res) => {
  const { key } = req.params;
  if (!KEYS.includes(key)) return res.status(404).json({ success: false, message: 'Unknown content block' });
  const data = req.body?.data;
  if (!isPlainObject(data)) return res.status(400).json({ success: false, message: 'Content must be an object' });
  if (Buffer.byteLength(JSON.stringify(data)) > MAX_BYTES) {
    return res.status(413).json({ success: false, message: 'Content is too large' });
  }
  try {
    const row = await prisma.siteContent.upsert({ where: { key }, update: { data }, create: { key, data } });
    res.json({ success: true, data: row.data, updatedAt: row.updatedAt });
  } catch (error) {
    console.error('[Content] save failed:', error.message);
    res.status(500).json({ success: false, message: 'Could not save content' });
  }
};
