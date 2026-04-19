// src/store/index.js
import { configureStore } from '@reduxjs/toolkit'
import authReducer     from './slices/authSlice'
import progressReducer from './slices/progressSlice'
import profileReducer  from './slices/profileSlice'
import editorReducer   from './slices/editorSlice'   

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    progress: progressReducer,
    profile:  profileReducer,
    editor:   editorReducer,  
  },
  devTools: import.meta.env.DEV,
})

export default store