import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Code2, Mail, Lock, User, Eye, EyeOff, ArrowLeft, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, Divider, Input } from '../components/ui'
import OtpInput from '../components/auth/OtpInput'
import toast from 'react-hot-toast'

const slide = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
}

// ── Google icon SVG ───────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export default function AuthPage() {
  const nav = useNavigate()
  const { login, loginWithGoogle, signup, verifyOtp, loading } = useAuth()

  const [view, setView] = useState('login') // 'login' | 'signup' | 'otp'
  const [showPass, setShowPass] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [otpTimer, setOtpTimer] = useState(60)
  const [otpError, setOtpError] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const [pendingName, setPendingName] = useState('')

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})

  // OTP countdown
  useEffect(() => {
    if (view !== 'otp') return
    setOtpTimer(60)
    const interval = setInterval(() => {
      setOtpTimer(t => (t <= 1 ? (clearInterval(interval), 0) : t - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [view])

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    const errs = {}
    if (!loginForm.email) errs.email = 'Email is required'
    if (!loginForm.password) errs.password = 'Password is required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    const res = await login(loginForm)
    if (res.success) { toast.success('Welcome back!'); nav('/dashboard') }
    else toast.error(res.error || 'Login failed')
  }

  // ── Google ─────────────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    const res = await loginWithGoogle()
    if (res.success) { toast.success('Signed in with Google!'); nav('/dashboard') }
  }

  // ── Signup ─────────────────────────────────────────────────────────────────
  const handleSignup = async () => {
    const errs = {}
    if (!signupForm.name) errs.name = 'Name is required'
    if (!signupForm.email) errs.email = 'Email is required'
    if (signupForm.password.length < 6) errs.password = 'Minimum 6 characters'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    const res = await signup(signupForm)
    if (res.success) {
      setPendingEmail(signupForm.email)
      setPendingName(signupForm.name)
      toast.success('OTP sent to your email!')
      setView('otp')
    }
  }

  // ── Verify OTP ─────────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    setOtpError('')
    if (otpValue.length < 6) { setOtpError('Enter all 6 digits'); return }
    const res = await verifyOtp({ email: pendingEmail, otp: otpValue, name: pendingName })
    if (res.success) { toast.success('Account created!'); nav('/dashboard') }
    else setOtpError(res.error || 'Invalid OTP')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Left panel - brand */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 border-r border-[#1e1e2e] p-10 relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.06) 0%, transparent 60%)' }} />
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Code2 size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">CodeForge</span>
        </div>

        <div className="relative z-10">
          <h2 className="font-display font-black text-4xl text-white leading-tight mb-4">
            Level up your<br />
            <span className="text-gradient">coding skills</span>
          </h2>
          <p className="text-[#6b7280] leading-relaxed text-sm">
            Structured problems, real execution, instant feedback.
            The focused practice platform built for serious learners.
          </p>

          <div className="mt-8 space-y-3">
            {['8+ problems across 5 topic areas', 'Monaco Editor with syntax highlighting', 'Judge0-powered code execution', 'Track your progress over time'].map(t => (
              <div key={t} className="flex items-center gap-2.5 text-sm text-[#8888aa]">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-[#3a3a5a]">© 2024 CodeForge. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">

            {/* ── LOGIN ────────────────────────────────────────────────────── */}
            {view === 'login' && (
              <motion.div key="login" {...slide} className="space-y-6">
                <div>
                  <h1 className="font-display font-bold text-2xl text-white mb-1">Welcome back</h1>
                  <p className="text-sm text-[#6b7280]">Sign in to continue solving problems</p>
                </div>

                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-[#1e1e2e] bg-[#111118] hover:bg-[#16161f] hover:border-[#2a2a3a] text-sm text-[#e2e2e8] transition-all"
                >
                  <GoogleIcon /> Continue with Google
                </button>

                <Divider label="or continue with email" />

                <div className="space-y-4">
                  <Input
                    label="Email" type="email" placeholder="you@example.com"
                    value={loginForm.email} error={errors.email}
                    onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                  />
                  <div className="relative">
                    <Input
                      label="Password" type={showPass ? 'text' : 'password'}
                      placeholder="••••••••" value={loginForm.password} error={errors.password}
                      onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    />
                    <button
                      onClick={() => setShowPass(p => !p)}
                      className="absolute right-3 top-8 text-[#4b4b6a] hover:text-[#8888aa]"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <Button variant="primary" onClick={handleLogin} loading={loading} className="w-full">
                  Sign In
                </Button>

                <p className="text-center text-sm text-[#6b7280]">
                  Don't have an account?{' '}
                  <button onClick={() => { setView('signup'); setErrors({}) }} className="text-blue-400 hover:text-blue-300 font-medium">
                    Sign up free
                  </button>
                </p>
              </motion.div>
            )}

            {/* ── SIGNUP ───────────────────────────────────────────────────── */}
            {view === 'signup' && (
              <motion.div key="signup" {...slide} className="space-y-6">
                <div className="flex items-center gap-3">
                  <button onClick={() => setView('login')} className="text-[#4b4b6a] hover:text-white">
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <h1 className="font-display font-bold text-2xl text-white">Create account</h1>
                    <p className="text-sm text-[#6b7280]">We'll send you an OTP to verify</p>
                  </div>
                </div>

                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-[#1e1e2e] bg-[#111118] hover:bg-[#16161f] hover:border-[#2a2a3a] text-sm text-[#e2e2e8] transition-all"
                >
                  <GoogleIcon /> Sign up with Google
                </button>

                <Divider label="or sign up with email" />

                <div className="space-y-4">
                  <Input
                    label="Full Name" type="text" placeholder="Umang Varotariya"
                    value={signupForm.name} error={errors.name}
                    onChange={e => setSignupForm(p => ({ ...p, name: e.target.value }))}
                  />
                  <Input
                    label="Email" type="email" placeholder="you@example.com"
                    value={signupForm.email} error={errors.email}
                    onChange={e => setSignupForm(p => ({ ...p, email: e.target.value }))}
                  />
                  <div className="relative">
                    <Input
                      label="Password" type={showPass ? 'text' : 'password'}
                      placeholder="Min. 6 characters" value={signupForm.password} error={errors.password}
                      onChange={e => setSignupForm(p => ({ ...p, password: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleSignup()}
                    />
                    <button
                      onClick={() => setShowPass(p => !p)}
                      className="absolute right-3 top-8 text-[#4b4b6a] hover:text-[#8888aa]"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <Button variant="primary" onClick={handleSignup} loading={loading} className="w-full">
                  Create Account & Send OTP
                </Button>

                <p className="text-center text-sm text-[#6b7280]">
                  Already have an account?{' '}
                  <button onClick={() => { setView('login'); setErrors({}) }} className="text-blue-400 hover:text-blue-300 font-medium">
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}

            {/* ── OTP ──────────────────────────────────────────────────────── */}
            {view === 'otp' && (
              <motion.div key="otp" {...slide} className="space-y-6">
                <div className="flex items-center gap-3">
                  <button onClick={() => setView('signup')} className="text-[#4b4b6a] hover:text-white">
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <h1 className="font-display font-bold text-2xl text-white">Verify email</h1>
                    <p className="text-sm text-[#6b7280]">
                      Code sent to <span className="text-blue-400">{pendingEmail}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6 space-y-4">
                  <p className="text-center text-sm text-[#8888aa]">Enter the 6-digit code</p>
                  <OtpInput length={6} onChange={setOtpValue} error={otpError} />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#4b4b6a]">
                    {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Didn\'t receive it?'}
                  </span>
                  <button
                    disabled={otpTimer > 0}
                    onClick={() => { setOtpTimer(60); toast.success('OTP resent!') }}
                    className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={13} /> Resend
                  </button>
                </div>

                <Button variant="primary" onClick={handleVerifyOtp} loading={loading} className="w-full">
                  Verify & Continue
                </Button>

                <p className="text-center text-xs text-[#3a3a5a]">
                  For this demo, any 6-digit code will work
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
