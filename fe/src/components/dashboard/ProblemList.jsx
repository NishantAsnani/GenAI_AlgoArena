// src/components/dashboard/ProblemList.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, CheckCircle } from 'lucide-react'
import { useAppSelector } from '../../hooks/redux'
import { selectSolved }   from '../../store/slices/progressSlice'
import { getFolders, getSubfolders, getProblems } from '../../data/problems'

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
      className="px-2 py-0.5 rounded text-[11px] font-semibold"
      style={{ color: c.text, background: c.bg, border: `1px solid ${c.border}` }}
    >
      {d}
    </span>
  )
}

// ── Single problem row ────────────────────────────────────────────────────────
function ProblemRow({ problem, isSolved }) {
  const nav = useNavigate()
  return (
    <button
      onClick={() => nav(`/problem/${problem.id}`)}
      className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100
        last:border-0 hover:bg-orange-50/50 transition-colors text-left group"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Solved indicator */}
        <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
          isSolved
            ? 'bg-green-50 border-green-300'
            : 'border-gray-300 group-hover:border-orange-300'
        }`}>
          {isSolved && <CheckCircle size={10} className="text-green-600" />}
        </div>
        <span className={`text-[13px] font-medium truncate transition-colors ${
          isSolved ? 'text-gray-400 line-through' : 'text-black group-hover:text-orange-600'
        }`}>
          {problem.title}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <DiffBadge d={problem.difficulty} />
        <ChevronRight size={13} className="text-gray-300 group-hover:text-orange-400 transition-colors" />
      </div>
    </button>
  )
}

// ── Subfolder ─────────────────────────────────────────────────────────────────
function Subfolder({ folder, subfolder, solved }) {
  const [open, setOpen] = useState(true)
  const problems        = getProblems(folder, subfolder)
  const solvedCount     = problems.filter(p => solved.includes(p.id)).length

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-2.5 pl-8 hover:bg-gray-50
          transition-colors text-left border-b border-gray-100"
      >
        <ChevronRight
          size={13}
          className="text-gray-400 transition-transform flex-shrink-0"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)' }}
        />
        <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">
          {subfolder}
        </span>
        <span className="text-[11px] text-gray-400 ml-1">
          ({solvedCount}/{problems.length})
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{   height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {problems.map(p => (
              <ProblemRow
                key={p.id}
                problem={p}
                isSolved={solved.includes(p.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Folder ────────────────────────────────────────────────────────────────────
function Folder({ folder, solved, search }) {
  const [open, setOpen]  = useState(true)
  const subfolders       = getSubfolders(folder)

  // Filter problems by search
  const allProblems      = subfolders.flatMap(sub => getProblems(folder, sub))
  const filteredProblems = search
    ? allProblems.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    : null

  const totalInFolder  = allProblems.length
  const solvedInFolder = allProblems.filter(p => solved.includes(p.id)).length
  const pct            = totalInFolder ? Math.round((solvedInFolder / totalInFolder) * 100) : 0

  // Hide folder entirely if search has no matches
  if (search && filteredProblems.length === 0) return null

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden mb-3">
      {/* Folder header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-white
          hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-semibold text-black">{folder}</span>
          <span className="text-[12px] text-gray-400">{solvedInFolder}/{totalInFolder} solved</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Mini progress */}
          <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden hidden sm:block">
            <div
              className="h-full rounded-full bg-orange-400 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <ChevronRight
            size={15}
            className="text-gray-400 transition-transform"
            style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)' }}
          />
        </div>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{   height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-100"
          >
            {/* Search results — flat list */}
            {search ? (
              filteredProblems.map(p => (
                <ProblemRow key={p.id} problem={p} isSolved={solved.includes(p.id)} />
              ))
            ) : (
              subfolders.map(sub => (
                <Subfolder
                  key={sub}
                  folder={folder}
                  subfolder={sub}
                  solved={solved}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── ProblemList ───────────────────────────────────────────────────────────────
export default function ProblemList({ search }) {
  const solved  = useAppSelector(selectSolved)
  const folders = getFolders()

  return (
    <div>
      {folders.map(folder => (
        <Folder
          key={folder}
          folder={folder}
          solved={solved}
          search={search}
        />
      ))}
    </div>
  )
}
