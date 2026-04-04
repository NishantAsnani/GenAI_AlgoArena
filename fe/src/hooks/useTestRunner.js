// src/hooks/useTestRunner.js
// ─────────────────────────────────────────────────────────────────────────────
// Test Runner Hook — handles Run and Submit code execution
//
// CURRENT MODE : Mock (simulates Judge0 results without backend)
// BACKEND MODE : Uncomment sections marked "BACKEND: Uncomment" below
//               Requires: backend running + Judge0 Docker container running
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react'

// BACKEND: Uncomment this import when backend + Judge0 are ready
// import { submissionsApi } from '../services/api'

// ── Mock result generator ─────────────────────────────────────────────────────
const mockRun = async (code, testCases) => {
  await new Promise(r => setTimeout(r, 1400))
  const hasCode = code.trim().length > 50
  return testCases.map((tc, i) => ({
    ...tc,
    status:        hasCode ? 'Accepted' : i === 0 ? 'Accepted' : 'Wrong Answer',
    actualOutput:  hasCode ? tc.expected : 'null',
    executionTime: `${Math.floor(Math.random() * 50 + 10)}ms`,
    memoryUsed:    `${(Math.random() * 10 + 5).toFixed(1)}MB`,
    passed:        hasCode,
  }))
}

export function useTestRunner() {
  const [running,      setRunning]      = useState(false)
  const [submitting,   setSubmitting]   = useState(false)
  const [runResults,   setRunResults]   = useState(null)
  const [submitResult, setSubmitResult] = useState(null)
  const [activeTab,    setActiveTab]    = useState('testcases')

  // ── RUN: sample test cases only ───────────────────────────────────────────
  const run = useCallback(async (code, language, problem) => {
    setRunning(true)
    setRunResults(null)
    setActiveTab('results')
    try {
      // BACKEND: Uncomment below & remove mock block when backend is ready
      // ─────────────────────────────────────────────────────────────────
      // const data = await submissionsApi.run({ problemId: problem.id, code, language })
      // setRunResults(data.results)
      // ─────────────────────────────────────────────────────────────────

      // ── MOCK ──
      const results = await mockRun(code, problem.sampleTestCases)
      setRunResults(results)
      // ─────────────────────────────────────────────────────────────────
    } catch (err) {
      console.error('Run error:', err)
    } finally {
      setRunning(false)
    }
  }, [])

  // ── SUBMIT: all test cases, returns submission data ───────────────────────
  const submit = useCallback(async (code, language, problem) => {
    setSubmitting(true)
    setSubmitResult(null)
    setActiveTab('results')
    try {
      // BACKEND: Uncomment below & remove mock block when backend is ready
      // ─────────────────────────────────────────────────────────────────
      // const data = await submissionsApi.submit({ problemId: problem.id, code, language })
      // setSubmitResult({
      //   verdict: data.verdict,
      //   passed:  data.passed,
      //   total:   data.total,
      //   results: data.results,
      //   runtime: data.runtime,
      //   memory:  data.memory,
      // })
      // return data   // ← returned to ProblemPage for addSubmission
      // ─────────────────────────────────────────────────────────────────

      // ── MOCK ──
      await new Promise(r => setTimeout(r, 1600))
      const willPass   = code.trim().length > 50
      const allCases   = [...problem.sampleTestCases, ...problem.hiddenTestCases]
      const results    = allCases.map(tc => ({
        ...tc,
        passed:       willPass,
        verdict:      willPass ? 'Accepted' : 'Wrong Answer',
        actualOutput: willPass ? tc.expected : '',
        executionTime:`${Math.floor(Math.random() * 80 + 20)}ms`,
        memoryUsed:   `${Math.floor(Math.random() * 8 + 10)}MB`,
      }))
      const passed  = results.filter(r => r.passed).length
      const verdict = willPass ? 'Accepted' : 'Wrong Answer'
      const runtime = willPass ? `${Math.floor(Math.random() * 80 + 20)}ms` : '—'
      const memory  = willPass ? `${Math.floor(Math.random() * 8 + 10)}MB`  : '—'
      const mockResult = { verdict, passed, total: results.length, results, runtime, memory, language, code }
      setSubmitResult({ verdict, passed, total: results.length, results, runtime, memory })
      return mockResult
      // ─────────────────────────────────────────────────────────────────
    } catch (err) {
      console.error('Submit error:', err)
    } finally {
      setSubmitting(false)
    }
  }, [])

  const reset = useCallback(() => {
    setRunResults(null)
    setSubmitResult(null)
    setActiveTab('testcases')
  }, [])

  return { running, submitting, runResults, submitResult, activeTab, setActiveTab, run, submit, reset }
}
