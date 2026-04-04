// src/store/index.js
// ─────────────────────────────────────────────────────────────────────────────
// Redux Toolkit Store — CodeForge
// ─────────────────────────────────────────────────────────────────────────────

import { configureStore } from '@reduxjs/toolkit'
import authReducer     from './slices/authSlice'
import progressReducer from './slices/progressSlice'

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    progress: progressReducer,
  },

  // BACKEND: Add redux-persist middleware here when backend is ready
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware({
  //     serializableCheck: {
  //       ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
  //     },
  //   }),

  devTools: import.meta.env.DEV, // Redux DevTools in development only
})

export default store
