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

app.use(cors({ 
  origin: [
    process.env.FRONTEND_URL, 
    process.env.CLIENT_URL, 
    'http://localhost:5173', 
    'http://127.0.0.1:5173'
  ].filter(Boolean), 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
}));
app.use(express.json());
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
    // If not minio, it would be served from /uploads which we should also expose?
    // fallback logic if needed
    res.status(404).send('Image not found');
  }
});

module.exports = app;
