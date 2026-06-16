import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { departments } from '../../data/mockData.js'

export default function DepartmentDonut() {
  const svgRef = useRef(null)

  useEffect(() => {
    const data = departments
    const size = 200
    const r = size / 2
    const inner = r * 0.58

    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', size).attr('height', size)

    const g = svg.append('g').attr('transform', `translate(${r},${r})`)

    const pie = d3.pie().value(d => d.patients).sort(null).padAngle(0.03)
    const arc = d3.arc().innerRadius(inner).outerRadius(r - 4)
    const arcHover = d3.arc().innerRadius(inner).outerRadius(r + 2)

    const slices = g.selectAll('path').data(pie(data)).join('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('opacity', 0.85)
      .style('cursor','pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this).transition().duration(150).attr('d', arcHover).attr('opacity', 1)
        label.text(d.data.name).attr('y', -8)
        count.text(d.data.patients + ' pts')
      })
      .on('mouseleave', function() {
        d3.select(this).transition().duration(150).attr('d', arc).attr('opacity', 0.85)
        label.text('Total').attr('y', -8)
        count.text(data.reduce((s,d) => s + d.patients, 0))
      })

    // Animate
    slices.attr('d', d => { const s = {...d, endAngle: d.startAngle}; return arc(s) })
      .transition().duration(900).ease(d3.easeCubicOut).attrTween('d', function(d) {
        const i = d3.interpolate({ startAngle: d.startAngle, endAngle: d.startAngle }, d)
        return t => arc(i(t))
      })

    const total = data.reduce((s, d) => s + d.patients, 0)
    const label = g.append('text').attr('text-anchor','middle').attr('y',-8)
      .attr('fill','#9ca3af').attr('font-size','11').text('Total')
    const count = g.append('text').attr('text-anchor','middle').attr('y',12)
      .attr('fill','white').attr('font-size','22').attr('font-weight','700').text(total)

  }, [])

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Patients by Department</h3>
      <div className="flex items-center gap-6">
        <svg ref={svgRef} className="flex-shrink-0" />
        <div className="space-y-2 flex-1">
          {departments.map(d => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{background: d.color}} />
                <span className="text-xs text-gray-400">{d.name}</span>
              </div>
              <span className="text-xs font-semibold text-white">{d.patients}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
