// src/store/slices/profileSlice.js
// ─────────────────────────────────────────────────────────────────────────────
// Profile Slice — stores and updates user profile data per user (keyed by email)
// CURRENT MODE : localStorage  |  BACKEND MODE: Uncomment "BACKEND:" sections
// ─────────────────────────────────────────────────────────────────────────────
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const profileKey  = (email) => `aa_profile_${email}`

const loadProfile = (email) => {
  if (!email) return {}
  try { return JSON.parse(localStorage.getItem(profileKey(email))) || {} } catch { return {} }
}
const saveProfile = (email, data) => {
  if (!email) return
  localStorage.setItem(profileKey(email), JSON.stringify(data))
}

// ── LOAD PROFILE ──────────────────────────────────────────────────────────────
export const loadUserProfile = createAsyncThunk(
  'profile/load',
  async (email, { rejectWithValue }) => {
    try {
      // BACKEND: Uncomment below & delete localStorage block when backend is ready
      // const { data } = await api.get('/user/profile')
      // return data.profile

      // ── LOCAL ──
      return loadProfile(email)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// ── SAVE PROFILE ──────────────────────────────────────────────────────────────
export const saveUserProfile = createAsyncThunk(
  'profile/save',
  async ({ email, profile }, { rejectWithValue }) => {
    try {
      // BACKEND: Uncomment below & delete localStorage block when backend is ready
      // const { data } = await api.put('/user/profile', profile)
      // return data.profile

      // ── LOCAL ──
      saveProfile(email, profile)
      return profile
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// ── Slice ──────────────────────────────────────────────────────────────────────
const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    data:    {},     // { location, education, gradYear, mobile, github, linkedin, twitter, leetcode, codeforces, gfg, hackerrank, resume }
    loading: false,
    saving:  false,
    error:   null,
  },
  reducers: {
    resetProfileState: (state) => {
      state.data    = {}
      state.loading = false
      state.saving  = false
      state.error   = null
    },
    // Optimistically patch a single field in state
    patchField: (state, { payload }) => {
      state.data = { ...state.data, ...payload }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserProfile.pending,   (s) => { s.loading = true;  s.error = null })
      .addCase(loadUserProfile.rejected,  (s) => { s.loading = false })
      .addCase(loadUserProfile.fulfilled, (s, { payload }) => {
        s.loading = false
        s.data    = payload
      })

    builder
      .addCase(saveUserProfile.pending,   (s) => { s.saving = true;  s.error = null })
      .addCase(saveUserProfile.rejected,  (s, a) => { s.saving = false; s.error = a.payload })
      .addCase(saveUserProfile.fulfilled, (s, { payload }) => {
        s.saving = false
        s.data   = payload
      })
  },
})

export const { resetProfileState, patchField } = profileSlice.actions

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectProfile        = (s) => s.profile.data
export const selectProfileLoading = (s) => s.profile.loading
export const selectProfileSaving  = (s) => s.profile.saving
export const selectProfileError   = (s) => s.profile.error

export default profileSlice.reducer
