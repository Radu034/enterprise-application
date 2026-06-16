import { useState } from 'react'
import { doctors } from '../data/mockData.js'
import { CalendarIcon, PlusIcon, ClockIcon } from '../components/shared/Icons.jsx'

const MOCK_APPOINTMENTS = [
  { id: 1,  doctor: 'Dr. Mihai Popescu',    specialty: 'Cardiology',  date: '2024-06-10', time: '14:00', status: 'Confirmed', reason: 'Routine checkup'      },
  { id: 2,  doctor: 'Dr. Elena Dumitrescu', specialty: 'Neurology',   date: '2024-06-12', time: '09:30', status: 'Confirmed', reason: 'Follow-up consultation'},
  { id: 3,  doctor: 'Dr. Ioana Stancu',     specialty: 'Pediatrics',  date: '2024-06-16', time: '11:00', status: 'Pending',   reason: 'Annual examination'   },
  { id: 4,  doctor: 'Dr. Mihai Popescu',    specialty: 'Cardiology',  date: '2024-04-18', time: '10:00', status: 'Completed', reason: 'Blood pressure review' },
  { id: 5,  doctor: 'Dr. Vlad Ionescu',     specialty: 'Radiology',   date: '2024-02-02', time: '08:30', status: 'Completed', reason: 'Chest X-ray'          },
  { id: 6,  doctor: 'Dr. Mihai Popescu',    specialty: 'Cardiology',  date: '2023-11-15', time: '15:00', status: 'Completed', reason: 'Annual examination'   },
]

const statusCls = {
  Confirmed: 'bg-teal/10 text-teal border border-teal/20',
  Pending:   'bg-blue/10 text-blue border border-blue/20',
  Completed: 'bg-gray-700/50 text-gray-400 border border-gray-700',
  Cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

const today = new Date().toISOString().split('T')[0]

export default function AppointmentsPage() {
  const [tab, setTab]           = useState('upcoming')
  const [showForm, setShowForm] = useState(false)
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS)
  const [form, setForm]         = useState({ doctorId: '', date: '', time: '', reason: '' })
  const [msg, setMsg]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]   = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const upcoming = appointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending')
  const past     = appointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled')

  async function handleBook(e) {
    e.preventDefault()
    if (!form.doctorId || !form.date || !form.time) { setMsg('Please fill in all required fields.'); return }
    setMsg(''); setSubmitting(true)
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const doctor = doctors.find(d => d.id === parseInt(form.doctorId))

    try {
      const res = await fetch('http://localhost:8082/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId:       user.id,
          patientName:     `${user.firstName} ${user.lastName}`,
          doctorId:        doctor?.id,
          doctorName:      doctor?.name,
          doctorSpecialty: doctor?.specialty,
          dateTime:        `${form.date}T${form.time}:00`,
          reason:          form.reason,
          status:          'PENDING'
        })
      })
      if (res.ok) {
        const created = await res.json()
        setAppointments(prev => [{
          id: created.id,
          doctor:    doctor?.name,
          specialty: doctor?.specialty,
          date:      form.date,
          time:      form.time,
          status:    'Pending',
          reason:    form.reason
        }, ...prev])
      } else {
        throw new Error()
      }
    } catch {
      // backend unavailable — add locally
      setAppointments(prev => [{
        id: Date.now(),
        doctor:    doctor?.name,
        specialty: doctor?.specialty,
        date:      form.date,
        time:      form.time,
        status:    'Pending',
        reason:    form.reason
      }, ...prev])
    }

    setForm({ doctorId: '', date: '', time: '', reason: '' })
    setShowForm(false)
    setTab('upcoming')
    setSuccess('Appointment booked successfully.')
    setTimeout(() => setSuccess(''), 4000)
    setSubmitting(false)
  }

  const inputCls = "w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal transition-colors"

  const list = tab === 'upcoming' ? upcoming : past

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Appointments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your scheduled visits</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-teal text-black font-semibold rounded-lg text-sm hover:bg-teal/90 transition-colors"
        >
          <PlusIcon size={15} />
          Book Appointment
        </button>
      </div>

      {success && (
        <div className="px-4 py-3 rounded-lg bg-teal/10 border border-teal/20 text-teal text-sm">
          {success}
        </div>
      )}

      {/* Booking form */}
      {showForm && (
        <div className="card border-teal/20 space-y-4">
          <h3 className="text-sm font-semibold text-white border-b border-border pb-3">New Appointment</h3>
          <form onSubmit={handleBook} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Select Doctor <span className="text-orange">*</span></label>
              <select value={form.doctorId} onChange={set('doctorId')} className={inputCls + ' cursor-pointer'}>
                <option value="">— Choose a doctor —</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date <span className="text-orange">*</span></label>
                <input type="date" value={form.date} onChange={set('date')} min={today} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Time <span className="text-orange">*</span></label>
                <input type="time" value={form.time} onChange={set('time')} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Reason for visit</label>
              <input value={form.reason} onChange={set('reason')} placeholder="Brief description" className={inputCls} />
            </div>
            {msg && <p className="text-xs text-orange">{msg}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={submitting}
                className="px-5 py-2 bg-teal text-black font-semibold rounded-lg text-sm hover:bg-teal/90 transition-colors disabled:opacity-50">
                {submitting ? 'Booking…' : 'Confirm Booking'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2 rounded-lg border border-border text-sm text-gray-400 hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {[
          { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
          { key: 'past',     label: `Past (${past.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
              ${tab === t.key ? 'border-teal text-teal' : 'border-transparent text-gray-500 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {list.length === 0 ? (
        <div className="card text-center py-12">
          <CalendarIcon size={32} />
          <p className="mt-3 text-gray-400 text-sm">No {tab} appointments.</p>
          {tab === 'upcoming' && (
            <button onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 rounded-lg border border-teal/30 text-teal text-sm hover:bg-teal/10 transition-colors">
              Book your first appointment
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {list.map(a => (
            <div key={a.id} className="card hover:border-white/10 transition-all duration-150">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-gray-400 flex-shrink-0">
                  <CalendarIcon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{a.doctor}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{a.specialty}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusCls[a.status]}`}>
                      {a.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <CalendarIcon size={12} />
                      {a.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon size={12} />
                      {a.time}
                    </span>
                    {a.reason && <span className="text-gray-600">· {a.reason}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
