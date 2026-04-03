import { Loader2 } from 'lucide-react'

// ── Button ─────────────────────────────────────────────────────────────────
export function Button({
  children, onClick, variant = 'primary', size = 'md',
  disabled = false, loading = false, className = '', type = 'button', ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg cursor-pointer select-none border transition-all duration-150'
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600 text-white shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]',
    secondary: 'bg-transparent hover:bg-white/5 border-[#2a2a3a] hover:border-[#3b82f6]/40 text-[#a0a0b0]',
    ghost: 'bg-transparent hover:bg-white/5 border-transparent text-[#a0a0b0] hover:text-white',
    danger: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400 hover:text-red-300',
    success: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-400',
    run: 'bg-[#1a2e1a] hover:bg-[#1f381f] border-green-500/30 hover:border-green-500/60 text-green-400 hover:text-green-300',
    submit: 'bg-blue-500 hover:bg-blue-600 border-blue-500 text-white shadow-md hover:shadow-blue-500/30 active:scale-[0.98]',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  )
}

// ── Badge ──────────────────────────────────────────────────────────────────
export function Badge({ children, color = '#3b82f6', className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${className}`}
      style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}
    >
      {children}
    </span>
  )
}

export function DifficultyBadge({ difficulty }) {
  const colors = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' }
  return <Badge color={colors[difficulty] || '#3b82f6'}>{difficulty}</Badge>
}

// ── Spinner ────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = '#3b82f6' }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      className="animate-spin"
      style={{ color }}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="60" strokeDashoffset="20" />
    </svg>
  )
}

// ── Divider ────────────────────────────────────────────────────────────────
export function Divider({ label, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-px bg-[#1e1e2e]" />
      {label && <span className="text-xs text-[#4b4b6a]">{label}</span>}
      <div className="flex-1 h-px bg-[#1e1e2e]" />
    </div>
  )
}

// ── Input ──────────────────────────────────────────────────────────────────
export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-[#8888aa]">{label}</label>}
      <input
        className={`w-full px-3.5 py-2.5 rounded-lg bg-[#0d0d15] border text-sm text-[#f1f1f5] placeholder-[#3a3a5a] outline-none
          focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10
          ${error ? 'border-red-500/50' : 'border-[#1e1e2e]'}
          ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
