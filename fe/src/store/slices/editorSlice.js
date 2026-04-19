// src/store/slices/editorSlice.js
// ─────────────────────────────────────────────────────────────────────────────
// Editor Slice — manages code editor state, run & submit results
// CURRENT MODE : Mock (no backend)
// BACKEND MODE : Uncomment "BACKEND:" sections in useTestRunner.js
// ─────────────────────────────────────────────────────────────────────────────
import { createSlice } from '@reduxjs/toolkit'

const editorSlice = createSlice({
  name: 'editor',
  initialState: {
    // Per-problem code cache: { [problemId]: { [language]: codeString } }
    codeCache:    {},

    // Active language per problem: { [problemId]: language }
    languageCache: {},

    // Run / Submit results
    running:      false,
    submitting:   false,
    runResults:   null,   // array of { input, expected, actual, passed, time }
    submitResult: null,   // { verdict, passed, total, runtime, memory }
    activeTab:    'testcases', // 'testcases' | 'results'
  },
  reducers: {
    // Save code for a problem + language to cache
    setCode: (state, { payload: { problemId, language, code } }) => {
      if (!state.codeCache[problemId]) state.codeCache[problemId] = {}
      state.codeCache[problemId][language] = code
    },

    // Set active language for a problem
    setLanguage: (state, { payload: { problemId, language } }) => {
      state.languageCache[problemId] = language
    },

    // Run state
    setRunning:    (state, { payload }) => { state.running    = payload },
    setSubmitting: (state, { payload }) => { state.submitting = payload },
    setRunResults: (state, { payload }) => {
      state.runResults = payload
      state.activeTab  = 'results'
    },
    setSubmitResult: (state, { payload }) => {
      state.submitResult = payload
      state.activeTab    = 'results'
    },
    setActiveTab: (state, { payload }) => { state.activeTab = payload },

    // Reset results when problem/language changes
    resetResults: (state) => {
      state.running      = false
      state.submitting   = false
      state.runResults   = null
      state.submitResult = null
      state.activeTab    = 'testcases'
    },
  },
})

export const {
  setCode, setLanguage,
  setRunning, setSubmitting,
  setRunResults, setSubmitResult,
  setActiveTab, resetResults,
} = editorSlice.actions

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectCode = (problemId, language) => (s) =>
  s.editor.codeCache[problemId]?.[language] ?? null

export const selectLanguage = (problemId) => (s) =>
  s.editor.languageCache[problemId] ?? 'C++'

export const selectRunning      = (s) => s.editor.running
export const selectSubmitting   = (s) => s.editor.submitting
export const selectRunResults   = (s) => s.editor.runResults
export const selectSubmitResult = (s) => s.editor.submitResult
export const selectActiveTab    = (s) => s.editor.activeTab

export default editorSlice.reducer