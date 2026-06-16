import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()
  const [role, setRole]       = useState('patient')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg]         = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    if (!email || !password) { setMsg('Please fill in all fields.'); return }
    setLoading(true); setMsg('')
    const port = role === 'patient' ? 8081 : 8083
    try {
      const res = await fetch(`http://localhost:${port}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (res.status === 401) { setMsg('Invalid email or password.'); setLoading(false); return }
      if (!res.ok)            { setMsg('Server error. Please try again.'); setLoading(false); return }
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
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-logo text-4xl text-teal tracking-wide">ClinicApp</span>
          <p className="text-gray-500 text-sm mt-2">Sign in to your account</p>
        </div>

        <div className="card space-y-5">
          <div className="flex rounded-lg overflow-hidden border border-border">
            {['patient', 'doctor'].map(r => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`flex-1 py-2 text-sm font-medium transition-colors capitalize
                  ${role === r ? 'bg-teal text-black' : 'text-gray-400 hover:text-white'}`}>
                {r === 'patient' ? 'Patient' : 'Doctor'}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password" className={inputCls} />
            </div>
            <div className="text-right -mt-2">
              <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-teal transition-colors">
                Forgot password?
              </Link>
            </div>
            {msg && <p className="text-xs text-orange">{msg}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-teal text-black font-semibold rounded-lg text-sm hover:bg-teal/90 transition-colors disabled:opacity-50">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500">
            No account?{' '}
            <Link to="/register" className="text-teal hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
