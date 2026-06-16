import RoomViewer from '../components/facility/RoomViewer.jsx'
import { beds }    from '../data/mockData.js'

export default function FacilityPage() {
  const counts = { available:0, occupied:0, reserved:0 }
  beds.forEach(b => counts[b.status]++)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-white">Facility Map</h1>
        <p className="text-sm text-gray-500 mt-0.5">3D ward view — click any bed for patient details.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Available', count:counts.available, color:'#00C9A7' },
          { label:'Occupied',  count:counts.occupied,  color:'#e74c3c' },
          { label:'Reserved',  count:counts.reserved,  color:'#F07B3D' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <div className="text-2xl font-bold" style={{color:s.color}}>{s.count}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <RoomViewer />
    </div>
  )
}
