import { NavLink, useNavigate } from 'react-router-dom'
import { HomeIcon, CalendarIcon, UserIcon, ScanIcon, BuildingIcon, LogoutIcon } from '../shared/Icons.jsx'

const patientLinks = [
  { to: '/',             icon: HomeIcon,     label: 'Dashboard'    },
  { to: '/appointments', icon: CalendarIcon, label: 'Appointments' },
  { to: '/profile',      icon: UserIcon,     label: 'My Profile'   },
]

const doctorLinks = [
  { to: '/',          icon: HomeIcon,     label: 'Dashboard'    },
  { to: '/schedule',  icon: CalendarIcon, label: 'Schedule'     },
  { to: '/scans',     icon: ScanIcon,     label: 'Scan Viewer'  },
  { to: '/facility',  icon: BuildingIcon, label: 'Facility'     },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const role = user.role || 'patient'
  const links = role === 'doctor' ? doctorLinks : patientLinks

  function signOut() {
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-surface border-r border-border flex flex-col">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-border">
        <span className="font-logo text-2xl text-teal tracking-wide">ClinicApp</span>
        <p className="text-xs text-gray-500 mt-0.5 capitalize">{role} Portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ` +
              (isActive
                ? 'bg-teal/10 text-teal'
                : 'text-gray-400 hover:bg-white/5 hover:text-white')
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User block + sign out */}
      <div className="px-4 py-4 border-t border-border space-y-3">
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-teal/20 border border-teal/30 flex items-center justify-center text-teal text-sm font-semibold flex-shrink-0">
            {(user.firstName?.[0] || '?').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-white font-medium truncate">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-red-400 hover:bg-red-400/5 transition-all duration-150"
        >
          <LogoutIcon size={15} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
