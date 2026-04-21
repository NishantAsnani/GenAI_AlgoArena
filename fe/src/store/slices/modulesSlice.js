import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { moduleApi } from '../../api/auth'

export const fetchModules = createAsyncThunk(
  'modules/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await moduleApi.getAll()
      return data.data || []
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

const modulesSlice = createSlice({
  name: 'modules',
  initialState: {
    items:   [],
    loading: false,
    error:   null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchModules.pending,   (s)             => { s.loading = true;  s.error = null })
      .addCase(fetchModules.rejected,  (s, { payload }) => { s.loading = false; s.error = payload })
      .addCase(fetchModules.fulfilled, (s, { payload }) => { s.loading = false; s.items = payload })
  },
})

export const selectModules        = (s) => s.modules.items
export const selectModulesLoading = (s) => s.modules.loading

// Flatten all problems out of modules → lessons → problems
export const selectAllProblemsFromModules = (s) => {
  const problems = []
  for (const mod of s.modules.items) {
    for (const lesson of (mod.lessons || [])) {
      for (const problem of (lesson.problems || [])) {
        problems.push(problem)
      }
    }
  }
  return problems
}

export default modulesSlice.reducer
