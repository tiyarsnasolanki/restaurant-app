# 🍽️ RestaurantPro — Smart Restaurant Management + Food Waste Reduction

Full-stack MERN application with:
- Online menu browsing & ordering
- Table reservation system
- Staff & admin dashboards
- Surplus food marketplace (reduce waste, offer discounts)

## Tech Stack
| Layer     | Technology                    | Deployment  |
|-----------|-------------------------------|-------------|
| Frontend  | React + Vite + Tailwind CSS   | Vercel      |
| Backend   | Node.js + Express             | Render      |
| Database  | MongoDB Atlas (M0 free tier)  | Cloud       |
| Auth      | JWT (jsonwebtoken)            | —           |

---

## ─── STEP-BY-STEP SETUP ─────────────────────────────────────────

### STEP 1 — MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com → Sign up (free)
2. Create a new Project → Build a Database → **M0 FREE** tier
3. Choose cloud provider + region → Create Cluster
4. **Database Access** → Add new user → username + password → "Atlas Admin" role
5. **Network Access** → Add IP → Allow Access from Anywhere → `0.0.0.0/0`
6. Click **Connect** → Drivers → copy your connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/restaurantDB
   ```

---

### STEP 2 — Run Locally

```bash
# Clone/download the project
cd restaurant-app

# ── Backend ──────────────────────────────────────────────────────
cd server
npm install

# Create .env file
cp .env.example .env
# Edit .env and fill in your MONGO_URI and JWT_SECRET

# Seed sample data (optional but recommended)
node seed.js

# Start server
npm run dev       # runs on http://localhost:5000

# ── Frontend (new terminal) ────────────────────────────────────────
cd ../client
npm install

# Create .env file (for local dev no changes needed — proxy handles it)
cp .env.example .env

# Start client
npm run dev       # runs on http://localhost:5173
```

**Local test accounts (after seed):**
| Role     | Email                    | Password     |
|----------|--------------------------|--------------|
| Admin    | admin@restaurant.com     | admin123     |
| Staff    | staff@restaurant.com     | staff123     |
| Customer | customer@example.com     | customer123  |

---

### STEP 3 — Deploy Backend to Render

1. Push your `server/` folder to a **GitHub repository**
   ```bash
   cd restaurant-app
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/restaurant-app.git
   git push -u origin main
   ```

2. Go to https://render.com → Sign up → New → **Web Service**
3. Connect GitHub → Select your repository
4. Configure:
   - **Name**: `restaurant-api`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: Free

5. Add **Environment Variables**:
   ```
   MONGO_URI     = mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/restaurantDB
   JWT_SECRET    = your_very_long_random_secret_key_here
   CLIENT_URL    = https://your-app.vercel.app   ← fill after Vercel deploy
   PORT          = 5000
   ```

6. Click **Create Web Service** → wait for deploy (~3 min)
7. Copy your Render URL: `https://restaurant-api.onrender.com`

> ⚠️ **Render free tier sleeps** after 15 min of inactivity.  
> Use https://uptimerobot.com — create a free monitor that pings your API URL every 10 minutes.

---

### STEP 4 — Deploy Frontend to Vercel

1. Go to https://vercel.com → Sign up → **Add New Project**
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add **Environment Variable**:
   ```
   VITE_API_URL = https://restaurant-api.onrender.com/api
   ```

5. Click **Deploy** → wait (~2 min)
6. Copy your Vercel URL: `https://restaurant-app.vercel.app`

---

### STEP 5 — Link Backend → Frontend

Go back to **Render** → your web service → **Environment**  
Update `CLIENT_URL` to your Vercel URL:
```
CLIENT_URL = https://restaurant-app.vercel.app
```
Click **Save Changes** → Render auto-redeploys.

---

### STEP 6 — Verify Everything Works

Test these in your browser:
- `https://restaurant-api.onrender.com/api/health` → should return `{"status":"ok"}`
- `https://restaurant-app.vercel.app` → should load the homepage
- Login with admin credentials → check Admin Dashboard
- Browse Menu → Add to Cart → Place Order
- Go to Surplus page → check deals

---

## Project Structure

```
restaurant-app/
├── client/                    ← React Frontend (Vercel)
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js       ← Axios instance with JWT interceptor
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── components/
│   │   │   ├── shared/        ← Navbar, Spinner, StatusBadge
│   │   │   └── customer/      ← MenuCard
│   │   └── pages/
│   │       ├── Home.jsx
│   │       ├── MenuPage.jsx
│   │       ├── SurplusPage.jsx
│   │       ├── LoginPage.jsx
│   │       ├── RegisterPage.jsx
│   │       ├── customer/      ← Cart, Orders, Reservations, Profile
│   │       ├── staff/         ← Dashboard, Orders, Reservations, Surplus
│   │       └── admin/         ← Dashboard, Menu, Users
│   ├── vercel.json            ← React Router fix for Vercel
│   └── vite.config.js
│
└── server/                    ← Express Backend (Render)
    ├── models/
    │   ├── User.js
    │   ├── MenuItem.js
    │   ├── Order.js
    │   ├── Reservation.js
    │   └── SurplusListing.js
    ├── routes/
    │   ├── auth.js
    │   ├── menu.js
    │   ├── orders.js
    │   ├── reservations.js
    │   ├── surplus.js
    │   ├── dashboard.js
    │   └── adminUsers.js
    ├── middleware/
    │   └── auth.js            ← JWT protect + role authorize
    ├── index.js               ← Express app entry point
    └── seed.js                ← Sample data seeder
```

## API Routes Reference

### Auth
| Method | Route                       | Access   | Description         |
|--------|-----------------------------|----------|---------------------|
| POST   | /api/auth/register          | Public   | Register user       |
| POST   | /api/auth/login             | Public   | Login               |
| GET    | /api/auth/me                | Auth     | Get current user    |
| PUT    | /api/auth/profile           | Auth     | Update profile      |
| GET    | /api/auth/users             | Admin    | List all users      |
| PATCH  | /api/auth/users/:id/role    | Admin    | Change user role    |

### Menu
| Method | Route                       | Access       | Description          |
|--------|-----------------------------|--------------|----------------------|
| GET    | /api/menu                   | Public       | Get all items        |
| POST   | /api/menu                   | Admin/Staff  | Add item             |
| PUT    | /api/menu/:id               | Admin/Staff  | Update item          |
| DELETE | /api/menu/:id               | Admin        | Delete item          |
| PATCH  | /api/menu/:id/availability  | Admin/Staff  | Toggle availability  |

### Orders
| Method | Route                       | Access       | Description          |
|--------|-----------------------------|--------------|----------------------|
| GET    | /api/orders                 | Auth         | Get orders           |
| POST   | /api/orders                 | Auth         | Place order          |
| PATCH  | /api/orders/:id/status      | Admin/Staff  | Update status        |
| DELETE | /api/orders/:id             | Auth         | Cancel order         |

### Reservations
| Method | Route                         | Access      | Description         |
|--------|-------------------------------|-------------|---------------------|
| GET    | /api/reservations             | Auth        | Get reservations    |
| GET    | /api/reservations/slots       | Public      | Available time slots|
| POST   | /api/reservations             | Auth        | Book table          |
| PATCH  | /api/reservations/:id/status  | Admin/Staff | Update status       |
| DELETE | /api/reservations/:id         | Auth        | Cancel              |

### Surplus
| Method | Route                   | Access      | Description         |
|--------|-------------------------|-------------|---------------------|
| GET    | /api/surplus            | Public      | Active listings     |
| GET    | /api/surplus/all        | Admin/Staff | All listings        |
| POST   | /api/surplus            | Admin/Staff | Create listing      |
| POST   | /api/surplus/:id/claim  | Auth        | Claim a deal        |
| PATCH  | /api/surplus/:id        | Admin/Staff | Update listing      |

---

## Default User Roles

| Role     | Permissions                                           |
|----------|-------------------------------------------------------|
| customer | Browse menu, order, reserve tables, claim surplus     |
| staff    | All customer perms + manage orders, reservations, surplus listings |
| admin    | All staff perms + manage menu, users, view analytics  |
# restaurant-app
