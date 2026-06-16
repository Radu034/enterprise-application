import PatientDashboard from './PatientDashboard.jsx'
import DoctorDashboard  from './DoctorDashboard.jsx'

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.role === 'doctor' ? <DoctorDashboard /> : <PatientDashboard />
}
