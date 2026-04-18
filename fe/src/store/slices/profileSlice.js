import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL   = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const profileKey = (email) => `aa_profile_${email}`

const loadLocal = (email) => {
  if (!email) return {}
  try { return JSON.parse(localStorage.getItem(profileKey(email))) || {} } catch { return {} }
}
const saveLocal = (email, data) => {
  if (!email) return
  localStorage.setItem(profileKey(email), JSON.stringify(data))
}

const authHeader = () => {
  const token = localStorage.getItem('aa_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── LOAD PROFILE ──────────────────────────────────────────────────────────────
export const loadUserProfile = createAsyncThunk(
  'profile/load',
  async (email, { rejectWithValue }) => {
    try {
      return loadLocal(email)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const saveUserProfile = createAsyncThunk(
  'profile/save',
  async ({ email, profile }, { rejectWithValue }) => {
    try {
      saveLocal(email, profile)
      return profile
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    data:    {},
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

export const selectProfile        = (s) => s.profile.data
export const selectProfileLoading = (s) => s.profile.loading
export const selectProfileSaving  = (s) => s.profile.saving
export const selectProfileError   = (s) => s.profile.error

export default profileSlice.reducer