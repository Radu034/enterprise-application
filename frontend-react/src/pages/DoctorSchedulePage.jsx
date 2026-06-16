import { useState } from 'react'
import { patients, clinicSchedule } from '../data/mockData.js'
import PatientPopup, { getPatientByName } from '../components/shared/PatientPopup.jsx'
import { CalendarIcon } from '../components/shared/Icons.jsx'

const SCHEDULE_START = new Date('2026-06-10')
const SCHEDULE_END   = new Date('2026-07-20')
const DAY_NAMES      = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// Return the Monday of the week containing `date`
function weekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day   // Monday-based
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function buildWeek(mondayDate) {
  const today     = toDateStr(new Date())
  const tomorrow  = toDateStr(addDays(new Date(), 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d       = addDays(mondayDate, i)
    const dateStr = toDateStr(d)
    const dow     = d.getDay()
    return {
      date:      dateStr,
      label:     dateStr === today ? 'Today' : dateStr === tomorrow ? 'Tomorrow' : DAY_NAMES[dow],
      short:     d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
      isWeekend: dow === 0 || dow === 6,
      inRange:   d >= SCHEDULE_START && d <= SCHEDULE_END,
      count:     (clinicSchedule[dateStr] || []).length,
    }
  })
}

const statusCls = {
  Confirmed: 'bg-teal/10 text-teal border-teal/20',
  Pending:   'bg-blue/10 text-blue border-blue/20',
  Urgent:    'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function DoctorSchedulePage() {
  const todayStr = toDateStr(new Date())

  const [monday,    setMonday]    = useState(() => weekStart(new Date()))
  const [activeDay, setActiveDay] = useState(todayStr)
  const [selected,  setSelected]  = useState(null)
  const [filterDoc, setFilterDoc] = useState('all')

  const week = buildWeek(monday)

  // Week label e.g. "Jun 10 – Jun 16"
  const weekLabel = `${week[0].short} – ${week[6].short}`

  // Prev / next week bounds
  const prevMonday = addDays(monday, -7)
  const nextMonday = addDays(monday,  7)
  const canGoPrev  = prevMonday <= SCHEDULE_END && addDays(prevMonday, 6) >= SCHEDULE_START
  const canGoNext  = nextMonday <= SCHEDULE_END

  function goWeek(dir) {
    const newMonday = addDays(monday, dir * 7)
    setMonday(newMonday)
    // Select first in-range day of new week that has appointments, else first in-range day
    const newWeek = buildWeek(newMonday)
    const first = newWeek.find(d => d.inRange && d.count > 0) || newWeek.find(d => d.inRange)
    if (first) setActiveDay(first.date)
    setFilterDoc('all')
  }

  const rawAppts  = clinicSchedule[activeDay] || []
  const appts     = filterDoc === 'all' ? rawAppts : rawAppts.filter(a => a.doctor === filterDoc)
  const urgent    = appts.filter(a => a.status === 'Urgent')
  const rest      = appts.filter(a => a.status !== 'Urgent')
  const allDoctors = [...new Set(rawAppts.map(a => a.doctor))].sort()
  const dayInfo    = week.find(d => d.date === activeDay)

  function openPatient(name) {
    const p = getPatientByName(name)
    if (p) setSelected(p)
  }

  return (
    <>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold text-white">Schedule</h1>
          <p className="text-sm text-gray-500 mt-0.5">Clinic appointments · Jun 10 – Jul 20, 2026</p>
        </div>

        {/* Week navigator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => goWeek(-1)}
            disabled={!canGoPrev}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex gap-1.5 flex-1">
            {week.map(d => (
              <button
                key={d.date}
                onClick={() => { if (d.inRange) { setActiveDay(d.date); setFilterDoc('all') } }}
                disabled={!d.inRange}
                className={`flex flex-col items-center flex-1 py-2.5 rounded-lg border transition-all duration-150 min-w-0
                  ${d.date === activeDay && d.inRange
                    ? 'bg-teal text-black border-teal'
                    : d.isWeekend
                    ? 'bg-surface border-border/40 text-gray-700 cursor-default'
                    : d.inRange
                    ? 'bg-surface border-border text-gray-400 hover:text-white hover:border-white/20 cursor-pointer'
                    : 'bg-surface border-border/20 text-gray-800 cursor-default'
                  }`}
              >
                <span className="text-xs font-semibold truncate">{d.label}</span>
                <span className={`text-xs mt-0.5 ${d.date === activeDay && d.inRange ? 'text-black/60' : 'text-gray-600'}`}>{d.short}</span>
                {d.inRange && d.count > 0 && (
                  <span className={`text-xs font-bold mt-0.5 ${d.date === activeDay ? 'text-black/80' : 'text-gray-500'}`}>{d.count}</span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => goWeek(1)}
            disabled={!canGoNext}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Week label */}
        <p className="text-xs text-gray-600 -mt-1">Week of {weekLabel}</p>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Main column */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm font-medium text-white">
                {dayInfo?.label} · {dayInfo?.short}
                <span className="text-gray-500 font-normal ml-2">
                  {appts.length} appointment{appts.length !== 1 ? 's' : ''}
                </span>
              </p>
              {allDoctors.length > 1 && (
                <select
                  value={filterDoc}
                  onChange={e => setFilterDoc(e.target.value)}
                  className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-teal transition-colors cursor-pointer"
                >
                  <option value="all">All doctors</option>
                  {allDoctors.map(doc => <option key={doc} value={doc}>{doc}</option>)}
                </select>
              )}
            </div>

            {urgent.length > 0 && (
              <div className="card border-red-500/20 bg-red-500/5 space-y-2">
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wide">Urgent — {urgent.length}</p>
                {urgent.map((a, i) => <AppRow key={a.id} appt={a} index={i+1} onClick={() => openPatient(a.patient)} />)}
              </div>
            )}

            {rest.length === 0 && urgent.length === 0 ? (
              <div className="card py-14 text-center space-y-2">
                <div className="flex justify-center text-gray-600"><CalendarIcon size={30} /></div>
                <p className="text-gray-500 text-sm">No appointments scheduled</p>
              </div>
            ) : (
              <div className="card space-y-1 p-3">
                {rest.map((a, i) => <AppRow key={a.id} appt={a} index={i+1} onClick={() => openPatient(a.patient)} />)}
              </div>
            )}
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-4">Day Summary</h3>
              <div className="space-y-3">
                {[
                  { label: 'Total',     value: appts.length,                                  color: '#3D8EF0' },
                  { label: 'Confirmed', value: appts.filter(a=>a.status==='Confirmed').length, color: '#00C9A7' },
                  { label: 'Pending',   value: appts.filter(a=>a.status==='Pending').length,   color: '#3D8EF0' },
                  { label: 'Urgent',    value: urgent.length,                                  color: '#F07B3D' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                    <span className="text-xs text-gray-400">{s.label}</span>
                    <span className="text-sm font-bold tabular-nums" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-3">Specialty Breakdown</h3>
              {['Cardiology','Neurology','Orthopedics','Pediatrics','Radiology','General'].map(dept => {
                const cnt = appts.filter(a => a.specialty === dept).length
                if (!cnt) return null
                const pct = Math.round(cnt / appts.length * 100)
                return (
                  <div key={dept} className="mb-2.5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">{dept}</span>
                      <span className="text-gray-500">{cnt}</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-teal rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-3">Active Patients</h3>
              <div className="space-y-1">
                {patients.filter(p => p.status === 'Active').slice(0, 6).map(p => (
                  <div key={p.id} onClick={() => openPatient(p.name)}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                    <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center text-xs text-gray-400 font-semibold flex-shrink-0">
                      {p.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white truncate group-hover:text-teal transition-colors">{p.name}</p>
                      <p className="text-xs text-gray-600">{p.department}</p>
                    </div>
                    <span className="text-xs text-gray-600 flex-shrink-0">{p.age}y</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PatientPopup patient={selected} onClose={() => setSelected(null)} />
    </>
  )
}

function AppRow({ appt, index, onClick }) {
  return (
    <div onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
      <span className="text-xs text-gray-600 w-5 text-right flex-shrink-0">{index}</span>
      <span className="text-sm font-bold text-white tabular-nums w-12 flex-shrink-0">{appt.time}</span>
      <div className="w-px h-7 bg-border flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate group-hover:text-teal transition-colors">{appt.patient}</p>
        <p className="text-xs text-gray-500 truncate">{appt.doctor} · {appt.type}</p>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 border ${statusCls[appt.status]}`}>
        {appt.status}
      </span>
    </div>
  )
}
