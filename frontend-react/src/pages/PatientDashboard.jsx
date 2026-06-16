import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import KPICard from '../components/dashboard/KPICard.jsx'
import { CalendarIcon, ClockIcon, HeartIcon, CheckIcon, ChevronRightIcon } from '../components/shared/Icons.jsx'
import BodyMap from '../components/shared/BodyMap.jsx'
import { patients } from '../data/mockData.js'
import { useNavigate } from 'react-router-dom'

const user = JSON.parse(localStorage.getItem('user') || '{}')

// Find the logged-in user's patient record; fall back to patient[0] for demo
const demoPatient = patients.find(
  p => p.firstName === user.firstName && p.lastName === user.lastName
) ?? patients[0]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

// Mock upcoming appointments for this patient
const myAppointments = [
  { id: 1, doctor: 'Dr. Mihai Popescu',     specialty: 'Cardiology',  date: 'Today',      time: '14:00', status: 'Confirmed', reason: 'Routine checkup'     },
  { id: 2, doctor: 'Dr. Elena Dumitrescu',  specialty: 'Neurology',   date: 'Thu, Jun 12', time: '09:30', status: 'Confirmed', reason: 'Follow-up'           },
  { id: 3, doctor: 'Dr. Ioana Stancu',      specialty: 'Pediatrics',  date: 'Mon, Jun 16', time: '11:00', status: 'Pending',   reason: 'Annual examination'  },
]

const healthTimeline = [
  { month: 'Jan', bp: 122, hr: 74 },
  { month: 'Feb', bp: 118, hr: 71 },
  { month: 'Mar', bp: 125, hr: 76 },
  { month: 'Apr', bp: 120, hr: 73 },
  { month: 'May', bp: 116, hr: 70 },
  { month: 'Jun', bp: 119, hr: 72 },
]

function HealthChart() {
  const svgRef = useRef(null)

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const W = el.clientWidth || 400
    const H = 160
    const m = { top: 16, right: 16, bottom: 24, left: 32 }
    const w = W - m.left - m.right
    const h = H - m.top - m.bottom

    d3.select(el).selectAll('*').remove()
    const svg = d3.select(el).attr('width', W).attr('height', H)
    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`)

    const x = d3.scalePoint().domain(healthTimeline.map(d => d.month)).range([0, w])
    const y = d3.scaleLinear().domain([60, 140]).range([h, 0])

    // Grid
    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickSize(-w).tickFormat(''))
      .call(gg => gg.select('.domain').remove())
      .call(gg => gg.selectAll('.tick line').attr('stroke', '#2A3446').attr('stroke-dasharray', '3,3'))

    const drawLine = (key, color) => {
      const line = d3.line().x(d => x(d.month)).y(d => y(d[key])).curve(d3.curveCatmullRom)
      const path = g.append('path').datum(healthTimeline)
        .attr('fill', 'none').attr('stroke', color).attr('stroke-width', 2)
        .attr('d', line)
      const len = path.node().getTotalLength()
      path.attr('stroke-dasharray', len).attr('stroke-dashoffset', len)
        .transition().duration(1200).ease(d3.easeCubicOut).attr('stroke-dashoffset', 0)

      g.selectAll(`.dot-${key}`).data(healthTimeline).join('circle')
        .attr('cx', d => x(d.month)).attr('cy', d => y(d[key]))
        .attr('r', 3.5).attr('fill', color).attr('stroke', '#161B22').attr('stroke-width', 1.5)
    }

    drawLine('bp', '#3D8EF0')
    drawLine('hr', '#00C9A7')

    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).tickSize(0))
      .call(gg => gg.select('.domain').attr('stroke', '#2A3446'))
      .call(gg => gg.selectAll('text').attr('fill', '#6b7280').attr('font-size', 11))

    g.append('g')
      .call(d3.axisLeft(y).ticks(4))
      .call(gg => gg.select('.domain').remove())
      .call(gg => gg.selectAll('text').attr('fill', '#6b7280').attr('font-size', 11))
  }, [])

  return <svg ref={svgRef} className="w-full" />
}

const statusCls = {
  Confirmed: 'bg-teal/10 text-teal border border-teal/20',
  Pending:   'bg-blue/10 text-blue border border-blue/20',
}

export default function PatientDashboard() {
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">{greeting()}, {user.firstName || 'Patient'}</h1>
        <p className="text-sm text-gray-500 mt-0.5">Here is a summary of your health activity.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard label="Upcoming Visits"   value={myAppointments.length} icon={CalendarIcon} color="#00C9A7" />
        <KPICard label="Visits This Year"  value={7}                     icon={ClockIcon}    color="#3D8EF0" />
        <KPICard label="Active Conditions" value={1}                     icon={HeartIcon}    color="#F07B3D" subtitle={demoPatient.condition} />
        <KPICard label="Completed Visits"  value={12}                    icon={CheckIcon}    color="#a78bfa" />
      </div>

      {/* Appointments + Health chart */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Upcoming */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Upcoming Appointments</h3>
            <button onClick={() => navigate('/appointments')}
              className="text-xs text-teal hover:underline flex items-center gap-1">
              View all <ChevronRightIcon size={13} />
            </button>
          </div>
          <div className="space-y-2">
            {myAppointments.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-bg border border-border hover:border-white/10 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-teal/10 border border-teal/20 flex items-center justify-center text-teal flex-shrink-0">
                  <CalendarIcon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{a.doctor}</p>
                  <p className="text-xs text-gray-500">{a.specialty} · {a.date} at {a.time}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusCls[a.status]}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/appointments')}
            className="mt-4 w-full py-2 rounded-lg border border-teal/30 text-teal text-sm font-medium hover:bg-teal/10 transition-colors">
            Book New Appointment
          </button>
        </div>

        {/* Health chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">Health Trends — 2026</h3>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-blue inline-block" /> Blood Pressure</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-teal inline-block" /> Heart Rate</span>
            </div>
          </div>
          <HealthChart />
        </div>
      </div>

      {/* Anatomy overview + Recent activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* BodyMap */}
        <div className="xl:col-span-1">
          <BodyMap patient={demoPatient} />
        </div>

        {/* Recent activity */}
        <div className="card xl:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Medical Activity</h3>
          <div className="space-y-0">
            {demoPatient.consultations.map((c, i) => (
              <div key={i} className="flex gap-4 py-3 border-b border-border/50 last:border-0">
                <div className="w-24 flex-shrink-0 text-xs text-gray-500 pt-0.5">{c.date}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{c.type}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.doctor}</p>
                </div>
                <div className="text-xs text-gray-400 text-right max-w-[220px] pt-0.5 leading-relaxed">{c.findings}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
