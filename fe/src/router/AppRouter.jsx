// src/router/AppRouter.jsx
import { useEffect }                              from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector }         from '../hooks/redux'
import { restoreSession, selectToken, selectSessionRestored } from '../store/slices/authSlice'
import LandingPage   from '../pages/LandingPage'
import AuthPage      from '../pages/AuthPage'
import DashboardPage from '../pages/DashboardPage'

// ── Protected route — redirects to /auth if no token ─────────────────────────
function ProtectedRoute({ children }) {
  const token            = useAppSelector(selectToken)
  const sessionRestored  = useAppSelector(selectSessionRestored)

  // While session is being restored from localStorage, show nothing
  if (!sessionRestored) return null

  return token ? children : <Navigate to="/auth" replace />
}

// ── Guest route — redirects to /dashboard if already logged in ───────────────
function GuestRoute({ children }) {
  const token           = useAppSelector(selectToken)
  const sessionRestored = useAppSelector(selectSessionRestored)

  if (!sessionRestored) return null

  return !token ? children : <Navigate to="/dashboard" replace />
}

// ── AppRouter ─────────────────────────────────────────────────────────────────
export default function AppRouter() {
  const dispatch = useAppDispatch()

  // Restore session from localStorage on every page load/refresh
  useEffect(() => {
    dispatch(restoreSession())
  }, [dispatch])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"     element={<LandingPage />} />

        {/* Guest only */}
        <Route path="/auth" element={<GuestRoute><AuthPage /></GuestRoute>} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
