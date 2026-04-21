import { configureStore } from '@reduxjs/toolkit'
import authReducer     from './slices/authSlice'
import progressReducer from './slices/progressSlice'
import profileReducer  from './slices/profileSlice'
import editorReducer   from './slices/editorSlice'
import problemsReducer from './slices/problemsSlice'
import modulesReducer  from './slices/modulesSlice'

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    progress: progressReducer,
    profile:  profileReducer,
    editor:   editorReducer,
    problems: problemsReducer,
    modules:  modulesReducer,
  },
  devTools: import.meta.env.DEV,
})

export default store
