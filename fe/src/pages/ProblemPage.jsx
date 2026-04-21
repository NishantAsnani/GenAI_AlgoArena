// src/pages/ProblemPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Module: editor
// Split layout: problem description (left) + Monaco editor (right)
// + slide-in navigation drawer for Modules → Lessons → Problems
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate }   from 'react-router-dom'
import { motion, AnimatePresence }  from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Play, Send,
  LayoutDashboard, User, Loader2,
  Layers, X, ChevronRight as ChevRight,
  BookOpen, CheckCircle,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { selectUser }               from '../store/slices/authSlice'
import {
  setCode, setLanguage, resetResults,
  selectCode, selectLanguage,
} from '../store/slices/editorSlice'
import { markProblemSolved }        from '../store/slices/progressSlice'
import { selectSolved }             from '../store/slices/progressSlice'
import {
  selectAllProblemsFromModules,
  selectModules,
  fetchModules,
  selectModulesLoading,
} from '../store/slices/modulesSlice'
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

// ── Difficulty badge ──────────────────────────────────────────────────────────
const DIFF = {
  Easy:   { text: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  Medium: { text: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  Hard:   { text: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
}

function DiffBadge({ d }) {
  const c = DIFF[d] || DIFF.Easy
  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] font-semibold flex-shrink-0"
      style={{ color: c.text, background: c.bg, border: `1px solid ${c.border}` }}
    >
      {d}
    </span>
  )
}

// ── Navigation drawer ─────────────────────────────────────────────────────────
function NavProblemRow({ problem, isSolved, onNavigate }) {
  const id = problem._id || problem.id
  return (
    <button
      onClick={() => onNavigate(id)}
      className="w-full flex items-center justify-between px-5 py-2 border-b border-gray-100
        last:border-0 hover:bg-orange-50/60 transition-colors text-left group"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-3 h-3 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
          isSolved ? 'bg-green-50 border-green-300' : 'border-gray-300 group-hover:border-orange-300'
        }`}>
          {isSolved && <CheckCircle size={8} className="text-green-600" />}
        </div>
        <span className={`text-[12px] font-medium truncate transition-colors ${
          isSolved ? 'text-gray-400 line-through' : 'text-gray-800 group-hover:text-orange-600'
        }`}>
          {problem.title}
        </span>
      </div>
      <DiffBadge d={problem.difficulty} />
    </button>
  )
}

function NavLessonFolder({ lesson, solved, onNavigate, currentId }) {
  const [open, setOpen] = useState(true)
  const problems   = lesson.problems || []
  const solvedCount = problems.filter(p => solved.includes(p._id || p.id)).length
  const hasActive   = problems.some(p => String(p._id || p.id) === String(currentId))

  // Auto-open if the current problem is in this lesson
  useEffect(() => { if (hasActive) setOpen(true) }, [hasActive])

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50/80 hover:bg-gray-100 transition-colors text-left"
      >
        <BookOpen size={11} className="text-gray-400 flex-shrink-0" />
        <span className="text-[11px] font-semibold text-gray-600 flex-1 truncate">{lesson.title}</span>
        <span className="text-[10px] text-gray-400 flex-shrink-0">{solvedCount}/{problems.length}</span>
        <ChevRight
          size={11}
          className="text-gray-400 flex-shrink-0 transition-transform"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)' }}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.16 }}
            className="overflow-hidden"
          >
            {problems.map(p => (
              <div
                key={p._id || p.id}
                style={
                  String(p._id || p.id) === String(currentId)
                    ? { background: '#fff7ed', borderLeft: '2px solid #f97316' }
                    : {}
                }
              >
                <NavProblemRow
                  problem={p}
                  isSolved={solved.includes(p._id || p.id)}
                  onNavigate={onNavigate}
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NavModuleFolder({ module, solved, onNavigate, currentId }) {
  const lessons     = module.lessons || []
  const allProblems = lessons.flatMap(l => l.problems || [])
  const solvedCount = allProblems.filter(p => solved.includes(p._id || p.id)).length
  const total       = allProblems.length
  const pct         = total ? Math.round((solvedCount / total) * 100) : 0
  const hasActive   = allProblems.some(p => String(p._id || p.id) === String(currentId))
  const [open, setOpen] = useState(true)

  useEffect(() => { if (hasActive) setOpen(true) }, [hasActive])

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden mb-2.5">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[13px] font-semibold text-black truncate">{module.title}</span>
          <span className="text-[11px] text-gray-400 flex-shrink-0">{solvedCount}/{total}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <div className="w-12 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full bg-orange-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <ChevRight
            size={13}
            className="text-gray-400 transition-transform"
            style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)' }}
          />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-t border-gray-100"
          >
            {lessons.length === 0 ? (
              <p className="px-3 py-2 text-[12px] text-gray-400 italic">No lessons yet.</p>
            ) : (
              lessons.map(lesson => (
                <NavLessonFolder
                  key={lesson._id || lesson.id}
                  lesson={lesson}
                  solved={solved}
                  onNavigate={onNavigate}
                  currentId={currentId}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NavigationDrawer({ open, onClose, currentId, onNavigate }) {
  const modules        = useAppSelector(selectModules)
  const solved         = useAppSelector(selectSolved)
  const modulesLoading = useAppSelector(selectModulesLoading)

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 36 }}
            className="fixed top-0 left-0 h-full z-50 flex flex-col bg-white shadow-2xl"
            style={{ width: '300px' }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <Layers size={15} className="text-orange-500" />
                <span className="text-[14px] font-semibold text-black">Problems</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
              >
                <X size={15} />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
              {modulesLoading ? (
                <div className="flex items-center justify-center py-12 text-gray-400 text-[13px] gap-2">
                  <Loader2 size={14} className="animate-spin text-orange-400" />
                  Loading modules…
                </div>
              ) : modules.length === 0 ? (
                <p className="text-center text-[13px] text-gray-400 py-12">No modules found.</p>
              ) : (
                modules.map(mod => (
                  <NavModuleFolder
                    key={mod._id || mod.id}
                    module={mod}
                    solved={solved}
                    onNavigate={(problemId) => { onNavigate(problemId); onClose() }}
                    currentId={currentId}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
  const [pageState,   setPageState]   = useState('loading')
  const [showNav,     setShowNav]     = useState(false)

  // Ensure modules are loaded for the nav drawer
  useEffect(() => { dispatch(fetchModules()) }, [dispatch])

  // ── Resolve the problem (static → store → API) ────────────────────────────
  useEffect(() => {
    let cancelled = false
    setPageState('loading')
    setProblem(null)

    async function resolve() {
      const staticP = getProblemById(id)
      if (staticP) {
        if (!cancelled) {
          setProblem(staticP)
          setAllProblems(PROBLEMS)
          setPageState('found')
        }
        return
      }

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (storeProblems.length === 0) return
    if (!getProblemById(id)) {
      setAllProblems(storeProblems)
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

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCodeChange = (val) => {
    dispatch(setCode({ problemId: id, language, code: val }))
  }

  const handleLanguageChange = (lang) => {
    dispatch(setLanguage({ problemId: id, language: lang }))
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

      {/* ── Navigation Drawer ────────────────────────────────────────────── */}
      <NavigationDrawer
        open={showNav}
        onClose={() => setShowNav(false)}
        currentId={id}
        onNavigate={(problemId) => nav(`/problem/${problemId}`)}
      />

      {/* ── Topbar ──────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 bg-white flex-shrink-0 z-30">

        <Logo onClick={() => nav('/dashboard')} />
        <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

        {/* Browse problems button */}
        <button
          onClick={() => setShowNav(true)}
          title="Browse problems"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium
            text-gray-500 hover:text-black hover:bg-gray-100 transition-all border border-transparent
            hover:border-gray-200 flex-shrink-0"
        >
          <Layers size={13} />
          <span className="hidden sm:block">Problems</span>
        </button>

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