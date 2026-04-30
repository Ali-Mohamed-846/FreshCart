# 🛒 FreshCart — E-Commerce Platform

A full-featured e-commerce app built with the latest stack.

## ✨ Tech Stack

| Package                   | Version   |
|---------------------------|-----------|
| **Next.js**               | 16.2.3    |
| **React**                 | 19.2.4    |
| **TypeScript**            | ^5        |
| **Tailwind CSS**          | ^4        |
| **React Icons**           | ^5.6.0    |
| **React Hook Form**       | ^7.72.1   |
| **Zod**                   | ^4.3.6    |
| **React Toastify**        | ^11.0.5   |
| **React Loader Spinner**  | ^8.0.2    |
| **Radix UI**              | ^1.4.3    |
| **Shadcn**                | ^4.2.0    |
| **CVA**                   | ^0.7.1    |
| **clsx**                  | ^2.1.1    |
| **tailwind-merge**        | ^3.5.0    |
| **tw-animate-css**        | ^1.4.0    |
| **Lucide React**          | ^1.8.0    |

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (Turbopack ⚡)
npm run dev

# 3. Open in browser
# http://localhost:3000
```

## 📁 Project Structure

```
freshcart/
├── app/                      # Next.js App Router pages
│   ├── page.tsx              # Homepage
│   ├── products/             # Shop page + [id] product detail
│   ├── categories/           # All Categories
│   ├── brands/               # All Brands
│   ├── cart/                 # Shopping Cart
│   ├── wishlist/             # Wishlist
│   ├── checkout/             # Checkout flow
│   ├── login/                # Sign In
│   ├── register/             # Sign Up
│   ├── forgot-password/      # Password Reset (3-step)
│   ├── profile/              # Account + Addresses + Settings
│   │   └── orders/           # Order History
│   └── contact/              # Contact + FAQ
│
├── components/
│   ├── Navbar.tsx            # Sticky nav, dynamic category dropdown
│   ├── Footer.tsx
│   ├── ProductCard.tsx       # Reusable card with cart/wishlist
│   └── UI.tsx                # Spinner (react-loader-spinner), Breadcrumb
│
├── context/
│   ├── CartContext.tsx        # Per-user cart (survives account switch)
│   ├── WishlistContext.tsx    # Wishlist persisted in localStorage
│   └── AuthContext.tsx        # JWT auth (logout keeps cart intact)
│
├── lib/
│   ├── api.ts                # All API calls using native fetch()
│   ├── toast.ts              # react-toastify wrapper (toast shim)
│   └── utils.ts              # cn() helper (clsx + tailwind-merge)
│
├── types/
│   └── index.ts              # TypeScript interfaces (Product, Order, …)
│
└── public/
    └── grocery-cart.png      # Login page illustration
```

## 🔑 Key Features

- ✅ Real API — Route Academy (`ecommerce.routemisr.com`)
- ✅ Auth (Sign In / Sign Up / Forgot Password 3-step)
- ✅ **Per-user cart** — switching accounts shows that user's own cart
- ✅ Cart & Wishlist persist in localStorage (survive logout)
- ✅ **Buy Now** redirects to `/login` when not authenticated
- ✅ Dynamic category/brand filtering
- ✅ Search, sort, pagination
- ✅ Checkout with saved addresses
- ✅ Order history stored in localStorage
- ✅ Tailwind v4 CSS-first configuration (`@theme` in `globals.css`)
- ✅ React Toastify for notifications
- ✅ React Loader Spinner for loading states
- ✅ Fully responsive (mobile + desktop)

## 🌐 API

Base URL: `https://ecommerce.routemisr.com/api/v1`

## 📦 Build

```bash
npm run build   # production build
npm start       # serve production
npm run lint    # ESLint 9
npm run type-check  # TypeScript check
```
