import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { PROBLEMS } from '../data/problems'
import { submissionsApi, profileApi } from '../services/api'
import { useAuth } from './AuthContext'

const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const { user } = useAuth()
  const [solved, setSolved] = useState(new Set())
  const [submissions, setSubmissions] = useState({}) // { [problemId]: [...] }

  // ── Load solved problems from backend when user logs in ────────────────
  useEffect(() => {
    if (!user) { setSolved(new Set()); setSubmissions({}); return }
    const load = async () => {
      try {
        const { solvedProblemIds } = await profileApi.get()
        setSolved(new Set(solvedProblemIds || []))
      } catch { /* ignore — fall back to empty */ }
    }
    load()
  }, [user?.id])

  const markSolved = useCallback((problemId) => {
    setSolved(prev => new Set([...prev, problemId]))
  }, [])

  const isSolved = useCallback((problemId) => solved.has(problemId), [solved])

  // ── Add submission (called from ProblemPage after API submit) ──────────
  const addSubmission = useCallback((problemId, entry) => {
    // entry comes from the backend response, already shaped correctly
    const record = {
      id: entry.id || Date.now().toString(),
      verdict: entry.verdict,
      language: entry.language,
      code: entry.code,
      date: entry.createdAt
        ? new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      runtime: entry.runtime || '—',
      memory: entry.memory || '—',
      passed: entry.passed,
      total: entry.total,
    }
    setSubmissions(prev => ({
      ...prev,
      [problemId]: [record, ...(prev[problemId] || [])],
    }))
    return record
  }, [])

  const getSubmissions = useCallback((problemId) => submissions[problemId] || [], [submissions])

  // ── Load submissions for a specific problem from backend ───────────────
  const loadSubmissions = useCallback(async (problemId) => {
    try {
      const data = await submissionsApi.getByProblem(problemId)
      const formatted = data.map(s => ({
        id: s.id,
        verdict: s.verdict,
        language: s.language,
        code: s.code,
        date: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        runtime: s.runtime || '—',
        memory: s.memory || '—',
        passed: s.passed,
        total: s.total,
      }))
      setSubmissions(prev => ({ ...prev, [problemId]: formatted }))
    } catch { /* ignore */ }
  }, [])

  // ── Delete submission ──────────────────────────────────────────────────
  const deleteSubmission = useCallback(async (problemId, submissionId) => {
    try {
      await submissionsApi.delete(submissionId)
    } catch { /* ignore */ }
    setSubmissions(prev => ({
      ...prev,
      [problemId]: (prev[problemId] || []).filter(s => s.id !== submissionId),
    }))
  }, [])

  const solvedCount = solved.size
  const totalCount = PROBLEMS.length
  const percentage = Math.round((solvedCount / totalCount) * 100)

  return (
    <ProgressContext.Provider value={{
      solved, markSolved, isSolved, solvedCount, totalCount, percentage,
      submissions, addSubmission, getSubmissions, loadSubmissions, deleteSubmission,
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
