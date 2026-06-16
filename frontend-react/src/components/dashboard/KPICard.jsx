import { useEffect, useRef } from 'react'
import { TrendUpIcon, TrendDownIcon } from '../shared/Icons.jsx'

export default function KPICard({ label, value, unit = '', color = '#00C9A7', icon: Icon, trend, subtitle }) {
  const numRef = useRef(null)

  useEffect(() => {
    const target = parseInt(value) || 0
    let current = 0
    const step = Math.max(1, Math.ceil(target / 40))
    const timer = setInterval(() => {
      current = Math.min(current + step, target)
      if (numRef.current) numRef.current.textContent = current.toLocaleString() + unit
      if (current >= target) clearInterval(timer)
    }, 28)
    return () => clearInterval(timer)
  }, [value, unit])

  return (
    <div className="card flex flex-col gap-3 hover:border-white/10 transition-all duration-200">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider leading-tight">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '18', color }}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <div>
        <span ref={numRef} className="text-3xl font-bold tabular-nums" style={{ color }}>0</span>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {trend != null && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className={`flex items-center gap-0.5 font-medium ${trend >= 0 ? 'text-teal' : 'text-orange'}`}>
            {trend >= 0 ? <TrendUpIcon /> : <TrendDownIcon />}
            {Math.abs(trend)}%
          </span>
          <span className="text-gray-600">vs last week</span>
        </div>
      )}
    </div>
  )
}
