import { useState } from 'react'
import ScanProcessor  from '../components/scans/ScanProcessor.jsx'
import DiagnosticPanel from '../components/scans/DiagnosticPanel.jsx'

export default function ScanPage() {
  const [stats, setStats] = useState(null)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-white">Medical Imaging</h1>
        <p className="text-sm text-gray-500 mt-0.5">Upload a scan and apply real-time image processing filters.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <ScanProcessor onAnalyze={setStats} />
        </div>
        <div>
          <DiagnosticPanel stats={stats} />
        </div>
      </div>
    </div>
  )
}
