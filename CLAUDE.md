# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Next.js version

This project uses **Next.js 16.2.6** with **React 19**. These are newer versions with breaking changes from what training data reflects. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run lint     # ESLint
```

There are no tests configured.

## Environment variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY` (server-side only, for the meal analysis API route)

## Architecture

**Apex** is a fitness-tracking web app (workouts, nutrition, progress, programs, profile). It uses the Next.js App Router with no `pages/` directory.

### Auth & user data

Auth runs through Supabase. The `useAuth` hook (`lib/useAuth.ts`) is the single source of truth for session state. It also derives a `profile` object — **user profile fields (name, weight, goal, targets, etc.) live in Supabase `user_metadata`**, not a separate database table. Updating a profile means calling `supabase.auth.updateUser({ data: {...} })`.

All authenticated pages call `useAuth()` at the top. When `requireAuth=true` (default), unauthenticated users are redirected to `/login` automatically.

### Page structure

- `/` — landing page; redirects to `/dashboard` if already authenticated
- `/login`, `/signup` — auth pages, no AppShell
- `/dashboard`, `/workouts`, `/nutrition`, `/progress`, `/programs`, `/profile` — authenticated pages, all wrapped in `<AppShell>`

Every authenticated page is `'use client'` and follows the pattern:
```tsx
const { loading, profile, user } = useAuth()
if (loading) return <Loader />
return <AppShell>...</AppShell>
```

### Layout components

- `AppShell` (`components/AppShell.tsx`) — flex container: fixed `Sidebar` + scrollable `<main>`
- `Sidebar` (`components/Sidebar.tsx`) — fixed left nav (224px wide, `--sidebar` CSS var), shows nav links and user info from `useAuth`
- `BarcodeScanner` (`components/BarcodeScanner.tsx`) — ZXing-based barcode reader, always loaded with `dynamic(..., { ssr: false })`

### API routes

`app/api/analyze-meal/route.ts` — POST endpoint that accepts a base64 meal photo and returns macro estimates using `claude-sonnet-4-6` via the Anthropic SDK.

### Styling

No Tailwind utility classes are used in components. All styling is **inline styles** via `React.CSSProperties` objects. Design tokens are CSS variables defined in `app/globals.css`:
- Colors: `--bg`, `--surface` through `--surface4`, `--border`, `--border2`, `--border3`
- Accent palette: `--accent` (#C8FF57 lime), `--accent2` (#57C8FF blue), `--accent3` (purple), `--accent4` (orange-red)
- Typography: `--font` (DM Sans, body), `--font-head` (Syne, headings/numbers)
- Animations: `fadeUp`, `fadeIn`, `spin`, `pulse`, `shimmer` are defined globally and used via inline `animation:` styles

When adding UI, use inline styles and reference CSS variables — do not introduce Tailwind classes or a CSS-in-JS library.
