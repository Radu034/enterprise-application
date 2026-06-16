import { useState, useRef, useEffect } from 'react'
import { patients } from '../../data/mockData.js'
import { BellIcon, SunIcon, MoonIcon } from '../shared/Icons.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'Urgent appointment at 11:00',
    body:  'Gheorghe Dănilă — Cardiology. ECG required before consultation.',
    time:  'Today, 10:42',
    type:  'urgent',
    read:  false,
  },
  {
    id: 2,
    title: 'Lab results available',
    body:  'Blood panel for Alexandru Ionescu has been processed and attached.',
    time:  'Today, 09:15',
    type:  'info',
    read:  false,
  },
  {
    id: 3,
    title: 'Appointment request — Pending',
    body:  'Cristina Munteanu has requested a Blood Pressure follow-up for tomorrow at 11:30.',
    time:  'Yesterday, 18:03',
    type:  'request',
    read:  false,
  },
]

const typeColor = {
  urgent:  { dot: 'bg-red-400',  label: 'text-red-400'  },
  info:    { dot: 'bg-blue',     label: 'text-blue'      },
  request: { dot: 'bg-teal',     label: 'text-teal'      },
}

export default function Topbar() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const { theme, toggle } = useTheme()
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [showBell, setShowBell] = useState(false)
  const [notes, setNotes]       = useState(NOTIFICATIONS)
  const bellRef = useRef(null)
  const isDoctor = user.role === 'doctor'
  const unread = notes.filter(n => !n.read).length

  // Close dropdown when clicking outside
  useEffect(() => {
    function handle(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowBell(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function handleSearch(e) {
    const q = e.target.value
    setQuery(q)
    setResults(q.length > 1
      ? patients.filter(p => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 5)
      : [])
  }

  function markAllRead() {
    setNotes(ns => ns.map(n => ({ ...n, read: true })))
  }

  function dismiss(id) {
    setNotes(ns => ns.filter(n => n.id !== id))
  }

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center px-6 gap-4 flex-shrink-0">

      {isDoctor ? (
        <div className="relative flex-1 max-w-sm">
          <input
            value={query}
            onChange={handleSearch}
            placeholder="Search patients…"
            className="w-full bg-bg border border-border rounded-lg px-4 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal transition-colors"
          />
          {results.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-surface border border-border rounded-lg shadow-xl z-50 overflow-hidden">
              {results.map(p => (
                <div key={p.id} className="px-4 py-2.5 hover:bg-white/5 cursor-pointer text-sm flex justify-between">
                  <span className="text-white">{p.name}</span>
                  <span className="text-xs text-gray-500">{p.department}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400">
          {greeting()}, <span className="text-white font-medium">{user.firstName}</span>
        </p>
      )}

      <div className="flex items-center gap-4 ml-auto">

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
        >
          {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>

        {/* Bell */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setShowBell(v => !v)}
            className="relative text-gray-400 hover:text-white transition-colors p-1"
          >
            <BellIcon size={18} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange rounded-full text-xs flex items-center justify-center text-white font-bold leading-none">
                {unread}
              </span>
            )}
          </button>

          {showBell && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold text-white">Notifications</span>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-teal hover:underline">
                    Mark all as read
                  </button>
                )}
              </div>
              {notes.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">No notifications</div>
              ) : (
                <div className="divide-y divide-border max-h-80 overflow-y-auto">
                  {notes.map(n => (
                    <div key={n.id} className={`px-4 py-3 hover:bg-white/5 transition-colors ${!n.read ? 'bg-white/[0.02]' : ''}`}>
                      <div className="flex items-start gap-2.5">
                        <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${typeColor[n.type].dot} ${n.read ? 'opacity-30' : ''}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${n.read ? 'text-gray-400' : 'text-white'}`}>{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                          <p className="text-xs text-gray-600 mt-1">{n.time}</p>
                        </div>
                        <button
                          onClick={() => dismiss(n.id)}
                          className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0 mt-0.5"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status pill */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 bg-teal/5 border border-teal/20 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
          System Online
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-teal/20 border border-teal/30 flex items-center justify-center text-teal font-semibold text-sm">
            {(user.firstName?.[0] || '?').toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm text-white leading-tight">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-500 capitalize leading-tight">{user.role || 'Patient'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
