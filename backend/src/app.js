const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const logger = require('./utils/logger');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes');

const cookieParser = require('cookie-parser');
const passport = require('passport');

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Behind a host's proxy: real client IPs (sign-in rate limits) and HTTPS-only cookies work
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Basic security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  if (isProduction) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
    ...(isProduction ? [] : ['http://localhost:5173', 'http://127.0.0.1:5173']),
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
}));
// Stripe webhooks are signed over the raw body, so this route comes before express.json()
app.post('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }), require('./controllers/paymentController').stripeWebhook);
app.use(express.json({ limit: '300kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Initialize Passport config
require('./config/passport')(passport);

// Setup morgan to pipe HTTP logs to Winston
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Unified API Router
const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => {
  res.json({ success: true, message: 'Miracle Tree API is operational', timestamp: new Date() });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/cart', require('./routes/cart.routes'));
apiRouter.use('/enquiries', require('./routes/enquiry.routes'));
apiRouter.use('/content', require('./routes/content.routes'));

app.use('/api', apiRouter);

// Proxy for minio images
const minioClient = require('./config/minio');
app.get('/product/:image', async (req, res) => {
  if (process.env.USE_MINIO === 'true') {
    try {
      const bucketName = process.env.MINIO_BUCKET_NAME || 'icuman';
      const dataStream = await minioClient.getObject(bucketName, `product/${req.params.image}`);
      dataStream.pipe(res);
    } catch (err) {
      res.status(404).send('Image not found');
    }
  } else {
    res.status(404).send('Image not found');
  }
});

const path = require('path');
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

module.exports = app;
