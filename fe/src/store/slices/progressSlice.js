import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const storageKey = (email) => `aa_solved_${email}`
const loadSolved = (email) => {
  if (!email) return []
  try { return JSON.parse(localStorage.getItem(storageKey(email))) || [] } catch { return [] }
}
const saveSolved = (email, ids) => {
  if (!email) return
  localStorage.setItem(storageKey(email), JSON.stringify(ids))
}

export const loadUserProgress = createAsyncThunk(
  'progress/load',
  async (email, { rejectWithValue }) => {
    try {
      return loadSolved(email)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const markProblemSolved = createAsyncThunk(
  'progress/markSolved',
  async ({ email, problemId }, { getState, rejectWithValue }) => {
    try {
      const current = getState().progress.solved
      const updated = current.includes(problemId) ? current : [...current, problemId]
      saveSolved(email, updated)
      return updated
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

const progressSlice = createSlice({
  name: 'progress',
  initialState: {
    solved:  [],
    loading: false,
  },
  reducers: {
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

export const selectSolved      = (s) => s.progress.solved
export const selectIsSolved    = (id) => (s) => s.progress.solved.includes(id)
export const selectSolvedCount = (s) => s.progress.solved.length
export const selectTotalCount  = (s) => {
  let total = 0
  for (const mod of (s.modules?.items || [])) {
    for (const lesson of (mod.lessons || [])) {
      total += (lesson.problems || []).length
    }
  }
  return total
}
export const selectPercentage  = (s) => {
  const total = selectTotalCount(s)
  const n     = s.progress.solved.length
  return total === 0 || n === 0 ? 0 : Math.round((n / total) * 100)
}

export default progressSlice.reducer
