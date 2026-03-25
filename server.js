import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDB } from './db.js';
import { seedDB, checkIfSeeded } from './seed.js';
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import ordersRoutes from './routes/orders.js';
import wishlistRoutes from './routes/wishlist.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
let DB_INITIALIZED = false;

async function startServer() {
  try {
    // Initialize database
    await initDB();
    DB_INITIALIZED = true;

    // Seed if not already seeded
    if (!checkIfSeeded()) {
      console.log('Seeding database...');
      seedDB();
    }

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productsRoutes);
    app.use('/api/cart', cartRoutes);
    app.use('/api/orders', ordersRoutes);
    app.use('/api/wishlist', wishlistRoutes);

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        service: 'Zippy API',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
    });

    // Serve frontend
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ error: 'Not found' });
    });

    // Error handler
    app.use((err, req, res, next) => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Zippy API running on http://localhost:${PORT}`);
      console.log(`✓ Frontend: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
