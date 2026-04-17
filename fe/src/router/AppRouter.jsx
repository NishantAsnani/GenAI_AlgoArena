import { useEffect }                               from 'react'
import { BrowserRouter, Routes, Route, Navigate }  from 'react-router-dom'
import { useAppDispatch, useAppSelector }          from '../hooks/redux'
import { restoreSession, selectToken, selectSessionRestored } from '../store/slices/authSlice'
import LandingPage   from '../pages/LandingPage'
import AuthPage      from '../pages/AuthPage'
import DashboardPage from '../pages/DashboardPage'
import ProfilePage   from '../pages/ProfilePage'

function ProtectedRoute({ children }) {
  const token           = useAppSelector(selectToken)
  const sessionRestored = useAppSelector(selectSessionRestored)
  if (!sessionRestored) return null
  return token ? children : <Navigate to="/auth" replace />
}

function GuestRoute({ children }) {
  const token           = useAppSelector(selectToken)
  const sessionRestored = useAppSelector(selectSessionRestored)
  if (!sessionRestored) return null
  return !token ? children : <Navigate to="/dashboard" replace />
}

export default function AppRouter() {
  const dispatch = useAppDispatch()
  useEffect(() => { dispatch(restoreSession()) }, [dispatch])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/auth"      element={<GuestRoute><AuthPage /></GuestRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
