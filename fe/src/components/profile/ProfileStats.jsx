import { useMemo } from 'react'
import { useAppSelector } from '../../hooks/redux'
import { selectSolved, selectSolvedCount, selectPercentage } from '../../store/slices/progressSlice'
import { selectProblems, selectProblemsCount } from '../../store/slices/problemsSlice'
import { selectAllProblemsFromModules } from '../../store/slices/modulesSlice'

function DonutChart({ easy, medium, hard, total, solved }) {
  const r    = 52
  const cx   = 68
  const cy   = 68
  const circ = 2 * Math.PI * r

  const easyPct = total ? easy   / total : 0
  const medPct  = total ? medium / total : 0
  const hardPct = total ? hard   / total : 0

  const segments = [
    { pct: easyPct, color: '#16a34a', offset: 0 },
    { pct: medPct,  color: '#d97706', offset: easyPct },
    { pct: hardPct, color: '#dc2626', offset: easyPct + medPct },
  ]

  return (
    <div className="flex flex-col items-center">
      <svg width={136} height={136} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={13} />
        {total === 0 ? null : segments.map((seg, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={13}
            strokeDasharray={`${circ * seg.pct} ${circ * (1 - seg.pct)}`}
            strokeDashoffset={-circ * seg.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="mt-[-88px] mb-[52px] text-center pointer-events-none">
        <div className="text-2xl font-bold text-black leading-none">{solved}</div>
        <div className="text-[11px] text-gray-400 mt-0.5">/ {total}</div>
      </div>
      <div className="flex flex-col gap-1.5 mt-1 w-full">
        {[
          { label: 'Easy',   count: easy,   color: '#16a34a' },
          { label: 'Medium', count: medium, color: '#d97706' },
          { label: 'Hard',   count: hard,   color: '#dc2626' },
        ].map(d => (
          <div key={d.label} className="flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
              <span className="text-gray-500">{d.label}</span>
            </div>
            <span className="font-semibold text-black">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Heatmap() {
  const user    = useAppSelector(selectUser)
  const heatKey = `aa_heatmap_${user?.email}`
  const heatData = useMemo(() => {
    try { return JSON.parse(localStorage.getItem(heatKey)) || {} } catch { return {} }
  }, [heatKey])

  const days = useMemo(() => {
    const arr = []
    for (let i = 27; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      arr.push({ key, val: heatData[key] || 0 })
    }
    return arr
  }, [heatData])

  const activeCount = days.filter(d => d.val > 0).length

  const colorMap = (v) => {
    if (v === 0) return '#f3f4f6'
    if (v === 1) return '#fed7aa'
    if (v === 2) return '#fb923c'
    return '#ea580c'
  }

  const weeks = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">
          Activity — last 28 days
        </span>
        <span className="text-[11px] text-gray-400">{activeCount} active days</span>
      </div>
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map(d => (
              <div
                key={d.key}
                title={`${d.key}: ${d.val} submission${d.val !== 1 ? 's' : ''}`}
                className="w-5 h-5 rounded-sm cursor-default transition-all hover:opacity-70"
                style={{ background: colorMap(d.val) }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-[10px] text-gray-400">Less</span>
        {[0, 1, 2, 3].map(v => (
          <div key={v} className="w-3 h-3 rounded-sm" style={{ background: colorMap(v) }} />
        ))}
        <span className="text-[10px] text-gray-400">More</span>
      </div>
    </div>
  )
}

export default function ProfileStats() {
  const solved      = useAppSelector(selectSolved)
  const solvedCount = useAppSelector(selectSolvedCount)
  const percentage  = useAppSelector(selectPercentage)
  const sliceProblems  = useAppSelector(selectProblems)
  const moduleProblems = useAppSelector(selectAllProblemsFromModules)
  const problems = sliceProblems.length > 0 ? sliceProblems : moduleProblems
  const total    = problems.length

  const easy   = problems.filter(p => p.difficulty === 'Easy'   && solved.includes(p._id || p.id)).length
  const medium = problems.filter(p => p.difficulty === 'Medium' && solved.includes(p._id || p.id)).length
  const hard   = problems.filter(p => p.difficulty === 'Hard'   && solved.includes(p._id || p.id)).length

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-[13px] font-bold text-black uppercase tracking-wide mb-4">
          DSA Progress
        </h3>
        <DonutChart
          easy={easy} medium={medium} hard={hard}
          total={total} solved={solvedCount}
        />
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-gray-500">Overall</span>
            <span className="font-bold text-black">{percentage}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-orange-500 transition-all duration-700"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
