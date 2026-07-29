# 🧩 Puzzle Universe

A polished, full-stack **puzzle game platform** built with **Next.js (App Router)**, **PostgreSQL**, and **Drizzle ORM**. Puzzle Universe is a single account, single dashboard experience where players enjoy **six complete, fully playable puzzle games**, climb global leaderboards, unlock achievements, complete daily missions, spend coins/gems in a cosmetic shop, and grow their profile — all backed by persistent storage and realistic seeded demo data.

Designed for everyone, **age 4 and up**.

---

## ✨ Highlights

- 🎮 **6 complete, playable games** (not mockups) with real game logic and scoring
- 🔐 **JWT authentication** with secure HTTP-only cookies (register / login / logout)
- 🏠 **Clean dashboard** with sidebar navigation, top bar, and a notification center
- 🗂️ **Full CRUD** for Achievements, Missions, Shop Items, and Events (admin-gated)
- 🏆 **Global leaderboard**, XP/level progression, daily rewards & streaks
- 🛍️ **Cosmetic shop** with coins & gems economy and live purchases
- 💾 **Persistent PostgreSQL storage** via Drizzle ORM
- 🌱 **Auto-seeded demo world** so the app feels alive on first load
- 💎 **Modern UI**: glassmorphism, animated gradient backdrop, skeleton loaders, empty states, toasts, modals, confirm dialogs, offline indicator, optimistic updates, and responsive design

---

## 🎮 The Games

All six games award **XP + coins**, update your **high score / best combo**, and feed the **leaderboard** through a single shared scoring pipeline.

| Game | Icon | Description | Controls | Age |
|------|------|-------------|----------|-----|
| **Grid Block Puzzle** | 🧩 | Place blocks on an 8×8 board and clear full rows/columns for combos. Endless play. | Tap a block, tap the board | 4+ |
| **Memory Match** | 🃏 | Flip cards to find matching pairs. Score by speed & efficiency. 3 difficulties (6/8/12 pairs). | Tap cards | 4+ |
| **2048** | 🔢 | Slide tiles to merge matching numbers and reach 2048. "Keep going" after winning. | Arrow keys / WASD / swipe / on-screen buttons | 6+ |
| **Sliding Puzzle** | 🔀 | Classic 15-puzzle. Arrange numbered tiles in order. Guaranteed-solvable shuffle. 3 board sizes. | Tap tiles next to the gap | 5+ |
| **Sudoku** | 9️⃣ | Fill the 9×9 grid so every row, column, and box contains 1–9. Uniquely-solvable generator, mistake tracking (3 strikes). | Tap cell + number pad / keyboard | 8+ |
| **Color Flood** | 🎨 | Flood-fill the board to a single color within a move limit. | Tap a color | 4+ |

### Game engineering notes
- **Sudoku** uses a backtracking generator that produces puzzles with a **verified unique solution** (validated with a solution counter) in easy/medium/hard clue counts.
- **2048** uses a rotate-slide-merge engine covering all four directions with correct merge rules.
- **Sliding Puzzle** is shuffled by performing random legal moves from the solved state, so every board is **always solvable** and never starts already solved.
- **Color Flood** uses an iterative flood-fill (DFS) algorithm.
- Games are **code-split** with `next/dynamic` + skeleton loaders for fast startup.

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React 19, Server Components + Route Handlers) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL |
| ORM | Drizzle ORM (`drizzle-orm`, `drizzle-kit`) |
| Auth | `jose` (JWT sign/verify) + `bcryptjs` (password hashing) + HTTP-only cookies |
| State | React Context (`UserProvider`, `ToastProvider`) |

---

## 📁 Project Structure

```
puzzle-universe/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout & metadata
│   │   ├── globals.css               # Tailwind + theme (glass, animations, skeleton)
│   │   ├── page.tsx                  # Landing (redirects to /dashboard if logged in)
│   │   ├── AuthClient.tsx            # Login / register / quick demo login UI
│   │   ├── api/                      # Backend Route Handlers (REST)
│   │   │   ├── health/route.ts       # Healthcheck (used by deploy)
│   │   │   ├── seed/route.ts         # Idempotent demo data seeder
│   │   │   ├── auth/                 # register, login, logout, me
│   │   │   ├── scores/route.ts       # Submit score + get history
│   │   │   ├── leaderboard/route.ts  # Global top 50
│   │   │   ├── daily/route.ts        # Claim daily reward / streak
│   │   │   ├── profile/route.ts      # Update username / avatar / country
│   │   │   ├── achievements/         # CRUD (+ /[id])
│   │   │   ├── missions/             # CRUD (+ /[id])
│   │   │   ├── shop/                 # CRUD (+ /[id]) + /purchase
│   │   │   ├── events/               # CRUD (+ /[id])
│   │   │   ├── notifications/        # list, mark read (+ /[id])
│   │   │   └── admin/stats/route.ts  # Admin dashboard metrics
│   │   └── dashboard/
│   │       ├── layout.tsx            # Auth guard + providers + Shell
│   │       ├── page.tsx              # Dashboard home (widgets)
│   │       ├── play/
│   │       │   ├── page.tsx          # Game arcade hub
│   │       │   └── [slug]/           # Dynamic game route + GameRunner
│   │       ├── leaderboard/page.tsx
│   │       ├── achievements/page.tsx
│   │       ├── missions/page.tsx
│   │       ├── shop/page.tsx
│   │       ├── events/page.tsx
│   │       ├── profile/page.tsx
│   │       └── admin/page.tsx
│   ├── components/
│   │   ├── Shell.tsx                 # Sidebar + topbar + notifications
│   │   ├── UserContext.tsx           # Current-user provider & refresh
│   │   ├── Toast.tsx                 # Toast notifications provider
│   │   ├── ui.tsx                    # Skeleton, EmptyState, Modal, ConfirmDialog, Field
│   │   ├── CrudManager.tsx           # Reusable CRUD grid (search, optimistic updates)
│   │   ├── GameOverlay.tsx           # Shared win/lose overlay
│   │   ├── BlockPuzzle.tsx           # Grid Block Puzzle game
│   │   └── games/
│   │       ├── MemoryMatch.tsx
│   │       ├── Game2048.tsx
│   │       ├── SlidingPuzzle.tsx
│   │       ├── Sudoku.tsx
│   │       └── ColorFlood.tsx
│   ├── lib/
│   │   ├── auth.ts                   # hash/verify, JWT, cookie session helpers
│   │   ├── api.ts                    # requireUser / requireAdmin guards
│   │   ├── client.ts                 # Typed fetch wrapper
│   │   ├── levels.ts                 # XP → level progression
│   │   ├── games.ts                  # Game catalog metadata
│   │   ├── sudoku.ts                 # Sudoku generator/solver/validator
│   │   └── useSubmitScore.ts         # Shared score submission hook
│   └── db/
│       ├── index.ts                  # Drizzle client (pg Pool)
│       └── schema.ts                 # Table definitions
├── drizzle.config.json
├── package.json
└── README.md
```

---

## 🗄️ Database Schema

All tables live in `src/db/schema.ts` (PostgreSQL via Drizzle).

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | serial | PK |
| username | varchar(60) | |
| email | varchar(160) | unique |
| password_hash | text | bcrypt |
| country | varchar(60) | default `US` |
| avatar | text | emoji, default 🦊 |
| role | varchar(20) | `player` / `admin` |
| xp, coins, gems, level, streak | integer | economy & progression |
| high_score, games_played, wins, best_combo | integer | stats |
| created_at | timestamp | |

### `scores`
`id, user_id, score, lines, combo, mode, created_at` — one row per completed game, `mode` = game slug.

### `achievements`
`id, title, description, category, icon, target, reward_coins, reward_gems, created_at`

### `missions`
`id, title, description, type (daily/weekly/monthly/seasonal/event), target, progress, reward_xp, reward_coins, completed, created_at`

### `shop_items`
`id, name, description, category (theme/effect/frame/music/bundle), icon, price_coins, price_gems, featured, created_at`

### `notifications`
`id, user_id (nullable = global), title, body, type, read, created_at`

### `events`
`id, title, description, icon, status (live/upcoming/ended), starts_at, ends_at, meta (jsonb), created_at`

---

## 🔌 API Reference

All routes are JSON. Protected routes require the session cookie; admin routes require `role = admin`.

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account, sets session cookie |
| POST | `/api/auth/login` | Log in, sets session cookie |
| POST | `/api/auth/logout` | Clear session |
| GET  | `/api/auth/me` | Current user (with level progress) |

### Gameplay & Progression
| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/api/scores` | List recent scores / submit a score (awards XP + coins) |
| GET | `/api/leaderboard` | Global top 50 by high score |
| POST | `/api/daily` | Claim daily reward, increment streak |
| PATCH | `/api/profile` | Update username / avatar / country |

### CRUD Resources (`GET`/`POST` on collection, `PATCH`/`DELETE` on `/[id]`)
- `/api/achievements` · `/api/missions` · `/api/shop` · `/api/events`
- Reads are open to any logged-in user; **create/update/delete require admin**.
- `/api/shop/purchase` — spend coins/gems to unlock an item.
- `/api/notifications` — list + `markAllRead`; `/api/notifications/[id]` mark read / delete.

### Admin & System
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/stats` | Platform counts & totals (admin only) |
| POST | `/api/seed` | Idempotent demo-data seeder |
| GET | `/api/health` | Healthcheck (`{ ok: true }`) |

---

## 🔐 Authentication Flow

1. On the landing page, a `POST /api/seed` runs to ensure demo data exists.
2. **Register** or **Login** → server verifies credentials with `bcryptjs`, signs a **JWT** with `jose`, and stores it in a **secure, HTTP-only cookie** (`pu_session`, 7-day expiry).
3. The `/dashboard` layout is a **server component** that reads the cookie, verifies the token, loads the user, and redirects to `/` if unauthenticated.
4. Client hydration uses `UserProvider` for live user state (coins, XP, etc.), refreshed after score/daily/purchase actions.
5. **Logout** clears the cookie and hard-navigates home.

> Passwords are hashed with bcrypt; tokens are HS256-signed. Set `JWT_SECRET` in production.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- A PostgreSQL database

### 1. Configure environment
Create a `.env` file in the project root:
```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
JWT_SECRET=change-me-to-a-long-random-string
```

### 2. Install dependencies
```bash
npm install
```

### 3. Apply the database schema
```bash
npx drizzle-kit push
```

### 4. Run the app
```bash
npm run dev
# open http://localhost:3000
```

The demo world **auto-seeds** on first visit to the landing page (or call `POST /api/seed`).

### Production build
```bash
npm run build
npm run start
```

---

## 🧪 Demo Accounts

Seeded automatically. Password for both: **`password123`**

| Role | Email | Access |
|------|-------|--------|
| 👑 Admin | `admin@puzzle.dev` | Full CRUD + admin dashboard |
| 🦊 Player | `demo@puzzle.dev` | Standard player experience |

The login screen also has **one-click quick-login** buttons for both accounts.

The seeder also creates 18 leaderboard bot players, 30+ achievements, 8 missions, 12 shop items, 5 events, and starter notifications.

---

## 🧭 App Walkthrough

- **Dashboard** — welcome banner + XP bar, quick stats, daily reward, mission progress, leaderboard preview, and live events.
- **Play (Arcade)** — pick any of the six games; each has its own difficulty options and scoring.
- **Leaderboard** — searchable global ranking with medals; your row is highlighted.
- **Achievements / Missions / Events** — browse everything; admins get create/edit/delete.
- **Shop** — filter by category, buy items with coins/gems (live balance updates).
- **Profile** — edit avatar/username/country, view detailed stats and recent game history.
- **Admin** — platform metrics and quick links to all management sections (admin only).

---

## 📜 NPM Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type-check |
| `npx drizzle-kit push` | Sync schema to the database |

---

## 🎨 UI/UX Details

- **Glassmorphism** panels over an animated multi-radial gradient background.
- **Skeleton loaders** and **empty states** for every async section.
- **Optimistic updates** in all CRUD flows with rollback on error.
- **Toasts**, **modals**, and **confirm dialogs** for feedback and destructive actions.
- **Offline indicator** in the top bar (listens to `navigator.onLine`).
- **Responsive**: mobile drawer sidebar, adaptive grids, touch controls for games.

---

## 🔒 Security & Production Hardening

- HTTP-only, `SameSite=Lax`, `Secure`-in-production session cookies.
- **Env validation** — the app refuses to start in production without a strong `JWT_SECRET` (≥32 chars).
- **Rate limiting** on login (10 / 5 min / IP) and registration (5 / 10 min / IP) → HTTP 429.
- **Input validation & sanitization** on auth (email format, length bounds, control-char stripping).
- **Security headers**: HSTS, `X-Frame-Options`, `X-Content-Type-Options`, Referrer-Policy, Permissions-Policy; `X-Powered-By` removed.
- **Edge middleware** guards `/dashboard/*`; server-side guards (`requireUser`, `requireAdmin`) on every protected route.
- **Score integrity** — submitted scores are clamped to bounds and game modes are whitelisted.
- Passwords hashed with bcrypt; generic auth errors prevent user enumeration.
- Role-based access control for admin CRUD operations.

## 🚢 Deployment

The app builds to a **standalone** output and ships with a production `Dockerfile`.

### Docker
```bash
docker build -t puzzle-universe .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="$(openssl rand -base64 48)" \
  -e NEXT_PUBLIC_SITE_URL="https://your-domain.com" \
  puzzle-universe
```

### Any Node host / PaaS (Vercel, Railway, Render, Fly.io)
1. Set env vars from `.env.example` (at minimum `DATABASE_URL` and `JWT_SECRET`).
2. Run `npx drizzle-kit push` once against the production database.
3. `npm run build` → `npm run start` (or use the platform's Next.js build).

### CI
`.github/workflows/ci.yml` spins up PostgreSQL, applies the schema, then runs typecheck, lint, and build on every push/PR.

### Health & monitoring
`GET /api/health` returns `{ ok, status, db, latencyMs, timestamp }` (503 when the DB is unreachable) — wire it to your uptime/load-balancer checks.

### SEO / PWA
Includes dynamic `robots.txt`, `sitemap.xml`, a web manifest, OpenGraph/Twitter metadata, and an installable app icon.

---

## 📈 Progression System

- **XP** earned per game = `score / 10 + lines * 5`.
- **Coins** earned = `score / 25`.
- **Levels** scale progressively (`levelFromXp` in `src/lib/levels.ts`).
- **Daily reward** grows with your streak; claim once per session for coins + gems.

---

Built as a commercial-quality demo of a scalable puzzle platform — a single account, one dashboard, many games. 🧩
