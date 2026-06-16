import { useState } from 'react'
import { upcomingAppointments } from '../../data/mockData.js'
import PatientPopup, { getPatientByName } from '../shared/PatientPopup.jsx'

const statusCls = {
  Confirmed: 'bg-teal/10 text-teal border border-teal/20',
  Pending:   'bg-blue/10 text-blue border border-blue/20',
  Urgent:    'bg-red-500/10 text-red-400 border border-red-500/20',
}

export default function UpcomingAppointments() {
  const [selected, setSelected] = useState(null)

  function openPatient(name) {
    const p = getPatientByName(name)
    if (p) setSelected(p)
  }

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Today's Appointments</h3>
          <span className="text-xs text-gray-500">{upcomingAppointments.filter(a => a.date === 'Today').length} scheduled</span>
        </div>
        <div className="space-y-1">
          {upcomingAppointments.map(a => (
            <div
              key={a.id}
              onClick={() => openPatient(a.patient)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
            >
              <div className="text-center w-10 flex-shrink-0">
                <div className="text-xs text-gray-500">{a.date}</div>
                <div className="text-sm font-semibold text-white tabular-nums">{a.time}</div>
              </div>
              <div className="w-px h-8 bg-border flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate group-hover:text-teal transition-colors">{a.patient}</div>
                <div className="text-xs text-gray-500 truncate">{a.doctor} · {a.type}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusCls[a.status]}`}>
                {a.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <PatientPopup patient={selected} onClose={() => setSelected(null)} />
    </>
  )
}
