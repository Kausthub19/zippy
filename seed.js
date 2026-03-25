import { v4 as uuidv4 } from 'uuid';
import { getDB, runSQL, saveDB } from './db.js';

export function seedDB() {
  const db = getDB();

  const categories = [
    { name: 'Men', subcategories: ['Shirts', 'T-Shirts', 'Pants'] },
    { name: 'Women', subcategories: ['Tops', 'T-Shirts', 'Bottoms'] },
    { name: 'Kids', subcategories: ['Shirts', 'T-Shirts', 'Pants'] }
  ];

  const colorOptions = {
    Men: {
      Shirts: ['White', 'Navy', 'Black', 'Blue', 'Olive', 'Grey', 'Red', 'Yellow', 'Brown'],
      'T-Shirts': ['White', 'Navy', 'Black', 'Blue', 'Red', 'Grey', 'Olive', 'Pink', 'Yellow', 'Green'],
      Pants: ['Black', 'Navy', 'Grey', 'Blue', 'Olive', 'Brown', 'White']
    },
    Women: {
      Tops: ['White', 'Pink', 'Navy', 'Red', 'Blue', 'Yellow', 'Green', 'Black', 'Purple', 'Olive'],
      'T-Shirts': ['White', 'Pink', 'Black', 'Blue', 'Yellow', 'Grey', 'Navy', 'Red', 'Green', 'Olive', 'Purple'],
      Bottoms: ['Black', 'Blue', 'Pink', 'White', 'Navy', 'Olive', 'Red', 'Grey', 'Yellow', 'Green', 'Brown']
    },
    Kids: {
      Shirts: ['White', 'Blue', 'Navy', 'Yellow', 'Green', 'Red', 'Pink', 'Grey', 'Olive'],
      'T-Shirts': ['White', 'Blue', 'Red', 'Yellow', 'Green', 'Navy', 'Pink', 'Grey', 'Olive', 'Black'],
      Pants: ['Black', 'Navy', 'Blue', 'Grey', 'Olive', 'Red', 'White', 'Yellow', 'Green', 'Brown']
    }
  };

  const prices = {
    Men: { Shirts: [799, 2199], 'T-Shirts': [549, 1299], Pants: [799, 2499] },
    Women: { Tops: [799, 2299], 'T-Shirts': [549, 999], Bottoms: [799, 2199] },
    Kids: { Shirts: [549, 849], 'T-Shirts': [519, 749], Pants: [649, 1099] }
  };

  const badges = ['New', 'Sale', 'Bestseller', 'Premium', null];
  const sizesByCategory = {
    Shirts: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'T-Shirts': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    Tops: ['XS', 'S', 'M', 'L', 'XL'],
    Bottoms: ['28', '30', '32', '34', '36', '38'],
    Pants: ['28', '30', '32', '34', '36', '38']
  };

  let productCount = 0;

  categories.forEach(cat => {
    cat.subcategories.forEach(subcat => {
      const colorList = colorOptions[cat.name][subcat];
      const [minPrice, maxPrice] = prices[cat.name][subcat];
      const sizes = sizesByCategory[subcat] || ['S', 'M', 'L', 'XL'];

      // 15 products per subcategory
      for (let i = 0; i < 15; i++) {
        const color = colorList[i % colorList.length];
        const basePrice = minPrice + Math.round((maxPrice - minPrice) * Math.random() / 50) * 50;
        const onSale = Math.random() > 0.7;
        const originalPrice = onSale ? basePrice + Math.round(Math.random() * 500) : basePrice;

        const product = {
          id: uuidv4(),
          name: `${cat.name}'s ${subcat} - ${color}`,
          category: cat.name,
          subcategory: subcat,
          price: onSale ? basePrice : originalPrice,
          original_price: onSale ? originalPrice : null,
          color: color,
          badge: i < 2 ? 'New' : (onSale ? 'Sale' : (i % 5 === 0 ? 'Bestseller' : null)),
          sizes: JSON.stringify(sizes),
          stock: Math.floor(Math.random() * 50) + 10
        };

        const stmt = db.prepare(`
          INSERT INTO products (id, name, category, subcategory, price, original_price, color, badge, sizes, stock)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.bind([
          product.id, product.name, product.category, product.subcategory,
          product.price, product.original_price, product.color, product.badge,
          product.sizes, product.stock
        ]);
        stmt.step();
        stmt.free();

        productCount++;
      }
    });
  });

  saveDB();
  console.log(`✓ Seeded ${productCount} products`);
}

export function checkIfSeeded() {
  const result = getDB().exec('SELECT COUNT(*) as count FROM products');
  return result[0]?.values[0]?.[0] > 0;
}
