import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const saveSession = (token, email, profile_pic = '') => {
  localStorage.setItem('aa_token', token)
  localStorage.setItem('aa_user', JSON.stringify({ email, profile_pic }))
}

const clearSession = () => {
  localStorage.removeItem('aa_token')
  localStorage.removeItem('aa_user')
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/user/login`, { email, password })
      const { token, email: userEmail, profile_pic } = data.data
      saveSession(token, userEmail, profile_pic)
      return { user: { email: userEmail, profile_pic }, token }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const signupUser = createAsyncThunk(
  'auth/signup',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/user/signup`, { name, email, password })
      const { token, email: userEmail, profile_pic } = data.data
      saveSession(token, userEmail, profile_pic)
      return { user: { email: userEmail, profile_pic }, token }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/user/generateUrl`)
      const { auth_url } = data.data
      window.location.href = auth_url
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  clearSession()
})

// ── Slice ──────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:    null,
    token:   null,
    loading: false,
    error:   null,
  },
  reducers: {
    clearError(state) { state.error = null },

    setGoogleSession(state, { payload }) {
      state.user    = { email: payload.email, profile_pic: payload.profile_pic }
      state.token   = payload.token
      state.loading = false
      state.error   = null
      saveSession(payload.token, payload.email, payload.profile_pic)
    },
  },
  extraReducers: (builder) => {
    const pending  = (s)              => { s.loading = true;  s.error = null }
    const rejected = (s, a)           => { s.loading = false; s.error = a.payload }
    const session  = (s, { payload }) => {
      s.loading = false
      s.user    = payload.user
      s.token   = payload.token
    }

    builder.addCase(loginUser.pending,        pending)
    builder.addCase(loginUser.fulfilled,      session)
    builder.addCase(loginUser.rejected,       rejected)

    builder.addCase(signupUser.pending,       pending)
    builder.addCase(signupUser.fulfilled,     session)
    builder.addCase(signupUser.rejected,      rejected)

    // loginWithGoogle only shows loading state — the page redirects away
    builder.addCase(loginWithGoogle.pending,  pending)
    builder.addCase(loginWithGoogle.rejected, rejected)

    builder.addCase(logoutUser.fulfilled, (s) => {
      s.user = null; s.token = null; s.loading = false; s.error = null
    })
  },
})

export const { clearError, setGoogleSession } = authSlice.actions
export default authSlice.reducer

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectUser        = (s) => s.auth.user
export const selectAuthLoading = (s) => s.auth.loading
export const selectAuthError   = (s) => s.auth.error
