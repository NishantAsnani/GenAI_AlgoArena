// src/hooks/useTestRunner.js
import { useState } from 'react'
import { submissionApi } from '../api/auth'

const LANG_ID = { C: 50, 'C++': 54, Java: 62, Python: 71 }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function pollUntilDone(submissionId) {
  for (let attempt = 0; attempt < 60; attempt++) {
    await sleep(2000)
    const res = await submissionApi.getById(submissionId)
    const sub = res?.data?.data ?? res?.data
    if (sub?.status && sub.status !== 'Pending') return sub
  }
  throw new Error('Polling timed out')
}

// ── test_results is stored as an array [{stdout,stderr,...}] in DB ────────────
function getOutput(sub) {
  // test_results can be an array (mongoose schema) or a plain object
  const tr = Array.isArray(sub?.test_results)
    ? sub.test_results[0]
    : sub?.test_results
  if (!tr) return ''
  if (tr.compile_output) return `[Compile Error] ${tr.compile_output.trim()}`
  if (tr.stderr)         return `[Runtime Error] ${tr.stderr.trim()}`
  if (tr.stdout)         return tr.stdout.trim()
  return ''
}

// ── Normalise input: "2, 3"  →  "2\n3"  so stdin works for all languages ─────
function normalizeInput(raw) {
  if (!raw) return ''
  // Replace ", " or "," separators with newline so cin/Scanner/input() all work
  return String(raw).replace(/,\s*/g, '\n').trim()
}

async function runOne(code, langId, input, problemId) {
  const payload = { code, language_id: langId, input: normalizeInput(input) }
  if (problemId) payload.problem_id = problemId

  const res = await submissionApi.submit(payload)
  const submissionId =
    res?.data?.data?.submission_id ??
    res?.data?.submission_id

  if (!submissionId) throw new Error('No submission_id returned from server')
  return pollUntilDone(submissionId)
}

export function useTestRunner() {
  const [running,      setRunning]      = useState(false)
  const [submitting,   setSubmitting]   = useState(false)
  const [runResults,   setRunResults]   = useState(null)
  const [submitResult, setSubmitResult] = useState(null)
  const [activeTab,    setActiveTab]    = useState('testcases')

  const run = async (code, language, problem) => {
    setRunning(true)
    setRunResults(null)
    setSubmitResult(null)
    setActiveTab('results')

    const langId = LANG_ID[language] || 71
    const tcs    = problem?.sampleTestCases || []

    try {
      const results = await Promise.all(
        tcs.map(async (tc) => {
          const sub      = await runOne(code, langId, tc.input)
          const actual   = getOutput(sub)
          const expected = String(tc.expected ?? '').trim()
          const passed   = actual === expected
          return {
            input:    String(tc.input ?? ''),
            expected,
            actual,
            passed,
            time: sub?.runtime_ms ? `${sub.runtime_ms}s` : null,
          }
        })
      )
      setRunResults(results)
    } catch (err) {
      console.error('[useTestRunner] run error:', err)
    } finally {
      setRunning(false)
    }
  }

  const submit = async (code, language, problem) => {
    setSubmitting(true)
    setSubmitResult(null)
    setRunResults(null)
    setActiveTab('results')

    const langId    = LANG_ID[language] || 71
    const sampleTCs = problem?.sampleTestCases || []
    const hiddenTCs = problem?.hiddenTestCases  || []
    const allTCs    = [...sampleTCs, ...hiddenTCs]

    try {
      const results = await Promise.all(
        allTCs.map(async (tc, i) => {
          const sub      = await runOne(code, langId, tc.input, i === 0 ? problem?.id : undefined)
          const actual   = getOutput(sub)
          const expected = String(tc.expected ?? '').trim()
          const passed   = actual === expected
          return {
            input:    String(tc.input ?? ''),
            expected,
            actual,
            passed,
            time:     sub?.runtime_ms ? `${sub.runtime_ms}s` : null,
            isHidden: i >= sampleTCs.length,
          }
        })
      )

      const passedCount = results.filter((r) => r.passed).length
      const total       = results.length
      const verdict     = passedCount === total ? 'Accepted' : 'Wrong Answer'

      const result = {
        verdict,
        passed:      passedCount,
        total,
        runtime:     results[0]?.time || '—',
        memory:      '—',
        testResults: results,
      }

      setSubmitResult(result)
      return result
    } catch (err) {
      console.error('[useTestRunner] submit error:', err)
      return null
    } finally {
      setSubmitting(false)
    }
  }

  return {
    running, submitting,
    runResults, submitResult,
    activeTab, setActiveTab,
    run, submit,
  }
}