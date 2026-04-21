// src/components/editor/ProblemDescription.jsx
// Left panel — Description + Submissions tabs
import { useState, useEffect } from 'react'
import { FileText, Clock, Send, Trash2, Eye, ArrowLeft, Activity,
         RotateCcw, Loader2, AlertCircle, CheckCircle,
         Lightbulb, MemoryStick } from 'lucide-react'

const DIFF_COLOR = {
  Easy:   { text: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  Medium: { text: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  Hard:   { text: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
}

const TABS = [
  { id: 'description', label: 'Description', icon: FileText },
  { id: 'submissions', label: 'Submissions',  icon: Clock    },
]

function renderText(text) {
  if (!text) return null
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**'))
      return <strong key={i} className="font-semibold text-black">{p.slice(2, -2)}</strong>
    if (p.startsWith('`') && p.endsWith('`'))
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-gray-100 text-orange-600 font-mono text-[12px]">
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
      <div>
        <h1 className="text-[18px] font-bold text-black tracking-tight mb-2">{problem.title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="px-2.5 py-0.5 rounded-full text-[12px] font-semibold"
            style={{ color: dc.text, background: dc.bg, border: `1px solid ${dc.border}` }}
          >
            {problem.difficulty}
          </span>
          {(problem.tags || []).map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-500">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <p className="text-[14px] text-gray-700 leading-relaxed">
        {renderText(problem.description)}
      </p>

      {(problem.examples || []).map((ex, i) => (
        <div key={i} className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">
              Example {i + 1}
            </span>
          </div>
          <div className="p-4 font-mono text-[12.5px] space-y-1.5">
            <div><span className="text-gray-400">Input:  </span><span className="text-black">{ex.input}</span></div>
            <div><span className="text-gray-400">Output: </span><span className="text-green-700 font-semibold">{ex.output}</span></div>
            {ex.explanation && (
              <div className="pt-1 text-gray-500 font-sans text-[12px]">{ex.explanation}</div>
            )}
          </div>
        </div>
      ))}

      {(problem.constraints || []).length > 0 && (
        <div>
          <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wide mb-2">Constraints</h3>
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

// ── Complexity Badge ──────────────────────────────────────────────────────────
function ComplexityBadge({ label, notation, color }) {
  return (
    <div className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl border ${color} flex-1`}>
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5">{label}</span>
      <span className="font-mono text-[15px] font-bold">{notation}</span>
    </div>
  )
}

// ── Analysis View (inline page) ───────────────────────────────────────────────
function AnalysisView({ submission, problemId, onBack }) {
  const [loading,  setLoading]  = useState(false)
  const [analysis, setAnalysis] = useState(submission.analysis || null)
  const [error,    setError]    = useState(null)

  const runAnalysis = async () => {
    setLoading(true)
    setError(null)
    try {
      // BACKEND: Replace mock with real endpoint
      // const { data } = await api.post('/ai/analyze', {
      //   submission_id: submission.id,
      //   problem_id:    problemId,
      //   code:          submission.code,
      //   language:      submission.language,
      // })
      // setAnalysis(data.data)

      await new Promise(r => setTimeout(r, 1600))
      setAnalysis(getMockAnalysis(submission.code, submission.language))
    } catch {
      setError('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!analysis) runAnalysis()
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* ── Top bar with back button ── */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold
            text-gray-500 hover:text-black hover:bg-gray-100 transition-all border border-gray-200"
        >
          <ArrowLeft size={13} />
          Back
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <Activity size={13} className="text-orange-500" />
        <span className="text-[13px] font-bold text-black">Code Analysis</span>
        <span className="ml-auto px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-mono text-gray-500">
          {submission.language}
        </span>
        <span
          className="px-2 py-0.5 rounded-md text-[10px] font-bold"
          style={{
            color: submission.verdict === 'Accepted' ? '#16a34a' : '#dc2626',
            background: submission.verdict === 'Accepted' ? '#f0fdf4' : '#fef2f2',
          }}
        >
          {submission.verdict}
        </span>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ── Submitted code — fixed height, scrollable ── */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <span className="text-[11px] font-semibold text-gray-500 ml-1">Submitted Code</span>
            </div>
            <span className="text-[10px] font-mono text-gray-400">{submission.date}</span>
          </div>
          <div className="overflow-auto bg-[#fafafa]" style={{ height: '200px' }}>
            <pre className="p-4 text-[12px] font-mono text-gray-800 leading-relaxed whitespace-pre min-w-max">
              {submission.code || '// No code available'}
            </pre>
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && !analysis && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="relative w-10 h-10">
              <div className="w-10 h-10 rounded-full border-2 border-orange-100 absolute inset-0" />
              <Loader2 size={20} className="text-orange-500 animate-spin absolute inset-0 m-auto" />
            </div>
            <p className="text-[13px] font-medium text-gray-400">Analyzing your code…</p>
            <p className="text-[11px] text-gray-300">This may take a moment</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
              <span className="text-[13px] text-red-600 font-medium">{error}</span>
            </div>
            <button
              onClick={runAnalysis}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px]
                font-semibold bg-red-500 text-white hover:bg-red-600 transition-all"
            >
              <RotateCcw size={11} /> Try again
            </button>
          </div>
        )}

        {/* ── Analysis results ── */}
        {analysis && (
          <div className="space-y-4">
            {/* Complexity row */}
            <div className="flex gap-3">
              <ComplexityBadge
                label="Time Complexity"
                notation={analysis.time_complexity?.notation || '—'}
                color="bg-blue-50 border-blue-200 text-blue-700"
              />
              <ComplexityBadge
                label="Space Complexity"
                notation={analysis.space_complexity?.notation || '—'}
                color="bg-purple-50 border-purple-200 text-purple-700"
              />
            </div>

            {/* Time detail */}
            {analysis.time_complexity?.explanation && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={12} className="text-blue-500" />
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">Time Complexity</span>
                </div>
                <p className="text-[12.5px] text-gray-700 leading-relaxed">
                  {analysis.time_complexity.explanation}
                </p>
              </div>
            )}

            {/* Space detail */}
            {analysis.space_complexity?.explanation && (
              <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MemoryStick size={12} className="text-purple-500" />
                  <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wide">Space Complexity</span>
                </div>
                <p className="text-[12.5px] text-gray-700 leading-relaxed">
                  {analysis.space_complexity.explanation}
                </p>
              </div>
            )}

            {/* Review */}
            {analysis.review && (
              <div className="rounded-xl border border-green-100 bg-green-50/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={12} className="text-green-500" />
                  <span className="text-[11px] font-bold text-green-700 uppercase tracking-wide">Code Review</span>
                </div>
                <p className="text-[12.5px] text-gray-700 leading-relaxed">{analysis.review}</p>
              </div>
            )}

            {/* Suggestions */}
            {analysis.suggestions?.length > 0 && (
              <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={12} className="text-orange-500" />
                  <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wide">Suggestions</span>
                </div>
                <ul className="space-y-2">
                  {analysis.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12.5px] text-gray-700">
                      <span className="text-orange-400 mt-0.5 flex-shrink-0 font-bold">→</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Re-analyze */}
            <div className="pt-1">
              <button
                onClick={runAnalysis}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold
                  border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-black
                  disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                {loading ? 'Re-analyzing…' : 'Re-analyze'}
              </button>
            </div>
          </div>
        )}

        {/* Re-analyzing overlay */}
        {analysis && loading && (
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-20">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 shadow-lg pointer-events-auto">
              <Loader2 size={14} className="text-orange-400 animate-spin" />
              <span className="text-[12px] text-gray-600 font-medium">Re-analyzing…</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Submissions tab ───────────────────────────────────────────────────────────
function SubmissionsTab({ submissions, onDelete, problemId }) {
  const [viewingCode,  setViewingCode]  = useState(null)
  const [analyzingSub, setAnalyzingSub] = useState(null)

  if (analyzingSub) {
    return (
      <div className="flex flex-col h-full">
        <AnalysisView
          submission={analyzingSub}
          problemId={problemId}
          onBack={() => setAnalyzingSub(null)}
        />
      </div>
    )
  }

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
            <span className="text-[12px] font-semibold text-gray-600">
              {viewingCode.language} · {viewingCode.verdict}
            </span>
            <button
              onClick={() => setViewingCode(null)}
              className="text-[11px] text-gray-400 hover:text-black px-2 py-1 rounded hover:bg-gray-200 transition-all"
            >
              ✕ Close
            </button>
          </div>
          <div className="p-4 overflow-x-auto max-h-48">
            <pre className="text-[12px] font-mono text-black leading-relaxed whitespace-pre">
              {viewingCode.code}
            </pre>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[30px_1fr_64px_100px_36px_36px] gap-1.5 px-3 py-2.5
          bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
          <span>#</span>
          <span>Status</span>
          <span>Lang</span>
          <span>Analysis</span>
          <span className="text-center">Code</span>
          <span className="text-center">Del</span>
        </div>

        {submissions.map((sub, i) => {
          const accepted = sub.verdict === 'Accepted'
          return (
            <div key={sub.id}>
              <div className="grid grid-cols-[30px_1fr_64px_100px_36px_36px] gap-1.5 px-3 py-3
                border-b border-gray-100 last:border-0 items-center hover:bg-gray-50 transition-colors">

                <span className="text-[11px] text-gray-400 font-mono">{i + 1}</span>

                <div>
                  <div className="text-[12px] font-bold leading-tight"
                    style={{ color: accepted ? '#16a34a' : '#dc2626' }}>
                    {sub.verdict}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{sub.date}</div>
                </div>

                <span className="px-1.5 py-1 rounded bg-gray-100 text-[10px] font-mono text-gray-600 text-center truncate">
                  {sub.language}
                </span>

                {/* Analysis: active button for Accepted, dashed placeholder for others */}
                <div className="flex justify-start">
                  {accepted ? (
                    <button
                      onClick={() => setAnalyzingSub(sub)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold
                        border border-orange-200 bg-orange-50 text-orange-600
                        hover:bg-orange-100 hover:border-orange-300 transition-all"
                    >
                      <Activity size={11} />
                      <span className="hidden sm:inline">Analysis</span>
                    </button>
                  ) : (
                    <span
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold
                        border border-dashed border-gray-200 text-gray-300 cursor-not-allowed select-none"
                      title="Analysis only available for accepted submissions"
                    >
                      <Activity size={11} className="opacity-30" />
                      <span className="hidden sm:inline tracking-widest">— —</span>
                    </span>
                  )}
                </div>

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
                    className="p-1.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-gray-400 mt-3 px-1">
        {submissions.length} submission{submissions.length > 1 ? 's' : ''}
      </p>
    </div>
  )
}

// ── ProblemDescription (main export) ──────────────────────────────────────────
export default function ProblemDescription({ problem, submissions, onDeleteSubmission }) {
  const [tab, setTab] = useState('description')

  return (
    <div className="flex flex-col h-full">
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
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">
                {submissions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'description' && <DescriptionTab problem={problem} />}
        {tab === 'submissions' && (
          <SubmissionsTab
            submissions={submissions}
            onDelete={onDeleteSubmission}
            problemId={problem?.id || problem?._id}
          />
        )}
      </div>
    </div>
  )
}

// ── Mock analysis ─────────────────────────────────────────────────────────────
function getMockAnalysis(code = '', language = '') {
  const len       = (code || '').trim().length
  const hasLoop   = code.includes('for') || code.includes('while')
  const hasNested = (code.match(/for|while/g) || []).length >= 2
  const hasMap    = code.includes('Map') || code.includes('map') || code.includes('dict')
  const complete  = len > 50

  return {
    time_complexity: {
      notation:    hasNested ? 'O(n²)' : hasLoop ? 'O(n)' : 'O(1)',
      explanation: hasNested
        ? 'Two nested loops iterate over the input, resulting in quadratic time complexity.'
        : hasLoop
        ? 'A single loop iterates through the input once — linear time complexity.'
        : 'No loops detected. Constant time execution.',
    },
    space_complexity: {
      notation:    hasMap ? 'O(n)' : 'O(1)',
      explanation: hasMap
        ? 'A hash map stores up to n elements in the worst case, giving linear space.'
        : 'Only a constant number of variables are used — no extra space scales with input.',
    },
    review: complete
      ? `The ${language} solution is well-structured. Variable names are clear and the logic is easy to follow.`
      : 'The code is incomplete or too short. Make sure to implement the full solution before analyzing.',
    suggestions: complete ? [
      'Consider adding edge case handling for empty input.',
      'You could use early return to simplify nested conditions.',
      hasNested ? 'Consider optimizing the nested loop — a hash map could reduce time complexity to O(n).' : null,
    ].filter(Boolean) : [
      'Complete the implementation first.',
      'Test with the provided examples before submitting.',
    ],
  }
}