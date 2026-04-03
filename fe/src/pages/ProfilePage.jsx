import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Code2, ArrowLeft, Edit, Share2, Github, Twitter, Linkedin,
  MapPin, GraduationCap, Phone, Mail, ExternalLink, Trophy,
  CheckCircle, Flame, Calendar, User
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../context/ProgressContext'
import { PROBLEMS } from '../data/problems'

// ── Generate mock heatmap data (last 12 months) ──────────────────────────────
function generateHeatmap() {
  const data = {}
  const now = new Date()
  for (let i = 365; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const rand = Math.random()
    data[key] = rand > 0.72 ? (rand > 0.9 ? 3 : rand > 0.82 ? 2 : 1) : 0
  }
  return data
}
const HEATMAP_DATA = generateHeatmap()

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function HeatmapGrid() {
  const entries = Object.entries(HEATMAP_DATA)
  const weeks = []
  let week = []
  // pad start
  const firstDay = new Date(entries[0][0]).getDay()
  for (let i = 0; i < firstDay; i++) week.push(null)
  for (const [date, val] of entries) {
    week.push({ date, val })
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length) weeks.push(week)

  const totalSubmissions = entries.filter(([,v]) => v > 0).length
  const activeDays = entries.filter(([,v]) => v > 0).length

  // max streak
  let maxStreak = 0, cur = 0
  for (const [,v] of entries) {
    if (v > 0) { cur++; maxStreak = Math.max(maxStreak, cur) } else cur = 0
  }

  const colorMap = { 0: '#1a1a2e', 1: '#166534', 2: '#16a34a', 3: '#22c55e' }

  // get month labels positions
  const monthLabels = []
  let lastMonth = -1
  weeks.forEach((wk, wi) => {
    const firstReal = wk.find(d => d !== null)
    if (firstReal) {
      const m = new Date(firstReal.date).getMonth()
      if (m !== lastMonth) { monthLabels.push({ month: m, weekIdx: wi }); lastMonth = m }
    }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-white">
          {totalSubmissions} submissions in the last 12 months
        </span>
        <div className="flex items-center gap-2 text-xs text-[#4b4b6a]">
          <span>Less</span>
          {[0,1,2,3].map(v => (
            <div key={v} className="w-3 h-3 rounded-sm" style={{ background: colorMap[v] }} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Month labels */}
      <div className="flex mb-1" style={{ paddingLeft: 0 }}>
        {weeks.map((_, wi) => {
          const label = monthLabels.find(ml => ml.weekIdx === wi)
          return (
            <div key={wi} className="text-[10px] text-[#4b4b6a]" style={{ width: 14, marginRight: 2, flexShrink: 0 }}>
              {label ? MONTHS[label.month] : ''}
            </div>
          )
        })}
      </div>

      {/* Grid */}
      <div className="flex gap-0.5 overflow-x-auto pb-2">
        {weeks.map((wk, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {wk.map((cell, di) => (
              <div
                key={di}
                title={cell ? `${cell.date}: ${cell.val} submission${cell.val > 1 ? 's' : ''}` : ''}
                className="w-3 h-3 rounded-sm transition-all hover:ring-1 hover:ring-white/20"
                style={{ background: cell ? colorMap[cell.val] : '#1a1a2e', opacity: cell === null ? 0 : 1 }}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6 mt-3 text-xs text-[#4b4b6a]">
        <span>Active Days — <span className="text-white">{activeDays}</span></span>
        <span>Max Streak — <span className="text-white">{maxStreak}</span></span>
      </div>
    </div>
  )
}

// ── Donut chart SVG ──────────────────────────────────────────────────────────
function DonutChart({ easy, medium, hard, totalSolved, total }) {
  const r = 60, cx = 80, cy = 80, strokeW = 14
  const circumference = 2 * Math.PI * r
  const easyPct = easy / total
  const medPct = medium / total
  const hardPct = hard / total
  const gap = 0.01

  const easyDash = circumference * (easyPct - gap)
  const medDash = circumference * (medPct - gap)
  const hardDash = circumference * (hardPct - gap)

  const easyOffset = 0
  const medOffset = -(circumference * easyPct)
  const hardOffset = -(circumference * (easyPct + medPct))

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={160} height={160}>
          {/* Background */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a1a2e" strokeWidth={strokeW} />
          {/* Easy */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#22c55e" strokeWidth={strokeW}
            strokeDasharray={`${easyDash} ${circumference}`}
            strokeDashoffset={-circumference * easyOffset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />
          {/* Medium */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f59e0b" strokeWidth={strokeW}
            strokeDasharray={`${medDash} ${circumference}`}
            strokeDashoffset={circumference * (easyPct) - circumference}
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />
          {/* Hard */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ef4444" strokeWidth={strokeW}
            strokeDasharray={`${hardDash} ${circumference}`}
            strokeDashoffset={circumference * (easyPct + medPct) - circumference}
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-white">{totalSolved}</span>
          <span className="text-xs text-[#4b4b6a]">{total}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 mt-2 text-xs">
        {[['#22c55e','Easy',easy,346],['#f59e0b','Medium',medium,476],['#ef4444','Hard',hard,254]].map(([c,l,v,t]) => (
          <div key={l} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: c }} />
            <span className="text-[#8888aa]">{l}</span>
            <span className="text-white font-semibold ml-1">{v}/{t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const nav = useNavigate()
  const { user } = useAuth()
  const { solvedCount, totalCount, solved } = useProgress()

  // Count by difficulty
  const easyS = PROBLEMS.filter(p => p.difficulty === 'Easy' && solved.has(p.id)).length
  const medS  = PROBLEMS.filter(p => p.difficulty === 'Medium' && solved.has(p.id)).length
  const hardS = PROBLEMS.filter(p => p.difficulty === 'Hard' && solved.has(p.id)).length

  const profile = user?.profile || {}

  const socialLinks = [
    { label: 'GitHub', url: profile.github, icon: Github },
    { label: 'Twitter', url: profile.twitter, icon: Twitter },
    { label: 'LinkedIn', url: profile.linkedin, icon: Linkedin },
  ].filter(s => s.url)

  const codingProfiles = [
    { label: 'LeetCode', url: profile.leetcode },
    { label: 'HackerRank', url: profile.hackerrank },
    { label: 'Codeforces', url: profile.codeforces },
    { label: 'GeeksForGeeks', url: profile.gfg },
  ].filter(c => c.url)

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5
        border-b border-[#1e1e2e] bg-[#0d0d15]">
        <button onClick={() => nav('/dashboard')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <Code2 size={15} className="text-white" />
          </div>
          <span className="font-display font-bold text-base text-white">CodeForge</span>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => nav('/edit-profile')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1e1e2e]
              bg-[#16161f] text-xs text-[#c0c0d0] hover:border-blue-500/40 transition-all">
            <Edit size={13} /> Edit Profile
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1e1e2e]
            bg-[#16161f] text-xs text-[#c0c0d0] hover:border-[#2a2a3a] transition-all">
            <Share2 size={13} /> Share Profile
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-[280px_1fr] gap-6">

          {/* ── LEFT SIDEBAR ───────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Avatar + name */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-xl border border-[#1e1e2e] bg-[#111118]">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-20 h-20 rounded-full bg-[#1e1e2e] border-2 border-[#2a2a3a]
                  flex items-center justify-center">
                  {profile.avatar
                    ? <img src={profile.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                    : <User size={32} className="text-[#4b4b6a]" />
                  }
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-white">{user?.name}</h2>
                  <p className="text-xs text-[#4b4b6a] mt-0.5">@{user?.email?.split('@')[0]}</p>
                </div>
                {(profile.location || profile.education) && (
                  <div className="space-y-1.5 w-full text-left">
                    {profile.location && (
                      <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                        <MapPin size={12} className="text-[#4b4b6a]" />
                        {profile.location}
                      </div>
                    )}
                    {profile.education && (
                      <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                        <GraduationCap size={12} className="text-[#4b4b6a]" />
                        {profile.education}
                      </div>
                    )}
                    {profile.mobile && (
                      <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                        <Phone size={12} className="text-[#4b4b6a]" />
                        {profile.mobile}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                      <Mail size={12} className="text-[#4b4b6a]" />
                      {user?.email}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Social links */}
            {socialLinks.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="p-4 rounded-xl border border-[#1e1e2e] bg-[#111118]">
                <h3 className="text-xs font-semibold text-[#4b4b6a] uppercase tracking-wider mb-3">Social</h3>
                <div className="space-y-2">
                  {socialLinks.map(s => (
                    <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-[#8888aa] hover:text-white transition-colors">
                      <s.icon size={13} />
                      <span>{s.label}</span>
                      <ExternalLink size={10} className="ml-auto text-[#2a2a3a]" />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Coding profiles */}
            {codingProfiles.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="p-4 rounded-xl border border-[#1e1e2e] bg-[#111118]">
                <h3 className="text-xs font-semibold text-[#4b4b6a] uppercase tracking-wider mb-3">Coding Profiles</h3>
                <div className="space-y-2">
                  {codingProfiles.map(c => (
                    <a key={c.label} href={c.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-[#8888aa] hover:text-white transition-colors">
                      <Code2 size={12} />
                      <span>{c.label}</span>
                      <ExternalLink size={10} className="ml-auto text-[#2a2a3a]" />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Empty state prompt */}
            {socialLinks.length === 0 && codingProfiles.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="p-4 rounded-xl border border-dashed border-[#1e1e2e] text-center">
                <p className="text-xs text-[#2a2a4a] mb-2">No links added yet</p>
                <button onClick={() => nav('/edit-profile')}
                  className="text-xs text-blue-400 hover:text-blue-300">
                  + Edit profile to add links
                </button>
              </motion.div>
            )}
          </div>

          {/* ── RIGHT CONTENT ───────────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Top row: DSA Progress + Stats */}
            <div className="grid grid-cols-2 gap-5">
              {/* DSA Progress donut */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-xl border border-[#1e1e2e] bg-[#111118]">
                <h3 className="text-sm font-bold text-white mb-4">DSA Progress</h3>
                <div className="flex items-center justify-center">
                  <DonutChart
                    easy={easyS} medium={medS} hard={hardS}
                    totalSolved={solvedCount} total={totalCount}
                  />
                </div>
              </motion.div>

              {/* Quick stats */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 }}
                className="p-5 rounded-xl border border-[#1e1e2e] bg-[#111118]">
                <h3 className="text-sm font-bold text-white mb-4">Stats</h3>
                <div className="space-y-3">
                  {[
                    { icon: Trophy, label: 'Problems Solved', value: solvedCount, color: '#f59e0b' },
                    { icon: CheckCircle, label: 'Easy Solved', value: easyS, color: '#22c55e' },
                    { icon: CheckCircle, label: 'Medium Solved', value: medS, color: '#f59e0b' },
                    { icon: CheckCircle, label: 'Hard Solved', value: hardS, color: '#ef4444' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <s.icon size={14} style={{ color: s.color }} />
                        <span className="text-xs text-[#6b7280]">{s.label}</span>
                      </div>
                      <span className="text-sm font-bold text-white">{s.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Activity heatmap */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="p-5 rounded-xl border border-[#1e1e2e] bg-[#111118] overflow-hidden">
              <HeatmapGrid />
            </motion.div>

            {/* Recent Solved */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="p-5 rounded-xl border border-[#1e1e2e] bg-[#111118]">
              <h3 className="text-sm font-bold text-white mb-4">Recently Solved</h3>
              {solvedCount === 0 ? (
                <div className="text-center py-8">
                  <Trophy size={28} className="text-[#1e1e2e] mx-auto mb-2" />
                  <p className="text-xs text-[#2a2a4a]">No problems solved yet. Start coding!</p>
                  <button onClick={() => nav('/dashboard')}
                    className="mt-3 text-xs text-blue-400 hover:text-blue-300">
                    Go to problems →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {PROBLEMS.filter(p => solved.has(p.id)).map(p => (
                    <div key={p.id}
                      className="flex items-center justify-between py-2 border-b border-[#1e1e2e]/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/40
                          flex items-center justify-center">
                          <CheckCircle size={10} className="text-green-400" />
                        </div>
                        <span className="text-sm text-[#c0c0d0]">{p.title}</span>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded"
                        style={{
                          color: { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' }[p.difficulty],
                          background: { Easy: 'rgba(34,197,94,0.08)', Medium: 'rgba(245,158,11,0.08)', Hard: 'rgba(239,68,68,0.08)' }[p.difficulty],
                        }}>
                        {p.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
