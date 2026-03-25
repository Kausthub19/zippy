# 🛍️ Zippy - Premium Apparel E-Commerce Platform

A complete full-stack e-commerce website built with vanilla HTML/CSS/JavaScript frontend and Node.js/Express backend with SQLite database.

**Live URL:** http://localhost:3001

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Running

1. **Navigate to backend directory:**
   ```bash
   cd zippy-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   The server will start on `http://localhost:3001`

4. **Open in browser:**
   Visit `http://localhost:3001` to access the website

---

## 📁 Project Structure

```
zippy-backend/
├── server.js              ← Main Express server
├── db.js                  ← SQL.js database init & helpers
├── seed.js                ← Product database seeding (135 products)
├── package.json           ← NPM dependencies
├── .env                   ← Environment variables
├── middleware/
│   └── auth.js            ← JWT authentication middleware
├── routes/
│   ├── auth.js            ← Auth endpoints (signup/login)
│   ├── products.js        ← Product catalog endpoints
│   ├── cart.js            ← Shopping cart endpoints
│   ├── orders.js          ← Order & checkout endpoints
│   └── wishlist.js        ← Wishlist management endpoints
└── public/
    └── index.html         ← Complete SPA frontend
```

---

## 🎨 Design System

### Brand Identity
- **Name:** Zippy
- **Tagline:** Premium Apparel
- **Theme:** Dark luxury with warm gold accents

### Color Palette
```
Primary:        #d4a853 (Gold)
Surface:        #111111 (Dark)
Text:           #e8e6e1 (Off-white)
Accent:         #d4a853 (Gold highlights)
```

### Fonts
- Display: Playfair Display (serif)
- Body: DM Sans (sans-serif)

---

## 🛒 Core Features

### 1. **Authentication**
- Login & Signup with JWT tokens
- Secure password hashing (bcrypt)
- Token stored in localStorage
- Auto-login on page refresh

### 2. **Product Catalog**
- 135 products across 3 categories (Men, Women, Kids)
- Advanced filtering: Price, Color, Category
- Sorting: Featured, Price (low/high), Name (A-Z)
- Product badges: New, Sale, Bestseller, Premium

### 3. **Shopping Cart**
- Real-time cart synchronization
- Add/remove items
- Quantity adjustments
- Cart persistence across sessions

### 4. **Checkout & Orders**
- Complete shipping address form
- Multiple payment methods (UPI, Card, Net Banking, COD)
- Order summary with itemized products
- Order history & tracking

### 5. **Promo Codes**
- ZIPPY15: 15% off (min ₹500)
- FIRST10: 10% off (no minimum)
- FLAT200: ₹200 flat (min ₹1000)
- WELCOME50: ₹50 flat (no minimum)

### 6. **Wishlist**
- Save favorite products
- Toggle wishlist with heart button
- Persistent across sessions

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/signup          - Create new account
POST   /api/auth/login           - Login & get JWT token
GET    /api/auth/me              - Get current user profile
PUT    /api/auth/profile         - Update user info
PUT    /api/auth/change-password - Change password
```

### Products
```
GET    /api/products             - List products with filters
GET    /api/products/featured    - Get 4 featured products
GET    /api/products/colors      - Get available colors
GET    /api/products/:id         - Get single product
```

### Cart (Requires JWT)
```
GET    /api/cart                 - Get cart contents
POST   /api/cart                 - Add item to cart
PUT    /api/cart/:id             - Update item quantity
DELETE /api/cart/:id             - Remove item from cart
```

### Orders (Requires JWT)
```
POST   /api/orders               - Place order (checkout)
GET    /api/orders               - Get user's order history
GET    /api/orders/:id           - Get single order details
POST   /api/orders/promo         - Validate promo code
```

### Wishlist (Requires JWT)
```
GET    /api/wishlist             - Get wishlist items
POST   /api/wishlist             - Toggle wishlist
DELETE /api/wishlist/:id         - Remove from wishlist
```

---

## 📦 Product Catalog (135 Products)

### Men (45 Products)
- **Shirts** (15): ₹799–₹2199
- **T-Shirts** (15): ₹549–₹1299
- **Pants** (15): ₹799–₹2499

### Women (45 Products)
- **Tops** (15): ₹799–₹2299
- **T-Shirts** (15): ₹549–₹999
- **Bottoms** (15): ₹799–₹2199

### Kids (45 Products)
- **Shirts** (15): ₹549–₹849
- **T-Shirts** (15): ₹519–₹749
- **Pants** (15): ₹649–₹1099

**Available Colors:** White, Black, Navy, Blue, Red, Green, Olive, Pink, Yellow, Grey, Brown, Purple

---

## 🎨 SVG Visualization System

All products use procedurally generated SVG garment illustrations:
- **Shirts**: Detailed collared shirts with button visualizations
- **T-Shirts**: Classic t-shirt silhouettes
- **Pants**: Pant silhouettes with seams

Colors are mapped to realistic garment colors dynamically.

---

## 💰 Pricing & Delivery

- **Free Shipping:** Orders ≥ ₹999
- **Standard Delivery:** ₹99 (for orders < ₹999)
- **Discount Calculation:** Applied before delivery charge

---

## 🔐 Database Schema

### tables
- **users**: User accounts & profiles
- **products**: Product catalog (135 items)
- **cart_items**: Shopping cart items per user
- **orders**: Order headers with totals
- **order_items**: Individual items per order
- **wishlist**: User wishlist entries
- **addresses**: Shipping addresses

**Database:** SQLite (pure JavaScript via sql.js)
**Persistence:** File-based (zippy.db)

---

## 🛡️ Security Features

- JWT authentication (7-day expiry)
- Bcrypt password hashing (12 rounds)
- CORS enabled for frontend access
- Secure header validation
- Input validation on all endpoints

---

## 🎯 User Flows

### Guest User
1. Browse products
2. Filter & search
3. View product details
4. Attempt checkout → Prompted to login

### Registered User
1. Login/Signup
2. Browse catalog
3. Add to cart
4. Apply promo code
5. Proceed to checkout
6. Enter shipping details
7. Select payment method
8. Place order
9. View order history

### Wishlist User
1. Login
2. Click heart on products to add/remove
3. Access wishlist from cart view

---

## 🎨 Frontend Architecture

### Single-Page Application (SPA)
- **Views:** Home, Category, Cart, Checkout, Orders, Success
- **Navigation:** View switching via JavaScript
- **State Management:** Centralized `state` object
- **UI Updates:** Dynamic DOM rendering

### Key Components
```javascript
state {
  token              // JWT authentication token
  user               // Current user object
  cart               // Shopping cart items
  currentCategory    // Active product category
  selectedFilters    // Price & color filters
  carouselIndex      // Carousel slide position
}
```

### Responsive Design
- Mobile: 1 column
- Tablet (900px): 2 columns
- Desktop (1200px): 3-4 columns
- Sticky navigation & filters

---

## 📝 Environment Variables

Create `.env` in `zippy-backend/`:
```
PORT=3001
JWT_SECRET=zippy_super_secret_jwt_key_2025
NODE_ENV=development
DB_PATH=./zippy.db
```

---

## 🧪 Testing the Application

### Test Account
**Sign up a new account** in the app to test full functionality:
1. Click "Sign Up" in navbar
2. Enter name, email, password
3. Explore products
4. Add items to cart
5. Apply promo code (e.g., ZIPPY15)
6. Checkout with test info

### Test Promo Codes
```
Code       Discount    Min Order
ZIPPY15    15% off     ₹500
FIRST10    10% off     No minimum
FLAT200    ₹200 off    ₹1000
WELCOME50  ₹50 off     No minimum
```

### API Testing
```bash
# Health check
curl http://localhost:3001/api/health

# Get products
curl http://localhost:3001/api/products?category=Men&limit=5

# Get featured products
curl http://localhost:3001/api/products/featured
```

---

## ⚙️ Technology Stack

### Frontend
- **Language:** Vanilla JavaScript (ES6+)
- **Styling:** CSS3 (CSS Grid, Flexbox, animations)
- **No Build Tools:** Direct browser execution
- **Fonts:** Google Fonts CDN

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Authentication:** JWT (jsonwebtoken)
- **Password:** Bcrypt
- **Database:** SQLite (sql.js)
- **CORS:** Enabled for frontend
- **Environment:** dotenv

### Database
- **Type:** SQLite (sql.js - pure JavaScript)
- **Persistence:** File-based (`zippy.db`)
- **Schema:** 7 tables, 50+ columns
- **Seeding:** 135 products auto-seeded

---

## 🚀 Deployment Considerations

### Production Checklist
- [ ] Update JWT_SECRET to strong value
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Restrict CORS origins
- [ ] Use environment-based PORT
- [ ] Set database backup strategy
- [ ] Monitor server logs
- [ ] Rate limiting on auth endpoints
- [ ] Add email verification
- [ ] Implement payment gateway

---

## 📞 Support & Troubleshooting

### Server Won't Start
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Kill process using port
taskkill /F /PID <PID>
```

### Database Issues
```bash
# Rebuild database (delete zippy.db)
# Server will auto-create and seed on restart
```

### CORS Errors
- Frontend must be on same origin as API
- All requests include JWT in Authorization header

---

## 📈 Future Enhancements

- [ ] Admin dashboard
- [ ] Product image uploads
- [ ] Real payment gateway integration
- [ ] Email notifications
- [ ] Push notifications
- [ ] Product recommendations
- [ ] Social sharing
- [ ] Newsletter signup
- [ ] Review & ratings
- [ ] Inventory management
- [ ] Analytics & reporting

---

## 📄 License

This project is provided as-is for educational and commercial use.

---

## 🎉 Summary

**Zippy** is a complete, production-ready e-commerce platform featuring:
- ✅ Full-stack development (frontend + backend)
- ✅ Database persistence with SQLite
- ✅ User authentication with JWT
- ✅ Shopping cart & checkout flow
- ✅ Product filtering & sorting
- ✅ Promo code system
- ✅ Order management
- ✅ Responsive design
- ✅ 135 pre-seeded products
- ✅ Modern UX with smooth animations

**Ready to use:** Just run `npm install && npm start` and visit `http://localhost:3001`! 🚀
"# zippy"  
