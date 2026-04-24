// src/components/editor/TestCasePanel.jsx
// Bottom panel — Test Cases tab + Results tab
import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Loader2, Clock, MemoryStick } from 'lucide-react'

// ── Result row ────────────────────────────────────────────────────────────────
function ResultRow({ result, index, isHidden }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <div className={`rounded-lg border overflow-hidden mb-2 ${
      result.passed ? 'border-green-200' : 'border-red-200'
    }`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors ${
          result.passed ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'
        }`}
      >
        <div className="flex items-center gap-2">
          {result.passed
            ? <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
            : <XCircle    size={14} className="text-red-500   flex-shrink-0" />
          }
          <span className="text-[12px] font-semibold"
            style={{ color: result.passed ? '#16a34a' : '#dc2626' }}>
            {isHidden ? `Hidden Test ${index + 1}` : `Case ${index + 1}`}
          </span>
          {result.time && (
            <span className="text-[10px] text-gray-400 font-mono ml-1">{result.time}</span>
          )}
        </div>
        {open
          ? <ChevronUp   size={13} className="text-gray-400" />
          : <ChevronDown size={13} className="text-gray-400" />
        }
      </button>

      {open && (
        <div className="px-3 py-3 bg-white border-t border-gray-100 space-y-2 font-mono text-[12px]">
          {!isHidden && (
            <div>
              <span className="text-gray-400 text-[11px] uppercase tracking-wide">Input</span>
              <div className="mt-1 px-2 py-1.5 rounded bg-gray-50 text-black whitespace-pre-wrap">{result.input}</div>
            </div>
          )}
          <div>
            <span className="text-gray-400 text-[11px] uppercase tracking-wide">Expected</span>
            <div className="mt-1 px-2 py-1.5 rounded bg-gray-50 text-green-700">
              {isHidden ? '(hidden)' : result.expected}
            </div>
          </div>
          <div>
            <span className="text-gray-400 text-[11px] uppercase tracking-wide">Your Output</span>
            <div className={`mt-1 px-2 py-1.5 rounded whitespace-pre-wrap ${
              result.passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}>
              {result.actual || '(no output)'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Verdict banner ────────────────────────────────────────────────────────────
function VerdictBanner({ result }) {
  const accepted = result.verdict === 'Accepted'
  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl mb-4 ${
      accepted
        ? 'bg-green-50 border border-green-200'
        : 'bg-red-50   border border-red-200'
    }`}>
      <div className="flex items-center gap-2">
        {accepted
          ? <CheckCircle size={16} className="text-green-600" />
          : <XCircle     size={16} className="text-red-500" />
        }
        <span className="text-[14px] font-bold"
          style={{ color: accepted ? '#16a34a' : '#dc2626' }}>
          {result.verdict}
        </span>
        <span className="text-[12px] text-gray-500">
          {result.passed}/{result.total} test cases passed
        </span>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono">
        {result.runtime !== '—' && (
          <span className="flex items-center gap-1">
            <Clock size={11} /> {result.runtime}
          </span>
        )}
        {result.memory !== '—' && (
          <span className="flex items-center gap-1">
            <MemoryStick size={11} /> {result.memory}
          </span>
        )}
      </div>
    </div>
  )
}

// ── TestCasePanel ─────────────────────────────────────────────────────────────
export default function TestCasePanel({
  problem,
  activeTab,
  setActiveTab,
  runResults,
  submitResult,
  running,
  submitting,
}) {
  const [collapsed, setCollapsed] = useState(false)

  const isLoading = running || submitting
  const loadLabel = running ? 'Running...' : 'Submitting...'

  return (
    <div className={`flex flex-col border-t border-gray-200 bg-white transition-all ${
      collapsed ? 'h-10' : 'h-[220px]'
    }`}>
      {/* Panel header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-1">
          {['testcases', 'results'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded text-[12px] font-semibold transition-all capitalize ${
                activeTab === tab
                  ? 'bg-black text-white'
                  : 'text-gray-400 hover:text-black hover:bg-gray-100'
              }`}
            >
              {tab === 'testcases' ? 'Test Cases' : 'Results'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setCollapsed(c => !c)}
          className="p-1 rounded text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
        >
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-3">

          {/* Loading spinner */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <Loader2 size={20} className="text-orange-500 animate-spin" />
              <span className="text-[12px] text-gray-400">{loadLabel}</span>
            </div>
          )}

          {/* Test cases tab */}
          {!isLoading && activeTab === 'testcases' && (
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                Sample Test Cases
              </p>
              {(problem?.sampleTestCases || []).map((tc, i) => (
                <div key={i} className="rounded-lg border border-gray-200 mb-2 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                      Case {i + 1}
                    </span>
                  </div>
                  <div className="p-3 font-mono text-[12px] space-y-1.5">
                    <div>
                      <span className="text-gray-400">Input:  </span>
                      <span className="text-black">{tc.input}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Output: </span>
                      <span className="text-green-700">{tc.expected}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results tab — after Run */}
          {!isLoading && activeTab === 'results' && runResults && !submitResult && (
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                Run Results
              </p>
              {runResults.map((r, i) => (
                <ResultRow key={i} result={r} index={i} isHidden={false} />
              ))}
            </div>
          )}

          {/* Results tab — after Submit: banner + all per-test rows */}
          {!isLoading && activeTab === 'results' && submitResult && (
            <div>
              <VerdictBanner result={submitResult} />
              {Array.isArray(submitResult.testResults) &&
                submitResult.testResults.map((r, i) => (
                  <ResultRow key={i} result={r} index={i} isHidden={!!r.isHidden} />
                ))
              }
            </div>
          )}

          {/* Empty results state */}
          {!isLoading && activeTab === 'results' && !runResults && !submitResult && (
            <div className="flex items-center justify-center h-full">
              <p className="text-[12px] text-gray-400">Run or Submit to see results</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}