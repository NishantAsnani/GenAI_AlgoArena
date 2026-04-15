// src/components/ui/index.jsx
import { Loader2 } from 'lucide-react'

// ── Button ─────────────────────────────────────────────────────────────────────
export function Button({
  children, onClick, variant = 'primary', size = 'md',
  disabled = false, loading = false, className = '', type = 'button', ...props
}) {
  const base  = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg cursor-pointer select-none border transition-all duration-150'
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  const variants = {
    primary:
      'bg-orange-500 hover:bg-orange-600 border-orange-500 hover:border-orange-600 text-white shadow-md active:scale-[0.98]',
    secondary:
      'bg-white hover:bg-orange-50 border-orange-400 text-black hover:border-orange-500',
    ghost:
      'bg-transparent hover:bg-gray-100 border-transparent text-black',
    danger:
      'bg-red-50 hover:bg-red-100 border-red-300 text-black',
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

// ── Divider ────────────────────────────────────────────────────────────────────
export function Divider({ label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-gray-200" />
      {label && <span className="text-xs font-medium text-black whitespace-nowrap">{label}</span>}
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}

// ── Input ──────────────────────────────────────────────────────────────────────
export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-black">{label}</label>
      )}
      <input
        className={`w-full px-3.5 py-2.5 rounded-lg bg-white border text-sm text-black
          font-medium placeholder-gray-400 outline-none
          focus:border-orange-500 focus:ring-2 focus:ring-orange-200
          transition-all duration-150
          ${error ? 'border-red-400' : 'border-gray-300 hover:border-gray-400'}
          ${className}`}
        {...props}
      />
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </div>
  )
}

// ── Badge ──────────────────────────────────────────────────────────────────────
export function Badge({ children, color = '#f97316', className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${className}`}
      style={{ color: '#000000', background: `${color}20`, border: `1px solid ${color}40` }}
    >
      {children}
    </span>
  )
}
