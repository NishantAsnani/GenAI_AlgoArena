import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { problemApi } from '../../api/auth'

export const fetchProblems = createAsyncThunk(
  'problems/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await problemApi.getAll()
      return data.data.problems || []
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

const problemsSlice = createSlice({
  name: 'problems',
  initialState: {
    items:   [],
    loading: false,
    error:   null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProblems.pending,   (s)          => { s.loading = true;  s.error = null })
      .addCase(fetchProblems.rejected,  (s, { payload }) => { s.loading = false; s.error = payload })
      .addCase(fetchProblems.fulfilled, (s, { payload }) => {
        s.loading = false
        s.items   = payload
      })
  },
})

export const selectProblems        = (s) => s.problems.items
export const selectProblemsLoading = (s) => s.problems.loading
export const selectProblemsCount   = (s) => s.problems.items.length

export default problemsSlice.reducer
