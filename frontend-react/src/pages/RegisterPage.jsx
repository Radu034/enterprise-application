import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const SPECIALTIES = ['General Practitioner','Cardiologist','Dermatologist','Neurologist',
  'Orthopedist','Pediatrician','Psychiatrist','Radiologist','Surgeon','Urologist']

function strengthScore(pw) {
  let s = 0
  if (pw.length >= 8)          s++
  if (/[A-Z]/.test(pw))        s++
  if (/[0-9]/.test(pw))        s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}
const strengthColor = ['#2A3446', '#e74c3c', '#e67e22', '#f1c40f', '#00C9A7']
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']

export default function RegisterPage() {
  const navigate = useNavigate()
  const [role, setRole]       = useState('patient')
  const [form, setForm]       = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '', specialty: '' })
  const [msg, setMsg]         = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const score = strengthScore(form.password)
  const match = form.confirm && form.password === form.confirm

  async function handleRegister(e) {
    e.preventDefault()
    const { firstName, lastName, email, password, confirm, specialty } = form
    if (!firstName || !lastName || !email || !password) { setMsg('Please fill in all fields.'); return }
    if (password.length < 6)   { setMsg('Password must be at least 6 characters.'); return }
    if (password !== confirm)  { setMsg('Passwords do not match.'); return }
    if (role === 'doctor' && !specialty) { setMsg('Please select a specialty.'); return }
    setLoading(true); setMsg('')
    const port = role === 'patient' ? 8081 : 8083
    const body = role === 'patient'
      ? { firstName, lastName, email, password }
      : { firstName, lastName, email, password, specialty }
    try {
      const res = await fetch(`http://localhost:${port}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.status === 409) { setMsg('An account with this email already exists.'); setLoading(false); return }
      if (!res.ok)            { setMsg('Registration failed. Please try again.'); setLoading(false); return }
      const user = await res.json()
      user.role = role
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/')
    } catch {
      setMsg('Cannot connect to the server. Is the backend running?')
    }
    setLoading(false)
  }

  const inputCls = "w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal transition-colors"

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-logo text-4xl text-teal tracking-wide">ClinicApp</span>
          <p className="text-gray-500 text-sm mt-2">Create your account</p>
        </div>

        <div className="card space-y-4">
          <div className="flex rounded-lg overflow-hidden border border-border">
            {['patient', 'doctor'].map(r => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`flex-1 py-2 text-sm font-medium transition-colors capitalize
                  ${role === r ? 'bg-teal text-black' : 'text-gray-400 hover:text-white'}`}>
                {r === 'patient' ? 'Patient' : 'Doctor'}
              </button>
            ))}
          </div>

          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">First Name</label>
                <input value={form.firstName} onChange={set('firstName')} placeholder="Ion" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Last Name</label>
                <input value={form.lastName} onChange={set('lastName')} placeholder="Popescu" className={inputCls} />
              </div>
            </div>

            {role === 'doctor' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Specialty</label>
                <select value={form.specialty} onChange={set('specialty')} className={inputCls + ' cursor-pointer'}>
                  <option value="">— Select specialty —</option>
                  {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Email address</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={inputCls} />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" className={inputCls} />
              {form.password && (
                <>
                  <div className="mt-1.5 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${score * 25}%`, background: strengthColor[score] }} />
                  <p className="text-xs mt-0.5" style={{ color: strengthColor[score] }}>{strengthLabel[score]}</p>
                </>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Confirm Password</label>
              <input type="password" value={form.confirm} onChange={set('confirm')} placeholder="Re-enter password" className={inputCls} />
              {form.confirm && (
                <p className={`text-xs mt-0.5 ${match ? 'text-teal' : 'text-orange'}`}>
                  {match ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>

            {msg && <p className="text-xs text-orange">{msg}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-teal text-black font-semibold rounded-lg text-sm hover:bg-teal/90 transition-colors disabled:opacity-50 mt-1">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-teal hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
