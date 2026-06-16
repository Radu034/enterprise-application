import { useState } from 'react'
import { EditIcon, CheckIcon, UserIcon } from '../components/shared/Icons.jsx'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

function getUser() {
  return JSON.parse(localStorage.getItem('user') || '{}')
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-white">{value || <span className="text-gray-600 italic">Not provided</span>}</p>
    </div>
  )
}

export default function PatientProfilePage() {
  const [editing, setEditing] = useState(false)
  const [saved, setSaved]     = useState(false)
  const [msg, setMsg]         = useState('')
  const [form, setForm]       = useState(() => {
    const u = getUser()
    return {
      firstName:        u.firstName        || '',
      lastName:         u.lastName         || '',
      email:            u.email            || '',
      phone:            u.phone            || '',
      birthDate:        u.birthDate        || '',
      address:          u.address          || '',
      bloodType:        u.bloodType        || '',
      emergencyContact: u.emergencyContact || '',
    }
  })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSave(e) {
    e.preventDefault()
    setMsg('')
    const u = getUser()
    const port = 8081
    try {
      const res = await fetch(`http://localhost:${port}/patients/${u.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        const updated = await res.json()
        localStorage.setItem('user', JSON.stringify({ ...u, ...updated, role: 'patient' }))
      }
    } catch {
      // backend not connected — update local state only
    }
    localStorage.setItem('user', JSON.stringify({ ...u, ...form, role: 'patient' }))
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputCls = "w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal transition-colors"

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">My Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">Personal and medical information</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-gray-300 hover:border-teal/40 hover:text-white transition-all duration-150"
          >
            <EditIcon size={14} />
            Edit Profile
          </button>
        )}
        {saved && (
          <div className="flex items-center gap-2 text-sm text-teal">
            <CheckIcon size={14} />
            Saved successfully
          </div>
        )}
      </div>

      {/* Avatar + name card */}
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-teal/20 border-2 border-teal/30 flex items-center justify-center text-teal text-2xl font-bold flex-shrink-0">
          {(form.firstName?.[0] || '?').toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-semibold text-white">{form.firstName} {form.lastName}</p>
          <p className="text-sm text-gray-500">{form.email}</p>
          <span className="mt-1 inline-block text-xs px-2 py-0.5 rounded-full bg-teal/10 text-teal border border-teal/20">Patient</span>
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="card space-y-4">
            <h3 className="text-sm font-semibold text-white border-b border-border pb-3">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">First Name</label>
                <input value={form.firstName} onChange={set('firstName')} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Last Name</label>
                <input value={form.lastName} onChange={set('lastName')} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input type="email" value={form.email} onChange={set('email')} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phone</label>
                <input value={form.phone} onChange={set('phone')} placeholder="+40 7xx xxx xxx" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date of Birth</label>
                <input type="date" value={form.birthDate} onChange={set('birthDate')} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Address</label>
              <input value={form.address} onChange={set('address')} placeholder="Street, City, County" className={inputCls} />
            </div>
          </div>

          <div className="card space-y-4">
            <h3 className="text-sm font-semibold text-white border-b border-border pb-3">Medical Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Blood Type</label>
                <select value={form.bloodType} onChange={set('bloodType')} className={inputCls + ' cursor-pointer'}>
                  <option value="">— Select —</option>
                  {BLOOD_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Emergency Contact</label>
                <input value={form.emergencyContact} onChange={set('emergencyContact')} placeholder="Name / phone number" className={inputCls} />
              </div>
            </div>
          </div>

          {msg && <p className="text-xs text-orange">{msg}</p>}

          <div className="flex gap-3">
            <button type="submit"
              className="px-5 py-2 bg-teal text-black font-semibold rounded-lg text-sm hover:bg-teal/90 transition-colors">
              Save Changes
            </button>
            <button type="button" onClick={() => setEditing(false)}
              className="px-5 py-2 rounded-lg border border-border text-sm text-gray-400 hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="card space-y-5">
            <h3 className="text-sm font-semibold text-white border-b border-border pb-3">Personal Information</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <Field label="First Name"   value={form.firstName} />
              <Field label="Last Name"    value={form.lastName} />
              <Field label="Email"        value={form.email} />
              <Field label="Phone"        value={form.phone} />
              <Field label="Date of Birth" value={form.birthDate} />
              <Field label="Address"      value={form.address} />
            </div>
          </div>
          <div className="card space-y-5">
            <h3 className="text-sm font-semibold text-white border-b border-border pb-3">Medical Information</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <Field label="Blood Type"         value={form.bloodType} />
              <Field label="Emergency Contact"  value={form.emergencyContact} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
