import { useState, useEffect } from 'react'

function ConfidenceBar({ label, value, color }) {
  const [width, setWidth] = useState(0)
  useEffect(() => { const t = setTimeout(() => setWidth(value), 80); return () => clearTimeout(t) }, [value])
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="font-semibold tabular-nums" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, background: color }} />
      </div>
    </div>
  )
}

function analyzeStats(stats) {
  if (!stats) return null
  const { variance, edgeDensity } = stats
  const anomalyScore = Math.min(100, Math.round((edgeDensity * 600) + (variance > 3000 ? 30 : 0)))
  const normalScore  = Math.max(0, Math.min(100, 100 - anomalyScore - 10))
  const inconclusive = 100 - anomalyScore - normalScore

  let finding, risk
  if (anomalyScore > 55) {
    finding = 'Elevated edge density and contrast variance detected. Possible structural anomaly in imaged region. Specialist review recommended.'
    risk = 'high'
  } else if (anomalyScore > 30) {
    finding = 'Moderate image complexity detected. Results are within borderline parameters. Clinical correlation advised.'
    risk = 'medium'
  } else {
    finding = 'Image statistics within normal parameters. No significant anomaly markers detected.'
    risk = 'low'
  }
  return { normalScore, anomalyScore, inconclusive, finding, risk, ...stats }
}

const riskStyle = {
  high:   { color: '#F07B3D', label: 'High Risk',     bg: '#F07B3D18', border: '#F07B3D40' },
  medium: { color: '#f1c40f', label: 'Borderline',    bg: '#f1c40f18', border: '#f1c40f40' },
  low:    { color: '#00C9A7', label: 'Normal Range',   bg: '#00C9A718', border: '#00C9A740' },
}

export default function DiagnosticPanel({ stats }) {
  const result = analyzeStats(stats)

  if (!result) {
    return (
      <div className="card flex flex-col items-center justify-center py-12 text-center space-y-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
        </svg>
        <p className="text-sm text-gray-400">Upload a scan to run diagnostic analysis</p>
        <p className="text-xs text-gray-600">Pixel-statistics based analysis</p>
      </div>
    )
  }

  const rs = riskStyle[result.risk]

  return (
    <div className="card space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Diagnostic Analysis</h3>
        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
          style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}>
          {rs.label}
        </span>
      </div>

      <div className="space-y-3">
        <ConfidenceBar label="Normal"           value={result.normalScore}  color="#00C9A7" />
        <ConfidenceBar label="Anomaly Detected" value={result.anomalyScore} color="#F07B3D" />
        <ConfidenceBar label="Inconclusive"     value={result.inconclusive} color="#3D8EF0" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Mean Intensity', val: result.mean },
          { label: 'Variance',       val: result.variance },
          { label: 'Edge Density',   val: result.edgeDensity },
        ].map(s => (
          <div key={s.label} className="bg-bg rounded-lg p-2.5 text-center">
            <div className="text-xs text-gray-500 leading-tight">{s.label}</div>
            <div className="text-sm font-bold text-white mt-1 tabular-nums">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="bg-bg rounded-lg p-3 space-y-1">
        <p className="text-xs font-semibold text-gray-400">Findings Summary</p>
        <p className="text-xs text-gray-300 leading-relaxed">{result.finding}</p>
      </div>

      {result.risk === 'high' && (
        <div className="flex items-start gap-2.5 bg-orange/10 border border-orange/20 rounded-lg p-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-orange flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-orange leading-relaxed">
            High-risk indicators detected. Recommend immediate specialist review and follow-up scheduling.
          </p>
        </div>
      )}

      <button className="w-full py-2 rounded-lg border border-border text-xs text-gray-400 hover:border-teal/40 hover:text-teal transition-all">
        Find Similar Cases (CBIR)
      </button>
    </div>
  )
}
