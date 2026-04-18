import { configureStore } from '@reduxjs/toolkit'
import authReducer     from './slices/authSlice'
import progressReducer from './slices/progressSlice'
import profileReducer  from './slices/profileSlice'

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    progress: progressReducer,
    profile:  profileReducer,
  },
  devTools: import.meta.env.DEV,
})

export default store
