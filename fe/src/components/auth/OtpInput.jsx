import { useRef, useState, useEffect } from 'react'

export default function OtpInput({ length = 6, onChange, error }) {
  const [values, setValues] = useState(Array(length).fill(''))
  const refs = useRef([])

  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  const handleChange = (idx, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...values]
    next[idx] = val
    setValues(next)
    onChange?.(next.join(''))
    if (val && idx < length - 1) refs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !values[idx] && idx > 0) {
      refs.current[idx - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && idx > 0) refs.current[idx - 1]?.focus()
    if (e.key === 'ArrowRight' && idx < length - 1) refs.current[idx + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    const next = Array(length).fill('')
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setValues(next)
    onChange?.(next.join(''))
    const focusIdx = Math.min(pasted.length, length - 1)
    refs.current[focusIdx]?.focus()
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2.5 justify-center">
        {values.map((val, idx) => (
          <input
            key={idx}
            ref={el => refs.current[idx] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={val}
            onChange={e => handleChange(idx, e)}
            onKeyDown={e => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className={`w-11 h-13 text-center text-lg font-semibold rounded-lg bg-[#0d0d15] border outline-none
              transition-all duration-150
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:scale-105
              ${error ? 'border-red-500/50 text-red-400' : val ? 'border-blue-500/60 text-blue-400' : 'border-[#1e1e2e] text-[#f1f1f5]'}`}
            style={{ height: '52px', fontFamily: 'JetBrains Mono, monospace' }}
          />
        ))}
      </div>
      {error && <p className="text-center text-xs text-red-400">{error}</p>}
    </div>
  )
}
