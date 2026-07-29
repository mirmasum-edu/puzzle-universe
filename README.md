# 🧩 Puzzle Universe

A polished, production-ready **full-stack puzzle game platform** — a single account and
one dashboard for **six fully playable puzzle games**. Players climb global leaderboards,
unlock achievements, complete daily missions, spend coins & gems in a cosmetic shop, and
grow an XP-based profile. Designed for everyone, ages 4+.

## 🎮 Games
- 🧩 **Grid Block Puzzle** — place blocks & clear lines on an 8×8 board
- 🃏 **Memory Match** — flip cards to find pairs (3 difficulties)
- 🔢 **2048** — merge tiles (keyboard / swipe / buttons)
- 🔀 **Sliding Puzzle** — classic 15-puzzle, always solvable (3 sizes)
- 9️⃣ **Sudoku** — uniquely-solvable generator, 3 difficulties, mistake tracking
- 🎨 **Color Flood** — flood-fill the board within a move limit

## ✨ Features
- 🔐 JWT cookie authentication (register / login / logout, demo + admin accounts)
- 🏠 Clean dashboard with sidebar navigation & notification center
- 🏆 Global leaderboard, XP/level progression, daily rewards & streaks
- 🗂️ Full CRUD (achievements, missions, shop items, events) with optimistic updates
- 🛍️ Cosmetic shop with a coins & gems economy
- 🌱 Auto-seeded realistic demo data so it feels alive on first load
- 💎 Modern UI: glassmorphism, skeleton loaders, empty states, toasts, responsive design

## 🧰 Tech Stack
**Next.js 16 (App Router)** · **React 19** · **TypeScript** · **Tailwind CSS v4** ·
**PostgreSQL** · **Drizzle ORM** · **jose** (JWT) · **bcryptjs**

## 🔒 Production-Ready
Security headers, rate limiting, input validation & sanitization, route guards, score
integrity checks, SEO metadata + robots/sitemap, PWA manifest, Docker, and GitHub Actions CI.

## 🚀 Quick Start
```bash
npm install
cp .env.example .env      # set DATABASE_URL and JWT_SECRET
npx drizzle-kit push      # create tables
npm run dev               # http://localhost:3000
