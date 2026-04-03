import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Code2, ChevronRight, ChevronDown, Check, LogOut,
  Trophy, BookOpen, Search, User, Settings
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../context/ProgressContext'
import { PROBLEMS, getFolders, getSubfolders, getProblems } from '../data/problems'
import { DifficultyBadge } from '../components/ui'

const FOLDER_COLORS = {
  Sorting: '#3b82f6',
  Arrays: '#8b5cf6',
  'Linked Lists': '#ec4899',
  'Dynamic Programming': '#f59e0b',
  Graphs: '#22c55e',
}

// ── User dropdown menu ────────────────────────────────────────────────────────
function UserDropdown({ user, onLogout, onProfile }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#16161f] border border-[#1e1e2e]
          hover:border-blue-500/30 hover:bg-[#1a1a28] transition-all"
      >
        <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30
          flex items-center justify-center text-xs font-bold text-blue-400">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <span className="text-sm text-[#c0c0d0]">{user?.name}</span>
        <ChevronDown
          size={13}
          className="text-[#4b4b6a] transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
        />
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[#1e1e2e]
              bg-[#111118] shadow-2xl overflow-hidden z-50"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-[#1e1e2e]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-500/15 border border-blue-500/25
                  flex items-center justify-center text-sm font-bold text-blue-400">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-[#4b4b6a] truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-1.5">
              <button
                onClick={() => { setOpen(false); onProfile() }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-sm text-[#c0c0d0] hover:bg-[#1a1a28] hover:text-white transition-colors text-left"
              >
                <User size={15} className="text-[#4b4b6a]" />
                View Profile
              </button>

              <div className="my-1 h-px bg-[#1e1e2e]" />

              <button
                onClick={() => { setOpen(false); onLogout() }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function DashboardPage() {
  const nav = useNavigate()
  const { user, logout } = useAuth()
  const { solvedCount, totalCount, percentage, isSolved } = useProgress()
  const [openFolders, setOpenFolders] = useState({ Sorting: true })
  const [openSubfolders, setOpenSubfolders] = useState({ 'Sorting-Algorithms': true })
  const [search, setSearch] = useState('')

  const folders = getFolders()

  const toggleFolder = (f) => setOpenFolders(p => ({ ...p, [f]: !p[f] }))
  const toggleSubfolder = (key) => setOpenSubfolders(p => ({ ...p, [key]: !p[key] }))

  const filtered = search
    ? PROBLEMS.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    : null

  const handleLogout = () => { logout(); nav('/') }
  const handleProfile = () => nav('/profile')

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* ── Topbar ──────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-[#1e1e2e] bg-[#0d0d15] sticky top-0 z-50">

        {/* Logo — clicks back to dashboard (home) */}
        <button
          onClick={() => nav('/dashboard')}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <Code2 size={15} className="text-white" />
          </div>
          <span className="font-display font-bold text-base text-white">CodeForge</span>
        </button>

        {/* Progress bar */}
        <div className="flex-1 max-w-sm mx-8">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#6b7280]">
              <span className="text-white font-semibold">{solvedCount}</span> / {totalCount} Solved
            </span>
            <span className="text-blue-400 font-medium">{percentage}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#1e1e2e] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* User dropdown */}
        <UserDropdown user={user} onLogout={handleLogout} onProfile={handleProfile} />
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="font-display font-black text-3xl text-white mb-1">
            Hello, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-[#6b7280] text-sm">
            {solvedCount === 0
              ? 'Ready to start? Pick a problem below.'
              : `You've solved ${solvedCount} problem${solvedCount > 1 ? 's' : ''}. Keep going!`}
          </p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: Trophy, label: 'Solved', value: solvedCount, color: '#f59e0b' },
            { icon: BookOpen, label: 'Total', value: totalCount, color: '#3b82f6' },
            { icon: Check, label: 'Progress', value: `${percentage}%`, color: '#22c55e' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="flex items-center gap-4 p-4 rounded-xl border border-[#1e1e2e] bg-[#111118]"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <div className="font-display font-bold text-xl text-white">{s.value}</div>
                <div className="text-xs text-[#6b7280]">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-7">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4b4b6a]" />
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111118] border border-[#1e1e2e]
              text-sm text-[#e2e2e8] placeholder-[#3a3a5a] outline-none
              focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10"
          />
        </div>

        {/* Search results */}
        {filtered && (
          <div className="mb-8 space-y-2">
            <p className="text-xs text-[#4b4b6a] mb-3">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
            </p>
            {filtered.length === 0 && (
              <div className="text-center py-10 text-[#4b4b6a] text-sm">No problems found.</div>
            )}
            {filtered.map(p => (
              <ProblemRow key={p.id} problem={p} solved={isSolved(p.id)} onClick={() => nav(`/problem/${p.id}`)} />
            ))}
          </div>
        )}

        {/* Folder tree */}
        {!filtered && (
          <div className="space-y-3">
            {folders.map((folder, fi) => {
              const subfolders = getSubfolders(folder)
              const folderProblems = PROBLEMS.filter(p => p.folder === folder)
              const folderSolved = folderProblems.filter(p => isSolved(p.id)).length

              return (
                <motion.div
                  key={folder}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: fi * 0.06 }}
                  className="rounded-xl border border-[#1e1e2e] bg-[#111118] overflow-hidden"
                >
                  {/* Folder header */}
                  <button
                    onClick={() => toggleFolder(folder)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#16161f] transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: FOLDER_COLORS[folder] || '#3b82f6' }}
                      />
                      <div>
                        <div className="font-semibold text-[#e2e2e8] text-sm">{folder}</div>
                        <div className="text-xs text-[#4b4b6a]">{folderSolved} / {folderProblems.length} solved</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-1 rounded-full bg-[#1e1e2e]">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all"
                          style={{ width: `${(folderSolved / folderProblems.length) * 100}%` }}
                        />
                      </div>
                      <ChevronDown
                        size={16} className="text-[#4b4b6a] transition-transform"
                        style={{ transform: openFolders[folder] ? 'rotate(0)' : 'rotate(-90deg)' }}
                      />
                    </div>
                  </button>

                  {/* Subfolders */}
                  <AnimatePresence>
                    {openFolders[folder] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-[#1e1e2e]">
                          {subfolders.map(sub => {
                            const subKey = `${folder}-${sub}`
                            const problems = getProblems(folder, sub)
                            const subSolved = problems.filter(p => isSolved(p.id)).length

                            return (
                              <div key={sub}>
                                <button
                                  onClick={() => toggleSubfolder(subKey)}
                                  className="w-full flex items-center justify-between px-5 py-3 pl-10 hover:bg-[#16161f] transition-colors text-left"
                                >
                                  <div className="flex items-center gap-2">
                                    <ChevronRight
                                      size={13} className="text-[#3a3a5a] transition-transform"
                                      style={{ transform: openSubfolders[subKey] ? 'rotate(90deg)' : 'rotate(0)' }}
                                    />
                                    <span className="text-xs font-medium text-[#8888aa]">{sub}</span>
                                    <span className="text-xs text-[#3a3a5a]">({subSolved}/{problems.length})</span>
                                  </div>
                                </button>

                                <AnimatePresence>
                                  {openSubfolders[subKey] && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      {problems.map(p => (
                                        <ProblemRow
                                          key={p.id} problem={p} solved={isSolved(p.id)}
                                          onClick={() => nav(`/problem/${p.id}`)}
                                          indent
                                        />
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function ProblemRow({ problem, solved, onClick, indent = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between py-3 pr-5 hover:bg-[#16161f]
        transition-colors text-left group border-t border-[#1e1e2e]/50
        ${indent ? 'pl-16' : 'pl-5'}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all
          ${solved ? 'bg-green-500/20 border-green-500/50' : 'border-[#2a2a3a] group-hover:border-blue-500/30'}`}>
          {solved && <Check size={11} className="text-green-400" />}
        </div>
        <span className={`text-sm transition-colors ${solved ? 'text-[#6b7280] line-through' : 'text-[#c0c0d0] group-hover:text-white'}`}>
          {problem.title}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <DifficultyBadge difficulty={problem.difficulty} />
        <ChevronRight size={13} className="text-[#2a2a3a] group-hover:text-blue-400 transition-colors" />
      </div>
    </button>
  )
}
