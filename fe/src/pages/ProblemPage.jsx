// src/pages/ProblemPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Module: editor
// Split layout: problem description (left) + simple text editor (right)
// NEXT STAGE: Replace SimpleEditor with Monaco Editor
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate }  from 'react-router-dom'
import { motion }                  from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Play, Send,
  Check, LayoutDashboard, User,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { selectUser }              from '../store/slices/authSlice'
import {
  setCode, setLanguage, resetResults,
  selectCode, selectLanguage,
} from '../store/slices/editorSlice'
import { markProblemSolved }       from '../store/slices/progressSlice'
import { useTestRunner }           from '../hooks/useTestRunner'
import { PROBLEMS, getProblemById } from '../data/problems'
import SimpleEditor, { LANGUAGES } from '../components/editor/SimpleEditor'
import ProblemDescription          from '../components/editor/ProblemDescription'
import TestCasePanel               from '../components/editor/TestCasePanel'
import toast                       from 'react-hot-toast'

// ── Logo ──────────────────────────────────────────────────────────────────────
function Logo({ onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
        <span className="font-mono text-white text-[12px]">&gt;_</span>
      </div>
      <span className="font-semibold text-[14px] text-black tracking-tight hidden sm:block">
        Code<span className="text-orange-500">Arena</span>
      </span>
    </button>
  )
}

// ── Draggable divider ─────────────────────────────────────────────────────────
function useDivider(initial = 42) {
  const [pct,  setPct]  = useState(initial)
  const dragging        = useRef(false)
  const containerRef    = useRef(null)

  const onMouseDown = useCallback((e) => {
    e.preventDefault()
    dragging.current           = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const p    = ((e.clientX - rect.left) / rect.width) * 100
      setPct(Math.min(Math.max(p, 20), 75))
    }
    const onUp = () => {
      dragging.current           = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [])

  return { pct, containerRef, onMouseDown }
}

// ── ProblemPage ───────────────────────────────────────────────────────────────
export default function ProblemPage() {
  const { id }   = useParams()
  const nav      = useNavigate()
  const dispatch = useAppDispatch()
  const user     = useAppSelector(selectUser)

  const problem      = getProblemById(id)
  const currentIndex = PROBLEMS.findIndex(p => p.id === id)

  const language = useAppSelector(selectLanguage(id))
  const cached   = useAppSelector(selectCode(id, language))
  const code     = cached ?? (problem?.starterCode?.[language] || '')

  const { pct, containerRef, onMouseDown } = useDivider(42)
  const { running, submitting, runResults, submitResult, activeTab, run, submit, setActiveTab } = useTestRunner()

  // Submissions stored locally per user per problem
  const subKey = `aa_subs_${user?.email}_${id}`
  const [submissions, setSubmissions] = useState(() => {
    try { return JSON.parse(localStorage.getItem(subKey)) || [] } catch { return [] }
  })

  const saveSubmissions = (arr) => {
    setSubmissions(arr)
    localStorage.setItem(subKey, JSON.stringify(arr))
  }

  // Reset editor state when navigating to a different problem
  useEffect(() => {
    dispatch(resetResults())
  }, [id, dispatch])

  // Load starter code for language if no cached code yet
  useEffect(() => {
    if (!cached && problem) {
      dispatch(setCode({ problemId: id, language, code: problem.starterCode?.[language] || '' }))
    }
  }, [id, language, cached, problem, dispatch])

  if (!problem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-3">Problem not found</p>
          <button onClick={() => nav('/dashboard')}
            className="px-4 py-2 rounded-lg bg-black text-white text-[13px] hover:bg-gray-800">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleCodeChange = (val) => {
    dispatch(setCode({ problemId: id, language, code: val }))
  }

  const handleLanguageChange = (lang) => {
    dispatch(setLanguage({ problemId: id, language: lang }))
    // Load starter code for new language if no cached version
    const alreadyCached = /* check store */ false
    if (problem.starterCode?.[lang]) {
      dispatch(setCode({ problemId: id, language: lang, code: problem.starterCode[lang] }))
    }
  }

  const handleRun = () => {
    if (!code.trim()) { toast.error('Write some code first!'); return }
    run(code, language, problem)
  }

  const handleSubmit = async () => {
    if (!code.trim()) { toast.error('Write some code first!'); return }
    const result = await submit(code, language, problem)
    if (!result) return

    // Save to local submissions list
    const record = {
      id:      Date.now().toString(),
      verdict: result.verdict,
      language,
      code,
      date:    new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      runtime: result.runtime,
      memory:  result.memory,
      passed:  result.passed,
      total:   result.total,
    }
    saveSubmissions([record, ...submissions])

    if (result.verdict === 'Accepted') {
      dispatch(markProblemSolved({ email: user?.email, problemId: id }))
      toast.success('🎉 Accepted! Problem solved!', { duration: 4000 })
    } else {
      toast.error(`${result.verdict} — ${result.passed}/${result.total} test cases passed`)
    }
  }

  const handleDeleteSub = (subId) => {
    saveSubmissions(submissions.filter(s => s.id !== subId))
  }

  const navPrev = () => { if (currentIndex > 0) nav(`/problem/${PROBLEMS[currentIndex - 1].id}`) }
  const navNext = () => { if (currentIndex < PROBLEMS.length - 1) nav(`/problem/${PROBLEMS[currentIndex + 1].id}`) }

  const dc = { Easy: '#16a34a', Medium: '#d97706', Hard: '#dc2626' }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">

      {/* ── Topbar ──────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-gray-200
        bg-white flex-shrink-0 z-30">

        <Logo onClick={() => nav('/dashboard')} />

        <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

        {/* Problem title + difficulty */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-[11px] text-gray-400 flex-shrink-0">
            #{currentIndex + 1}
          </span>
          <span className="text-[13px] font-semibold text-black truncate">
            {problem.title}
          </span>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
            style={{
              color: dc[problem.difficulty],
              background: `${dc[problem.difficulty]}15`,
            }}
          >
            {problem.difficulty}
          </span>
        </div>

        {/* Prev / Next */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={navPrev} disabled={currentIndex === 0}
            className="p-1.5 rounded text-gray-400 hover:text-black hover:bg-gray-100
              disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronLeft size={15} />
          </button>
          <span className="text-[11px] text-gray-400 font-mono">
            {currentIndex + 1}/{PROBLEMS.length}
          </span>
          <button onClick={navNext} disabled={currentIndex === PROBLEMS.length - 1}
            className="p-1.5 rounded text-gray-400 hover:text-black hover:bg-gray-100
              disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

        {/* Run + Submit */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleRun}
            disabled={running || submitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px]
              font-semibold bg-green-50 border border-green-200 text-green-700
              hover:bg-green-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Play size={12} fill="currentColor" />
            Run
          </button>
          <button
            onClick={handleSubmit}
            disabled={running || submitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px]
              font-semibold bg-black text-white hover:bg-gray-800
              disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Send size={12} />
            Submit
          </button>
        </div>

        <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

        {/* Nav links */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => nav('/dashboard')}
            className="p-1.5 rounded text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
            title="Dashboard">
            <LayoutDashboard size={15} />
          </button>
          <button onClick={() => nav('/profile')}
            className="p-1.5 rounded text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
            title="Profile">
            <User size={15} />
          </button>
        </div>
      </header>

      {/* ── Split layout ─────────────────────────────────────────────────── */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden">

        {/* LEFT — Problem description */}
        <div
          className="flex-shrink-0 overflow-hidden border-r border-gray-200"
          style={{ width: `${pct}%` }}
        >
          <ProblemDescription
            problem={problem}
            submissions={submissions}
            onDeleteSubmission={handleDeleteSub}
          />
        </div>

        {/* Drag handle */}
        <div
          onMouseDown={onMouseDown}
          className="w-1 flex-shrink-0 bg-gray-200 hover:bg-orange-400
            active:bg-orange-500 cursor-col-resize transition-colors z-10"
        />

        {/* RIGHT — Editor + test panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor takes all remaining space above test panel */}
          <div className="flex-1 overflow-hidden">
            <SimpleEditor
              code={code}
              onChange={handleCodeChange}
              language={language}
              onLanguageChange={handleLanguageChange}
              starterCode={problem.starterCode || {}}
            />
          </div>

          {/* Test case panel — fixed height at bottom */}
          <TestCasePanel
            problem={problem}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            runResults={runResults}
            submitResult={submitResult}
            running={running}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  )
}