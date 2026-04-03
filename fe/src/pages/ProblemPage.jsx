import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import {
  Menu, Play, Send, ChevronLeft, ChevronRight, Code2, RotateCcw,
  Copy, Check, LogOut, Bot, X, Sparkles, User, Loader2, Minimize2,
  Maximize2, GripVertical
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../context/ProgressContext'
import { useTestRunner } from '../hooks/useTestRunner'
import { getProblemById, PROBLEMS, LANGUAGES } from '../data/problems'
import Sidebar from '../components/sidebar/Sidebar'
import ProblemDescription from '../components/problem/ProblemDescription'
import TestCasePanel from '../components/testcases/TestCasePanel'
import { Button, DifficultyBadge } from '../components/ui'
import toast from 'react-hot-toast'

// ── AI Chat Panel ─────────────────────────────────────────────────────────────
function AIChatPanel({ problem, code, language, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm your AI coding assistant 🤖\n\nI can see you're working on **${problem.title}**. Ask me anything:\n- 💡 Hints without spoilers\n- 🐛 Debug your code\n- 📚 Explain concepts\n- ⚡ Optimize your solution`,
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg = { role: 'user', content: text }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setLoading(true)

    try {
      const history = updated.slice(1).map(m => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are an expert competitive programming assistant embedded inside CodeForge, a coding platform.

Problem the user is solving: "${problem.title}" (${problem.difficulty})
Problem description: ${problem.description?.slice(0, 400)}
Current language: ${language}
Current code:
\`\`\`${language}
${code || '// (empty)'}
\`\`\`

Guidelines:
- Be concise and helpful. Use markdown formatting.
- Give hints before full solutions — don't spoil unless asked.
- When showing code use proper \`\`\`language blocks.
- Keep answers focused on the problem at hand.`,
          messages: history,
        }),
      })

      const data = await res.json()
      const reply = data.content?.map(b => b.text || '').join('') || 'Sorry, I had trouble responding.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Connection error. Please try again.' }])
    }
    setLoading(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  // Simple markdown renderer for chat
  const renderMessage = (text) => {
    const lines = text.split('\n')
    const result = []
    let inCode = false
    let codeLang = ''
    let codeLines = []
    let key = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.startsWith('```')) {
        if (!inCode) { inCode = true; codeLang = line.slice(3); codeLines = [] }
        else {
          result.push(
            <div key={key++} className="my-2 rounded-lg overflow-hidden border border-[#2a2a3a]">
              {codeLang && (
                <div className="px-3 py-1 bg-[#1a1a28] text-[10px] font-mono text-[#4b4b6a] border-b border-[#2a2a3a]">
                  {codeLang}
                </div>
              )}
              <pre className="p-3 text-xs font-mono text-[#c0c0d0] bg-[#0d0d15] overflow-x-auto leading-relaxed">
                {codeLines.join('\n')}
              </pre>
            </div>
          )
          inCode = false; codeLines = []
        }
        continue
      }
      if (inCode) { codeLines.push(line); continue }

      // Bold + inline code
      const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
      const rendered = parts.map((p, pi) => {
        if (p.startsWith('**') && p.endsWith('**'))
          return <strong key={pi} className="text-white font-semibold">{p.slice(2, -2)}</strong>
        if (p.startsWith('`') && p.endsWith('`'))
          return <code key={pi} className="px-1 rounded bg-[#1a1a2e] text-blue-300 font-mono text-[11px]">{p.slice(1, -1)}</code>
        return p
      })

      if (line.startsWith('- ') || line.startsWith('• '))
        result.push(<div key={key++} className="flex gap-2 text-sm text-[#c0c0d0] leading-relaxed">
          <span className="text-[#3a3a5a] mt-1 flex-shrink-0">•</span>
          <span>{rendered.map((r, ri) => typeof r === 'string' ? r.slice(ri === 0 ? 2 : 0) : r)}</span>
        </div>)
      else if (line === '')
        result.push(<div key={key++} className="h-1.5" />)
      else
        result.push(<p key={key++} className="text-sm text-[#c0c0d0] leading-relaxed">{rendered}</p>)
    }
    return result
  }

  const QUICK_PROMPTS = [
    'Give me a hint 💡',
    'Debug my code 🐛',
    'Explain the approach 📚',
    'What is the time complexity? ⚡',
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-20 right-5 z-50 flex flex-col rounded-2xl border border-[#1e1e2e] shadow-2xl overflow-hidden"
      style={{
        width: minimized ? 280 : 380,
        height: minimized ? 'auto' : 520,
        background: '#0d0d15',
        boxShadow: '0 25px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(59,130,246,0.1)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#1e1e2e] flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #111128 100%)' }}>
        <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30
          flex items-center justify-center flex-shrink-0">
          <Sparkles size={13} className="text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white">AI Assistant</p>
          <p className="text-[10px] text-[#4b4b6a] truncate">{problem.title}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMinimized(m => !m)}
            className="p-1.5 rounded-lg text-[#4b4b6a] hover:text-white hover:bg-white/5 transition-all">
            {minimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
          </button>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-[#4b4b6a] hover:text-red-400 hover:bg-red-500/10 transition-all">
            <X size={12} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                  ${msg.role === 'assistant'
                    ? 'bg-blue-500/20 border border-blue-500/30'
                    : 'bg-[#1e1e2e] border border-[#2a2a3a]'
                  }`}>
                  {msg.role === 'assistant'
                    ? <Bot size={11} className="text-blue-400" />
                    : <User size={11} className="text-[#6b7280]" />
                  }
                </div>
                <div className={`max-w-[85%] rounded-xl px-3 py-2.5 text-left
                  ${msg.role === 'assistant'
                    ? 'bg-[#111118] border border-[#1e1e2e]'
                    : 'bg-blue-500/15 border border-blue-500/20'
                  }`}>
                  {msg.role === 'user'
                    ? <p className="text-sm text-[#e2e2e8] leading-relaxed">{msg.content}</p>
                    : <div className="space-y-0.5">{renderMessage(msg.content)}</div>
                  }
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30
                  flex items-center justify-center flex-shrink-0">
                  <Bot size={11} className="text-blue-400" />
                </div>
                <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map(q => (
                <button key={q} onClick={() => { setInput(q); inputRef.current?.focus() }}
                  className="px-2.5 py-1 rounded-lg bg-[#16161f] border border-[#1e1e2e] text-[11px]
                    text-[#8888aa] hover:text-white hover:border-blue-500/30 hover:bg-[#1a1a28] transition-all">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-end gap-2 px-3 py-3 border-t border-[#1e1e2e] flex-shrink-0">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything about this problem..."
              rows={1}
              className="flex-1 bg-[#111118] border border-[#1e1e2e] rounded-xl px-3 py-2.5
                text-xs text-[#e2e2e8] placeholder-[#2a2a4a] outline-none resize-none
                focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 transition-all"
              style={{ maxHeight: 80, minHeight: 36 }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl bg-blue-500 hover:bg-blue-600 flex items-center justify-center
                disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-lg shadow-blue-500/20"
            >
              {loading ? <Loader2 size={13} className="text-white animate-spin" /> : <Send size={13} className="text-white" />}
            </button>
          </div>
        </>
      )}
    </motion.div>
  )
}

// ── Draggable Divider ─────────────────────────────────────────────────────────
function useDraggableDivider(initial = 42) {
  const [leftPct, setLeftPct] = useState(initial)
  const dragging = useRef(false)
  const containerRef = useRef(null)

  const onMouseDown = useCallback((e) => {
    e.preventDefault()
    dragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const pct = (x / rect.width) * 100
      setLeftPct(Math.min(Math.max(pct, 20), 75))
    }
    const onUp = () => {
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  return { leftPct, containerRef, onMouseDown }
}

// ── Main ProblemPage ──────────────────────────────────────────────────────────
export default function ProblemPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { user, logout } = useAuth()
  const { isSolved, markSolved, solvedCount, totalCount, addSubmission, getSubmissions, deleteSubmission, loadSubmissions } = useProgress()

  const problem = getProblemById(id)
  const currentIndex = PROBLEMS.findIndex(p => p.id === id)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [language, setLanguage] = useState('C++')
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [justAccepted, setJustAccepted] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  const { leftPct, containerRef, onMouseDown } = useDraggableDivider(42)
  const { running, submitting, runResults, submitResult, activeTab, setActiveTab, run, submit, reset } = useTestRunner()

  useEffect(() => {
    if (problem) { setCode(problem.starterCode[language] || ''); reset(); setJustAccepted(false) }
  }, [problem?.id, language])

  // Load past submissions for this problem from backend
  useEffect(() => {
    if (problem) loadSubmissions(problem.id)
  }, [problem?.id])

  if (!problem) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#4b4b6a] mb-4">Problem not found</p>
          <Button variant="primary" onClick={() => nav('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  const solved = isSolved(problem.id)

  const handleRun = () => {
    if (!code.trim()) { toast.error('Write some code first!'); return }
    run(code, language, problem)
  }

  const handleSubmit = async () => {
    if (!code.trim()) { toast.error('Write some code first!'); return }
    await submit(code, language, problem)
    setTimeout(() => {
      const willPass = code.trim().length > 50
      const verdict = willPass ? 'Accepted' : 'Wrong Answer'
      addSubmission(problem.id, {
        verdict, language, code,
        runtime: willPass ? `${Math.floor(Math.random() * 80 + 20)}ms` : '—',
        memory: willPass ? `${Math.floor(Math.random() * 8 + 10)}MB` : '—',
        passed: willPass ? problem.hiddenTestCases?.length || 5 : Math.floor(Math.random() * 3),
        total: problem.hiddenTestCases?.length || 5,
      })
      if (willPass) { markSolved(problem.id); setJustAccepted(true); toast.success('🎉 Accepted! Problem solved!', { duration: 4000 }) }
      else toast.error('Wrong Answer. Keep trying!')
    }, 1600)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    toast.success('Code copied!')
  }

  const handleReset = () => { setCode(problem.starterCode[language] || ''); reset(); toast.success('Code reset to starter template') }

  const navPrev = () => { if (currentIndex > 0) nav(`/problem/${PROBLEMS[currentIndex - 1].id}`) }
  const navNext = () => { if (currentIndex < PROBLEMS.length - 1) nav(`/problem/${PROBLEMS[currentIndex + 1].id}`) }

  const monacoLang = { 'C++': 'cpp', Python: 'python', Java: 'java', JavaScript: 'javascript' }[language]

  return (
    <div className="h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">
      {/* ── TOP BAR ───────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-3 py-2 border-b border-[#1e1e2e] bg-[#0d0d15] flex-shrink-0 z-30">
        <button onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded-lg text-[#6b7280] hover:text-white hover:bg-white/5 transition-all flex-shrink-0">
          <Menu size={18} />
        </button>

        <button onClick={() => nav('/dashboard')} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
            <Code2 size={13} className="text-white" />
          </div>
          <span className="font-display font-bold text-sm text-white hidden sm:block">CodeForge</span>
        </button>

        <div className="w-px h-5 bg-[#1e1e2e] flex-shrink-0" />

        {/* Problem title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-xs text-[#4b4b6a] flex-shrink-0">#{currentIndex + 1}</span>
          <span className="text-sm font-medium text-[#e2e2e8] truncate">{problem.title}</span>
          <DifficultyBadge difficulty={problem.difficulty} />
          {(solved || justAccepted) && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
              <Check size={10} className="text-green-400" />
              <span className="text-[10px] text-green-400 font-medium">Solved</span>
            </motion.div>
          )}
        </div>

        {/* Prev / Next */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={navPrev} disabled={currentIndex === 0}
            className="p-1.5 rounded text-[#4b4b6a] hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs text-[#4b4b6a]">{currentIndex + 1}/{PROBLEMS.length}</span>
          <button onClick={navNext} disabled={currentIndex === PROBLEMS.length - 1}
            className="p-1.5 rounded text-[#4b4b6a] hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="w-px h-5 bg-[#1e1e2e] flex-shrink-0" />

        {/* Language selector */}
        <select value={language} onChange={e => setLanguage(e.target.value)}
          className="text-xs bg-[#16161f] border border-[#1e1e2e] text-[#c0c0d0] rounded-lg px-2 py-1.5 outline-none focus:border-blue-500/40 cursor-pointer flex-shrink-0">
          {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        {/* Run + Submit */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={handleRun} disabled={running || submitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1a2e1a] hover:bg-[#1f381f] border border-green-500/25 hover:border-green-500/50 text-green-400 hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            <Play size={12} fill="currentColor" />
            Run
          </button>
          <button onClick={handleSubmit} disabled={running || submitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20">
            <Send size={12} />
            Submit
          </button>
        </div>

        {/* Progress + logout */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-xs text-[#4b4b6a] hidden md:block">
            <span className="text-white">{solvedCount}</span>/{totalCount}
          </div>
          <button onClick={() => { logout(); nav('/') }}
            className="p-1.5 rounded-lg text-[#4b4b6a] hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* ── MAIN SPLIT (draggable) ────────────────────────────────────── */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden relative">
        {/* LEFT */}
        <div className="flex-shrink-0 overflow-hidden" style={{ width: `${leftPct}%` }}>
          <ProblemDescription
            problem={problem}
            submissions={getSubmissions(problem.id)}
            onDeleteSubmission={(sid) => deleteSubmission(problem.id, sid)}
          />
        </div>

        {/* DRAG HANDLE */}
        <div
          onMouseDown={onMouseDown}
          className="flex-shrink-0 w-1 relative flex items-center justify-center
            bg-[#1e1e2e] hover:bg-blue-500/40 active:bg-blue-500/60 transition-colors cursor-col-resize group z-10"
        >
          {/* Visible grip indicator */}
          <div className="absolute inset-y-0 flex items-center justify-center">
            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-0.5 h-4 rounded-full bg-blue-400/70" />
              <div className="w-0.5 h-4 rounded-full bg-blue-400/70" />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor toolbar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1e1e2e] bg-[#0d0d15] flex-shrink-0">
            <span className="text-xs text-[#4b4b6a] font-mono">
              solution.{monacoLang === 'cpp' ? 'cpp' : monacoLang}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={handleCopy}
                className="p-1.5 rounded text-[#4b4b6a] hover:text-white hover:bg-white/5 transition-all" title="Copy code">
                {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
              </button>
              <button onClick={handleReset}
                className="p-1.5 rounded text-[#4b4b6a] hover:text-white hover:bg-white/5 transition-all" title="Reset">
                <RotateCcw size={13} />
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={monacoLang}
              value={code}
              onChange={v => setCode(v || '')}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace',
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                bracketPairColorization: { enabled: true },
                smoothScrolling: true,
                cursorSmoothCaretAnimation: 'on',
                tabSize: 4,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </div>

          {/* Test Case Panel */}
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

      {/* Sidebar overlay */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} currentProblemId={id} />

      {/* ── FLOATING AI BUTTON ────────────────────────────────────────── */}
      <AnimatePresence>
        {!chatOpen && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setChatOpen(true)}
            className="fixed bottom-5 right-5 z-50 w-13 h-13 rounded-2xl flex items-center justify-center
              shadow-2xl border border-blue-500/30 transition-all group"
            style={{
              width: 52, height: 52,
              background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
              boxShadow: '0 8px 32px rgba(59,130,246,0.4), 0 0 0 1px rgba(59,130,246,0.2)',
            }}
            title="AI Assistant"
          >
            <Sparkles size={20} className="text-white" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-2xl border-2 border-blue-400/30 animate-ping" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── AI CHAT PANEL ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {chatOpen && (
          <AIChatPanel
            key="chat"
            problem={problem}
            code={code}
            language={language}
            onClose={() => setChatOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
