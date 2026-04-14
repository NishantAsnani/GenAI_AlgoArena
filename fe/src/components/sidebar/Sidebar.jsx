import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, ChevronRight, Check, Code2, User, LogOut, Settings } from 'lucide-react'
import { useProgress } from '../../context/ProgressContext'
import { useAuth } from '../../context/AuthContext'
import { getFolders, getSubfolders, getProblems } from '../../data/problems'

export default function Sidebar({ open, onClose, currentProblemId }) {
  const nav = useNavigate()
  const { isSolved } = useProgress()
  const { user, logout } = useAuth()
  const [openFolders, setOpenFolders] = useState({})
  const [openSubfolders, setOpenSubfolders] = useState({})
  const folders = getFolders()

  const toggle = (key, setter) => setter(p => ({ ...p, [key]: !p[key] }))

  const goTo = (id) => { onClose(); nav(`/problem/${id}`) }
  const goProfile = () => { onClose(); nav('/profile') }
  const goEditProfile = () => { onClose(); nav('/edit-profile') }
  const handleLogout = () => { onClose(); logout(); nav('/') }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 top-0 h-full w-72 z-50 flex flex-col border-r border-[#1e1e2e]"
            style={{ background: '#0d0d15' }}
          >
            {/* ── Header ────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#1e1e2e] flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
                  <Code2 size={13} className="text-white" />
                </div>
                <span className="font-display font-bold text-sm text-white">Problems</span>
              </div>
              <button
                onClick={onClose}
                className="text-[#4b4b6a] hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all"
              >
                <X size={15} />
              </button>
            </div>

            {/* ── Folder Tree ───────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto py-2">
              {folders.map(folder => {
                const subs = getSubfolders(folder)
                const folderOpen = openFolders[folder]

                return (
                  <div key={folder}>
                    {/* Folder row — plain bullet, no emoji */}
                    <button
                      onClick={() => toggle(folder, setOpenFolders)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left group"
                    >
                      {/* Bullet dot */}
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors"
                        style={{ background: folderOpen ? '#3b82f6' : '#3a3a5a' }}
                      />
                      <span className="flex-1 text-sm font-medium text-[#c0c0d0] group-hover:text-white transition-colors">
                        {folder}
                      </span>
                      <ChevronRight
                        size={14}
                        className="text-[#3a3a5a] transition-transform flex-shrink-0"
                        style={{ transform: folderOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      />
                    </button>

                    <AnimatePresence>
                      {folderOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          {subs.map(sub => {
                            const subKey = `${folder}-${sub}`
                            const subOpen = openSubfolders[subKey]
                            const problems = getProblems(folder, sub)

                            return (
                              <div key={sub}>
                                {/* Subfolder row */}
                                <button
                                  onClick={() => toggle(subKey, setOpenSubfolders)}
                                  className="w-full flex items-center gap-2.5 pl-9 pr-4 py-2 hover:bg-white/5 transition-colors text-left"
                                >
                                  <span className="w-1 h-1 rounded-full bg-[#2a2a4a] flex-shrink-0" />
                                  <span className="flex-1 text-xs font-medium text-[#6b7280]">{sub}</span>
                                  <ChevronRight
                                    size={11}
                                    className="text-[#2a2a4a] transition-transform flex-shrink-0"
                                    style={{ transform: subOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                                  />
                                </button>

                                <AnimatePresence>
                                  {subOpen && (
                                    <motion.div
                                      initial={{ height: 0 }}
                                      animate={{ height: 'auto' }}
                                      exit={{ height: 0 }}
                                      transition={{ duration: 0.15 }}
                                      className="overflow-hidden"
                                    >
                                      {problems.map(p => {
                                        const solved = isSolved(p.id)
                                        const current = p.id === currentProblemId

                                        return (
                                          <button
                                            key={p.id}
                                            onClick={() => goTo(p.id)}
                                            className={`w-full flex items-center gap-2.5 pl-14 pr-4 py-2 text-left transition-colors
                                              ${current
                                                ? 'bg-blue-500/10 border-r-2 border-blue-500'
                                                : 'hover:bg-white/5'
                                              }`}
                                          >
                                            {/* Solved indicator */}
                                            <div
                                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all
                                                ${solved
                                                  ? 'bg-green-500/20 border-green-500/50'
                                                  : 'border-[#2a2a3a]'
                                                }`}
                                            >
                                              {solved && <Check size={8} className="text-green-400" />}
                                            </div>

                                            <span
                                              className={`flex-1 text-xs truncate transition-colors
                                                ${current
                                                  ? 'text-blue-400 font-medium'
                                                  : solved
                                                  ? 'text-[#4b4b6a] line-through'
                                                  : 'text-[#a0a0b8]'
                                                }`}
                                            >
                                              {p.title}
                                            </span>

                                            {/* Difficulty letter */}
                                            <span
                                              className="text-[10px] font-semibold flex-shrink-0"
                                              style={{
                                                color: {
                                                  Easy: '#22c55e',
                                                  Medium: '#f59e0b',
                                                  Hard: '#ef4444',
                                                }[p.difficulty],
                                              }}
                                            >
                                              {p.difficulty[0]}
                                            </span>
                                          </button>
                                        )
                                      })}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>

            {/* ── Bottom Profile Section ────────────────────────────── */}
            <div className="flex-shrink-0 border-t border-[#1e1e2e]">
              {/* User card */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1e1e2e]">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-blue-500/15 border border-blue-500/25
                  flex items-center justify-center text-sm font-bold text-blue-400 flex-shrink-0">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate leading-tight">
                    {user?.name}
                  </p>
                  <p className="text-xs text-[#4b4b6a] truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-2 space-y-0.5">
                <button
                  onClick={goProfile}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    text-sm text-[#a0a0b8] hover:bg-white/5 hover:text-white transition-all text-left"
                >
                  <User size={14} className="text-[#4b4b6a] flex-shrink-0" />
                  View Profile
                </button>

                <button
                  onClick={goEditProfile}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    text-sm text-[#a0a0b8] hover:bg-white/5 hover:text-white transition-all text-left"
                >
                  <Settings size={14} className="text-[#4b4b6a] flex-shrink-0" />
                  Edit Profile
                </button>

                <div className="my-1 h-px bg-[#1e1e2e]" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    text-sm text-red-400 hover:bg-red-500/10 transition-all text-left"
                >
                  <LogOut size={14} className="flex-shrink-0" />
                  Logout
                </button>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
