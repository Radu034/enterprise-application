import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import Sidebar           from './components/layout/Sidebar.jsx'
import Topbar            from './components/layout/Topbar.jsx'
import Dashboard         from './pages/Dashboard.jsx'
import ScanPage          from './pages/ScanPage.jsx'
import FacilityPage      from './pages/FacilityPage.jsx'
import AppointmentsPage  from './pages/AppointmentsPage.jsx'
import PatientProfilePage from './pages/PatientProfilePage.jsx'
import DoctorSchedulePage from './pages/DoctorSchedulePage.jsx'
import LoginPage         from './pages/LoginPage.jsx'
import RegisterPage      from './pages/RegisterPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'

function RequireAuth({ children }) {
  const user = localStorage.getItem('user')
  if (!user || user === 'undefined') return <Navigate to="/login" replace />
  return children
}

function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex flex-col flex-1 min-h-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/"             element={<Dashboard />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/profile"      element={<PatientProfilePage />} />
            <Route path="/schedule"     element={<DoctorSchedulePage />} />
            <Route path="/scans"        element={<ScanPage />} />
            <Route path="/facility"     element={<FacilityPage />} />
            <Route path="*"             element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          } />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
