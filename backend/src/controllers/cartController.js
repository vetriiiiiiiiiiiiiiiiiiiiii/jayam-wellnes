const prisma = require('../config/prisma');
const { productInclude, serializeCart } = require('../utils/serialize');

const cartInclude = {
  items: { include: { product: { include: productInclude } }, orderBy: { id: 'asc' } }
};

// Load the user's cart with products, creating an empty one if needed
const loadCart = (userId) =>
  prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: cartInclude
  });

exports.getCart = async (req, res) => {
  try {
    const cart = await loadCart(req.user.id);
    res.json({ success: true, cart: serializeCart(cart) });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Failed to load cart' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, color, size } = req.body;
    const quantity = Number(req.body.quantity ?? 1);
    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'Invalid product or quantity' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const cart = await prisma.cart.upsert({
      where: { userId: req.user.id },
      update: {},
      create: { userId: req.user.id }
    });

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, color: color ?? null, size: size ?? null }
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: quantity } }
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity, color, size }
      });
    }

    const updatedCart = await loadCart(req.user.id);
    res.json({ message: 'Added to cart successfully', cart: serializeCart(updatedCart) });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Failed to add item to cart' });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.body;
    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const { count } = await prisma.cartItem.updateMany({
      where: { id: itemId, cartId: cart.id },
      data: { quantity }
    });

    if (count === 0) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    const updatedCart = await loadCart(req.user.id);
    return res.json({ cart: serializeCart(updatedCart) });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Failed to update cart' });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });

    const updatedCart = await loadCart(req.user.id);
    res.json({ message: 'Item removed', cart: serializeCart(updatedCart) });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Failed to remove item' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({ where: { cart: { userId: req.user.id } } });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
};
