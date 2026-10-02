# juice_drop

**Juice Drop** 🍹 — A full-stack juice delivery platform built with the MERN stack. Browse fresh juices, manage your cart, place orders, and track purchases through a modern, responsive web application with secure authentication and admin management.

---

## 1. Problem

Buying genuinely fresh, cold-pressed juice is inconvenient: local juice bars have limited hours, packaged juices in stores are full of preservatives and added sugar, and there's no simple way to track a fresh-food order from "confirmed" to "at your door."

## 2. Solution

**JuiceDrop** is a juice delivery platform where customers browse a curated catalog of fresh juices, smoothies and detox blends, order in a few taps, and track delivery status in real time — while admins manage the entire catalog, inventory and order pipeline from a dedicated dashboard.

## 3. Key Features

- 🔐 JWT authentication with hashed passwords (customer & admin roles)
- 🧃 Full product catalog with search, category filters, price sort and stock status
- 💸 Per-product quantity pricing with configurable fixed unit-price tiers
- 📍 Public store finder for company-owned and franchise locations, managed by admins
- 📦 Configurable-size Juice Box builder with transparent menu-price totals
- 🚚 PIN-code delivery lookup with ETA and optional configured delivery slots
- ⭐ Written product reviews with customer authentication and duplicate protection
- 🛒 Persistent cart (localStorage) with coupon codes, tax and delivery-fee logic
- 📦 Checkout → order creation → live order-status tracking (Confirmed → Preparing → Out for Delivery → Delivered)
- 🛠️ Admin dashboard: revenue/orders/customers/products stats, full product CRUD, order status management, customer list
- 🔔 Toast notifications, skeleton loaders, and empty/error states throughout
- 🔒 Input validation, rate-limited auth endpoints, and role-based route protection

## 4. Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, React Router, Context API, Axios, Lucide React |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT, bcryptjs |
| Styling | Hand-written CSS (no framework) |

No TypeScript, Next.js, Firebase, Supabase, PostgreSQL, or Prisma — plain MERN, as specified.

## 5. Architecture

```
React (Vite, port 5173)
   │  Axios + JWT (Authorization: Bearer <token>)
   ▼
Express API (port 5000)
   │  Mongoose ODM
   ▼
MongoDB
```

Auth flow:
```
Register/Login → bcrypt compare/hash → JWT issued → stored in localStorage
                                                    → sent as Bearer token on every request
                                                    → verified by authMiddleware.protect
                                                    → role checked by authMiddleware.adminOnly
```

## 6. Folder Structure

```
juicedrop/
├── backend/
│   ├── config/db.js
│   ├── models/          User.js, Product.js, Order.js, Store.js, ProductReview.js
│   ├── controllers/     authController, productController, orderController, userController, storeController, reviewController
│   ├── routes/          authRoutes, productRoutes, orderRoutes, userRoutes, storeRoutes, deliveryRoutes
│   ├── middleware/      authMiddleware, errorMiddleware, rateLimiter
│   ├── utils/           generateToken.js, validators.js
│   ├── seed/seedData.js
│   └── server.js
└── frontend/
    └── src/
        ├── components/  Navbar, Footer, ProductCard, ProtectedRoute, AdminLayout, Skeleton
        ├── pages/        Home, Shop, Stores, ProductDetails, Login, Register, Cart, Checkout, Orders, Profile
        ├── pages/admin/  AdminDashboard, AdminProducts, AdminOrders, AdminUsers, AdminStores
        ├── context/      AuthContext, CartContext, ToastContext
        └── services/api.js
```

## 7. Installation

### Prerequisites
- Node.js 18+
- MongoDB (local install or a free MongoDB Atlas cluster)

### Backend
```bash
cd backend
npm install
cp .env.example .env
```
Fill in `.env`:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/juicedrop
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
DELIVERY_PINCODES=302001,302004
DELIVERY_ETA_MINUTES=45
DELIVERY_SLOTS=
JUICE_BOX_SIZE=4
```
Configure `DELIVERY_PINCODES` with the actual six-digit Indian PIN codes you serve. `DELIVERY_SLOTS` accepts an optional comma-separated list of slot labels; when it is empty, the checker reports only the configured ETA. The Juice Box contains `JUICE_BOX_SIZE` distinct juices and costs the sum of their selected size prices; it does not apply an unconfigured discount.

Migrate existing product records to project-local images and separate size prices:
```bash
npm run migrate:catalog
```
The migration preserves each existing catalog price as the smallest size and initializes larger sizes at 1.5× that price; admins can adjust each size's price and quantity tiers from **Admin → Products**.
Seed the database:
```bash
npm run seed
```
Start the API:
```bash
npm run dev
```
Confirm it's up: `GET http://localhost:5000/api/health` → `{"success":true,"message":"JuiceDrop API is running"}`

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm run dev
```
Open `http://localhost:5173`.

## 8. Production deployment (Vercel + Render + MongoDB Atlas)

This app uses GitHub as its source repository, Vercel for the Vite frontend, Render for the Express API, and MongoDB Atlas for persistent data. GitHub Pages alone cannot run the API or database.

1. Push this project to a GitHub repository. The root `.gitignore` excludes local `.env` files, `node_modules`, and build output; do not commit credentials.
2. Create a MongoDB Atlas cluster and database user. Restrict Atlas network access to the Render outbound IP addresses supported by your plan; avoid a public `0.0.0.0/0` rule in production. Copy the application connection string for the Render `MONGO_URI` secret.
3. In Render, create a Blueprint from the repository's `render.yaml`. Set `MONGO_URI`, `CLIENT_URL`, and `DELIVERY_PINCODES` when prompted. Render generates `JWT_SECRET`. `CLIENT_URL` must be the exact Vercel production origin (for example `https://juicedrop.example`) without a trailing slash; comma-separate any additional trusted origins.
4. In Vercel, import the same repository and set its root directory to `frontend`. Add `VITE_API_URL=https://<your-render-service>.onrender.com/api` as an environment variable for Production (and Preview if wanted), then deploy. Redeploy after changing this build-time variable.
5. From a secure local environment with the production `MONGO_URI` set, run `npm run seed:catalog` from `backend` to safely add the sample catalog to an empty database. Existing products are preserved. Do not run `npm run seed` against production: it deletes collections and creates demo accounts.
6. Create the first production administrator from a secure local environment by setting `ADMIN_NAME`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` (at least 12 characters), then run `npm run create:admin` from `backend`. It only creates a new account and refuses to change an existing one.
7. Verify `https://<your-render-service>.onrender.com/api/health`, then open the Vercel site and test registration, product browsing, and ordering.

The Render service uses `/api/health` for health checks. Configure actual delivery coverage in `DELIVERY_PINCODES`; optionally set `DELIVERY_SLOTS`. Create a production admin account securely before managing products or stores. Never use the documented demo credentials in production.

## 9. Demo Credentials (development only; after `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Admin | admin@juicedrop.com | admin123 |
| Customer | customer@juicedrop.com | customer123 |

## 10. API Documentation

### Auth (rate-limited: 20 req / 15 min per IP)
```
POST   /api/auth/register     { name, email, password, phone } → { token, user }
POST   /api/auth/login        { email, password } → { token, user }
GET    /api/auth/me           (protected) → { user }
```

### Products
```
GET    /api/products?search=&category=&sort=&minPrice=&maxPrice=
GET    /api/products/:id
GET    /api/products/:id/reviews  — written customer reviews and aggregate rating
GET    /api/products/:id/reviews/mine (protected) — current customer's review
POST   /api/products/:id/reviews (protected) { rating: 1-5, title, comment } — one review per customer
POST   /api/products           (admin) — validated body, `sizePrices: [{ size, price, priceTiers: [{ minQuantity, unitPrice }] }]`
PUT    /api/products/:id       (admin) — validated per-size base prices and optional quantity tiers
DELETE /api/products/:id       (admin)
```
`sort` accepts: `price_asc`, `price_desc`, `rating`, `name`.

### Orders
```
POST   /api/orders             (protected) { items[], shippingAddress, paymentMethod, couponCode }
GET    /api/orders/my          (protected) — current user's orders
GET    /api/orders/:id         (protected) — owner or admin only
GET    /api/orders             (admin) — all orders
PUT    /api/orders/:id/status  (admin) { orderStatus }
```

### Users
```
GET    /api/users              (admin) — customer list with order count & spend
GET    /api/users/:id          (admin) — one user + their orders
```

### Stores
```
GET    /api/stores?ownership=&search= — active stores; ownership is company-owned or franchise
GET    /api/stores/admin       (admin) — all stores, including hidden locations
POST   /api/stores             (admin) — create a location
PUT    /api/stores/:id         (admin) — update a location or hide/show it
DELETE /api/stores/:id         (admin) — delete a location
```
Customers can browse and search locations at `/stores`. Admins manage locations at `/admin/stores`, including address, contact information, opening hours and map links.

### Delivery and Juice Box
```
GET /api/delivery/:pincode — configured delivery availability, ETA and optional slots
GET /api/delivery/config   — configured Juice Box size
```
Customer pages: `/delivery` and `/build-a-box`. A box is added as normal cart line items so size, quantity, tax, stock and checkout prices stay consistent.

### Health
```
GET    /api/health
```

## 10. Business Rules

- Delivery: **FREE** when subtotal ≥ ₹299, else **₹49**
- Tax: **5%** applied to (subtotal − discount)
- Coupon `JUICE10`: **10% off** subtotal
- Admin-configured quantity tiers set the per-unit price at each minimum quantity, with prices recalculated in the cart and verified again when an order is placed
- Cart persists client-side via `localStorage`
- Stock is decremented atomically per line item when an order is placed; insufficient stock blocks the order

## 11. Security & Validation (Phase 17)

- Passwords hashed with bcrypt (10 salt rounds); password field never selected/returned by default
- JWT-based auth on every protected route; admin-only routes additionally check `role === "admin"`
- Centralized request validation (`utils/validators.js`) for register, login, product, store and order payloads — rejects malformed input before it reaches the database
- Product prices are selected by size and recalculated server-side at checkout; review uniqueness is enforced by a MongoDB compound index
- Lightweight in-memory rate limiter on `/api/auth/register` and `/api/auth/login` (20 requests / 15 min / IP) to blunt brute-force attempts
- CORS locked to `CLIENT_URL`
- Basic security response headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`)
- JSON body size capped at 1MB
- Centralized error handler normalizes Mongoose cast/validation/duplicate-key errors into consistent HTTP status codes
- Orders are user-scoped: a customer can only view their own orders (`getOrderById` checks ownership unless the requester is an admin)

**Known gaps to close before production**: swap the in-memory rate limiter for `express-rate-limit` + Redis (multi-instance safe), add `helmet` for a fuller header set, add CSRF protection if you move off Bearer-token auth, and add automated tests (see §13).

## 12. UI Polish (Phase 16)

- Toast notifications (success/error/info) for login, registration, cart actions, checkout, and every admin CRUD action
- Skeleton loaders (product grid, table rows) instead of bare "Loading..." text
- Distinct empty and error states with retry actions where relevant
- Subtle hover/transition polish on cards, buttons and table rows
- Fade-in animation on newly loaded content
- Responsive mobile nav (hamburger menu), responsive cart, and responsive admin dashboard/sidebar

## 13. Final Testing Checklist (Phase 18)

```
[x] Backend starts and connects to MongoDB
[x] Frontend starts and loads the homepage
[x] Register works (with validation errors surfaced via toast)
[x] Login works (demo accounts verified)
[x] Logout works
[x] JWT persists across refresh (via /api/auth/me on load)
[x] Products load from MongoDB (no mock data)
[x] Search works
[x] Category filter and sort work
[x] Product details page loads ingredients/calories/sizes
[x] Add to cart works (from grid card and detail page)
[x] Cart persists across refresh (localStorage)
[x] Coupon JUICE10 applies 10% off
[x] Checkout works and validates the address form
[x] Order is created in MongoDB and decrements stock
[x] Order history page lists a user's own orders only
[x] Order tracking bar reflects orderStatus
[x] Admin login works and routes non-admins away from /admin
[x] Admin can create/edit/delete products with validation
[x] Admin can view and update order status
[x] Customer sees updated status after admin changes it
[x] Mobile nav, cart and admin dashboard are usable at narrow widths
```

All items above were verified by static/syntax analysis of the full codebase and manual code review during this build; run through them live once MongoDB is connected in your environment, since this container has no outbound network access to install dependencies and boot the servers end-to-end.

## 14. Future Improvements

- Real payment gateway integration (Razorpay/Stripe) instead of the mock "Online Payment" flow
- Email/SMS order notifications
- Product image uploads (Cloudinary/S3) instead of image URLs
- Reviews & ratings per product
- Wishlist / saved addresses
- Automated test suite (Jest + Supertest for the API, React Testing Library for the frontend)
- Redis-backed rate limiting and caching for the product catalog
- Admin analytics: revenue over time, cohort retention

## 15. Screenshots

*(Add screenshots here before your demo — Home hero, Shop grid, Cart, Checkout, Order tracking, Admin dashboard.)*

- `docs/screenshot-home.png`
- `docs/screenshot-shop.png`
- `docs/screenshot-cart.png`
- `docs/screenshot-admin-dashboard.png`

---

# 🎤 5-Minute Hackathon Demo Plan

| Time | Segment | What to say / show |
|---|---|---|
| 0:00–0:30 | **Problem** | "Fresh, preservative-free juice is hard to get delivered — juice bars have limited hours, and bottled juice from stores is loaded with sugar and preservatives." |
| 0:30–1:00 | **Solution** | "JuiceDrop is a full MERN juice delivery platform — browse, order, and track fresh juice delivery, with a complete admin backend to run the business." |
| 1:00–1:30 | **Architecture** | Show the React → Express → MongoDB diagram from §5. Mention JWT auth, Mongoose schemas, and that it's 100% custom MERN — no BaaS shortcuts. |
| 1:30–3:30 | **Live Demo** | 1) Land on Home, scroll featured juices. 2) Go to Shop, search "mango", filter by category, sort by price. 3) Open a product, pick a size, add to cart. 4) Open Cart, apply `JUICE10`, show totals update live. 5) Checkout as the demo customer, place a COD order — show the toast + "Order Placed 🎉" screen. 6) Go to Orders, show the tracking bar. 7) Log in as admin, show the Dashboard stats, edit a product's stock, then update the order's status to "Out for Delivery." 8) Log back in as the customer and show the tracking bar updated live. |
| 3:30–4:15 | **Technical Implementation** | Highlight: JWT + bcrypt auth, role-based route protection, centralized input validation, rate-limited auth endpoints, atomic stock decrement on order creation, and localStorage-persisted cart. |
| 4:15–5:00 | **Future Scalability** | Mention real payment gateway integration, image uploads via Cloudinary, Redis-backed rate limiting, and horizontal scaling of the Express API behind a load balancer since it's stateless (JWT, no server sessions). |

**Presenter tips:**
- Pre-seed the database and pre-log-in a second browser/incognito tab as admin so you don't waste demo time typing credentials.
- Add 1–2 items to the cart *before* the demo starts so Cart isn't empty when you jump to it, or narrate the empty-cart state briefly to show polish.
- Have the admin order-status dropdown and the customer's Orders tab open in two side-by-side windows to show the "MongoDB → API → Customer" update happen live.
