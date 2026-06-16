import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { appointmentHistory } from '../../data/mockData.js'

export default function AppointmentHeatmap() {
  const svgRef = useRef(null)

  useEffect(() => {
    const data = appointmentHistory
    const cols = 10
    const rows = 3
    const cell = 28
    const gap = 4
    const W = cols * (cell + gap)
    const H = rows * (cell + gap) + 30

    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current).attr('width', W).attr('height', H)

    const colorScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .range(['#2A3446', '#00C9A7'])

    const tip = d3.select('body').selectAll('.heatmap-tip').data([null]).join('div')
      .attr('class','heatmap-tip')
      .style('position','fixed').style('background','#161B22').style('border','1px solid #2A3446')
      .style('padding','6px 10px').style('border-radius','6px').style('font-size','12px')
      .style('color','white').style('pointer-events','none').style('opacity',0).style('z-index','999')

    data.forEach((d, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = col * (cell + gap)
      const y = row * (cell + gap) + 24

      svg.append('rect')
        .attr('x', x).attr('y', y)
        .attr('width', cell).attr('height', cell)
        .attr('rx', 4)
        .attr('fill', colorScale(d.count))
        .style('cursor','pointer')
        .on('mouseenter', (event) => {
          tip.style('opacity',1).html(`<b>${d.date}</b><br/>${d.count} appointments`)
        })
        .on('mousemove', (event) => {
          tip.style('left', (event.clientX + 12) + 'px').style('top', (event.clientY - 28) + 'px')
        })
        .on('mouseleave', () => tip.style('opacity',0))
    })

    // Month label
    svg.append('text').attr('x', 0).attr('y', 14)
      .attr('fill','#6b7280').attr('font-size','11')
      .text(`${data[0].date.slice(0,7)} – ${data[29].date.slice(0,7)}`)

    // Color legend
    const lgW = 80
    const lgDefs = svg.append('defs')
    const lgGrad = lgDefs.append('linearGradient').attr('id','lgGrad')
    lgGrad.append('stop').attr('offset','0%').attr('stop-color','#2A3446')
    lgGrad.append('stop').attr('offset','100%').attr('stop-color','#00C9A7')
    svg.append('rect').attr('x', W - lgW).attr('y', 0).attr('width', lgW).attr('height', 8)
      .attr('rx',3).attr('fill','url(#lgGrad)')
    svg.append('text').attr('x', W - lgW).attr('y', 20).attr('fill','#6b7280').attr('font-size','9').text('Low')
    svg.append('text').attr('x', W - 16).attr('y', 20).attr('fill','#6b7280').attr('font-size','9').attr('text-anchor','end').text('High')

  }, [])

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Appointment Load — 30 Days</h3>
      <svg ref={svgRef} className="w-full overflow-visible" />
    </div>
  )
}
