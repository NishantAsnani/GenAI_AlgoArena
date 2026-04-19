// src/components/editor/SimpleEditor.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Plain textarea editor — no Monaco dependency
// Supports: C, C++, Java, Python
// Features: line numbers, Tab key indent, copy, reset, language switcher
// NEXT STAGE: Replace <SimpleEditor> with Monaco Editor component
// ─────────────────────────────────────────────────────────────────────────────
import { useRef, useState, useCallback } from 'react'
import { Copy, Check, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

export const LANGUAGES = ['C', 'C++', 'Java', 'Python']

// File extension per language
const EXT = { C: 'c', 'C++': 'cpp', Java: 'java', Python: 'py' }

// ── Line numbers sidebar ───────────────────────────────────────────────────────
function LineNumbers({ code }) {
  const lines = (code || '').split('\n')
  return (
    <div
      className="select-none text-right pr-3 pt-3 pb-3 min-w-[44px]
        text-[12px] leading-[22px] font-mono text-gray-300 bg-gray-50
        border-r border-gray-200 overflow-hidden flex-shrink-0"
      aria-hidden="true"
    >
      {lines.map((_, i) => (
        <div key={i}>{i + 1}</div>
      ))}
    </div>
  )
}

// ── SimpleEditor ──────────────────────────────────────────────────────────────
export default function SimpleEditor({
  code,
  onChange,
  language,
  onLanguageChange,
  starterCode,
}) {
  const textareaRef = useRef(null)
  const [copied, setCopied]   = useState(false)

  // Handle Tab key → insert 4 spaces instead of losing focus
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const el    = e.target
      const start = el.selectionStart
      const end   = el.selectionEnd
      const tab   = '    ' // 4 spaces

      if (e.shiftKey) {
        // Shift+Tab — remove indent
        const before = code.slice(0, start)
        if (before.endsWith(tab)) {
          const newCode = before.slice(0, -4) + code.slice(end)
          onChange(newCode)
          requestAnimationFrame(() => {
            el.selectionStart = el.selectionEnd = start - 4
          })
        }
      } else {
        // Tab — add indent
        const newCode = code.slice(0, start) + tab + code.slice(end)
        onChange(newCode)
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = start + 4
        })
      }
    }

    // Enter — auto-indent to match current line's indentation
    if (e.key === 'Enter') {
      e.preventDefault()
      const el      = e.target
      const start   = el.selectionStart
      const before  = code.slice(0, start)
      const lineStart = before.lastIndexOf('\n') + 1
      const currentLine = before.slice(lineStart)
      const indent  = currentLine.match(/^(\s*)/)[1]
      const newCode = code.slice(0, start) + '\n' + indent + code.slice(start)
      onChange(newCode)
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 1 + indent.length
      })
    }
  }, [code, onChange])

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Code copied!')
  }

  const handleReset = () => {
    onChange(starterCode[language] || '')
    toast.success('Reset to starter code')
  }

  const lineCount = (code || '').split('\n').length

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Toolbar ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200
        bg-gray-50 flex-shrink-0">
        <div className="flex items-center gap-1">
          {/* Language tabs */}
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`px-3 py-1 rounded text-[12px] font-mono font-semibold transition-all ${
                language === lang
                  ? 'bg-black text-white'
                  : 'text-gray-500 hover:text-black hover:bg-gray-200'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Right: filename + actions */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-gray-400">
            solution.{EXT[language]}
          </span>
          <div className="w-px h-3.5 bg-gray-200" />
          <button
            onClick={handleCopy}
            title="Copy code"
            className="p-1.5 rounded text-gray-400 hover:text-black hover:bg-gray-200 transition-all"
          >
            {copied
              ? <Check size={13} className="text-green-600" />
              : <Copy size={13} />
            }
          </button>
          <button
            onClick={handleReset}
            title="Reset to starter code"
            className="p-1.5 rounded text-gray-400 hover:text-black hover:bg-gray-200 transition-all"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* ── Editor area ───────────────────────────────────────────────── */}
      {/* NEXT STAGE: Replace this entire div with <MonacoEditor> */}
      <div className="flex flex-1 overflow-hidden">
        {/* Line numbers */}
        <LineNumbers code={code} />

        {/* Textarea */}
        <div className="flex-1 overflow-auto">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            className="w-full h-full min-h-full resize-none outline-none
              font-mono text-[13px] leading-[22px] text-black
              bg-white p-3 pl-4
              selection:bg-orange-100"
            style={{
              tabSize: 4,
              minHeight: `${Math.max(lineCount, 20) * 22 + 24}px`,
            }}
          />
        </div>
      </div>
    </div>
  )
}