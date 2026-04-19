// src/hooks/useTestRunner.js
// ─────────────────────────────────────────────────────────────────────────────
// Test Runner Hook — handles Run and Submit with mock execution
// CURRENT MODE : Mock  |  BACKEND MODE : Uncomment "BACKEND:" sections
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import {
  setRunning, setSubmitting,
  setRunResults, setSubmitResult,
  selectRunning, selectSubmitting,
  selectRunResults, selectSubmitResult,
  selectActiveTab, setActiveTab,
} from '../store/slices/editorSlice'

// BACKEND: Uncomment when backend + Judge0 are ready
// import axios from 'axios'
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
// const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('aa_token')}` })

// ── Mock delay ────────────────────────────────────────────────────────────────
const delay = (ms) => new Promise(r => setTimeout(r, ms))

// ── Mock execution logic ──────────────────────────────────────────────────────
// Passes if code.trim().length > 50 chars (replace with real Judge0 call)
const mockExecute = async (code, testCases) => {
  await delay(1200)
  const passes = code.trim().length > 50
  return testCases.map((tc, i) => ({
    input:    tc.input,
    expected: tc.expected,
    actual:   passes ? tc.expected : (i === 0 ? tc.expected : 'null'),
    passed:   passes ? true : i === 0,
    time:     `${Math.floor(Math.random() * 60 + 10)}ms`,
    memory:   `${(Math.random() * 8 + 8).toFixed(1)}MB`,
  }))
}

export function useTestRunner() {
  const dispatch     = useAppDispatch()
  const running      = useAppSelector(selectRunning)
  const submitting   = useAppSelector(selectSubmitting)
  const runResults   = useAppSelector(selectRunResults)
  const submitResult = useAppSelector(selectSubmitResult)
  const activeTab    = useAppSelector(selectActiveTab)

  // ── RUN: sample test cases only ──────────────────────────────────────────
  const run = useCallback(async (code, language, problem) => {
    if (!code.trim()) return
    dispatch(setRunning(true))
    dispatch(setActiveTab('results'))

    try {
      // BACKEND: Uncomment below & delete mock block when backend is ready
      // ─────────────────────────────────────────────────────────────────
      // const { data } = await axios.post(`${API_URL}/submissions/run`, {
      //   problem_id: problem.id,
      //   language,
      //   code,
      // }, { headers: authHeader() })
      // dispatch(setRunResults(data.data.results))
      // ─────────────────────────────────────────────────────────────────

      // ── MOCK ──
      const results = await mockExecute(code, problem.sampleTestCases)
      dispatch(setRunResults(results))

    } catch (err) {
      console.error('Run error:', err)
    } finally {
      dispatch(setRunning(false))
    }
  }, [dispatch])

  // ── SUBMIT: all test cases, returns result ────────────────────────────────
  const submit = useCallback(async (code, language, problem) => {
    if (!code.trim()) return null
    dispatch(setSubmitting(true))
    dispatch(setActiveTab('results'))

    try {
      // BACKEND: Uncomment below & delete mock block when backend is ready
      // ─────────────────────────────────────────────────────────────────
      // const { data } = await axios.post(`${API_URL}/submissions/submit`, {
      //   problem_id: problem.id,
      //   language,
      //   code,
      // }, { headers: authHeader() })
      // const result = {
      //   verdict: data.data.status,
      //   passed:  data.data.passed_count,
      //   total:   data.data.total_count,
      //   runtime: data.data.runtime_ms ? `${data.data.runtime_ms}ms` : '—',
      //   memory:  data.data.memory_kb  ? `${data.data.memory_kb}KB`  : '—',
      //   submissionId: data.data._id,
      // }
      // dispatch(setSubmitResult(result))
      // return result
      // ─────────────────────────────────────────────────────────────────

      // ── MOCK ──
      await delay(1600)
      const willPass  = code.trim().length > 50
      const allCases  = [...problem.sampleTestCases, ...(problem.hiddenTestCases || [])]
      const passed    = willPass ? allCases.length : Math.floor(allCases.length * 0.4)
      const result    = {
        verdict:  willPass ? 'Accepted' : 'Wrong Answer',
        passed,
        total:    allCases.length,
        runtime:  willPass ? `${Math.floor(Math.random() * 80 + 20)}ms` : '—',
        memory:   willPass ? `${Math.floor(Math.random() * 8 + 10)}MB`  : '—',
      }
      dispatch(setSubmitResult(result))
      return result

    } catch (err) {
      console.error('Submit error:', err)
      return null
    } finally {
      dispatch(setSubmitting(false))
    }
  }, [dispatch])

  // ── Reset results ─────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    dispatch(setActiveTab('testcases'))
  }, [dispatch])

  return {
    running, submitting,
    runResults, submitResult,
    activeTab,
    run, submit, reset,
    setActiveTab: (tab) => dispatch(setActiveTab(tab)),
  }
}