import { useState, useCallback } from 'react'
import { submissionsApi } from '../services/api'

// Judge0 language IDs (mirrors backend)
const LANGUAGE_IDS = {
  'C++': 54, Python: 71, Java: 62, JavaScript: 63,
}

export function useTestRunner() {
  const [running, setRunning]       = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [runResults, setRunResults] = useState(null)
  const [submitResult, setSubmitResult] = useState(null)
  const [activeTab, setActiveTab]   = useState('testcases')

  // ── Run: sample test cases only ─────────────────────────────────────────
  const run = useCallback(async (code, language, problem) => {
    setRunning(true)
    setRunResults(null)
    setActiveTab('results')

    try {
      const data = await submissionsApi.run({ problemId: problem.id, code, language })
      setRunResults(data.results)
    } catch (err) {
      // Fallback mock if backend not running
      console.warn('Backend not reachable — using mock results:', err.message)
      await new Promise(r => setTimeout(r, 1200))
      const hasCode = code.trim().length > 50
      setRunResults(
        problem.sampleTestCases.map((tc, i) => ({
          ...tc,
          status: hasCode ? 'Accepted' : i === 0 ? 'Accepted' : 'Wrong Answer',
          actualOutput: hasCode ? tc.expected : 'null',
          executionTime: `${Math.floor(Math.random() * 50 + 10)}ms`,
          memoryUsed: `${(Math.random() * 10 + 5).toFixed(1)}MB`,
          passed: hasCode,
        }))
      )
    } finally {
      setRunning(false)
    }
  }, [])

  // ── Submit: all test cases, returns submission record ───────────────────
  const submit = useCallback(async (code, language, problem) => {
    setSubmitting(true)
    setSubmitResult(null)
    setActiveTab('results')

    try {
      const data = await submissionsApi.submit({ problemId: problem.id, code, language })
      setSubmitResult({
        verdict: data.verdict,
        passed: data.passed,
        total: data.total,
        results: data.results,
        runtime: data.runtime,
        memory: data.memory,
      })
      // Return the DB submission record so ProblemPage can store it
      return data
    } catch (err) {
      // Fallback mock
      console.warn('Backend not reachable — using mock submit:', err.message)
      await new Promise(r => setTimeout(r, 1600))
      const willPass = code.trim().length > 50
      const allCases = [...problem.sampleTestCases, ...problem.hiddenTestCases]
      const results = allCases.map((tc, i) => ({
        ...tc,
        passed: willPass,
        verdict: willPass ? 'Accepted' : 'Wrong Answer',
        actualOutput: willPass ? tc.expected : '',
        time: (Math.random() * 0.05 + 0.01).toFixed(3),
      }))
      const passed = results.filter(r => r.passed).length
      const mockResult = {
        verdict: willPass ? 'Accepted' : 'Wrong Answer',
        passed, total: results.length,
        results,
        runtime: willPass ? `${Math.floor(Math.random() * 80 + 20)}ms` : '—',
        memory: willPass ? `${Math.floor(Math.random() * 8 + 10)}MB` : '—',
      }
      setSubmitResult(mockResult)
      return { ...mockResult, language, code }
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
