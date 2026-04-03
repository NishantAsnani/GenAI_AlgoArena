# CodeForge — Coding Learning Platform

A full-stack coding platform frontend built with React + Vite + Monaco Editor.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open http://localhost:5173
```

## Tech Stack
- **React 18** + **Vite**
- **Monaco Editor** (`@monaco-editor/react`) — VS Code quality IDE
- **Framer Motion** — animations
- **React Router v6** — routing
- **Tailwind CSS** — styling
- **React Hot Toast** — notifications
- **Lucide React** — icons

## Project Structure
```
src/
├── pages/
│   ├── LandingPage.jsx     ← Hero + features + CTA
│   ├── AuthPage.jsx        ← Login / Signup / OTP flow
│   ├── DashboardPage.jsx   ← Folder browser + problem list
│   └── ProblemPage.jsx     ← Split IDE view (main page)
├── components/
│   ├── ui/                 ← Button, Badge, Input, Spinner
│   ├── auth/               ← OtpInput
│   ├── sidebar/            ← Hamburger slide-in panel
│   ├── problem/            ← ProblemDescription panel
│   └── testcases/          ← TestCasePanel with run/submit results
├── context/
│   ├── AuthContext.jsx     ← User session (mock)
│   └── ProgressContext.jsx ← Solved problems tracking
├── hooks/
│   └── useTestRunner.js    ← Mock Judge0 integration
├── data/
│   └── problems.js         ← 8 seeded problems (3-level)
└── router/
    └── AppRouter.jsx
```

## Pages Flow
```
/ (Landing) → /auth (Login/Signup/OTP) → /dashboard → /problem/:id
```

## Auth Flow (Mock)
- **Login**: Any email + password works
- **Signup**: Fills form → OTP screen
- **OTP**: Any 6-digit code works in mock mode
- **Google OAuth**: Instantly logs in (mock)

## Judge0 Integration
Currently mocked in `src/hooks/useTestRunner.js`.

To connect real Judge0:
1. Run Judge0 via Docker: `docker-compose up` (see judge0 repo)
2. In `useTestRunner.js`, uncomment the `realRun` function
3. Replace `mockRun` calls with `realRun`

## Panel Layouts
Top bar has 3 preset toggles:
- **40/60** — More space for description
- **50/50** — Balanced (default)
- **30/70** — More space for editor

## Adding Problems
Edit `src/data/problems.js` — add an object to the `PROBLEMS` array following the existing schema.
