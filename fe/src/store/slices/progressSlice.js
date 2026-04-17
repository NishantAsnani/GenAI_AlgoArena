// src/store/slices/progressSlice.js
// ─────────────────────────────────────────────────────────────────────────────
// Progress Slice — tracks solved problems per user (keyed by email)
// CURRENT MODE : localStorage  |  BACKEND MODE: Uncomment "BACKEND:" sections
// ─────────────────────────────────────────────────────────────────────────────
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { PROBLEMS } from '../../data/problems'

// ── localStorage helpers (per-user key so each user has own progress) ────────
const storageKey   = (email) => `aa_solved_${email}`
const loadSolved   = (email) => {
  if (!email) return []
  try { return JSON.parse(localStorage.getItem(storageKey(email))) || [] } catch { return [] }
}
const saveSolved   = (email, ids) => {
  if (!email) return
  localStorage.setItem(storageKey(email), JSON.stringify(ids))
}

// ── LOAD SOLVED (called after login / session restore) ────────────────────────
export const loadUserProgress = createAsyncThunk(
  'progress/load',
  async (email, { rejectWithValue }) => {
    try {
      // BACKEND: Uncomment below & delete localStorage block when backend is ready
      // const { data } = await api.get('/user/progress')
      // return data.solvedIds   // array of problem IDs

      // ── LOCAL ──
      return loadSolved(email)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// ── MARK SOLVED (called after Accepted verdict) ───────────────────────────────
export const markProblemSolved = createAsyncThunk(
  'progress/markSolved',
  async ({ email, problemId }, { getState, rejectWithValue }) => {
    try {
      // BACKEND: Uncomment below when backend is ready
      // await api.post('/user/progress/solved', { problemId })

      // ── LOCAL ──
      const current = getState().progress.solved
      const updated = current.includes(problemId) ? current : [...current, problemId]
      saveSolved(email, updated)
      return updated
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// ── Slice ──────────────────────────────────────────────────────────────────────
const progressSlice = createSlice({
  name: 'progress',
  initialState: {
    solved:  [],   // array of solved problem IDs for current user
    loading: false,
  },
  reducers: {
    // Reset when user logs out
    resetProgress: (state) => {
      state.solved  = []
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserProgress.pending,   (state) => { state.loading = true })
      .addCase(loadUserProgress.rejected,  (state) => { state.loading = false })
      .addCase(loadUserProgress.fulfilled, (state, { payload }) => {
        state.loading = false
        state.solved  = payload
      })

    builder
      .addCase(markProblemSolved.fulfilled, (state, { payload }) => {
        state.solved = payload
      })
  },
})

export const { resetProgress } = progressSlice.actions

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectSolved       = (s) => s.progress.solved
export const selectIsSolved     = (id) => (s) => s.progress.solved.includes(id)
export const selectSolvedCount  = (s) => s.progress.solved.length
export const selectTotalCount   = ()  => PROBLEMS.length
export const selectPercentage   = (s) => {
  const n = s.progress.solved.length
  return n === 0 ? 0 : Math.round((n / PROBLEMS.length) * 100)
}

export default progressSlice.reducer
