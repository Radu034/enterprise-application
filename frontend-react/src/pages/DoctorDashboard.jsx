import KPICard             from '../components/dashboard/KPICard.jsx'
import AppointmentChart    from '../components/dashboard/AppointmentChart.jsx'
import DepartmentDonut     from '../components/dashboard/DepartmentDonut.jsx'
import AppointmentHeatmap  from '../components/dashboard/AppointmentHeatmap.jsx'
import UpcomingAppointments from '../components/dashboard/UpcomingAppointments.jsx'
import RecentPatients      from '../components/dashboard/RecentPatients.jsx'
import { patients, beds }  from '../data/mockData.js'
import { UsersIcon, CalendarIcon, BedIcon, ClockIcon } from '../components/shared/Icons.jsx'

const occupied = beds.filter(b => b.status === 'occupied').length
const user = JSON.parse(localStorage.getItem('user') || '{}')

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function DoctorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">
          {greeting()}, {user.role === 'doctor' ? 'Dr. ' : ''}{user.firstName || 'Doctor'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Here is an overview of the clinic for today.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard label="Total Patients"       value={patients.length} icon={UsersIcon}    color="#3D8EF0" trend={8}  />
        <KPICard label="Today's Appointments" value={24}              icon={CalendarIcon} color="#00C9A7" trend={-3} />
        <KPICard label="Beds Occupied"        value={occupied}        icon={BedIcon}      color="#F07B3D" trend={2}  />
        <KPICard label="Avg. Wait Time (min)" value={22}              icon={ClockIcon}    color="#a78bfa" trend={-8} subtitle="Down from 24 min last week" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2"><AppointmentChart /></div>
        <DepartmentDonut />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2"><AppointmentHeatmap /></div>
        <div className="card flex flex-col justify-center items-center gap-3 text-center">
          <div className="text-4xl font-bold text-teal tabular-nums">{occupied}</div>
          <p className="text-sm text-gray-400">Beds currently occupied</p>
          <div className="w-full mt-2 space-y-1.5">
            {['occupied','available','reserved'].map(s => {
              const count = beds.filter(b => b.status === s).length
              const pct = Math.round(count / beds.length * 100)
              const color = s === 'occupied' ? '#F07B3D' : s === 'available' ? '#00C9A7' : '#3D8EF0'
              return (
                <div key={s}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-gray-400 capitalize">{s}</span>
                    <span className="text-gray-500">{count}</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <UpcomingAppointments />
        <RecentPatients />
      </div>
    </div>
  )
}
