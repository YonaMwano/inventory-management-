# Inventory Management System (IMS)

Professional business dashboard for tracking **inventory**, **sales**, and **stock movement** — built with **Next.js 16** and **Neon PostgreSQL**.

## Features

- **Auth** — Register / Login / Logout (session cookie, scrypt password hashing)
- **Role-ready** — First registered user becomes `ADMIN`
- **Dashboard** — Live KPIs: inventory value, SKUs, low stock, out of stock, sales
- **Inventory** — Product list, add product with initial stock, stock status badges
- **Stock Movements** — Full audit trail (stock in/out, adjustments)
- **Sales / Purchasing / Suppliers / Reports / Settings** — UI ready for extension
- **Responsive** — Collapsible sidebar, mobile-friendly layout
- **Vercel-ready** — `pg` + Neon, dynamic routes, env documented

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | Neon PostgreSQL |
| DB client | `pg` (node-postgres) |
| Styling | Tailwind CSS 4 |
| Icons | Local SVG components |
| Hosting | Vercel |

## Project Structure

```
inventory-management/
├── app/
│   ├── (auth)/login, register
│   ├── (dashboard)/dashboard, inventory, sales, ...
│   ├── actions/          # Server Actions (auth, products)
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── icons.tsx
│   └── layout/sidebar, topbar
├── lib/
│   ├── auth.ts           # Session + password hashing
│   ├── db.ts             # Neon pool + SQL helpers
│   └── utils.ts
├── prisma/migrations/    # SQL schema for Neon (reference)
├── .env.example
├── vercel.json
└── package.json
```

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your Neon connection string:

```env
DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-xxx.aws.neon.tech/neondb?sslmode=require"
```

### 3. Create database tables

Open [Neon SQL Editor](https://console.neon.tech) and run the full script in:

```
prisma/migrations/0001_init.sql
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

1. Go to **Register** and create the first account (becomes Admin)
2. Open **Inventory** → **Add Product**
3. Check **Dashboard** and **Stock Movements** for live data

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial IMS"
git remote add origin https://github.com/YOUR_USER/inventory-management.git
git push -u origin main
```

### 2. Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)

### 3. Environment Variables (required)

In **Vercel → Project → Settings → Environment Variables** add:

| Name | Value | Environments |
|------|--------|--------------|
| `DATABASE_URL` | Your full Neon connection string | Production, Preview, Development |
| `NEXT_PUBLIC_APP_NAME` | `Inventory Management System` (optional) | Production, Preview |

**Important for Neon + Vercel:**

- Prefer the **pooled** connection string from Neon (ends with `-pooler`)
- Include `?sslmode=require`
- Ensure tables already exist (run `0001_init.sql` once in Neon)

### 4. Deploy

Click **Deploy**. After build succeeds, open the provided URL.

### 5. Post-deploy checklist

- [ ] Open `/register` and create the first admin user
- [ ] Add a product under Inventory
- [ ] Confirm Dashboard KPIs update
- [ ] Confirm Stock Movements shows the initial stock-in

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | Neon PostgreSQL connection string |
| `NEXT_PUBLIC_APP_NAME` | No | App display name |

Never commit `.env` or `.env.local`. Use `.env.example` as the template.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Database Schema (summary)

- `users` — accounts & roles
- `warehouses` — locations
- `categories` — product categories
- `products` — SKUs, cost, price, reorder level
- `inventory_items` — quantity per product × warehouse
- `stock_movements` — audit trail of every quantity change
- `customers`, `sales_orders`, `sales_order_items`
- `suppliers`, `purchase_orders`, `purchase_order_items`
- `audit_logs`, `notifications`, `company_settings`

## Security Notes

- Passwords hashed with Node `crypto.scrypt` (salted)
- Session stored in HTTP-only cookie
- Dashboard routes require a valid session
- Use Neon pooled URL on Vercel; rotate DB password if exposed

## License

Private / internal use unless otherwise stated.
