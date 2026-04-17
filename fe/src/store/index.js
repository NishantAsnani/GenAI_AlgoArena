// src/store/index.js
import { configureStore } from '@reduxjs/toolkit'
import authReducer     from './slices/authSlice'
import progressReducer from './slices/progressSlice'   // ← NEW

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    progress: progressReducer,  // ← NEW
  },
  devTools: import.meta.env.DEV,
})

export default store
