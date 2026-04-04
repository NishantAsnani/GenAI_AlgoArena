// src/store/slices/progressSlice.js
// ─────────────────────────────────────────────────────────────────────────────
// Progress Slice — handles solved problems, submissions per problem
//
// CURRENT MODE : Mock (works without backend)
// BACKEND MODE : Uncomment sections marked "BACKEND: Uncomment" below
// ─────────────────────────────────────────────────────────────────────────────

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { PROBLEMS } from '../../data/problems'

// BACKEND: Uncomment these imports when backend is ready
// import { submissionsApi, profileApi } from '../../services/api'

// ── Async Thunks ──────────────────────────────────────────────────────────────

// ── LOAD SOLVED PROBLEMS (on login) ──────────────────────────────────────────
export const loadSolvedProblems = createAsyncThunk(
  'progress/loadSolved',
  async (_, { rejectWithValue }) => {
    try {
      // BACKEND: Uncomment below & delete mock block when backend is ready
      // ─────────────────────────────────────────────────────────────────
      // const { solvedProblemIds } = await profileApi.get()
      // return solvedProblemIds || []
      // ─────────────────────────────────────────────────────────────────

      // ── MOCK — no solved problems on fresh load ──
      return []
      // ─────────────────────────────────────────────────────────────────
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// ── LOAD SUBMISSIONS FOR A PROBLEM ────────────────────────────────────────────
export const loadSubmissions = createAsyncThunk(
  'progress/loadSubmissions',
  async (problemId, { rejectWithValue }) => {
    try {
      // BACKEND: Uncomment below & delete mock block when backend is ready
      // ─────────────────────────────────────────────────────────────────
      // const data = await submissionsApi.getByProblem(problemId)
      // const formatted = data.map(s => ({
      //   id:       s.id,
      //   verdict:  s.verdict,
      //   language: s.language,
      //   code:     s.code,
      //   date:     new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      //   runtime:  s.runtime || '—',
      //   memory:   s.memory  || '—',
      //   passed:   s.passed,
      //   total:    s.total,
      // }))
      // return { problemId, submissions: formatted }
      // ─────────────────────────────────────────────────────────────────

      // ── MOCK — return empty (submissions added locally via addSubmission) ──
      return { problemId, submissions: [] }
      // ─────────────────────────────────────────────────────────────────
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// ── DELETE SUBMISSION ─────────────────────────────────────────────────────────
export const deleteSubmissionAsync = createAsyncThunk(
  'progress/deleteSubmission',
  async ({ problemId, submissionId }, { rejectWithValue }) => {
    try {
      // BACKEND: Uncomment below when backend is ready
      // ─────────────────────────────────────────────────────────────────
      // await submissionsApi.delete(submissionId)
      // ─────────────────────────────────────────────────────────────────

      return { problemId, submissionId }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// ── Slice ──────────────────────────────────────────────────────────────────────
const progressSlice = createSlice({
  name: 'progress',
  initialState: {
    solved:      [],    // array of solved problem IDs
    submissions: {},    // { [problemId]: [ { id, verdict, language, code, date, runtime, memory, passed, total } ] }
    loading:     false,
    error:       null,
  },
  reducers: {
    // Mark a problem as solved (called after Accepted submit)
    markSolved: (state, action) => {
      const id = action.payload
      if (!state.solved.includes(id)) {
        state.solved.push(id)
      }
    },

    // Add a new submission record (called from ProblemPage after submit)
    addSubmission: (state, action) => {
      const { problemId, entry } = action.payload
      const record = {
        id:       entry.id || Date.now().toString(),
        verdict:  entry.verdict,
        language: entry.language,
        code:     entry.code,
        date:     entry.createdAt
          ? new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        runtime:  entry.runtime || '—',
        memory:   entry.memory  || '—',
        passed:   entry.passed  ?? 0,
        total:    entry.total   ?? 0,
      }
      if (!state.submissions[problemId]) {
        state.submissions[problemId] = []
      }
      state.submissions[problemId].unshift(record)
    },

    // Reset all progress (on logout)
    resetProgress: (state) => {
      state.solved      = []
      state.submissions = {}
      state.error       = null
    },
  },
  extraReducers: (builder) => {
    // ── Load Solved ──
    builder
      .addCase(loadSolvedProblems.pending,   (state) => { state.loading = true })
      .addCase(loadSolvedProblems.rejected,  (state) => { state.loading = false })
      .addCase(loadSolvedProblems.fulfilled, (state, { payload }) => {
        state.loading = false
        state.solved  = payload
      })

    // ── Load Submissions ──
    builder
      .addCase(loadSubmissions.fulfilled, (state, { payload }) => {
        // Only replace if backend returned data (don't wipe locally added ones)
        if (payload.submissions.length > 0) {
          state.submissions[payload.problemId] = payload.submissions
        }
      })

    // ── Delete Submission ──
    builder
      .addCase(deleteSubmissionAsync.fulfilled, (state, { payload }) => {
        const { problemId, submissionId } = payload
        if (state.submissions[problemId]) {
          state.submissions[problemId] = state.submissions[problemId]
            .filter(s => s.id !== submissionId)
        }
      })
  },
})

export const { markSolved, addSubmission, resetProgress } = progressSlice.actions

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectSolved          = (state) => state.progress.solved
export const selectIsSolved        = (problemId) => (state) => state.progress.solved.includes(problemId)
export const selectSolvedCount     = (state) => state.progress.solved.length
export const selectTotalCount      = ()      => PROBLEMS.length
export const selectPercentage      = (state) => {
  const count = state.progress.solved.length
  return Math.round((count / PROBLEMS.length) * 100)
}
export const selectSubmissions     = (problemId) => (state) => state.progress.submissions[problemId] || []
export const selectProgressLoading = (state) => state.progress.loading

export default progressSlice.reducer
