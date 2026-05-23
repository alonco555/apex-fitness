# Apex Fitness — Project Onboarding

## What this is

**Apex** is a dark-themed fitness tracking web app ("Elite Fitness OS"). Users can log workouts, track nutrition and macros, monitor body composition progress, and build weekly training programs. The tagline is "built for athletes who take training seriously."

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.6 (App Router) |
| UI | React 19.2.4 + TypeScript |
| Auth + Backend | Supabase (`@supabase/supabase-js` ^2.106.1) |
| Styling | Inline CSS + CSS custom properties in `globals.css` |
| Fonts | Syne (headings) + DM Sans (body), loaded via Google Fonts |

**Important:** Next.js 16 has breaking changes from earlier versions. Per `AGENTS.md`, read `node_modules/next/dist/docs/` before writing Next.js-specific code. Do not assume Next.js 14/15 conventions apply.

Tailwind CSS is installed as a devDependency but **is not used** — all styles are written as inline `React.CSSProperties` objects or CSS variables.

## Required environment variables

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Create a `.env.local` at the project root with these values from the Supabase project dashboard.

## File structure

```
app/
  globals.css          # CSS variables, animations, base resets
  layout.tsx           # Root layout: loads fonts, sets <html>/<body>
  page.tsx             # Landing/marketing page (redirects to /dashboard if logged in)
  login/page.tsx       # Email+password login
  signup/page.tsx      # 5-step onboarding wizard
  dashboard/
    layout.tsx         # Dashboard sub-layout (wraps authenticated routes)
    page.tsx           # Main dashboard
  workouts/page.tsx    # Gym & cardio logging
  nutrition/page.tsx   # Food & macro tracking
  progress/page.tsx    # Charts: weight, steps, strength, running pace + PRs
  programs/page.tsx    # Weekly training schedule builder
  profile/page.tsx     # Profile editing + achievements

components/
  AppShell.tsx         # Layout wrapper: renders <Sidebar> + <main> with margin-left offset
  Sidebar.tsx          # Fixed 224px left nav with all 6 route links + logout
  Loader.tsx           # Centered spinning loader with optional text

lib/
  supabase.ts          # Supabase client singleton (reads env vars)
  useAuth.ts           # Auth hook — see details below
```

## Auth & user data

`lib/useAuth.ts` is used on every protected page. It:

- Calls `supabase.auth.getSession()` and subscribes to `onAuthStateChange`
- Redirects to `/login` if no session (pass `requireAuth=false` to opt out)
- Exposes `{ user, loading, logout, profile }`
- The `profile` object is derived entirely from Supabase `user_metadata` — no separate DB table

**User metadata fields stored in Supabase (set at signup, editable on `/profile`):**

| Field | Key in metadata | Type |
|---|---|---|
| Full name | `full_name` | string |
| Age | `age` | number |
| Gender | `gender` | `'male'` \| `'female'` |
| Height | `height` | number (cm) |
| Current weight | `weight` | number (kg) |
| Goal weight | `goal_weight` | number (kg) |
| Fitness goal | `fitness_goal` | `fat_loss` \| `muscle_gain` \| `recomp` \| `performance` \| `endurance` |
| Activity level | `activity_level` | `sedentary` \| `lightly_active` \| `moderately_active` \| `very_active` \| `extremely_active` |
| TDEE | `tdee` | number (kcal) |
| Target calories | `target_calories` | number (kcal) |
| Target protein | `target_protein` | number (g) |

TDEE is calculated at signup using the **Mifflin-St Jeor** formula with an activity multiplier.

## Signup flow

5-step wizard at `/signup`:
1. **Account** — name, email, password, confirm password
2. **Body Stats** — age, gender, height, weight, goal weight
3. **Your Goal** — fitness_goal selection
4. **Activity** — activity level + live TDEE preview
5. **Done** — success screen, auto-redirects to `/dashboard` after 2s

## Design system

All CSS values live in `:root` in `globals.css`. Key tokens:

| Token | Value | Use |
|---|---|---|
| `--bg` | `#07070F` | Page background |
| `--surface` | `#111120` | Cards, sidebar |
| `--surface2/3/4` | progressively lighter | Nested surfaces |
| `--accent` | `#C8FF57` | Primary action color (lime green) |
| `--accent2` | `#57C8FF` | Secondary (blue) |
| `--accent3` | `#B457FF` | Tertiary (purple) |
| `--font-head` | Syne | All headings/numbers |
| `--font` | DM Sans | Body text |
| `--sidebar` | `224px` | Sidebar width |
| `--transition` | `all 0.2s cubic-bezier(...)` | Standard transition |

Animations defined in globals.css: `fadeUp`, `fadeIn`, `spin`, `pulse`, `shimmer`, `float`, `blink`.

Utility classes: `.skeleton` (shimmer loading state), `.glass` (glassmorphism card), `.glow-accent`, `.glow-blue`.

## Pages overview

### `/` — Landing page
Marketing hero with animated gradient background and grid overlay. Checks session on mount — authenticated users are immediately redirected to `/dashboard`. Shows feature badges and CTA buttons to `/signup` and `/login`.

### `/dashboard` — Main dashboard
Shows greeting (time-based), goal summary from profile, "Your Plan" stats grid (weight, calories, protein, etc.), and 4 quick-action cards linking to each main section.

### `/workouts` — Workout logging
Three tabs:
- **Gym**: Pick from 5 workout templates (Push/Pull/Legs/Upper/Full Body). Active session tracks sets/reps/weight per exercise with checkboxes. Volume and set count shown in header.
- **Cardio**: Pick from 9 cardio/sport types, log duration/distance/calories/notes.
- **History**: Static mock list of recent sessions.

**Current state:** All data is local React state — nothing is persisted to Supabase. History is hardcoded mock data.

### `/nutrition` — Food tracking
- Macro overview with SVG calorie ring and progress bars for protein/carbs/fat
- 4 meal slots (Breakfast/Lunch/Dinner/Snacks) with "+ Add" button
- Food search modal with 15-item local database, quantity input
- Water intake tracker with +150/250/330/500ml buttons
- Demo log pre-populated at component initialization

**Current state:** All local state, no DB persistence. Food database is hardcoded in-component.

### `/progress` — Progress tracking
- Goal progress bar (start weight → goal weight)
- 4 charts: Weight trend (line), Daily steps (bar), Bench press 1RM (line), Running pace (line)
- Personal records grid (8 PRs displayed)
- Range toggle: 4w / 8w / 12w (UI only, charts use static data)

**Current state:** All data is hardcoded static arrays. No real data is read from or written to Supabase.

### `/programs` — Training schedule
Two tabs:
- **My Program**: 7-day grid (Sun–Sat). Click any day to open a dropdown and assign a workout type. Summary stats (training days, cardio sessions, gym sessions) auto-calculated.
- **Explore**: 4 pre-built program templates (PPL, Upper/Lower, Arnold Split, Marathon) with "Use This Program" button (no-op currently).

**Current state:** Schedule is local state with a default plan (Push/Pull/Legs + cardio). Not persisted.

### `/profile` — Profile editor
- Header card with avatar initial, name, email, goal badge, streak badge, stats (workouts, weight lost, streak)
- Edit form: body stats + goals (saves to Supabase `user_metadata` via `supabase.auth.updateUser`)
- Achievements grid (6 static badges)
- Account info card + sign out button

**This is the only page that writes back to Supabase** (other than auth).

## Patterns to follow

- All pages are `'use client'` components
- Load state: check `loading` from `useAuth()`, return `<Loader text="..."/>` while loading
- Layout: wrap content in `<AppShell>` which renders the sidebar
- Card style: `{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 18 }` — often declared as a `const card: React.CSSProperties` at the bottom of each file
- Inline style objects: most pages use a local `const s` or `const p` record at the bottom for cleaner JSX

## What does NOT exist yet (as of May 2026)

- No Supabase database tables — auth only. Workouts, nutrition logs, progress entries, and programs are all local state.
- No data persistence across sessions for workouts, nutrition, or programs
- No real food database — the 15-item list is hardcoded
- No charts library — progress charts are built with raw SVG
- No mobile layout — designed for desktop/sidebar layout
- No API routes
- Custom workout builder (shows a placeholder card in /workouts)
- "Save Program" button on /programs is a no-op
- "Use This Program" on explore tab is a no-op
- Achievements and streaks are hardcoded display values

## Running the project

```bash
npm run dev    # starts dev server on http://localhost:3000
npm run build  # production build
npm run lint   # ESLint
```
