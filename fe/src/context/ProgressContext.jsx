// src/context/ProgressContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Progress Context — REDUX BRIDGE
// Wraps Redux progress state into React Context so ALL existing components
// work without any changes.
//
// Real logic lives in: src/store/slices/progressSlice.js
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import {
  markSolved,
  addSubmission,
  deleteSubmissionAsync,
  loadSubmissions,
  selectSolved,
  selectSolvedCount,
  selectPercentage,
} from '../store/slices/progressSlice'
import { PROBLEMS } from '../data/problems'

const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const dispatch    = useAppDispatch()
  const solved      = useAppSelector(selectSolved)
  const solvedCount = useAppSelector(selectSolvedCount)
  const percentage  = useAppSelector(selectPercentage)
  const totalCount  = PROBLEMS.length
  // Read all submissions from store at once
  const allSubmissions = useAppSelector(state => state.progress.submissions)

  const markSolvedFn = useCallback((problemId) => {
    dispatch(markSolved(problemId))
  }, [dispatch])

  const isSolved = useCallback((problemId) => {
    return solved.includes(problemId)
  }, [solved])

  const addSubmissionFn = useCallback((problemId, entry) => {
    dispatch(addSubmission({ problemId, entry }))
  }, [dispatch])

  // Returns array synchronously — no hook inside callback
  const getSubmissions = useCallback((problemId) => {
    return allSubmissions[problemId] || []
  }, [allSubmissions])

  const loadSubmissionsFn = useCallback((problemId) => {
    dispatch(loadSubmissions(problemId))
  }, [dispatch])

  const deleteSubmissionFn = useCallback((problemId, submissionId) => {
    dispatch(deleteSubmissionAsync({ problemId, submissionId }))
  }, [dispatch])

  return (
    <ProgressContext.Provider value={{
      solved,
      solvedCount,
      totalCount,
      percentage,
      markSolved:       markSolvedFn,
      isSolved,
      addSubmission:    addSubmissionFn,
      getSubmissions,
      loadSubmissions:  loadSubmissionsFn,
      deleteSubmission: deleteSubmissionFn,
    }}>
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be inside ProgressProvider')
  return ctx
}
