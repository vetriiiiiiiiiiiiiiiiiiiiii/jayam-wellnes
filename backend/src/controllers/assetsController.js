const fs = require('fs');
const prisma = require('../config/prisma');
const { libraryFile, listLibrary, cropLibraryImage, removeQuietly } = require('../services/mediaService');

// Admin → Assets: every uploaded photo in one place, to reuse, crop or delete.

// Everything that can point at a photo, as one block of text to search
const usageText = async () => {
  const [products, images, content, banners, gallery] = await Promise.all([
    prisma.product.findMany({ select: { story: true, highlights: true } }),
    prisma.productImage.findMany({ select: { url: true } }),
    prisma.siteContent.findMany(),
    prisma.banner.findMany().catch(() => []),
    prisma.gallery.findMany().catch(() => []),
  ]);
  return JSON.stringify([products, images, content, banners, gallery]);
};

// GET /admin/assets — the library, newest first, with whether each photo is used
exports.listAssets = async (req, res) => {
  if (process.env.USE_MINIO === 'true') {
    return res.json({ assets: [], note: 'The photo library lists photos stored on this server; this store keeps them in MinIO.' });
  }
  const used = await usageText();
  const assets = listLibrary().map((asset) => ({ ...asset, inUse: used.includes(asset.url.split('/').pop()) }));
  res.json({ assets });
};

// POST /admin/assets/crop { url, left, top, width, height } — a cropped copy as a new photo
exports.cropAsset = async (req, res) => {
  try {
    const url = await cropLibraryImage(req.body?.url, req.body || {});
    res.status(201).json({ success: true, url });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Could not crop that photo' });
  }
};

// DELETE /admin/assets?url=… — remove a photo the site no longer uses
exports.deleteAsset = async (req, res) => {
  const url = String(req.query.url || '');
  const file = libraryFile(url);
  if (!file || !fs.existsSync(file)) return res.status(404).json({ message: 'Photo not found' });
  const used = await usageText();
  if (used.includes(url.split('/').pop()) && req.query.force !== 'true') {
    return res.status(409).json({ message: 'This photo is used on the site. Replace it there first.' });
  }
  removeQuietly(file);
  res.json({ success: true });
};
