import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Clock, MemoryStick, Plus, ChevronUp, ChevronDown, Loader2, Trophy } from 'lucide-react'
import { Spinner } from '../ui'

export default function TestCasePanel({ problem, activeTab, setActiveTab, runResults, submitResult, running, submitting }) {
  const [activeCaseIdx, setActiveCaseIdx] = useState(0)
  const [collapsed, setCollapsed] = useState(false)

  const sampleCases = problem.sampleTestCases

  return (
    <div className={`flex flex-col border-t border-[#1e1e2e] bg-[#0d0d15] transition-all ${collapsed ? 'h-9' : 'h-[220px]'}`}>
      {/* Tab bar + collapse */}
      <div className="flex items-center justify-between px-3 border-b border-[#1e1e2e] flex-shrink-0 h-9">
        <div className="flex items-center gap-1">
          {[
            { id: 'testcases', label: 'Test Cases' },
            { id: 'results', label: running || submitting ? 'Running...' : 'Results' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all
                ${activeTab === t.id ? 'text-white bg-[#1e1e2e]' : 'text-[#4b4b6a] hover:text-[#8888aa]'}`}
            >
              {t.id === 'results' && (running || submitting) && (
                <Loader2 size={11} className="inline animate-spin mr-1.5" />
              )}
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setCollapsed(p => !p)}
          className="text-[#4b4b6a] hover:text-white p-1 rounded hover:bg-white/5"
        >
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">

            {/* ── TEST CASES TAB ─────────────────────────────────────────── */}
            {activeTab === 'testcases' && (
              <motion.div key="tc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                {/* Case tabs */}
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#1e1e2e]">
                  {sampleCases.map((tc, i) => (
                    <button
                      key={tc.id}
                      onClick={() => setActiveCaseIdx(i)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-all
                        ${activeCaseIdx === i
                          ? 'bg-[#1e1e2e] text-white border border-[#2a2a3a]'
                          : 'text-[#4b4b6a] hover:text-[#8888aa]'}`}
                    >
                      {tc.label}
                    </button>
                  ))}
                </div>

                {/* Case content */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  <div>
                    <label className="text-[10px] font-semibold text-[#4b4b6a] uppercase tracking-wider block mb-1.5">Input</label>
                    <div className="rounded-lg bg-[#111118] border border-[#1e1e2e] p-2.5 font-mono text-xs text-[#c0c0d0]">
                      {sampleCases[activeCaseIdx]?.input}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[#4b4b6a] uppercase tracking-wider block mb-1.5">Expected Output</label>
                    <div className="rounded-lg bg-[#111118] border border-[#1e1e2e] p-2.5 font-mono text-xs text-[#22c55e]">
                      {sampleCases[activeCaseIdx]?.expected}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── RESULTS TAB ────────────────────────────────────────────── */}
            {activeTab === 'results' && (
              <motion.div key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto">

                {/* Loading state */}
                {(running || submitting) && (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <Spinner size={24} />
                    <p className="text-xs text-[#4b4b6a]">{running ? 'Running your code...' : 'Submitting...'}</p>
                  </div>
                )}

                {/* Run results */}
                {!running && !submitting && runResults && !submitResult && (
                  <div className="p-3 space-y-2">
                    {runResults.map((r, i) => (
                      <CaseResult key={i} result={r} index={i} />
                    ))}
                  </div>
                )}

                {/* Submit verdict */}
                {!running && !submitting && submitResult && (
                  <div className="p-3">
                    <SubmitVerdict result={submitResult} />
                  </div>
                )}

                {/* Empty */}
                {!running && !submitting && !runResults && !submitResult && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-xs text-[#3a3a5a]">Run your code to see results</p>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function CaseResult({ result, index }) {
  const passed = result.passed
  return (
    <div className={`rounded-lg border p-2.5 ${passed ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full flex items-center justify-center
            ${passed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            {passed ? <Check size={10} className="text-green-400" /> : <X size={10} className="text-red-400" />}
          </div>
          <span className="text-xs font-medium" style={{ color: passed ? '#22c55e' : '#ef4444' }}>
            {result.label} — {passed ? 'Passed' : 'Failed'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-[#4b4b6a]">
          <span className="flex items-center gap-1"><Clock size={10} /> {result.executionTime}</span>
          <span>{result.memoryUsed}</span>
        </div>
      </div>
      {!passed && (
        <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[10px]">
          <div>
            <span className="text-[#4b4b6a] block mb-1">Expected</span>
            <div className="bg-[#0d0d15] rounded p-1.5 text-green-400">{result.expected}</div>
          </div>
          <div>
            <span className="text-[#4b4b6a] block mb-1">Got</span>
            <div className="bg-[#0d0d15] rounded p-1.5 text-red-400">{result.actualOutput}</div>
          </div>
        </div>
      )}
    </div>
  )
}

function SubmitVerdict({ result }) {
  const accepted = result.verdict === 'Accepted'
  return (
    <div className={`rounded-xl border p-4 ${accepted ? 'border-green-500/25 bg-green-500/5' : 'border-red-500/25 bg-red-500/5'}`}>
      <div className="flex items-center gap-3 mb-3">
        {accepted
          ? <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"><Trophy size={16} className="text-green-400" /></div>
          : <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center"><X size={16} className="text-red-400" /></div>
        }
        <div>
          <div className="font-semibold text-sm" style={{ color: accepted ? '#22c55e' : '#ef4444' }}>{result.verdict}</div>
          <div className="text-xs text-[#6b7280]">{result.passed} / {result.total} test cases passed</div>
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs text-[#4b4b6a]">
          <span className="flex items-center gap-1"><Clock size={11} /> {result.runtime}</span>
          <span>{result.memory}</span>
        </div>
      </div>
      {/* Failed cases summary */}
      {!accepted && result.results.filter(r => !r.passed).slice(0, 2).map((r, i) => (
        <CaseResult key={i} result={r} index={i} />
      ))}
    </div>
  )
}
