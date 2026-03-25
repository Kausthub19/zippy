import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDB, queryAll, queryOne, saveDB } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/cart
router.get('/', authMiddleware, (req, res) => {
  try {
    const items = queryAll(`
      SELECT ci.id, ci.product_id, ci.qty, ci.size, p.name, p.price, p.original_price, p.color, p.category, p.subcategory
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `, [req.user.id]);

    let subtotal = 0;
    items.forEach(item => {
      subtotal += (item.price * item.qty);
    });

    const delivery = subtotal >= 999 ? 0 : 99;
    const total = subtotal + delivery;

    res.json({
      items,
      subtotal,
      delivery,
      total,
      count: items.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart
router.post('/', authMiddleware, (req, res) => {
  try {
    const { product_id, qty, size } = req.body;

    if (!product_id || !qty || !size) {
      return res.status(400).json({ error: 'Product ID, quantity, and size required' });
    }

    // Check if item already in cart
    const existing = queryOne(`
      SELECT id, qty FROM cart_items
      WHERE user_id = ? AND product_id = ? AND size = ?
    `, [req.user.id, product_id, size]);

    if (existing) {
      // Update quantity
      const stmt = getDB().prepare('UPDATE cart_items SET qty = ? WHERE id = ?');
      stmt.bind([existing.qty + parseInt(qty), existing.id]);
      stmt.step();
      stmt.free();
    } else {
      // Add new item
      const stmt = getDB().prepare(`
        INSERT INTO cart_items (id, user_id, product_id, qty, size)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.bind([uuidv4(), req.user.id, product_id, parseInt(qty), size]);
      stmt.step();
      stmt.free();
    }

    saveDB();
    res.json({ message: 'Item added to cart' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// PUT /api/cart/:id
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { qty } = req.body;

    if (qty < 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const stmt = getDB().prepare('UPDATE cart_items SET qty = ? WHERE id = ? AND user_id = ?');
    stmt.bind([parseInt(qty), req.params.id, req.user.id]);
    stmt.step();
    stmt.free();

    saveDB();
    res.json({ message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// DELETE /api/cart/:id
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const stmt = getDB().prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?');
    stmt.bind([req.params.id, req.user.id]);
    stmt.step();
    stmt.free();

    saveDB();
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// DELETE /api/cart (clear all)
router.delete('/', authMiddleware, (req, res) => {
  try {
    const stmt = getDB().prepare('DELETE FROM cart_items WHERE user_id = ?');
    stmt.bind([req.user.id]);
    stmt.step();
    stmt.free();

    saveDB();
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router;
