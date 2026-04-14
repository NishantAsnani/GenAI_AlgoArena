import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code2, Zap, Trophy, ChevronRight, Terminal, GitBranch, Cpu } from 'lucide-react'
import { Button } from '../components/ui'

const FEATURES = [
  {
    icon: Terminal,
    title: 'In-Browser IDE',
    desc: 'Monaco Editor with full syntax highlighting, autocomplete, and multi-language support — exactly like VS Code.',
    color: '#3b82f6',
  },
  {
    icon: Zap,
    title: 'Instant Execution',
    desc: 'Self-hosted Judge0 engine runs your code in isolated sandboxes. Get stdout, stderr, and runtime in real time.',
    color: '#a78bfa',
  },
  {
    icon: Trophy,
    title: 'Track Progress',
    desc: 'Solve problems, earn checkmarks, and watch your progress bar grow across every topic and difficulty.',
    color: '#22c55e',
  },
  {
    icon: GitBranch,
    title: 'Structured Topics',
    desc: 'Problems organized in 3-level folders: Topic → Subtopic → Problem. Never lose your place in the journey.',
    color: '#f59e0b',
  },
  {
    icon: Cpu,
    title: 'Hidden Test Cases',
    desc: 'Sample cases on Run. Hidden edge cases on Submit. Mirrors real interview-grade assessment.',
    color: '#ec4899',
  },
  {
    icon: Code2,
    title: 'Multi-Language',
    desc: 'Write in C++, Python, Java, or JavaScript. Switch languages per problem with persisted starter code.',
    color: '#06b6d4',
  },
]

const STATS = [
  { value: '8+', label: 'Problems' },
  { value: '4', label: 'Languages' },
  { value: '5', label: 'Topic Areas' },
  { value: '100%', label: 'Free' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function LandingPage() {
  const nav = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none">
        <div style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          width: '100%', height: '100%',
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px]"
          style={{ background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.07) 0%, transparent 70%)' }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-[#1e1e2e]/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <Code2 size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight">AlgoArena</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => nav('/auth')}>Sign In</Button>
          <Button variant="primary" size="sm" onClick={() => nav('/auth')}>
            Get Started <ChevronRight size={14} />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pt-28 pb-20 text-center">
        <motion.div {...fadeUp(0.05)}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-blue-500/20 text-blue-400 bg-blue-500/5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Now with Judge0 Self-Hosted Execution
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp(0.1)}
          className="font-display font-black text-5xl md:text-7xl text-white leading-[1.05] tracking-tight mb-6"
        >
          Master Coding
          <br />
          <span className="text-gradient">Problem by Problem</span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.18)}
          className="text-[#8888aa] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
        >
          A structured coding platform with a real in-browser IDE, instant code execution,
          and progress tracking across every topic you need to crack.
        </motion.p>

        <motion.div {...fadeUp(0.24)} className="flex items-center justify-center gap-4">
          <Button variant="primary" size="lg" onClick={() => nav('/auth')} className="glow-blue">
            Start Solving Free <ChevronRight size={16} />
          </Button>
          <Button variant="secondary" size="lg" onClick={() => nav('/auth')}>
            Sign In
          </Button>
        </motion.div>

        {/* Stats row */}
        <motion.div {...fadeUp(0.32)} className="flex items-center justify-center gap-10 mt-16 pt-16 border-t border-[#1e1e2e]/60">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="font-display font-bold text-2xl text-white">{s.value}</div>
              <div className="text-xs text-[#6b7280] mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Preview mockup */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-[#1e1e2e] overflow-hidden shadow-2xl"
          style={{ background: '#111118' }}
        >
          {/* Fake window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e1e2e] bg-[#0d0d15]">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <div className="ml-3 flex-1 h-5 rounded bg-[#1a1a28] max-w-xs" />
          </div>
          {/* Fake IDE preview */}
          <div className="flex h-64">
            <div className="w-48 border-r border-[#1e1e2e] p-3 space-y-2">
              {['Sorting', 'Arrays', 'Linked Lists', 'Graphs', 'Dynamic Programming'].map((f, i) => (
                <div key={f} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs ${i === 0 ? 'text-blue-400 bg-blue-500/10' : 'text-[#6b7280]'}`}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: i === 0 ? '#3b82f6' : '#2a2a3a' }} />
                  {f}
                </div>
              ))}
            </div>
            <div className="flex-1 p-4 font-mono text-xs space-y-1.5 text-[#8888aa]">
              {[
                { line: 'class Solution {', color: '#60a5fa' },
                { line: 'public:', color: '#a78bfa' },
                { line: '    vector<int> selectionSort(vector<int>& nums) {', color: '#e2e2e2' },
                { line: '        int n = nums.size();', color: '#8888aa' },
                { line: '        for (int i = 0; i < n - 1; i++) {', color: '#8888aa' },
                { line: '            int minIdx = i;', color: '#8888aa' },
                { line: '        }', color: '#8888aa' },
                { line: '    }', color: '#8888aa' },
                { line: '};', color: '#60a5fa' },
              ].map((l, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-[#2a2a4a] w-4">{i + 1}</span>
                  <span style={{ color: l.color }}>{l.line}</span>
                </div>
              ))}
            </div>
            <div className="w-64 border-l border-[#1e1e2e] p-3">
              <div className="text-xs text-green-400 font-medium mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400" /> Test Cases
              </div>
              {['Case 1 ✓', 'Case 2 ✓'].map(c => (
                <div key={c} className="text-xs text-[#4b6b4b] bg-green-500/5 border border-green-500/10 rounded px-2 py-1.5 mb-1.5">{c}</div>
              ))}
              <div className="mt-3 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded px-2 py-2 text-center font-medium">
                ✓ Accepted
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pb-24">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-display font-bold text-3xl text-white text-center mb-3"
        >
          Everything you need to level up
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[#6b7280] text-center mb-12"
        >
          Built for focused, structured practice — not distraction.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="p-5 rounded-xl border border-[#1e1e2e] bg-[#111118] hover:border-[#2a2a3a] group"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                style={{ background: `${f.color}15`, border: `1px solid ${f.color}25` }}>
                <f.icon size={18} style={{ color: f.color }} />
              </div>
              <h3 className="font-semibold text-[#e2e2e8] mb-2">{f.title}</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-2xl mx-auto px-8 pb-24 text-center">
        <div className="p-10 rounded-2xl border border-blue-500/20 bg-blue-500/5">
          <h2 className="font-display font-bold text-3xl text-white mb-3">Ready to start?</h2>
          <p className="text-[#6b7280] mb-7">Create a free account and solve your first problem in minutes.</p>
          <Button variant="primary" size="lg" onClick={() => nav('/auth')} className="glow-blue">
            Create Free Account <ChevronRight size={16} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1e1e2e] px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
            <Code2 size={12} className="text-white" />
          </div>
          <span className="font-display font-bold text-sm text-white">CodeForge</span>
        </div>
        <span className="text-xs text-[#3a3a5a]">Built for developers, by developers.</span>
      </footer>
    </div>
  )
}
