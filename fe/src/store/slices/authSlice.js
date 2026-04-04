// src/store/slices/authSlice.js
// ─────────────────────────────────────────────────────────────────────────────
// Auth Slice — handles login, signup, OTP, Google OAuth, session restore
//
// CURRENT MODE : Mock (works without backend)
// BACKEND MODE : Uncomment sections marked "BACKEND: Uncomment" below
// ─────────────────────────────────────────────────────────────────────────────

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// BACKEND: Uncomment this import when backend is ready
// import { authApi } from '../../services/api'

// ── Mock helpers ──────────────────────────────────────────────────────────────
const delay = (ms) => new Promise(r => setTimeout(r, ms))
const MOCK_TOKEN = 'mock-jwt-token'

const saveMockSession = (user) => {
  localStorage.setItem('cf_token', MOCK_TOKEN)
  localStorage.setItem('cf_mock_user', JSON.stringify(user))
}

const clearSession = () => {
  localStorage.removeItem('cf_token')
  localStorage.removeItem('cf_mock_user')
}

// ── Async Thunks ──────────────────────────────────────────────────────────────

// ── LOGIN ─────────────────────────────────────────────────────────────────────
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // BACKEND: Uncomment below & delete mock block when backend is ready
      // ─────────────────────────────────────────────────────────────────
      // const data = await authApi.login({ email, password })
      // localStorage.setItem('cf_token', data.token)
      // return { user: data.user, token: data.token }
      // ─────────────────────────────────────────────────────────────────

      // ── MOCK (delete this block when backend is ready) ──
      await delay(900)
      const user = { id: '1', name: 'Umang Varotariya', email, profile: {} }
      saveMockSession(user)
      return { user, token: MOCK_TOKEN }
      // ─────────────────────────────────────────────────────────────────
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message)
    }
  }
)

// ── SIGNUP ────────────────────────────────────────────────────────────────────
export const signupUser = createAsyncThunk(
  'auth/signup',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      // BACKEND: Uncomment below & delete mock block when backend is ready
      // ─────────────────────────────────────────────────────────────────
      // const data = await authApi.signup({ name, email, password })
      // return { email, pending: 'otp', devOtp: data.devOtp }
      // ─────────────────────────────────────────────────────────────────

      // ── MOCK ──
      await delay(900)
      // Mock skips OTP — logs in directly
      const user = { id: '1', name, email, profile: {} }
      saveMockSession(user)
      return { user, token: MOCK_TOKEN, skippedOtp: true }
      // ─────────────────────────────────────────────────────────────────
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message)
    }
  }
)

// ── VERIFY OTP ────────────────────────────────────────────────────────────────
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp, name }, { rejectWithValue }) => {
    try {
      // BACKEND: Uncomment below & delete mock block when backend is ready
      // ─────────────────────────────────────────────────────────────────
      // const data = await authApi.verifyOtp({ email, otp })
      // localStorage.setItem('cf_token', data.token)
      // return { user: data.user, token: data.token }
      // ─────────────────────────────────────────────────────────────────

      // ── MOCK — any 6-digit code works ──
      await delay(900)
      if (otp.length !== 6) throw new Error('Enter a 6-digit code')
      const user = { id: '1', name: name || 'User', email, profile: {} }
      saveMockSession(user)
      return { user, token: MOCK_TOKEN }
      // ─────────────────────────────────────────────────────────────────
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message)
    }
  }
)

// ── RESEND OTP ────────────────────────────────────────────────────────────────
export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async ({ email }, { rejectWithValue }) => {
    try {
      // BACKEND: Uncomment below & delete mock block when backend is ready
      // ─────────────────────────────────────────────────────────────────
      // await authApi.resendOtp({ email })
      // return { success: true }
      // ─────────────────────────────────────────────────────────────────

      // ── MOCK ──
      await delay(600)
      return { success: true }
      // ─────────────────────────────────────────────────────────────────
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message)
    }
  }
)

// ── GOOGLE OAUTH ──────────────────────────────────────────────────────────────
export const loginWithGoogle = createAsyncThunk(
  'auth/google',
  async (idToken, { rejectWithValue }) => {
    try {
      // BACKEND: Uncomment below & delete mock block when backend is ready
      // ─────────────────────────────────────────────────────────────────
      // const data = await authApi.google({ idToken })
      // localStorage.setItem('cf_token', data.token)
      // return { user: data.user, token: data.token }
      // ─────────────────────────────────────────────────────────────────

      // ── MOCK ──
      await delay(800)
      const user = { id: '1', name: 'Umang Varotariya', email: 'umang@gmail.com', profile: {} }
      saveMockSession(user)
      return { user, token: MOCK_TOKEN }
      // ─────────────────────────────────────────────────────────────────
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message)
    }
  }
)

// ── RESTORE SESSION ────────────────────────────────────────────────────────────
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('cf_token')
      if (!token) return rejectWithValue('No token')

      // BACKEND: Uncomment below & delete mock block when backend is ready
      // ─────────────────────────────────────────────────────────────────
      // const data = await authApi.me()
      // return { user: { id: data.id, name: data.name, email: data.email, profile: data.profile || {} }, token }
      // ─────────────────────────────────────────────────────────────────

      // ── MOCK ──
      const saved = localStorage.getItem('cf_mock_user')
      if (!saved) return rejectWithValue('No saved user')
      return { user: JSON.parse(saved), token }
      // ─────────────────────────────────────────────────────────────────
    } catch (err) {
      clearSession()
      return rejectWithValue(err.message)
    }
  }
)

// ── UPDATE PROFILE ─────────────────────────────────────────────────────────────
export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (fields, { getState, rejectWithValue }) => {
    try {
      // BACKEND: Uncomment below & delete mock block when backend is ready
      // ─────────────────────────────────────────────────────────────────
      // await profileApi.update(fields)
      // return fields
      // ─────────────────────────────────────────────────────────────────

      // ── MOCK ──
      await delay(900)
      return fields
      // ─────────────────────────────────────────────────────────────────
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message)
    }
  }
)

// ── Slice ──────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:    null,   // { id, name, email, profile }
    token:   null,
    loading: false,
    error:   null,
    sessionRestored: false,
  },
  reducers: {
    // Sync logout
    logoutUser: (state) => {
      clearSession()
      state.user    = null
      state.token   = null
      state.error   = null
    },
    // Clear any error message
    clearError: (state) => { state.error = null },
    // Directly update profile fields in state (used by EditProfilePage)
    patchProfile: (state, action) => {
      if (!state.user) return
      state.user.profile = { ...state.user.profile, ...action.payload }
      if (action.payload.name) state.user.name = action.payload.name
      // Persist mock user update
      if (state.token === MOCK_TOKEN) {
        localStorage.setItem('cf_mock_user', JSON.stringify(state.user))
      }
    },
  },
  extraReducers: (builder) => {
    // ── Helper to set loading/error ──
    const pending  = (state) => { state.loading = true;  state.error = null }
    const rejected = (state, action) => { state.loading = false; state.error = action.payload }

    // ── Login ──
    builder
      .addCase(loginUser.pending,   pending)
      .addCase(loginUser.rejected,  rejected)
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false
        state.user    = payload.user
        state.token   = payload.token
      })

    // ── Signup ──
    builder
      .addCase(signupUser.pending,   pending)
      .addCase(signupUser.rejected,  rejected)
      .addCase(signupUser.fulfilled, (state, { payload }) => {
        state.loading = false
        // If mock skipped OTP, set user directly
        if (payload.skippedOtp) {
          state.user  = payload.user
          state.token = payload.token
        }
        // If real backend: state stays without user (waiting for OTP)
      })

    // ── Verify OTP ──
    builder
      .addCase(verifyOtp.pending,   pending)
      .addCase(verifyOtp.rejected,  rejected)
      .addCase(verifyOtp.fulfilled, (state, { payload }) => {
        state.loading = false
        state.user    = payload.user
        state.token   = payload.token
      })

    // ── Resend OTP ──
    builder
      .addCase(resendOtp.pending,  pending)
      .addCase(resendOtp.rejected, rejected)
      .addCase(resendOtp.fulfilled, (state) => { state.loading = false })

    // ── Google ──
    builder
      .addCase(loginWithGoogle.pending,   pending)
      .addCase(loginWithGoogle.rejected,  rejected)
      .addCase(loginWithGoogle.fulfilled, (state, { payload }) => {
        state.loading = false
        state.user    = payload.user
        state.token   = payload.token
      })

    // ── Restore Session ──
    builder
      .addCase(restoreSession.pending,  (state) => { state.loading = true })
      .addCase(restoreSession.rejected, (state) => { state.loading = false; state.sessionRestored = true })
      .addCase(restoreSession.fulfilled, (state, { payload }) => {
        state.loading         = false
        state.sessionRestored = true
        state.user            = payload.user
        state.token           = payload.token
      })

    // ── Update Profile ──
    builder
      .addCase(updateUserProfile.pending,   pending)
      .addCase(updateUserProfile.rejected,  rejected)
      .addCase(updateUserProfile.fulfilled, (state, { payload }) => {
        state.loading = false
        if (!state.user) return
        state.user.profile = { ...state.user.profile, ...payload }
        if (payload.name) state.user.name = payload.name
        if (state.token === MOCK_TOKEN) {
          localStorage.setItem('cf_mock_user', JSON.stringify(state.user))
        }
      })
  },
})

export const { logoutUser, clearError, patchProfile } = authSlice.actions

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectUser            = (state) => state.auth.user
export const selectToken           = (state) => state.auth.token
export const selectAuthLoading     = (state) => state.auth.loading
export const selectAuthError       = (state) => state.auth.error
export const selectSessionRestored = (state) => state.auth.sessionRestored

export default authSlice.reducer
