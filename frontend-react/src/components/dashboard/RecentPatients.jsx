import { useState } from 'react'
import { patients } from '../../data/mockData.js'
import PatientPopup, { getPatientByName } from '../shared/PatientPopup.jsx'

const deptCls = {
  Cardiology:  'bg-blue/10 text-blue',
  Neurology:   'bg-teal/10 text-teal',
  Orthopedics: 'bg-orange/10 text-orange',
  Pediatrics:  'bg-purple-500/10 text-purple-400',
}
const statusCls = {
  Active:     'text-teal',
  Discharged: 'text-gray-500',
  Critical:   'text-red-400',
}

export default function RecentPatients() {
  const [selected, setSelected] = useState(null)
  const recent = patients.slice(0, 8)

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Recent Patients</h3>
          <span className="text-xs text-gray-500">{patients.length} total</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-border">
              <th className="text-left pb-2.5 font-medium">Name</th>
              <th className="text-left pb-2.5 font-medium">Department</th>
              <th className="text-left pb-2.5 font-medium hidden md:table-cell">Physician</th>
              <th className="text-left pb-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map(p => (
              <tr
                key={p.id}
                onClick={() => setSelected(getPatientByName(p.name))}
                className="border-b border-border/50 hover:bg-white/5 cursor-pointer transition-colors group"
              >
                <td className="py-2.5 font-medium text-white group-hover:text-teal transition-colors">{p.name}</td>
                <td className="py-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${deptCls[p.department]}`}>
                    {p.department}
                  </span>
                </td>
                <td className="py-2.5 text-gray-400 text-xs hidden md:table-cell">{p.doctor}</td>
                <td className={`py-2.5 text-xs font-medium ${statusCls[p.status]}`}>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PatientPopup patient={selected} onClose={() => setSelected(null)} />
    </>
  )
}
