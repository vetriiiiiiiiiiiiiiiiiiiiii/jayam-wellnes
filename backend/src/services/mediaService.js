const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const prisma = require('../config/prisma');

sharp.cache(false);

// Image processing, done in the request itself (no queue or Redis):
// resize, convert to WebP, store under public/uploads (or MinIO when USE_MINIO=true),
// and return the public path, e.g. /uploads/product/product-<id>-<time>.webp

const SIZES = {
  product: { width: 1600, height: 1600, fit: 'inside' },
  content: { width: 1600, height: 1600, fit: 'inside' },
  user: { width: 500, height: 500, fit: 'cover' },
};

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
const MAX_BYTES = 8 * 1024 * 1024;

const removeQuietly = (file) => {
  try {
    if (file && fs.existsSync(file)) fs.unlinkSync(file);
  } catch {}
};

/**
 * Turn one uploaded file (from multer) into a stored WebP image.
 * kind: "product" | "content" | "user"; ownerId is used in the filename.
 */
async function storeImage(file, kind, ownerId = 'site') {
  const input = path.resolve(file.path);
  try {
    if (!ALLOWED.includes(file.mimetype)) throw new Error('Please upload a JPEG, PNG, WebP or AVIF image');
    if (file.size > MAX_BYTES) throw new Error('Images must be 8 MB or smaller');

    const size = SIZES[kind] || SIZES.content;
    const random = Math.random().toString(36).slice(2, 10);
    const filename = `${kind}-${String(ownerId).slice(0, 32)}-${Date.now()}-${random}.webp`;
    const buffer = await sharp(input)
      .rotate()
      .resize(size.width, size.height, { fit: size.fit, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    if (process.env.USE_MINIO === 'true') {
      const minio = require('../config/minio');
      const objectKey = `${kind}/${filename}`;
      await minio.putObject(process.env.MINIO_BUCKET_NAME, objectKey, buffer, buffer.length, { 'Content-Type': 'image/webp' });
      return `/${objectKey}`;
    }

    const storedPath = `/uploads/${kind}/${filename}`;
    const destination = path.join(process.cwd(), 'public', storedPath);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, buffer);
    return storedPath;
  } finally {
    removeQuietly(input);
  }
}

// Store a product's uploaded images and append them to its gallery in order
async function addProductImages(productId, files = []) {
  if (!files.length) return [];
  let position = await prisma.productImage.count({ where: { productId } });
  const created = [];
  for (const file of files) {
    const url = await storeImage(file, 'product', productId);
    created.push(await prisma.productImage.create({ data: { productId, url, position } }));
    position += 1;
  }
  return created;
}

// Delete a stored image file when it lives in local uploads
function deleteStoredImage(url) {
  if (!url || !url.startsWith('/uploads/')) return;
  removeQuietly(path.join(process.cwd(), 'public', url));
}

module.exports = { storeImage, addProductImages, deleteStoredImage, removeQuietly };
