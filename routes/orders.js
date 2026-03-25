import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDB, queryAll, queryOne, saveDB } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const promoCodes = {
  ZIPPY15: { type: 'percent', value: 15, minOrder: 500 },
  FIRST10: { type: 'percent', value: 10, minOrder: 0 },
  FLAT200: { type: 'flat', value: 200, minOrder: 1000 },
  WELCOME50: { type: 'flat', value: 50, minOrder: 0 }
};

// POST /api/promo
router.post('/promo', (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || !promoCodes[code]) {
      return res.status(400).json({ error: 'Invalid promo code' });
    }

    const promo = promoCodes[code];
    if (subtotal < promo.minOrder) {
      return res.status(400).json({ error: `Minimum order of ₹${promo.minOrder} required` });
    }

    let discount = 0;
    if (promo.type === 'percent') {
      discount = Math.floor(subtotal * promo.value / 100);
    } else {
      discount = promo.value;
    }

    res.json({ discount, total: subtotal - discount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to apply promo' });
  }
});

// POST /api/orders
router.post('/', authMiddleware, (req, res) => {
  try {
    const {
      shipping_name,
      shipping_email,
      shipping_phone,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_pincode,
      payment_method,
      promo_code
    } = req.body;

    // Validate shipping info
    if (!shipping_name || !shipping_email || !shipping_phone || !shipping_address || !shipping_city || !shipping_state || !shipping_pincode) {
      return res.status(400).json({ error: 'All shipping fields required' });
    }

    // Get cart items
    const cartItems = queryAll(`
      SELECT ci.id, ci.product_id, ci.qty, ci.size, p.name, p.price, p.color, p.category, p.subcategory, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `, [req.user.id]);

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate totals
    let subtotal = 0;
    cartItems.forEach(item => {
      subtotal += (item.price * item.qty);
    });

    let discount = 0;
    if (promo_code && promoCodes[promo_code]) {
      const promo = promoCodes[promo_code];
      if (subtotal >= promo.minOrder) {
        if (promo.type === 'percent') {
          discount = Math.floor(subtotal * promo.value / 100);
        } else {
          discount = promo.value;
        }
      }
    }

    const delivery = (subtotal - discount) >= 999 ? 0 : 99;
    const total = subtotal - discount + delivery;

    // Create order
    const orderId = uuidv4();
    const stmt = getDB().prepare(`
      INSERT INTO orders (
        id, user_id, status, subtotal, delivery, total, payment_method,
        shipping_name, shipping_email, shipping_phone, shipping_address,
        shipping_city, shipping_state, shipping_pincode, promo_code, discount
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.bind([
      orderId, req.user.id, 'Confirmed', subtotal, delivery, total,
      payment_method, shipping_name, shipping_email, shipping_phone,
      shipping_address, shipping_city, shipping_state, shipping_pincode,
      promo_code || null, discount
    ]);
    stmt.step();
    stmt.free();

    // Add order items and decrement stock
    cartItems.forEach(item => {
      // Add order item
      const itemStmt = getDB().prepare(`
        INSERT INTO order_items (
          id, order_id, product_id, product_name, product_color,
          product_category, product_subcategory, size, qty, price
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      itemStmt.bind([
        uuidv4(), orderId, item.product_id, item.name, item.color,
        item.category, item.subcategory, item.size, item.qty, item.price
      ]);
      itemStmt.step();
      itemStmt.free();

      // Decrement stock
      const stockStmt = getDB().prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
      stockStmt.bind([item.qty, item.product_id]);
      stockStmt.step();
      stockStmt.free();
    });

    // Clear cart
    const clearStmt = getDB().prepare('DELETE FROM cart_items WHERE user_id = ?');
    clearStmt.bind([req.user.id]);
    clearStmt.step();
    clearStmt.free();

    saveDB();

    res.json({
      orderId,
      order: {
        id: orderId,
        status: 'Confirmed',
        subtotal,
        delivery,
        discount,
        total,
        created_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// GET /api/orders
router.get('/', authMiddleware, (req, res) => {
  try {
    const orders = queryAll(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    `, [req.user.id]);

    const ordersWithItems = orders.map(order => {
      const items = queryAll(`
        SELECT * FROM order_items WHERE order_id = ?
      `, [order.id]);

      return {
        ...order,
        items
      };
    });

    res.json(ordersWithItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const order = queryOne(`
      SELECT * FROM orders WHERE id = ? AND user_id = ?
    `, [req.params.id, req.user.id]);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = queryAll(`
      SELECT * FROM order_items WHERE order_id = ?
    `, [order.id]);

    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;
