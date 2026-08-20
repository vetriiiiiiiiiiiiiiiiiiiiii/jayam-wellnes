const express = require('express');
const { getDb } = require('../utils/db');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const db = getDb();
    const orders = await db.collection('orders').find().sort({ createdAt: -1 }).toArray();
    res.json(orders.map(o => ({ ...o, id: o._id.toString() })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/my', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const orders = await db.collection('orders').find({ userId: req.user.id }).sort({ createdAt: -1 }).toArray();
    res.json(orders.map(o => ({ ...o, id: o._id.toString() })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const { email, name, address, items, total } = req.body;
    let userId = null;
    
    // Check if user is authenticated (optional for checkout)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'secret');
        userId = decoded.id;
      } catch(e) {}
    }

    const orderNumber = 'ORD-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    
    const newOrder = {
      orderNumber,
      userId,
      email,
      name,
      address,
      items,
      total: Number(total),
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('orders').insertOne(newOrder);
    res.status(201).json({ ...newOrder, id: result.insertedId.toString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

module.exports = router;
