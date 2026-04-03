import { useState } from 'react'
import { FileText, Send, MessageSquare, Eye, Trash2, Activity, ArrowLeft, Copy, Check, Loader2 } from 'lucide-react'
import { DifficultyBadge, Badge } from '../ui'

const TABS = [
  { id: 'description', label: 'Description', icon: FileText },
  { id: 'submissions', label: 'Submissions', icon: Send },
  { id: 'discussion', label: 'Discussion', icon: MessageSquare },
]

// ── AI Code Analysis Panel ────────────────────────────────────────────────────
function AnalysisPanel({ submission, problemTitle, onBack }) {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [ran, setRan] = useState(false)

  const runAnalysis = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are a code analysis expert. Analyze the given code and return ONLY a JSON object (no markdown, no backticks) with this exact structure:
{
  "review": "A concise paragraph reviewing the code quality, style, and correctness. Mention specific line numbers and issues.",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "timeComplexity": { "notation": "O(n)", "explanation": "..." },
  "spaceComplexity": { "notation": "O(1)", "explanation": "..." }
}`,
          messages: [{
            role: 'user',
            content: `Problem: ${problemTitle}\nLanguage: ${submission.language}\nVerdict: ${submission.verdict}\n\nCode:\n${submission.code}`
          }]
        })
      })
      const data = await response.json()
      const text = data.content?.map(b => b.text || '').join('') || ''
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setAnalysis(parsed)
      setRan(true)
    } catch (e) {
      setError('Analysis failed. Please try again.')
    }
    setLoading(false)
  }

  // Auto-run on mount
  if (!ran && !loading && !error) runAnalysis()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e1e2e] bg-[#0d0d15] flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
        >
          <ArrowLeft size={13} />
          Back
        </button>
        <div className="h-4 w-px bg-[#1e1e2e]" />
        <div className="flex items-center gap-2">
          <Activity size={13} className="text-blue-400" />
          <span className="text-xs font-semibold text-white">Code Analysis</span>
        </div>
        <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-mono bg-[#1a1a28] text-[#6b7280] border border-[#2a2a3a]">
          {submission.language}
        </span>
        <span className="text-xs font-medium" style={{ color: submission.verdict === 'Accepted' ? '#22c55e' : '#ef4444' }}>
          {submission.verdict}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={28} className="text-blue-400 animate-spin" />
            <p className="text-sm text-[#6b7280]">Analyzing your code with AI...</p>
            <p className="text-xs text-[#2a2a4a]">Checking complexity, style, and correctness</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-sm text-red-400">{error}</p>
            <button onClick={runAnalysis} className="px-4 py-2 rounded-lg bg-blue-500 text-white text-xs hover:bg-blue-600 transition-colors">
              Retry
            </button>
          </div>
        )}

        {analysis && (
          <>
            {/* Review */}
            <section>
              <h3 className="font-display font-bold text-base text-white mb-3">Review</h3>
              <p className="text-sm text-[#c0c0d0] leading-relaxed">{analysis.review}</p>
              {analysis.suggestions?.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {analysis.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#c0c0d0]">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3a3a5a] flex-shrink-0" />
                      <span dangerouslySetInnerHTML={{ __html: s.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-[#1a1a2e] text-blue-300 font-mono text-xs">$1</code>') }} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="h-px bg-[#1e1e2e]" />

            {/* Complexity */}
            <section>
              <h3 className="font-display font-bold text-base text-white mb-4">Complexity Analysis</h3>
              <div className="space-y-4">
                {/* Time */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-[#e2e2e8]">Time Complexity</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400 font-bold">
                      {analysis.timeComplexity?.notation}
                    </span>
                  </div>
                  <p className="text-sm text-[#8888aa] leading-relaxed">{analysis.timeComplexity?.explanation}</p>
                </div>
                {/* Space */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-[#e2e2e8]">Space Complexity</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-400 font-bold">
                      {analysis.spaceComplexity?.notation}
                    </span>
                  </div>
                  <p className="text-sm text-[#8888aa] leading-relaxed">{analysis.spaceComplexity?.explanation}</p>
                </div>
              </div>
            </section>

            {/* Code snippet */}
            <div className="h-px bg-[#1e1e2e]" />
            <section>
              <h3 className="font-display font-bold text-sm text-white mb-3">Submitted Code</h3>
              <div className="rounded-xl border border-[#1e1e2e] bg-[#0d0d15] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e1e2e]">
                  <span className="text-xs font-mono text-[#4b4b6a]">{submission.language}</span>
                </div>
                <div className="p-4 overflow-x-auto max-h-48">
                  <pre className="text-xs text-[#c0c0d0] font-mono leading-relaxed whitespace-pre">{submission.code}</pre>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProblemDescription({ problem, submissions = [], onDeleteSubmission }) {
  const [tab, setTab] = useState('description')
  const [viewingCode, setViewingCode] = useState(null)
  const [analyzingSubmission, setAnalyzingSubmission] = useState(null)

  // If analysis panel is open, render it full-height
  if (analyzingSubmission) {
    return (
      <AnalysisPanel
        submission={analyzingSubmission}
        problemTitle={problem.title}
        onBack={() => setAnalyzingSubmission(null)}
      />
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Tab bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 px-3 border-b border-[#1e1e2e] bg-[#0d0d15] flex-shrink-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setViewingCode(null) }}
            className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap
              ${tab === t.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-[#6b7280] hover:text-[#a0a0b8]'}`}
          >
            <t.icon size={12} />
            {t.label}
            {t.id === 'submissions' && submissions.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1e1e2e] text-[#6b7280]">
                {submissions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* DESCRIPTION */}
        {tab === 'description' && (
          <div className="p-5 space-y-5">
            <div>
              <h1 className="font-display font-bold text-xl text-white mb-3">{problem.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <DifficultyBadge difficulty={problem.difficulty} />
                {problem.tags.map(tag => (
                  <Badge key={tag} color="#6b7280" className="text-[10px]">{tag}</Badge>
                ))}
              </div>
            </div>
            <div className="text-sm text-[#c0c0d0] leading-relaxed whitespace-pre-line">
              {renderMarkdown(problem.description)}
            </div>
            {problem.examples.map((ex, i) => (
              <div key={i} className="rounded-xl border border-[#1e1e2e] bg-[#0d0d15] overflow-hidden">
                <div className="px-4 py-2 border-b border-[#1e1e2e]">
                  <span className="text-xs font-semibold text-[#8888aa]">Example {i + 1}</span>
                </div>
                <div className="p-4 space-y-2 font-mono text-xs">
                  <div><span className="text-[#6b7280]">Input: </span><span className="text-[#e2e2e8]">{ex.input}</span></div>
                  <div><span className="text-[#6b7280]">Output: </span><span className="text-[#22c55e]">{ex.output}</span></div>
                  {ex.explanation && (
                    <div><span className="text-[#6b7280]">Explanation: </span><span className="text-[#8888aa]">{ex.explanation}</span></div>
                  )}
                </div>
              </div>
            ))}
            <div>
              <h3 className="text-xs font-semibold text-[#8888aa] uppercase tracking-wider mb-3">Constraints</h3>
              <ul className="space-y-1.5">
                {problem.constraints.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#8888aa] font-mono">
                    <span className="text-blue-500/60 mt-0.5">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* SUBMISSIONS */}
        {tab === 'submissions' && (
          <div className="p-4">
            {/* Inline code viewer */}
            {viewingCode && (
              <div className="mb-4 rounded-xl border border-[#1e1e2e] bg-[#0d0d15] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e1e2e]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#8888aa]">
                      #{submissions.findIndex(s => s.id === viewingCode.id) + 1} — {viewingCode.verdict}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#1a1a2e] text-[#6b7280] text-[10px] font-mono">{viewingCode.language}</span>
                  </div>
                  <button
                    onClick={() => setViewingCode(null)}
                    className="text-xs text-[#4b4b6a] hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-all"
                  >
                    ✕ Close
                  </button>
                </div>
                <div className="p-4 overflow-x-auto max-h-56">
                  <pre className="text-xs text-[#c0c0d0] font-mono leading-relaxed whitespace-pre">{viewingCode.code}</pre>
                </div>
              </div>
            )}

            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Send size={28} className="text-[#1e1e2e] mb-3" />
                <p className="text-sm text-[#4b4b6a]">No submissions yet</p>
                <p className="text-xs text-[#2a2a3a] mt-1">Submit your solution to see results here</p>
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-[#1e1e2e] overflow-hidden">
                  {/* Table header */}
                  <div className="grid grid-cols-[40px_1fr_90px_50px_60px_50px] gap-2 px-4 py-2.5
                    bg-[#0d0d15] border-b border-[#1e1e2e] text-xs font-semibold text-[#4b4b6a]">
                    <span>No.</span>
                    <span>Status</span>
                    <span>Language</span>
                    <span>Code</span>
                    <span>Analysis</span>
                    <span>Action</span>
                  </div>

                  {/* Rows */}
                  {submissions.map((sub, i) => {
                    const accepted = sub.verdict === 'Accepted'
                    return (
                      <div
                        key={sub.id}
                        className="grid grid-cols-[40px_1fr_90px_50px_60px_50px] gap-2 px-4 py-3.5
                          border-b border-[#1e1e2e]/60 last:border-0 hover:bg-[#111118] transition-colors items-center"
                      >
                        {/* No. */}
                        <span className="text-sm text-[#4b4b6a] font-mono">{i + 1}</span>

                        {/* Status */}
                        <div>
                          <div className="text-sm font-semibold" style={{ color: accepted ? '#22c55e' : '#ef4444' }}>
                            {sub.verdict}
                          </div>
                          <div className="text-[11px] text-[#4b4b6a] mt-0.5">{sub.date}</div>
                        </div>

                        {/* Language */}
                        <div>
                          <span className="px-2.5 py-1 rounded-lg bg-[#1a1a28] text-[#8888aa] text-xs font-mono border border-[#2a2a3a]">
                            {({ 'C++': 'cpp', Python: 'py', Java: 'java', JavaScript: 'js' }[sub.language] || sub.language)}
                          </span>
                        </div>

                        {/* View Code */}
                        <div className="flex justify-center">
                          <button
                            onClick={() => setViewingCode(viewingCode?.id === sub.id ? null : sub)}
                            className={`p-1.5 rounded-lg transition-all
                              ${viewingCode?.id === sub.id
                                ? 'text-blue-400 bg-blue-500/10'
                                : 'text-[#4b4b6a] hover:text-white hover:bg-white/5'}`}
                            title="View code"
                          >
                            <Eye size={14} />
                          </button>
                        </div>

                        {/* Analysis — AI powered */}
                        <div className="flex justify-center">
                          <button
                            onClick={() => { setViewingCode(null); setAnalyzingSubmission(sub) }}
                            className="p-1.5 rounded-lg text-[#4b4b6a] hover:text-blue-400 hover:bg-blue-500/10 transition-all group"
                            title="AI Code Analysis"
                          >
                            <Activity size={14} className="group-hover:scale-110 transition-transform" />
                          </button>
                        </div>

                        {/* Delete */}
                        <div className="flex justify-center">
                          <button
                            onClick={() => onDeleteSubmission?.(sub.id)}
                            className="p-1.5 rounded-lg text-[#4b4b6a] hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Delete submission"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between mt-3 px-1">
                  <span className="text-xs text-[#4b4b6a]">
                    Showing {submissions.length} out of {submissions.length} submission{submissions.length > 1 ? 's' : ''}
                  </span>
                  <span className="text-xs text-[#4b4b6a]">Page 1</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* DISCUSSION */}
        {tab === 'discussion' && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-5">
            <MessageSquare size={28} className="text-[#1e1e2e] mb-3" />
            <p className="text-sm text-[#4b4b6a]">Discussion coming soon</p>
            <p className="text-xs text-[#2a2a3a] mt-1">Community discussion will be available when backend connects.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function renderMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="px-1.5 py-0.5 rounded bg-[#1a1a2e] text-blue-300 font-mono text-xs">{part.slice(1, -1)}</code>
    return part
  })
}
