import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDB, queryAll, queryOne, saveDB } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/wishlist
router.get('/', authMiddleware, (req, res) => {
  try {
    const items = queryAll(`
      SELECT w.id, p.* FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ?
      ORDER BY w.added_at DESC
    `, [req.user.id]);

    res.json(items.map(item => ({
      ...item,
      sizes: JSON.parse(item.sizes)
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// POST /api/wishlist (toggle)
router.post('/', authMiddleware, (req, res) => {
  try {
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'Product ID required' });
    }

    // Check if already wishlisted
    const existing = queryOne(`
      SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?
    `, [req.user.id, product_id]);

    if (existing) {
      // Remove from wishlist
      const stmt = getDB().prepare('DELETE FROM wishlist WHERE id = ?');
      stmt.bind([existing.id]);
      stmt.step();
      stmt.free();
      saveDB();
      res.json({ wishlisted: false });
    } else {
      // Add to wishlist
      const stmt = getDB().prepare(`
        INSERT INTO wishlist (id, user_id, product_id)
        VALUES (?, ?, ?)
      `);
      stmt.bind([uuidv4(), req.user.id, product_id]);
      stmt.step();
      stmt.free();
      saveDB();
      res.json({ wishlisted: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle wishlist' });
  }
});

// DELETE /api/wishlist/:id
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const stmt = getDB().prepare('DELETE FROM wishlist WHERE id = ? AND user_id = ?');
    stmt.bind([req.params.id, req.user.id]);
    stmt.step();
    stmt.free();

    saveDB();
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

export default router;
