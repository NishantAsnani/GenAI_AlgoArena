import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ── Mock helpers ───────────────────────────────────────────────────────────────
const delay = (ms) => new Promise(r => setTimeout(r, ms))
const MOCK_TOKEN = 'mock-jwt-token'

const saveSession = (user) => {
  localStorage.setItem('aa_token', MOCK_TOKEN)
  localStorage.setItem('aa_user', JSON.stringify(user))
}
const clearSession = () => {
  localStorage.removeItem('aa_token')
  localStorage.removeItem('aa_user')
}

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // BACKEND: const data = await authApi.login({ email, password })
      // BACKEND: saveSession(data.user); return { user: data.user, token: data.token }
      await delay(900)
      const user = { id: '1', name: 'Demo User', email, profile: {} }
      saveSession(user)
      return { user, token: MOCK_TOKEN }
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message)
    }
  }
)

export const signupUser = createAsyncThunk(
  'auth/signup',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      // BACKEND: await authApi.signup({ name, email, password }); return { email, name }
      await delay(1000)
      return { email, name }
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message)
    }
  }
)

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp, name }, { rejectWithValue }) => {
    try {
      // BACKEND: const data = await authApi.verifyOtp({ email, otp })
      // BACKEND: saveSession(data.user); return { user: data.user, token: data.token }
      await delay(800)
      if (otp.length < 6) throw new Error('Invalid OTP')
      const user = { id: '2', name: name || 'New User', email, profile: {} }
      saveSession(user)
      return { user, token: MOCK_TOKEN }
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Invalid OTP')
    }
  }
)

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      // BACKEND: window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`
      await delay(700)
      const user = { id: 'g1', name: 'Google User', email: 'google@example.com', profile: {} }
      saveSession(user)
      return { user, token: MOCK_TOKEN }
    } catch (err) {
      return rejectWithValue(err.message)
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
  },
  extraReducers: (builder) => {
    const pending  = (s)         => { s.loading = true;  s.error = null }
    const rejected = (s, a)      => { s.loading = false; s.error = a.payload }
    const session  = (s, { payload }) => {
      s.loading = false
      s.user    = payload.user
      s.token   = payload.token
    }

    builder.addCase(loginUser.pending,        pending)
    builder.addCase(loginUser.fulfilled,      session)
    builder.addCase(loginUser.rejected,       rejected)

    builder.addCase(signupUser.pending,       pending)
    builder.addCase(signupUser.fulfilled,     (s) => { s.loading = false })
    builder.addCase(signupUser.rejected,      rejected)

    builder.addCase(verifyOtp.pending,        pending)
    builder.addCase(verifyOtp.fulfilled,      session)
    builder.addCase(verifyOtp.rejected,       rejected)

    builder.addCase(loginWithGoogle.pending,  pending)
    builder.addCase(loginWithGoogle.fulfilled,session)
    builder.addCase(loginWithGoogle.rejected, rejected)

    builder.addCase(logoutUser.fulfilled,     (s) => {
      s.user = null; s.token = null; s.loading = false; s.error = null
    })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectUser        = (s) => s.auth.user
export const selectAuthLoading = (s) => s.auth.loading
export const selectAuthError   = (s) => s.auth.error
