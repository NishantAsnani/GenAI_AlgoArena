// src/context/AuthContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Auth Context — REDUX BRIDGE
// This file wraps Redux auth state into a React Context so that ALL existing
// page and component files work without ANY changes.
//
// The real logic lives in: src/store/slices/authSlice.js
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import {
  loginUser,
  signupUser,
  verifyOtp,
  resendOtp,
  loginWithGoogle,
  logoutUser,
  restoreSession,
  updateUserProfile,
  patchProfile,
  selectUser,
  selectAuthLoading,
  selectAuthError,
  selectSessionRestored,
} from '../store/slices/authSlice'
import { resetProgress, loadSolvedProblems } from '../store/slices/progressSlice'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const dispatch = useAppDispatch()

  const user             = useAppSelector(selectUser)
  const loading          = useAppSelector(selectAuthLoading)
  const error            = useAppSelector(selectAuthError)
  const sessionRestored  = useAppSelector(selectSessionRestored)

  // ── Restore session on app boot ──────────────────────────────────────────
  useEffect(() => {
    dispatch(restoreSession())
  }, [dispatch])

  // ── Load solved problems when user logs in ───────────────────────────────
  useEffect(() => {
    if (user) dispatch(loadSolvedProblems())
  }, [user?.id, dispatch])

  // ── Auth action wrappers (same API as before — no page changes needed) ───

  const login = async ({ email, password }) => {
    const result = await dispatch(loginUser({ email, password }))
    if (loginUser.fulfilled.match(result)) return { success: true }
    return { success: false, error: result.payload }
  }

  const signup = async ({ name, email, password }) => {
    const result = await dispatch(signupUser({ name, email, password }))
    if (signupUser.fulfilled.match(result)) {
      // Mock skips OTP and logs in directly
      if (result.payload.skippedOtp) return { success: true }
      // BACKEND: Real backend returns pending OTP
      return { success: true, pending: 'otp', email, devOtp: result.payload.devOtp }
    }
    return { success: false, error: result.payload }
  }

  const verifyOtpFn = async ({ email, otp, name }) => {
    const result = await dispatch(verifyOtp({ email, otp, name }))
    if (verifyOtp.fulfilled.match(result)) return { success: true }
    return { success: false, error: result.payload }
  }

  const resendOtpFn = async ({ email }) => {
    await dispatch(resendOtp({ email }))
    return { success: true }
  }

  const loginWithGoogleFn = async (idToken) => {
    const result = await dispatch(loginWithGoogle(idToken))
    if (loginWithGoogle.fulfilled.match(result)) return { success: true }
    return { success: false, error: result.payload }
  }

  const updateProfile = (fields) => {
    dispatch(patchProfile(fields))
    // BACKEND: Also persist to server
    // dispatch(updateUserProfile(fields))
  }

  const logout = () => {
    dispatch(logoutUser())
    dispatch(resetProgress())
  }

  // Expose same shape as before — zero changes needed in pages/components
  return (
    <AuthContext.Provider value={{
      user,
      loading: loading || !sessionRestored,
      error,
      login,
      signup,
      verifyOtp:       verifyOtpFn,
      resendOtp:       resendOtpFn,
      loginWithGoogle: loginWithGoogleFn,
      updateProfile,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
