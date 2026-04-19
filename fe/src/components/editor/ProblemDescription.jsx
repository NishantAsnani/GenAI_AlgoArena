// src/components/editor/ProblemDescription.jsx
// Left panel — Description + Submissions tabs
import { useState } from 'react'
import { FileText, Clock, Send, CheckCircle, Trash2, Eye } from 'lucide-react'

const DIFF_COLOR = {
  Easy:   { text: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  Medium: { text: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  Hard:   { text: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
}

const TABS = [
  { id: 'description',  label: 'Description',  icon: FileText },
  { id: 'submissions',  label: 'Submissions',   icon: Clock    },
]

// ── Simple inline markdown renderer (bold + inline code) ─────────────────────
function renderText(text) {
  if (!text) return null
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**'))
      return <strong key={i} className="font-semibold text-black">{p.slice(2, -2)}</strong>
    if (p.startsWith('`') && p.endsWith('`'))
      return (
        <code key={i}
          className="px-1.5 py-0.5 rounded bg-gray-100 text-orange-600 font-mono text-[12px]">
          {p.slice(1, -1)}
        </code>
      )
    return p
  })
}

// ── Description tab ───────────────────────────────────────────────────────────
function DescriptionTab({ problem }) {
  const dc = DIFF_COLOR[problem.difficulty] || DIFF_COLOR.Easy
  return (
    <div className="p-5 space-y-5 text-[14px]">
      {/* Title + difficulty */}
      <div>
        <h1 className="text-[18px] font-bold text-black tracking-tight mb-2">
          {problem.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="px-2.5 py-0.5 rounded-full text-[12px] font-semibold"
            style={{ color: dc.text, background: dc.bg, border: `1px solid ${dc.border}` }}
          >
            {problem.difficulty}
          </span>
          {(problem.tags || []).map(tag => (
            <span key={tag}
              className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-500">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <p className="text-[14px] text-gray-700 leading-relaxed">
        {renderText(problem.description)}
      </p>

      {/* Examples */}
      {(problem.examples || []).map((ex, i) => (
        <div key={i} className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">
              Example {i + 1}
            </span>
          </div>
          <div className="p-4 font-mono text-[12.5px] space-y-1.5">
            <div>
              <span className="text-gray-400">Input:  </span>
              <span className="text-black">{ex.input}</span>
            </div>
            <div>
              <span className="text-gray-400">Output: </span>
              <span className="text-green-700 font-semibold">{ex.output}</span>
            </div>
            {ex.explanation && (
              <div className="pt-1 text-gray-500 font-sans text-[12px]">
                {ex.explanation}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Constraints */}
      {(problem.constraints || []).length > 0 && (
        <div>
          <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wide mb-2">
            Constraints
          </h3>
          <ul className="space-y-1.5">
            {problem.constraints.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-gray-600 font-mono">
                <span className="text-orange-400 mt-0.5 flex-shrink-0">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ── Submissions tab ───────────────────────────────────────────────────────────
function SubmissionsTab({ submissions, onDelete }) {
  const [viewingCode, setViewingCode] = useState(null)

  if (!submissions || submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <Send size={28} className="text-gray-200 mb-3" />
        <p className="text-[13px] font-medium text-gray-400">No submissions yet</p>
        <p className="text-[12px] text-gray-300 mt-1">Submit your solution to see results here</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Code viewer */}
      {viewingCode && (
        <div className="mb-4 rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-gray-600">
                {viewingCode.language} · {viewingCode.verdict}
              </span>
            </div>
            <button
              onClick={() => setViewingCode(null)}
              className="text-[11px] text-gray-400 hover:text-black px-2 py-1 rounded
                hover:bg-gray-200 transition-all"
            >
              ✕ Close
            </button>
          </div>
          <div className="p-4 overflow-x-auto max-h-52">
            <pre className="text-[12px] font-mono text-black leading-relaxed whitespace-pre">
              {viewingCode.code}
            </pre>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[36px_1fr_80px_44px_44px] gap-2 px-4 py-2.5
          bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
          <span>#</span>
          <span>Status</span>
          <span>Lang</span>
          <span className="text-center">Code</span>
          <span className="text-center">Del</span>
        </div>

        {submissions.map((sub, i) => {
          const accepted = sub.verdict === 'Accepted'
          return (
            <div
              key={sub.id}
              className="grid grid-cols-[36px_1fr_80px_44px_44px] gap-2 px-4 py-3
                border-b border-gray-100 last:border-0 items-center hover:bg-gray-50 transition-colors"
            >
              <span className="text-[12px] text-gray-400 font-mono">{i + 1}</span>

              <div>
                <div
                  className="text-[13px] font-semibold"
                  style={{ color: accepted ? '#16a34a' : '#dc2626' }}
                >
                  {sub.verdict}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">{sub.date}</div>
              </div>

              <span className="px-2 py-1 rounded bg-gray-100 text-[11px] font-mono
                text-gray-600 text-center">
                {sub.language}
              </span>

              <div className="flex justify-center">
                <button
                  onClick={() => setViewingCode(viewingCode?.id === sub.id ? null : sub)}
                  className={`p-1.5 rounded transition-all ${
                    viewingCode?.id === sub.id
                      ? 'bg-orange-100 text-orange-600'
                      : 'text-gray-400 hover:text-black hover:bg-gray-200'
                  }`}
                  title="View code"
                >
                  <Eye size={13} />
                </button>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => onDelete(sub.id)}
                  className="p-1.5 rounded text-gray-300 hover:text-red-500
                    hover:bg-red-50 transition-all"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-gray-400 mt-3 px-1">
        Showing {submissions.length} submission{submissions.length > 1 ? 's' : ''}
      </p>
    </div>
  )
}

// ── ProblemDescription (main export) ──────────────────────────────────────────
export default function ProblemDescription({ problem, submissions, onDeleteSubmission }) {
  const [tab, setTab] = useState('description')

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 px-3 border-b border-gray-200 bg-white flex-shrink-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-3 text-[12px] font-semibold
              border-b-2 transition-all whitespace-nowrap ${
              tab === t.id
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            <t.icon size={13} />
            {t.label}
            {t.id === 'submissions' && submissions?.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold
                bg-gray-100 text-gray-500">
                {submissions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'description' && <DescriptionTab problem={problem} />}
        {tab === 'submissions' && (
          <SubmissionsTab
            submissions={submissions}
            onDelete={onDeleteSubmission}
          />
        )}
      </div>
    </div>
  )
}