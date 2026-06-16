import { patients } from '../../data/mockData.js'

export function getPatientByName(name) {
  return patients.find(p => p.name === name) ?? null
}

const statusCls = {
  Active:     { text: 'text-teal',     bg: 'bg-teal/10 border-teal/20'        },
  Discharged: { text: 'text-gray-400', bg: 'bg-gray-700/40 border-gray-700'   },
  Critical:   { text: 'text-red-400',  bg: 'bg-red-500/10 border-red-500/20'  },
}

export default function PatientPopup({ patient, onClose }) {
  if (!patient) return null
  const sc = statusCls[patient.status] ?? statusCls.Active

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm card border-white/10 shadow-2xl z-10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal/20 border border-teal/30 flex items-center justify-center text-teal font-bold text-sm flex-shrink-0">
              {patient.name[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{patient.name}</p>
              <p className="text-xs text-gray-500">{patient.department} · {patient.age} yrs</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-0.5 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status badge */}
        <div className="mb-4">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${sc.bg} ${sc.text}`}>
            {patient.status}
          </span>
        </div>

        {/* Fields */}
        <div className="space-y-2.5">
          {[
            { label: 'Attending Physician', value: patient.doctor    },
            { label: 'Date of Birth',       value: patient.dob       },
            { label: 'Phone',               value: patient.phone     },
            { label: 'Blood Type',          value: patient.bloodType },
            { label: 'Address',             value: patient.address   },
            { label: 'Admitted',            value: patient.admitted  },
          ].filter(f => f.value).map(({ label, value }) => (
            <div key={label} className="flex gap-3">
              <span className="text-xs text-gray-500 w-36 flex-shrink-0">{label}</span>
              <span className="text-xs text-white flex-1 leading-relaxed">{value}</span>
            </div>
          ))}

          {patient.condition && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-gray-500 mb-1">Active Conditions</p>
              <p className="text-xs text-white leading-relaxed">{patient.condition}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
