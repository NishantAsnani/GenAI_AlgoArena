// src/components/profile/ProfileCard.jsx
// Left sidebar card — avatar, name, email, bio links
import { ExternalLink, MapPin, GraduationCap, Github, Linkedin, Twitter, FileText } from 'lucide-react'
import { useAppSelector } from '../../hooks/redux'
import { selectUser }     from '../../store/slices/authSlice'
import { selectProfile }  from '../../store/slices/profileSlice'
import { selectSolvedCount, selectPercentage } from '../../store/slices/progressSlice'
import { PROBLEMS } from '../../data/problems'

export default function ProfileCard({ onEditClick }) {
  const user        = useAppSelector(selectUser)
  const profile     = useAppSelector(selectProfile)
  const solvedCount = useAppSelector(selectSolvedCount)
  const percentage  = useAppSelector(selectPercentage)

  const displayName = user?.name || user?.email?.split('@')[0] || 'User'
  const initial     = displayName[0]?.toUpperCase()

  const socialLinks = [
    { icon: Github,   label: 'GitHub',   url: profile.github   },
    { icon: Linkedin, label: 'LinkedIn', url: profile.linkedin },
    { icon: Twitter,  label: 'Twitter',  url: profile.twitter  },
    { icon: FileText, label: 'Resume',   url: profile.resume   },
  ].filter(s => s.url)

  const codingLinks = [
    { label: 'LeetCode',    url: profile.leetcode   },
    { label: 'HackerRank',  url: profile.hackerrank },
    { label: 'Codeforces',  url: profile.codeforces },
    { label: 'GeeksForGeeks', url: profile.gfg      },
  ].filter(c => c.url)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      {/* Avatar + name */}
      <div className="flex flex-col items-center text-center gap-2 pb-4 border-b border-gray-100">
        {user?.profile_pic ? (
          <img
            src={user.profile_pic}
            alt={displayName}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-200
            flex items-center justify-center text-2xl font-bold text-orange-500">
            {initial}
          </div>
        )}
        <div>
          <p className="font-bold text-[15px] text-black">{displayName}</p>
          <p className="text-[12px] text-gray-400 mt-0.5">{user?.email}</p>
        </div>

        {/* Quick stats */}
        <div className="flex gap-4 mt-1">
          <div className="text-center">
            <div className="text-[15px] font-bold text-black">{solvedCount}</div>
            <div className="text-[10px] text-gray-400">Solved</div>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="text-center">
            <div className="text-[15px] font-bold text-black">{PROBLEMS.length}</div>
            <div className="text-[10px] text-gray-400">Total</div>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="text-center">
            <div className="text-[15px] font-bold text-orange-500">{percentage}%</div>
            <div className="text-[10px] text-gray-400">Done</div>
          </div>
        </div>

        <button
          onClick={onEditClick}
          className="mt-2 px-4 py-1.5 rounded-lg border border-gray-200 text-[12px]
            font-semibold text-gray-600 hover:bg-gray-50 hover:text-black transition-all"
        >
          Edit Profile
        </button>
      </div>

      {/* Info */}
      {(profile.location || profile.education) && (
        <div className="space-y-2 pb-4 border-b border-gray-100">
          {profile.location && (
            <div className="flex items-center gap-2 text-[12px] text-gray-500">
              <MapPin size={13} className="text-gray-400 flex-shrink-0" />
              {profile.location}
            </div>
          )}
          {profile.education && (
            <div className="flex items-center gap-2 text-[12px] text-gray-500">
              <GraduationCap size={13} className="text-gray-400 flex-shrink-0" />
              {profile.education}{profile.gradYear ? ` · ${profile.gradYear}` : ''}
            </div>
          )}
        </div>
      )}

      {/* Social links */}
      {socialLinks.length > 0 && (
        <div className="space-y-2 pb-4 border-b border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Social</p>
          {socialLinks.map(s => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[12px] text-gray-600 hover:text-orange-500 transition-colors"
            >
              <s.icon size={13} />
              <span>{s.label}</span>
              <ExternalLink size={10} className="ml-auto text-gray-300" />
            </a>
          ))}
        </div>
      )}

      {/* Coding profiles */}
      {codingLinks.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Coding</p>
          {codingLinks.map(c => (
            <a
              key={c.label}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-[12px] text-gray-600
                hover:text-orange-500 transition-colors"
            >
              <span>{c.label}</span>
              <ExternalLink size={10} className="text-gray-300" />
            </a>
          ))}
        </div>
      )}

      {/* Prompt to fill profile */}
      {socialLinks.length === 0 && codingLinks.length === 0 && !profile.location && (
        <button
          onClick={onEditClick}
          className="w-full text-center text-[12px] text-orange-500 hover:text-orange-600 transition-colors"
        >
          + Add your links and info
        </button>
      )}
    </div>
  )
}
