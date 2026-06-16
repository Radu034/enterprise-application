import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { weeklyAppointments } from '../../data/mockData.js'

export default function AppointmentChart() {
  const svgRef = useRef(null)

  useEffect(() => {
    const data = weeklyAppointments
    const el = svgRef.current
    const W = el.clientWidth || 600
    const H = 220
    const m = { top: 20, right: 20, bottom: 30, left: 36 }
    const w = W - m.left - m.right
    const h = H - m.top - m.bottom

    d3.select(el).selectAll('*').remove()

    const svg = d3.select(el)
      .attr('width', W)
      .attr('height', H)

    const defs = svg.append('defs')
    const grad = defs.append('linearGradient').attr('id', 'areaGrad').attr('x1',0).attr('y1',0).attr('x2',0).attr('y2',1)
    grad.append('stop').attr('offset','0%').attr('stop-color','#00C9A7').attr('stop-opacity', 0.4)
    grad.append('stop').attr('offset','100%').attr('stop-color','#00C9A7').attr('stop-opacity', 0.02)

    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`)

    const x = d3.scalePoint().domain(data.map(d => d.date.slice(5))).range([0, w])
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.count) + 5]).range([h, 0])

    // Grid lines
    g.append('g').attr('class','grid')
      .call(d3.axisLeft(y).ticks(4).tickSize(-w).tickFormat(''))
      .call(gg => gg.select('.domain').remove())
      .call(gg => gg.selectAll('.tick line').attr('stroke','#2A3446').attr('stroke-dasharray','4,4'))

    // Area
    const area = d3.area()
      .x(d => x(d.date.slice(5)))
      .y0(h).y1(d => y(d.count))
      .curve(d3.curveCatmullRom.alpha(0.5))

    g.append('path').datum(data).attr('d', area).attr('fill','url(#areaGrad)')

    // Line
    const line = d3.line()
      .x(d => x(d.date.slice(5)))
      .y(d => y(d.count))
      .curve(d3.curveCatmullRom.alpha(0.5))

    const path = g.append('path').datum(data)
      .attr('d', line)
      .attr('fill','none')
      .attr('stroke','#00C9A7')
      .attr('stroke-width', 2.5)

    // Animate stroke-dashoffset
    const len = path.node().getTotalLength()
    path.attr('stroke-dasharray', len).attr('stroke-dashoffset', len)
      .transition().duration(1400).ease(d3.easeCubicOut).attr('stroke-dashoffset', 0)

    // Dots
    g.selectAll('circle').data(data).join('circle')
      .attr('cx', d => x(d.date.slice(5)))
      .attr('cy', d => y(d.count))
      .attr('r', 4)
      .attr('fill','#00C9A7')
      .attr('stroke','#161B22')
      .attr('stroke-width', 2)

    // Axes
    g.append('g').attr('transform',`translate(0,${h})`)
      .call(d3.axisBottom(x).tickSize(0))
      .call(gg => gg.select('.domain').attr('stroke','#2A3446'))
      .call(gg => gg.selectAll('text').attr('fill','#6b7280').attr('font-size','11'))

    g.append('g')
      .call(d3.axisLeft(y).ticks(4))
      .call(gg => gg.select('.domain').remove())
      .call(gg => gg.selectAll('text').attr('fill','#6b7280').attr('font-size','11'))

  }, [])

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Appointments — Last 7 Days</h3>
      <svg ref={svgRef} className="w-full" />
    </div>
  )
}
