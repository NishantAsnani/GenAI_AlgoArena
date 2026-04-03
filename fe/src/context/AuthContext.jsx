import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AuthContext = createContext(null)

// ── Check if backend is reachable ─────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const getToken = () => localStorage.getItem('cf_token')
const setToken = (t) => localStorage.setItem('cf_token', t)
const removeToken = () => localStorage.removeItem('cf_token')

const apiRequest = async (method, path, body) => {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API}${path}`, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

// ── Mock fallback (used when backend is unreachable) ──────────────────────
const MOCK_USER = { id: '1', name: 'Umang Varotariya', email: 'umang@codeforge.dev', profile: {} }
const mockLogin = async (email) => {
  await new Promise(r => setTimeout(r, 800))
  return { token: 'mock-token', user: { ...MOCK_USER, email } }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [backendOnline, setBackendOnline] = useState(false)

  // ── Check backend on mount + restore session ───────────────────────────
  useEffect(() => {
    const init = async () => {
      // Ping backend
      try {
        const res = await fetch(`${API.replace('/api', '')}/health`, { signal: AbortSignal.timeout(2000) })
        if (res.ok) setBackendOnline(true)
      } catch { setBackendOnline(false) }

      // Restore session
      const token = getToken()
      if (token && token !== 'mock-token') {
        try {
          const data = await apiRequest('GET', '/auth/me')
          setUser({ id: data.id, name: data.name, email: data.email, profile: data.profile || {} })
        } catch { removeToken() }
      } else if (token === 'mock-token') {
        // Restore mock session
        const saved = localStorage.getItem('cf_mock_user')
        if (saved) setUser(JSON.parse(saved))
      }
      setLoading(false)
    }
    init()
  }, [])

  // ── Login ─────────────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    setLoading(true)
    try {
      if (backendOnline) {
        const data = await apiRequest('POST', '/auth/login', { email, password })
        setToken(data.token)
        setUser({ id: data.user.id, name: data.user.name, email: data.user.email, profile: {} })
      } else {
        // Mock fallback — any email/password works
        const data = await mockLogin(email)
        setToken(data.token)
        const u = { ...data.user, email }
        localStorage.setItem('cf_mock_user', JSON.stringify(u))
        setUser(u)
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    } finally { setLoading(false) }
  }, [backendOnline])

  // ── Google OAuth ──────────────────────────────────────────────────────
  const loginWithGoogle = useCallback(async (idToken) => {
    setLoading(true)
    try {
      if (backendOnline && idToken) {
        const data = await apiRequest('POST', '/auth/google', { idToken })
        setToken(data.token)
        setUser({ id: data.user.id, name: data.user.name, email: data.user.email, profile: {} })
      } else {
        const data = await mockLogin('google@codeforge.dev')
        setToken(data.token)
        localStorage.setItem('cf_mock_user', JSON.stringify(data.user))
        setUser(data.user)
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    } finally { setLoading(false) }
  }, [backendOnline])

  // ── Signup ────────────────────────────────────────────────────────────
  const signup = useCallback(async ({ name, email, password }) => {
    setLoading(true)
    try {
      if (backendOnline) {
        const data = await apiRequest('POST', '/auth/signup', { name, email, password })
        return { success: true, pending: 'otp', email, devOtp: data.devOtp }
      } else {
        // Mock: skip OTP, go straight to login
        await new Promise(r => setTimeout(r, 800))
        const u = { ...MOCK_USER, name, email }
        setToken('mock-token')
        localStorage.setItem('cf_mock_user', JSON.stringify(u))
        setUser(u)
        return { success: true }
      }
    } catch (err) {
      return { success: false, error: err.message }
    } finally { setLoading(false) }
  }, [backendOnline])

  // ── Verify OTP ────────────────────────────────────────────────────────
  const verifyOtp = useCallback(async ({ email, otp, name }) => {
    setLoading(true)
    try {
      if (backendOnline) {
        const data = await apiRequest('POST', '/auth/verify-otp', { email, otp })
        setToken(data.token)
        setUser({ id: data.user.id, name: data.user.name, email: data.user.email, profile: {} })
      } else {
        // Mock: any 6-digit code works
        if (otp.length === 6) {
          const u = { ...MOCK_USER, email }
          setToken('mock-token')
          localStorage.setItem('cf_mock_user', JSON.stringify(u))
          setUser(u)
        } else {
          return { success: false, error: 'Enter a 6-digit code' }
        }
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    } finally { setLoading(false) }
  }, [backendOnline])

  // ── Update profile ────────────────────────────────────────────────────
  const updateProfile = useCallback((fields) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, profile: { ...prev.profile, ...fields } }
      if (fields.name) updated.name = fields.name
      if (prev.id === '1') localStorage.setItem('cf_mock_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  // ── Logout ────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    removeToken()
    localStorage.removeItem('cf_mock_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user, loading, backendOnline,
      login, loginWithGoogle, signup, verifyOtp, updateProfile, logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
