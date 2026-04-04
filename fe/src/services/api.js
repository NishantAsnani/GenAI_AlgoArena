// src/services/api.js
// ─────────────────────────────────────────────────────────────────────────────
// Axios API Client — CodeForge Backend
//
// CURRENT MODE : Configured but not called (mock mode active in slices)
// BACKEND MODE : Import and call these functions from Redux slices
//               by uncommenting the "BACKEND: Uncomment" sections in:
//               → src/store/slices/authSlice.js
//               → src/store/slices/progressSlice.js
//               → src/hooks/useTestRunner.js
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ── Axios Instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request Interceptor — attach JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cf_token')
    if (token && token !== 'mock-jwt-token') {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor — handle 401 ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cf_token')
      localStorage.removeItem('cf_mock_user')
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

// ── Auth Endpoints ────────────────────────────────────────────────────────────
export const authApi = {
  signup:    (body) => api.post('/auth/signup',     body),
  verifyOtp: (body) => api.post('/auth/verify-otp', body),
  resendOtp: (body) => api.post('/auth/resend-otp', body),
  login:     (body) => api.post('/auth/login',      body),
  google:    (body) => api.post('/auth/google',     body),
  me:        ()     => api.get('/auth/me'),
}

// ── Problems Endpoints ────────────────────────────────────────────────────────
export const problemsApi = {
  list: ()     => api.get('/problems'),
  get:  (slug) => api.get(`/problems/${slug}`),
}

// ── Submissions Endpoints ─────────────────────────────────────────────────────
export const submissionsApi = {
  run:          (body) => api.post('/submissions/run',           body),
  submit:       (body) => api.post('/submissions/submit',        body),
  getByProblem: (id)   => api.get(`/submissions/problem/${id}`),
  getAll:       ()     => api.get('/submissions/all'),
  delete:       (id)   => api.delete(`/submissions/${id}`),
}

// ── Profile Endpoints ─────────────────────────────────────────────────────────
export const profileApi = {
  get:    ()     => api.get('/profile'),
  update: (body) => api.patch('/profile', body),
}

export default api
