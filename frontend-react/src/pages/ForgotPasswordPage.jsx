import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [role, setRole]           = useState('patient')
  const [step, setStep]           = useState(1)
  const [email, setEmail]         = useState('')
  const [code, setCode]           = useState('')
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [msg, setMsg]             = useState('')
  const [loading, setLoading]     = useState(false)

  const port = role === 'patient' ? 8081 : 8083

  async function handleRequestCode(e) {
    e.preventDefault()
    if (!email) { setMsg('Please enter your email address.'); return }
    setLoading(true); setMsg('')
    try {
      const res = await fetch(`http://localhost:${port}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (res.status === 404) { setMsg('No account found with this email address.'); setLoading(false); return }
      if (!res.ok)            { setMsg('Something went wrong. Please try again.'); setLoading(false); return }
      setStep(2)
    } catch {
      setMsg('Cannot connect to the server. Is the backend running?')
    }
    setLoading(false)
  }

  async function handleReset(e) {
    e.preventDefault()
    if (!code || !newPw || !confirmPw) { setMsg('Please fill in all fields.'); return }
    if (newPw !== confirmPw)           { setMsg('Passwords do not match.'); return }
    if (newPw.length < 6)              { setMsg('Password must be at least 6 characters.'); return }
    setLoading(true); setMsg('')
    try {
      const res = await fetch(`http://localhost:${port}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword: newPw })
      })
      if (res.status === 400) { setMsg('Invalid or expired code.'); setLoading(false); return }
      if (!res.ok)            { setMsg('Reset failed. Please try again.'); setLoading(false); return }
      navigate('/login')
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
          <p className="text-gray-500 text-sm mt-2">Reset your password</p>
        </div>

        <div className="card space-y-5">
          <div className="flex rounded-lg overflow-hidden border border-border">
            {['patient', 'doctor'].map(r => (
              <button key={r} type="button" onClick={() => { setRole(r); setStep(1); setMsg('') }}
                className={`flex-1 py-2 text-sm font-medium transition-colors capitalize
                  ${role === r ? 'bg-teal text-black' : 'text-gray-400 hover:text-white'}`}>
                {r === 'patient' ? 'Patient' : 'Doctor'}
              </button>
            ))}
          </div>

          {step === 1 ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <p className="text-xs text-gray-400 leading-relaxed">
                Enter your registered email address and we will send you a 6-digit verification code.
              </p>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className={inputCls} />
              </div>
              {msg && <p className="text-xs text-orange">{msg}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-teal text-black font-semibold rounded-lg text-sm hover:bg-teal/90 transition-colors disabled:opacity-50">
                {loading ? 'Sending…' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <p className="text-xs text-gray-400 leading-relaxed">
                A 6-digit code was sent to <span className="text-white font-medium">{email}</span>.
              </p>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Verification Code</label>
                <input value={code} onChange={e => setCode(e.target.value)}
                  placeholder="123456" maxLength={6} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">New Password</label>
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                  placeholder="Min. 6 characters" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Confirm Password</label>
                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Re-enter password" className={inputCls} />
              </div>
              {msg && <p className="text-xs text-orange">{msg}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-teal text-black font-semibold rounded-lg text-sm hover:bg-teal/90 transition-colors disabled:opacity-50">
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
              <button type="button" onClick={() => { setStep(1); setMsg('') }}
                className="w-full text-xs text-gray-500 hover:text-white transition-colors py-1">
                Use a different email address
              </button>
            </form>
          )}

          <p className="text-center text-xs text-gray-500">
            <Link to="/login" className="text-teal hover:underline">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
