import express from 'express';
import { getDB, queryAll, queryOne } from '../db.js';

const router = express.Router();

// GET /api/products
router.get('/', (req, res) => {
  try {
    const {
      category,
      subcategory,
      minPrice,
      maxPrice,
      color,
      sort = 'default',
      search,
      page = 1,
      limit = 12
    } = req.query;

    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (subcategory) {
      sql += ' AND subcategory = ?';
      params.push(subcategory);
    }
    if (minPrice) {
      sql += ' AND price >= ?';
      params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      sql += ' AND price <= ?';
      params.push(parseFloat(maxPrice));
    }
    if (color) {
      const colors = color.split(',');
      const placeholders = colors.map(() => '?').join(',');
      sql += ` AND color IN (${placeholders})`;
      params.push(...colors);
    }
    if (search) {
      sql += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    // Sorting
    if (sort === 'low') {
      sql += ' ORDER BY price ASC';
    } else if (sort === 'high') {
      sql += ' ORDER BY price DESC';
    } else if (sort === 'az') {
      sql += ' ORDER BY name ASC';
    } else {
      sql += ' ORDER BY badge DESC, created_at DESC';
    }

    // Get count before pagination
    const countParams = [];
    let countSql = 'SELECT COUNT(*) as count FROM products WHERE 1=1';

    if (category) {
      countSql += ' AND category = ?';
      countParams.push(category);
    }
    if (subcategory) {
      countSql += ' AND subcategory = ?';
      countParams.push(subcategory);
    }
    if (minPrice) {
      countSql += ' AND price >= ?';
      countParams.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      countSql += ' AND price <= ?';
      countParams.push(parseFloat(maxPrice));
    }
    if (color) {
      const colors = color.split(',');
      const placeholders = colors.map(() => '?').join(',');
      countSql += ` AND color IN (${placeholders})`;
      countParams.push(...colors);
    }
    if (search) {
      countSql += ' AND name LIKE ?';
      countParams.push(`%${search}%`);
    }

    const countResult = queryOne(countSql, countParams);

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const products = queryAll(sql, params);

    res.json({
      products: products.map(p => ({
        ...p,
        sizes: JSON.parse(p.sizes)
      })),
      total: countResult.count,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/featured
router.get('/featured', (req, res) => {
  try {
    const products = queryAll(
      `SELECT * FROM products WHERE badge IN ('New', 'Bestseller') ORDER BY created_at DESC LIMIT 4`
    );
    res.json(products.map(p => ({
      ...p,
      sizes: JSON.parse(p.sizes)
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

// GET /api/products/colors
router.get('/colors', (req, res) => {
  try {
    const { category, subcategory } = req.query;

    let sql = 'SELECT DISTINCT color FROM products WHERE 1=1';
    const params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (subcategory) {
      sql += ' AND subcategory = ?';
      params.push(subcategory);
    }

    sql += ' ORDER BY color ASC';

    const result = queryAll(sql, params);
    const colors = result.map(r => r.color);

    res.json(colors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch colors' });
  }
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  try {
    const product = queryOne('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      ...product,
      sizes: JSON.parse(product.sizes)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

export default router;
