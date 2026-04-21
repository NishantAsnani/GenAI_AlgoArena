// src/pages/ProblemPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Module: editor
// Split layout: problem description (left) + simple text editor (right)
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate }   from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, Play, Send,
  LayoutDashboard, User, Loader2,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { selectUser }               from '../store/slices/authSlice'
import {
  setCode, setLanguage, resetResults,
  selectCode, selectLanguage,
} from '../store/slices/editorSlice'
import { markProblemSolved }        from '../store/slices/progressSlice'
import { selectAllProblemsFromModules } from '../store/slices/modulesSlice'
import { useTestRunner }            from '../hooks/useTestRunner'
import { PROBLEMS, getProblemById } from '../data/problems'
import { problemApi }               from '../api/auth'
import { getStarterCode, generateStarterCode } from '../utils/starterCode'
import SimpleEditor                 from '../components/editor/SimpleEditor'
import ProblemDescription           from '../components/editor/ProblemDescription'
import TestCasePanel                from '../components/editor/TestCasePanel'
import toast                        from 'react-hot-toast'

// ── Normalize a backend (MongoDB) problem → frontend shape ────────────────────
function normalizeProblem(p) {
  if (!p) return null

  // Already in frontend shape (static PROBLEMS have both fields)
  if (p.sampleTestCases !== undefined && p.description !== undefined) return p

  const testCases = Array.isArray(p.test_cases) ? p.test_cases : []
  const visible   = testCases.filter(tc => !tc.hidden && !tc.is_hidden)
  const hidden    = testCases.filter(tc =>  tc.hidden ||  tc.is_hidden)

  const mapTc = (tc) => ({
    input:    String(tc.input ?? ''),
    expected: String(tc.expected_output ?? tc.expected ?? tc.output ?? ''),
  })

  const sampleTestCases = (visible.length > 0 ? visible : testCases.slice(0, 2)).map(mapTc)
  const hiddenTestCases  = (hidden.length  > 0 ? hidden  : testCases.slice(2)).map(mapTc)

  let constraints = []
  if (Array.isArray(p.constraints)) {
    constraints = p.constraints
  } else if (p.constraints && typeof p.constraints === 'object') {
    constraints = Object.entries(p.constraints).map(([k, v]) => `${k}: ${v}`)
  }

  return {
    id:             String(p._id || p.id),
    title:          p.title        || 'Untitled',
    difficulty:     p.difficulty   || 'Easy',
    tags:           p.tags         || [],
    description:    p.description_md || p.description || '',
    examples:       p.examples     || [],
    constraints,
    sampleTestCases,
    hiddenTestCases,
    // Generate HackerRank-style starter code when backend doesn't provide it
    starterCode:    (p.starterCode || p.starter_code) ?? generateStarterCode(p),
  }
}

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
    dragging.current               = true
    document.body.style.cursor     = 'col-resize'
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
      dragging.current               = false
      document.body.style.cursor     = ''
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

  const storeProblems = useAppSelector(selectAllProblemsFromModules)

  const [problem,     setProblem]     = useState(null)
  const [allProblems, setAllProblems] = useState([])
  // 'loading' | 'found' | 'notfound'
  const [pageState,   setPageState]   = useState('loading')

  // ── Resolve the problem (static → store → API) ────────────────────────────
  useEffect(() => {
    let cancelled = false
    setPageState('loading')
    setProblem(null)

    async function resolve() {
      // 1. Static PROBLEMS array (slug IDs like 'selection-sort')
      const staticP = getProblemById(id)
      if (staticP) {
        if (!cancelled) {
          setProblem(staticP)
          setAllProblems(PROBLEMS)
          setPageState('found')
        }
        return
      }

      // 2. Redux store (already-fetched backend problems)
      if (storeProblems.length > 0) {
        const fromStore = storeProblems.find(p => String(p._id || p.id) === String(id))
        if (fromStore) {
          if (!cancelled) {
            setProblem(normalizeProblem(fromStore))
            setAllProblems(storeProblems)
            setPageState('found')
          }
          return
        }
      }

      // 3. Fetch single problem from API (direct URL / deep link)
      try {
        const res     = await problemApi.getById(id)
        const fetched = res?.data?.data?.problem
        if (fetched && !cancelled) {
          setProblem(normalizeProblem(fetched))
          setAllProblems(prev => (prev.length > 0 ? prev : [fetched]))
          setPageState('found')
          return
        }
      } catch (err) {
        console.error('[ProblemPage] API error:', err?.response?.status, err?.message)
      }

      if (!cancelled) setPageState('notfound')
    }

    resolve()
    return () => { cancelled = true }
  // Only re-run when `id` changes; we read storeProblems at call-time
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Once the store populates (after dashboard fetch), sync allProblems
  useEffect(() => {
    if (storeProblems.length === 0) return
    if (!getProblemById(id)) {
      setAllProblems(storeProblems)
      // Also resolve the problem if we haven't found it yet
      if (pageState !== 'found') {
        const found = storeProblems.find(p => String(p._id || p.id) === String(id))
        if (found) {
          setProblem(normalizeProblem(found))
          setPageState('found')
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeProblems])

  const currentIndex = allProblems.findIndex(p => String(p._id || p.id) === String(id))

  // ── Language / code ────────────────────────────────────────────────────────
  const language = useAppSelector(selectLanguage(id))
  const cached   = useAppSelector(selectCode(id, language))

  // Seed the Redux editor store with generated starter code when problem loads
  useEffect(() => {
    if (!problem || cached) return
    const starter = getStarterCode(problem, language)
    if (starter) dispatch(setCode({ problemId: id, language, code: starter }))
  }, [problem, id, language, cached, dispatch])

  const code = cached ?? (problem ? getStarterCode(problem, language) : '')

  const { pct, containerRef, onMouseDown } = useDivider(42)
  const {
    running, submitting, runResults, submitResult, activeTab, run, submit, setActiveTab
  } = useTestRunner()

  const subKey = `aa_subs_${user?.email}_${id}`
  const [submissions, setSubmissions] = useState(() => {
    try { return JSON.parse(localStorage.getItem(subKey)) || [] } catch { return [] }
  })
  const saveSubmissions = (arr) => {
    setSubmissions(arr)
    localStorage.setItem(subKey, JSON.stringify(arr))
  }

  useEffect(() => { dispatch(resetResults()) }, [id, dispatch])

  // ── Loading ────────────────────────────────────────────────────────────────
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 size={26} className="animate-spin text-orange-400" />
          <span className="text-[14px]">Loading problem…</span>
        </div>
      </div>
    )
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (pageState === 'notfound' || !problem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-[16px] mb-3">Problem not found</p>
          <button
            onClick={() => nav('/dashboard')}
            className="px-4 py-2 rounded-xl bg-black text-white text-[13px] hover:bg-gray-800"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCodeChange = (val) => {
    dispatch(setCode({ problemId: id, language, code: val }))
  }

  const handleLanguageChange = (lang) => {
    dispatch(setLanguage({ problemId: id, language: lang }))
    // Always load fresh starter when switching language
    const starter = getStarterCode(problem, lang)
    dispatch(setCode({ problemId: id, language: lang, code: starter }))
  }

  const handleRun = () => {
    if (!code.trim()) { toast.error('Write some code first!'); return }
    run(code, language, problem)
  }

  const handleSubmit = async () => {
    if (!code.trim()) { toast.error('Write some code first!'); return }
    const result = await submit(code, language, problem)
    if (!result) return

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

  const navPrev = () => {
    if (currentIndex > 0) {
      const prev = allProblems[currentIndex - 1]
      nav(`/problem/${prev._id || prev.id}`)
    }
  }
  const navNext = () => {
    if (currentIndex >= 0 && currentIndex < allProblems.length - 1) {
      const next = allProblems[currentIndex + 1]
      nav(`/problem/${next._id || next.id}`)
    }
  }

  const dc = { Easy: '#16a34a', Medium: '#d97706', Hard: '#dc2626' }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">

      {/* ── Topbar ──────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 bg-white flex-shrink-0 z-30">

        <Logo onClick={() => nav('/dashboard')} />
        <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

        {/* Title + difficulty */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {currentIndex >= 0 && (
            <span className="text-[11px] text-gray-400 flex-shrink-0">#{currentIndex + 1}</span>
          )}
          <span className="text-[13px] font-semibold text-black truncate">{problem.title}</span>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ color: dc[problem.difficulty] || '#16a34a', background: `${dc[problem.difficulty] || '#16a34a'}15` }}
          >
            {problem.difficulty}
          </span>
        </div>

        {/* Prev / Next */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={navPrev} disabled={currentIndex <= 0}
            className="p-1.5 rounded text-gray-400 hover:text-black hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronLeft size={15} />
          </button>
          <span className="text-[11px] text-gray-400 font-mono">
            {currentIndex >= 0 ? `${currentIndex + 1}/${allProblems.length}` : `?/${allProblems.length}`}
          </span>
          <button onClick={navNext} disabled={currentIndex < 0 || currentIndex >= allProblems.length - 1}
            className="p-1.5 rounded text-gray-400 hover:text-black hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

        {/* Run + Submit */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={handleRun} disabled={running || submitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            {running ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
            Run
          </button>
          <button onClick={handleSubmit} disabled={running || submitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-black text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            Submit
          </button>
        </div>

        <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => nav('/dashboard')} title="Dashboard"
            className="p-1.5 rounded text-gray-400 hover:text-black hover:bg-gray-100 transition-all">
            <LayoutDashboard size={15} />
          </button>
          <button onClick={() => nav('/profile')} title="Profile"
            className="p-1.5 rounded text-gray-400 hover:text-black hover:bg-gray-100 transition-all">
            <User size={15} />
          </button>
        </div>
      </header>

      {/* ── Split layout ─────────────────────────────────────────────────── */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden">

        <div className="flex-shrink-0 overflow-hidden border-r border-gray-200" style={{ width: `${pct}%` }}>
          <ProblemDescription
            problem={problem}
            submissions={submissions}
            onDeleteSubmission={handleDeleteSub}
          />
        </div>

        <div onMouseDown={onMouseDown}
          className="w-1 flex-shrink-0 bg-gray-200 hover:bg-orange-400 active:bg-orange-500 cursor-col-resize transition-colors z-10" />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <SimpleEditor
              code={code}
              onChange={handleCodeChange}
              language={language}
              onLanguageChange={handleLanguageChange}
              starterCode={problem.starterCode || generateStarterCode(problem)}
            />
          </div>
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