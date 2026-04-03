// src/services/api.js
// Centralized API client for CodeForge backend

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

const getToken = () => localStorage.getItem('cf_token')
const setToken = (t) => localStorage.setItem('cf_token', t)
const removeToken = () => localStorage.removeItem('cf_token')

const request = async (method, path, body = null) => {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new ApiError(data.error || data.message || 'Request failed', res.status)
  }

  return data
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  signup:     (body) => request('POST', '/auth/signup', body),
  verifyOtp:  (body) => request('POST', '/auth/verify-otp', body),
  resendOtp:  (body) => request('POST', '/auth/resend-otp', body),
  login:      (body) => request('POST', '/auth/login', body),
  google:     (body) => request('POST', '/auth/google', body),
  me:         ()     => request('GET',  '/auth/me'),
}

// ── Problems ──────────────────────────────────────────────────────────────────
export const problemsApi = {
  list:     ()     => request('GET', '/problems'),
  get:      (slug) => request('GET', `/problems/${slug}`),
}

// ── Submissions ───────────────────────────────────────────────────────────────
export const submissionsApi = {
  run:              (body) => request('POST', '/submissions/run', body),
  submit:           (body) => request('POST', '/submissions/submit', body),
  getByProblem:     (problemId) => request('GET', `/submissions/problem/${problemId}`),
  getAll:           ()          => request('GET', '/submissions/all'),
  delete:           (id)        => request('DELETE', `/submissions/${id}`),
}

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileApi = {
  get:    ()     => request('GET',   '/profile'),
  update: (body) => request('PATCH', '/profile', body),
}

// ── Token helpers (used by contexts) ─────────────────────────────────────────
export { getToken, setToken, removeToken, ApiError }
