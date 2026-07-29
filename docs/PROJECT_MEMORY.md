# Puzzle Universe — AI Project Memory

> **Purpose of this file:** A dense, accurate context brief for AI agents (and developers) who need to understand this codebase quickly before making changes. It reflects the ACTUAL implemented state of the project. Keep it updated when architecture changes.

---

## 1. One-line summary

Puzzle Universe is a full-stack **puzzle game platform** (single account → one dashboard → six playable games) built on **Next.js 16 App Router + React 19 + TypeScript + Tailwind v4 + PostgreSQL (Drizzle ORM)**, with JWT cookie auth, full CRUD admin flows, an economy (coins/gems/XP), a global leaderboard, and auto-seeded demo data.

---

## 2. Tech stack & versions

- **Next.js 16.2.x** (App Router, Server Components + Route Handlers)
- **React 19.2.x**, **TypeScript 5.9**
- **Tailwind CSS v4** (imported via `@import "tailwindcss";` in `src/app/globals.css`; PostCSS plugin `@tailwindcss/postcss`)
- **PostgreSQL** accessed with **Drizzle ORM 0.45** + **drizzle-kit 0.31** (`pg` driver, `node-postgres`)
- **Auth:** `jose` (HS256 JWT) + `bcryptjs` (password hashing) + Next.js `cookies()`
- No Redux/Zustand — state is React Context only.

**Important constraints for this environment:**
- Never edit `package.json` by hand; use the package install tool.
- DB connection reads `DATABASE_URL` from `.env`. Local dev URL: `postgresql://postgres:postgres@127.0.0.1:5432/app_db`.
- Apply schema changes with `npx drizzle-kit push` (no migration files used).
- `src/db/index.ts` exports `db` (Drizzle) and `pool` (pg Pool). Import DB as `import { db } from "@/db"`.
- Path alias `@/*` → `src/*`.

---

## 3. How to run / validate

```bash
npm install
npx drizzle-kit push        # create tables (REQUIRED on a fresh DB — see gotcha #1)
npm run dev                 # dev server
npm run build && npm run start   # production
```

Validation sequence used in this repo (run all before considering work done):
1. `npx next typegen`
2. `npm exec tsc -- --noEmit`
3. `npm run build`
4. Health check at `/api/health` → `{ ok: true }`

---

## 4. Directory map (what lives where)

```
src/
  app/
    layout.tsx              Root layout, metadata, imports globals.css
    globals.css             Tailwind + theme classes: .pu-bg, .glass, .glass-strong,
                            .animate-fade-up, .animate-pop, .skeleton
    page.tsx                Landing. Server component: redirects to /dashboard if session exists,
                            else renders <AuthClient/>
    AuthClient.tsx          Client. Login/Register form + one-click demo/admin login.
                            Auto-runs POST /api/seed on mount. Uses window.location.assign
                            after auth (hard nav — see gotcha #2).
    api/                    ALL backend logic (Route Handlers). See section 6.
    dashboard/
      layout.tsx            SERVER auth guard. Reads cookie, loads user, redirects to "/" if none.
                            Wraps children in <ToastProvider><UserProvider><Shell>.
      page.tsx              Dashboard home widgets (XP bar, stats, daily reward, missions,
                            leaderboard preview, live events).
      play/
        page.tsx            Game arcade hub — grid of game cards linking to [slug].
        [slug]/page.tsx     Server: resolves slug via getGame(), 404 if invalid.
        [slug]/GameRunner.tsx  Client: dynamic-imports the correct game component by slug.
      leaderboard/page.tsx  Searchable global ranking, medals, "you" highlight.
      achievements/page.tsx Uses <CrudManager/>.
      missions/page.tsx     Uses <CrudManager/>.
      events/page.tsx       Uses <CrudManager/>.
      shop/page.tsx         Custom page: buy (all users) + CRUD (admin). NOT CrudManager.
      profile/page.tsx      Edit avatar/username/country, stats, recent scores.
      admin/page.tsx        Admin metrics dashboard (role-gated in UI + API).
  components/
    Shell.tsx               Sidebar nav + topbar + notification center + offline indicator + logout.
                            NAV array defines routes; Admin item filtered unless role==="admin".
    UserContext.tsx         UserProvider + useUser() → { me, loading, refresh, setMe }.
    Toast.tsx               ToastProvider + useToast() → { push(msg, type) }.
    ui.tsx                  Skeleton, SkeletonCard, EmptyState, Modal, ConfirmDialog, Field, inputCls.
    CrudManager.tsx         Reusable generic CRUD grid (search, create/edit modal, optimistic
                            updates + rollback, confirm-delete). Used by achievements/missions/events.
    GameOverlay.tsx         Shared win/lose overlay (score, saving/saved status, Play Again).
    BlockPuzzle.tsx         Game: Grid Block Puzzle (8x8). Takes prop `mode`.
    games/
      MemoryMatch.tsx       Game: flip-card pairs.
      Game2048.tsx          Game: 2048 merge.
      SlidingPuzzle.tsx     Game: 15-puzzle.
      Sudoku.tsx            Game: sudoku UI (logic in lib/sudoku.ts).
      ColorFlood.tsx        Game: flood-fill.
  proxy.ts                  Next 16 Proxy (was middleware). Cookie-presence gate for /dashboard/*
                            (defense in depth; adds ?redirect=<path>). Exports `proxy` (not middleware).
                            Full JWT verify still happens in the layout.
  lib/
    auth.ts                 hashPassword, verifyPassword, createToken, verifyToken, getSession,
                            setSession, clearSession. SESSION_COOKIE = "pu_session". Uses env.jwtSecret.
    env.ts                  Validated env access. Throws in prod if JWT_SECRET missing/<32 chars or
                            DATABASE_URL missing. Exports env.{isProd,databaseUrl,jwtSecret,appName}.
    validation.ts           isEmail, cleanString, toInt, toBool, validateRegister, validateLogin.
    rateLimit.ts            In-memory sliding-window limiter: rateLimit(key,limit,windowMs),
                            clientIp(req), tooManyRequests(). Swap for Redis for multi-instance.
    api.ts                  requireUser(), requireAdmin(), isResponse() guards for route handlers.
    client.ts               api<T>(url, options) typed fetch wrapper; throws Error(data.error).
    levels.ts               levelFromXp(xp), xpProgress(xp). Level N costs N*500 XP (cumulative).
    games.ts                GAMES catalog (slug, title, icon, tagline, description, color, minAge)
                            + getGame(slug).
    sudoku.ts               generate(difficulty), isValid, solver, unique-solution counter.
    useSubmitScore.ts       Client hook: submit({score,lines,combo,mode}) → POST /api/scores,
                            toasts reward, refreshes user. Returns {submit,submitting,saved,reset}.
  db/
    index.ts                Drizzle client + pg Pool (singleton on globalThis in dev).
    schema.ts               7 tables (section 5).
```

---

## 5. Database schema (src/db/schema.ts)

7 tables. All have `id serial PK` and `created_at timestamp default now`.

- **users**: username, email(unique), passwordHash, country(def US), avatar(emoji, def 🦊),
  role('player'|'admin'), xp(0), coins(500), gems(20), level(1), streak(0),
  highScore(0), gamesPlayed(0), wins(0), bestCombo(0).
- **scores**: userId, score, lines(0), combo(0), mode(varchar 30, def 'endless').
  `mode` stores the game slug (e.g. "2048", "sudoku", "memory", "endless").
- **achievements**: title, description, category(def 'general'), icon(🏆), target(1),
  rewardCoins(50), rewardGems(0).
- **missions**: title, description, type('daily'|'weekly'|'monthly'|'seasonal'|'event'),
  target(1), progress(0), rewardXp(100), rewardCoins(50), completed(false).
- **shop_items**: name, description, category('theme'|'effect'|'frame'|'music'|'bundle'),
  icon(🎨), priceCoins(0), priceGems(0), featured(false).
- **notifications**: userId (NULLABLE → null means global/broadcast), title, body,
  type(def 'info'), read(false).
- **events**: title, description, icon(🎉), status('live'|'upcoming'|'ended'),
  startsAt(now), endsAt(nullable), meta(jsonb nullable).

No foreign-key constraints are declared (userId is a plain integer). Relations handled in app code.

---

## 6. API routes (src/app/api/**)

Convention: collection route file `route.ts` handles `GET`/`POST`; item route `[id]/route.ts` handles `PATCH`/`DELETE`. Dynamic params are async: `{ params }: { params: Promise<{ id: string }> }` → `const { id } = await params;`. Responses use `Response.json(...)`.

**Auth (public):**
- `POST /api/auth/register` — {username,email,password,country}. Validates, checks dup email (409),
  hashes pw, random avatar, sets session cookie.
- `POST /api/auth/login` — {email,password}. Verifies, sets session.
- `POST /api/auth/logout` — clears cookie.
- `GET /api/auth/me` — returns user + level progress (or {user:null}).

**Gameplay/progression (require user):**
- `GET /api/scores` — last 20 of current user. `POST /api/scores` — {score,lines,combo,mode}:
  inserts a score AND updates user (xp+=score/10+lines*5, coins+=score/25, highScore=max,
  bestCombo=max, gamesPlayed+1, wins+1 if score>=1000). Returns {gainedXp,gainedCoins,newHighScore}.
- `GET /api/leaderboard` — top 50 users by highScore, each tagged with rank + me flag.
- `POST /api/daily` — grants coins (100 + streak*20) + 2 gems, streak+1, adds a notification.
- `PATCH /api/profile` — update username/country/avatar (avatar validated against allow-list).

**CRUD resources:** `/api/achievements`, `/api/missions`, `/api/shop`, `/api/events`
- `GET` (require user; supports `?q=` search on title/name), `POST`/`PATCH`/`DELETE` **require admin**.
- `POST /api/shop/purchase` — {itemId}: checks funds, deducts coins/gems, adds notification.

**Notifications (require user):**
- `GET /api/notifications` — user's + global (userId null), newest 30.
- `POST /api/notifications` — {action:"markAllRead"}.
- `PATCH/DELETE /api/notifications/[id]` — mark read / delete.

**Admin/system:**
- `GET /api/admin/stats` — counts of all resources + total score (admin only).
- `POST /api/seed` — **idempotent**: no-op if any users exist; otherwise creates admin + demo
  player + 18 bot users + 30+ achievements + 8 missions + 12 shop items + 5 events + notifications.
- `GET /api/health` — `{ ok: true }` after `select 1`.

---

## 7. Auth model (critical)

- JWT signed with `jose` HS256, secret from `process.env.JWT_SECRET` (fallback dev secret).
- Stored in cookie `pu_session`: httpOnly, sameSite=lax, secure in production, 7-day maxAge.
- `getSession()` reads+verifies cookie server-side → `{ userId, username, role } | null`.
- Route guards: `requireUser()` / `requireAdmin()` return the session OR a `Response` (401/403).
  Callers do: `const s = await requireUser(); if (isResponse(s)) return s;`.
- `/dashboard/layout.tsx` is the server-side gate for the whole authenticated area.

---

## 8. The six games

Registry in `src/lib/games.ts` (`GAMES` array). Slugs → routes at `/dashboard/play/<slug>`.
`GameRunner.tsx` dynamic-imports the component matching each slug.

| slug | component | notes |
|------|-----------|-------|
| block-puzzle | BlockPuzzle.tsx | 8×8 place-and-clear; prop `mode="endless"` |
| memory-match | games/MemoryMatch.tsx | 6/8/12 pairs; score = speed+efficiency |
| 2048 | games/Game2048.tsx | rotate-slide-merge engine; keys/WASD/swipe/buttons |
| sliding-puzzle | games/SlidingPuzzle.tsx | 3/4/5 sizes; shuffle from solved = always solvable |
| sudoku | games/Sudoku.tsx | logic in lib/sudoku.ts; unique-solution generator; 3 strikes |
| color-flood | games/ColorFlood.tsx | 14×14 flood-fill within move limit |

**All games submit through `useSubmitScore()`** → `POST /api/scores` with a `mode` = slug. This is the single scoring pipeline; do NOT add a separate scoring path. To add a new game: (1) create the component, (2) add an entry to `GAMES`, (3) add a branch in `GameRunner.tsx`.

Game logic was unit-verified: Sudoku generates unique puzzles (5–22ms), 2048 merges correctly, sliding shuffle is solvable & never pre-solved.

---

## 9. Economy & progression formulas

- **XP per game:** `floor(score/10) + lines*5`
- **Coins per game:** `floor(score/25)`
- **Win:** counted when a single game's score ≥ 1000.
- **Level:** cumulative; level N requires N*500 XP. `xpProgress()` returns {level, into, needed}
  for the progress bar. Level is recomputed on each score submit.
- **Daily reward:** `100 + streak*20` coins + 2 gems; streak increments each claim.
- New users start with 500 coins, 20 gems, level 1.

---

## 10. UI conventions / design system

- Dark theme only. Background uses `.pu-bg` (multi-radial gradient). Panels use `.glass` /
  `.glass-strong` (blur + translucent border).
- Accent gradient: `from-violet-500 to-fuchsia-500`. Success emerald, error rose, info sky.
- Loading = `<Skeleton/>` / `<SkeletonCard/>`. Empty = `<EmptyState/>`. Feedback = `useToast().push`.
- Destructive actions use `<ConfirmDialog/>`. Forms use `<Field/>` + `inputCls`.
- CRUD flows are **optimistic** (update state immediately, roll back + toast on failure).
- Responsive: sidebar is a drawer < lg; games have touch controls.

---

## 11. Demo accounts (seeded)

Password for both: `password123`.
- Admin: `admin@puzzle.dev` (role admin → full CRUD + admin dashboard, avatar 👑).
- Player: `demo@puzzle.dev` (role player).
Login screen has one-click quick-login buttons for both. Seed also creates 18 bot leaderboard
users and sample scores/notifications so the app looks alive immediately.

---

## 12. Known gotchas / lessons learned (READ BEFORE DEBUGGING)

1. **"Login not working" on a fresh DB is almost always missing tables.** On a new sandbox the
   tables don't exist until `npx drizzle-kit push` runs. If auth 500s or logins fail, first check
   `\dt` in psql. Symptoms of empty DB: login returns "Invalid email or password" (demo users
   not seeded yet).
2. **Auth uses hard navigation on purpose.** `AuthClient` (login/register) and `Shell` (logout)
   use `window.location.assign(...)` instead of `router.push + router.refresh` to avoid a race
   where the server layout renders against a stale cookie. Don't "optimize" this back to soft nav.
3. **Login awaits seeding.** `AuthClient` keeps a module-level `seedPromise`; login/quick-login
   `await` it so demo accounts exist before authenticating. Keep this ordering.
4. **CrudManager writes require admin.** Reads work for any user; POST/PATCH/DELETE return 403 for
   players. The UI hides create/edit/delete for non-admins.
5. **Notifications with `userId = null` are global broadcasts** — the GET query ORs user rows with
   null-user rows.
6. **`mode` column is only varchar(30)** — game slugs must stay short.
7. **Seed is idempotent** — it bails if any user exists, so editing seed content won't re-run on a
   populated DB. To re-seed: `TRUNCATE users, scores, achievements, missions, shop_items,
   notifications, events RESTART IDENTITY CASCADE;` then hit `/api/seed`.
8. Dynamic route params are Promises in Next 16 — always `await params`.
9. **Never let env validation hard-crash the running app.** A prior version of `lib/env.ts` threw
   in production when JWT_SECRET was unset; the managed runtime doesn't inject it, so EVERY route
   importing auth 500'd (symptom: "Something went wrong with this response"). Health check still
   passed because it doesn't touch JWT — misleading. Fix: fall back to a generated secret + warn.
   Only DATABASE_URL may throw (the app is unusable without it).

---

## 13. How to extend (common tasks)

- **Add a game:** component in `src/components/games/`, add to `GAMES` (lib/games.ts), add branch in
  `GameRunner.tsx`, submit via `useSubmitScore({..., mode: "<slug>"})`.
- **Add a CRUD resource:** add table in `schema.ts` → `drizzle-kit push`; create
  `api/<name>/route.ts` (GET/POST) + `api/<name>/[id]/route.ts` (PATCH/DELETE) guarded by
  requireUser/requireAdmin; create a page using `<CrudManager/>`; add a NAV entry in `Shell.tsx`.
- **Add a stat/currency:** extend `users` schema, update `/api/scores` update logic and
  `/api/auth/me` + `UserContext` shape.
- Always rerun the full validation sequence (typegen → tsc → build → health) after changes.

---

## 14. Production hardening (implemented)

- **Security headers** in `next.config.ts` (HSTS, X-Frame-Options SAMEORIGIN, nosniff,
  Referrer-Policy, Permissions-Policy). `poweredByHeader:false`, `compress:true`,
  `reactStrictMode:true`, `output:"standalone"` (for Docker).
- **Env access** (`lib/env.ts`) is resilient: DATABASE_URL is required, but a missing JWT_SECRET
  NEVER crashes the app — it falls back to a random per-instance secret and warns (set JWT_SECRET
  for durable/shared sessions). It must not throw at import time (Next evaluates modules at build).
- **Rate limiting** on `/api/auth/login` (10 / 5min / IP) and `/api/auth/register` (5 / 10min / IP)
  → 429 with Retry-After. In-memory (single instance); swap for Redis if scaling out.
- **Input validation/sanitization** on auth routes via `lib/validation.ts` (email format, length
  bounds, control-char stripping, lowercased emails). Generic auth errors prevent user enumeration.
- **Score integrity**: `/api/scores` clamps score/lines/combo to bounds and whitelists `mode`.
- **Proxy** (`src/proxy.ts`, Next 16 middleware replacement) redirects unauthenticated
  `/dashboard/*` to `/` early. Exports `proxy` (renamed from `middleware`).
- **Error/loading/not-found**: root `error.tsx`, `loading.tsx`, `not-found.tsx`, plus
  `dashboard/error.tsx` and `dashboard/loading.tsx`.
- **SEO/PWA**: full metadata (OpenGraph/Twitter) in `layout.tsx`, `robots.ts`, `sitemap.ts`,
  `manifest.ts`, and `public/icon.svg`. Disallows `/dashboard` and `/api` in robots.
- **Health**: `/api/health` returns rich status + DB latency; 503 on failure.
- **DB pool** tuned (max 10, timeouts) in `db/index.ts`.
- **Deploy**: multi-stage `Dockerfile` (non-root, standalone), `.dockerignore`, `.env.example`,
  GitHub Actions CI (`.github/workflows/ci.yml`: postgres service → push schema → typecheck →
  lint → build).

**Env vars:** `DATABASE_URL` (required), `JWT_SECRET` (required in prod, >=32 chars),
`NEXT_PUBLIC_SITE_URL` (SEO), `NEXT_PUBLIC_APP_NAME` (optional).

**Lint note:** the config enforces `react-hooks/set-state-in-effect`. Fetch-on-mount must use the
inline `api(...).then(setState)` pattern (not an awaited named fn) or the linter traces setState.

## 15. Current status

Fully functional and validated: authentication (register/login/logout/admin), all 6 games playable
with scoring, leaderboard, daily rewards, profile editing, shop purchases, full CRUD for
achievements/missions/shop/events, admin dashboard, notifications, and seeded demo data.
`README.md` (root) is the human-facing doc; this file is the AI/developer context brief.
