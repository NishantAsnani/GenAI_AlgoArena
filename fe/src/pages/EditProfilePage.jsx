import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code2, ArrowLeft, Save, User, Link, Code } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const COUNTRY_CODES = ['+91 IN', '+1 US', '+44 UK', '+61 AU', '+81 JP', '+49 DE', '+33 FR']
const GRAD_YEARS = ['2024', '2025', '2026', '2027', '2028', '2029', '2030']

function SectionCard({ title, icon: Icon, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[#1e1e2e] bg-[#111118] overflow-hidden mb-6"
    >
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#1e1e2e]">
        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20
          flex items-center justify-center">
          <Icon size={14} className="text-blue-400" />
        </div>
        <h2 className="font-display font-bold text-sm text-white">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  )
}

function FieldGrid({ children }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-4">{children}</div>
}

function Field({ label, children, full = false }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <label className="block text-xs font-medium text-[#6b7280] mb-2">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ placeholder, value, onChange, type = 'text' }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 rounded-lg bg-[#0d0d15] border border-[#1e1e2e]
        text-sm text-[#e2e2e8] placeholder-[#2a2a4a] outline-none
        focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 transition-all"
    />
  )
}

function Select({ options, value, onChange, placeholder }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 rounded-lg bg-[#0d0d15] border border-[#1e1e2e]
        text-sm text-[#e2e2e8] outline-none focus:border-blue-500/40 cursor-pointer
        focus:ring-1 focus:ring-blue-500/10 transition-all appearance-none"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function SaveButton({ onClick, saving }) {
  return (
    <div className="flex justify-end mt-4">
      <button
        onClick={onClick}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#3b2a1a] border border-orange-500/30
          text-orange-400 text-sm font-medium hover:bg-[#4a3520] hover:border-orange-500/50
          disabled:opacity-50 transition-all"
      >
        <Save size={14} />
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )
}

export default function EditProfilePage() {
  const nav = useNavigate()
  const { user, updateProfile } = useAuth()
  const p = user?.profile || {}

  // Basic info
  const [name, setName] = useState(user?.name || '')
  const [email] = useState(user?.email || '')
  const [countryCode, setCountryCode] = useState(p.countryCode || '')
  const [mobile, setMobile] = useState(p.mobile || '')
  const [location, setLocation] = useState(p.location || '')
  const [gradYear, setGradYear] = useState(p.gradYear || '')
  const [education, setEducation] = useState(p.education || '')

  // Social links
  const [github, setGithub] = useState(p.github || '')
  const [twitter, setTwitter] = useState(p.twitter || '')
  const [linkedin, setLinkedin] = useState(p.linkedin || '')
  const [socialOther, setSocialOther] = useState(p.socialOther || '')
  const [resume, setResume] = useState(p.resume || '')

  // Coding profiles
  const [leetcode, setLeetcode] = useState(p.leetcode || '')
  const [hackerrank, setHackerrank] = useState(p.hackerrank || '')
  const [codeforces, setCodeforces] = useState(p.codeforces || '')
  const [gfg, setGfg] = useState(p.gfg || '')
  const [codingOther, setCodingOther] = useState(p.codingOther || '')

  const [savingBasic, setSavingBasic] = useState(false)
  const [savingSocial, setSavingSocial] = useState(false)
  const [savingCoding, setSavingCoding] = useState(false)

  const saveBasic = async () => {
    setSavingBasic(true)
    await new Promise(r => setTimeout(r, 900))
    updateProfile({ name, countryCode, mobile, location, gradYear, education })
    setSavingBasic(false)
    toast.success('Basic info saved!')
  }

  const saveSocial = async () => {
    setSavingSocial(true)
    await new Promise(r => setTimeout(r, 900))
    updateProfile({ github, twitter, linkedin, socialOther, resume })
    setSavingSocial(false)
    toast.success('Social links saved!')
  }

  const saveCoding = async () => {
    setSavingCoding(true)
    await new Promise(r => setTimeout(r, 900))
    updateProfile({ leetcode, hackerrank, codeforces, gfg, codingOther })
    setSavingCoding(false)
    toast.success('Coding profiles saved!')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5
        border-b border-[#1e1e2e] bg-[#0d0d15]">
        <div className="flex items-center gap-3">
          <button onClick={() => nav('/dashboard')} className="flex items-center gap-2 hover:opacity-80">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Code2 size={15} className="text-white" />
            </div>
            <span className="font-display font-bold text-base text-white">CodeForge</span>
          </button>
          <span className="text-[#2a2a4a]">/</span>
          <span className="text-sm text-[#6b7280]">Edit Profile</span>
        </div>
        <button
          onClick={() => nav('/profile')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1e1e2e]
            bg-[#16161f] text-xs text-[#c0c0d0] hover:border-[#2a2a3a] transition-all"
        >
          <ArrowLeft size={13} /> Back to Profile
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display font-black text-2xl text-white mb-1">Edit Profile</h1>
          <p className="text-sm text-[#4b4b6a]">Update your personal information, links and coding profiles.</p>
        </div>

        {/* ── BASIC INFO ─────────────────────────────────────────────────── */}
        <SectionCard title="Basic Information" icon={User}>
          <FieldGrid>
            <Field label="Name">
              <TextInput placeholder="Your full name" value={name} onChange={setName} />
            </Field>
            <Field label="Email ID">
              <input
                type="email" value={email} disabled
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0a0a15] border border-[#1a1a2a]
                  text-sm text-[#4b4b6a] outline-none cursor-not-allowed"
              />
            </Field>

            {/* Mobile: country code + number */}
            <Field label="Mobile Number">
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}
                  className="w-28 flex-shrink-0 px-2 py-2.5 rounded-lg bg-[#0d0d15] border border-[#1e1e2e]
                    text-xs text-[#e2e2e8] outline-none focus:border-blue-500/40 cursor-pointer"
                >
                  <option value="">Select</option>
                  {COUNTRY_CODES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <TextInput placeholder="Enter your mobile number" value={mobile} onChange={setMobile} />
              </div>
            </Field>

            <Field label="Location">
              <TextInput placeholder="Enter your location" value={location} onChange={setLocation} />
            </Field>

            <Field label="Education Year">
              <Select
                options={GRAD_YEARS}
                value={gradYear}
                onChange={setGradYear}
                placeholder="Choose Your Graduation Year"
              />
            </Field>

            <Field label="Education">
              <TextInput
                placeholder="Select or enter your college/university"
                value={education}
                onChange={setEducation}
              />
            </Field>
          </FieldGrid>
          <SaveButton onClick={saveBasic} saving={savingBasic} />
        </SectionCard>

        {/* ── SOCIAL LINKS ───────────────────────────────────────────────── */}
        <SectionCard title="Social Links" icon={Link}>
          <FieldGrid>
            <Field label="GitHub">
              <TextInput placeholder="Add your GitHub URL" value={github} onChange={setGithub} />
            </Field>
            <Field label="X (formerly Twitter)">
              <TextInput placeholder="Add your Twitter URL" value={twitter} onChange={setTwitter} />
            </Field>
            <Field label="LinkedIn">
              <TextInput placeholder="Add your LinkedIn URL" value={linkedin} onChange={setLinkedin} />
            </Field>
            <Field label="Others">
              <TextInput placeholder="Add your others URL" value={socialOther} onChange={setSocialOther} />
            </Field>
            <Field label="Resume" full>
              <TextInput placeholder="Add your Resume URL" value={resume} onChange={setResume} />
            </Field>
          </FieldGrid>
          <SaveButton onClick={saveSocial} saving={savingSocial} />
        </SectionCard>

        {/* ── CODING PROFILES ────────────────────────────────────────────── */}
        <SectionCard title="Coding Profile" icon={Code}>
          <FieldGrid>
            <Field label="LeetCode">
              <TextInput placeholder="Add your Leetcode profile URL" value={leetcode} onChange={setLeetcode} />
            </Field>
            <Field label="HackerRank">
              <TextInput placeholder="Add your Hackerrank profile URL" value={hackerrank} onChange={setHackerrank} />
            </Field>
            <Field label="Codeforces">
              <TextInput placeholder="Add your Codeforces profile URL" value={codeforces} onChange={setCodeforces} />
            </Field>
            <Field label="GeeksForGeeks">
              <TextInput placeholder="Add your GeeksForGeeks profile URL" value={gfg} onChange={setGfg} />
            </Field>
            <Field label="Others" full>
              <TextInput placeholder="Add your other contest profile URL" value={codingOther} onChange={setCodingOther} />
            </Field>
          </FieldGrid>
          <SaveButton onClick={saveCoding} saving={savingCoding} />
        </SectionCard>
      </div>
    </div>
  )
}
