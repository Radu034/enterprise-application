import { useRef, useState, useEffect, useCallback } from 'react'
import * as d3 from 'd3'

// ── Image processing ──────────────────────────────────────────────────────────

function toGrayscale(src) {
  const dst = new ImageData(src.width, src.height)
  for (let i = 0; i < src.data.length; i += 4) {
    const g = 0.299 * src.data[i] + 0.587 * src.data[i+1] + 0.114 * src.data[i+2]
    dst.data[i] = dst.data[i+1] = dst.data[i+2] = g
    dst.data[i+3] = 255
  }
  return dst
}

function applySobel(src) {
  const gray = toGrayscale(src)
  const w = src.width, h = src.height
  const dst = new ImageData(w, h)
  const kX = [-1,0,1,-2,0,2,-1,0,1]
  const kY = [-1,-2,-1,0,0,0,1,2,1]
  for (let y = 1; y < h-1; y++) {
    for (let x = 1; x < w-1; x++) {
      let gx = 0, gy = 0
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y+ky)*w+(x+kx))*4
          const v = gray.data[idx]
          const ki = (ky+1)*3+(kx+1)
          gx += v * kX[ki]; gy += v * kY[ki]
        }
      }
      const mag = Math.min(255, Math.sqrt(gx*gx + gy*gy))
      const oi = (y*w+x)*4
      dst.data[oi] = dst.data[oi+1] = dst.data[oi+2] = mag
      dst.data[oi+3] = 255
    }
  }
  return dst
}

function applyGaussian(src) {
  const w = src.width, h = src.height
  const dst = new ImageData(w, h)
  const k = [2,4,5,4,2,4,9,12,9,4,5,12,15,12,5,4,9,12,9,4,2,4,5,4,2]
  for (let y = 2; y < h-2; y++) {
    for (let x = 2; x < w-2; x++) {
      let r=0,g=0,b=0
      for (let ky=-2;ky<=2;ky++) for (let kx=-2;kx<=2;kx++) {
        const idx=((y+ky)*w+(x+kx))*4
        const ki=(ky+2)*5+(kx+2)
        r+=src.data[idx]*k[ki]; g+=src.data[idx+1]*k[ki]; b+=src.data[idx+2]*k[ki]
      }
      const oi=(y*w+x)*4
      dst.data[oi]=r/159; dst.data[oi+1]=g/159; dst.data[oi+2]=b/159; dst.data[oi+3]=255
    }
  }
  return dst
}

function applyHistogramEq(src) {
  const gray = toGrayscale(src)
  const hist = new Array(256).fill(0)
  const total = src.width * src.height
  for (let i = 0; i < gray.data.length; i += 4) hist[gray.data[i]]++
  const cdf = hist.reduce((acc, v, i) => { acc[i] = (acc[i-1]||0) + v; return acc }, [])
  const cdfMin = cdf.find(v => v > 0)
  const dst = new ImageData(src.width, src.height)
  for (let i = 0; i < gray.data.length; i += 4) {
    const eq = Math.round(((cdf[gray.data[i]] - cdfMin) / (total - cdfMin)) * 255)
    dst.data[i] = dst.data[i+1] = dst.data[i+2] = eq
    dst.data[i+3] = 255
  }
  return dst
}

function applyThreshold(src, threshold) {
  const gray = toGrayscale(src)
  const dst = new ImageData(src.width, src.height)
  for (let i = 0; i < gray.data.length; i += 4) {
    const v = gray.data[i] > threshold ? 255 : 0
    dst.data[i] = dst.data[i+1] = dst.data[i+2] = v
    dst.data[i+3] = 255
  }
  return dst
}

function computeStats(imageData) {
  const d = imageData.data
  let sum = 0, sum2 = 0, edges = 0
  const n = d.length / 4
  for (let i = 0; i < d.length; i += 4) {
    const g = (d[i]+d[i+1]+d[i+2])/3
    sum += g; sum2 += g*g
    if (g > 200) edges++
  }
  const mean = sum / n
  return { mean: Math.round(mean), variance: Math.round(sum2/n - mean*mean), edgeDensity: +(edges/n).toFixed(4) }
}

const FILTERS = ['Original', 'Grayscale', 'Edge Detection', 'Gaussian Blur', 'Histogram Eq.', 'Threshold']

export default function ScanProcessor({ onAnalyze }) {
  // Both canvases are always in the DOM so refs are always valid
  const origCanvasRef = useRef(null)
  const procCanvasRef = useRef(null)
  const histSvgRef    = useRef(null)
  const origImgRef    = useRef(null)

  const [activeFilter, setActiveFilter] = useState('Original')
  const [threshold, setThreshold]       = useState(128)
  const [hasImage, setHasImage]         = useState(false)
  const [fileName, setFileName]         = useState('')

  const drawHistogram = useCallback((imageData) => {
    const bins = new Array(256).fill(0)
    for (let i = 0; i < imageData.data.length; i += 4)
      bins[Math.round(0.299*imageData.data[i]+0.587*imageData.data[i+1]+0.114*imageData.data[i+2])]++
    const el = histSvgRef.current
    if (!el) return
    const W = el.clientWidth || 300, H = 80
    d3.select(el).selectAll('*').remove()
    const svg = d3.select(el).attr('width', W).attr('height', H)
    const x = d3.scaleLinear().domain([0, 255]).range([0, W])
    const y = d3.scaleLinear().domain([0, d3.max(bins)]).range([H, 0])
    svg.selectAll('rect').data(bins).join('rect')
      .attr('x', (_, i) => x(i)).attr('y', d => y(d))
      .attr('width', W/256+0.5).attr('height', d => H-y(d))
      .attr('fill', '#00C9A7').attr('opacity', 0.75)
  }, [])

  const applyFilter = useCallback((filter, thresh = threshold) => {
    const orig = origImgRef.current
    if (!orig) return
    const pc = procCanvasRef.current
    if (!pc) return
    const ctx = pc.getContext('2d')

    let result
    if      (filter === 'Original')        result = orig
    else if (filter === 'Grayscale')       result = toGrayscale(orig)
    else if (filter === 'Edge Detection')  result = applySobel(orig)
    else if (filter === 'Gaussian Blur')   result = applyGaussian(orig)
    else if (filter === 'Histogram Eq.')   result = applyHistogramEq(orig)
    else if (filter === 'Threshold')       result = applyThreshold(orig, thresh)

    pc.width = result.width; pc.height = result.height
    ctx.putImageData(result, 0, 0)
    drawHistogram(result)
    if (onAnalyze) onAnalyze(computeStats(result))
  }, [threshold, drawHistogram, onAnalyze])

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    const img = new Image()
    img.onload = () => {
      const oc = origCanvasRef.current
      oc.width = img.width; oc.height = img.height
      const octx = oc.getContext('2d')
      octx.drawImage(img, 0, 0)
      origImgRef.current = octx.getImageData(0, 0, img.width, img.height)
      setHasImage(true)
      // activeFilter stays 'Original' — effect below will fire
    }
    img.src = URL.createObjectURL(file)
  }

  // Re-run whenever the filter, threshold, or image changes
  useEffect(() => {
    if (hasImage) applyFilter(activeFilter)
  }, [activeFilter, threshold, hasImage, applyFilter])

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div className="card">
        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors
          ${hasImage ? 'border-teal/40 bg-teal/5' : 'border-border hover:border-teal/40'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {fileName
            ? <span className="text-sm text-teal font-medium">{fileName}</span>
            : <span className="text-sm text-gray-400">Click to upload an X-Ray or MRI image</span>
          }
          <span className="text-xs text-gray-600 mt-1">PNG, JPG, DICOM-preview supported</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
      </div>

      {/* Filter toolbar — only shown when image is loaded */}
      {hasImage && (
        <div className="card space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Processing Filters</p>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === f
                    ? 'bg-teal text-black'
                    : 'bg-bg border border-border text-gray-400 hover:border-teal/40 hover:text-white'
                }`}>
                {f}
              </button>
            ))}
          </div>
          {activeFilter === 'Threshold' && (
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs text-gray-400 w-32 flex-shrink-0">Threshold: {threshold}</span>
              <input type="range" min={0} max={255} value={threshold}
                onChange={e => setThreshold(+e.target.value)}
                className="flex-1 accent-teal" />
            </div>
          )}
        </div>
      )}

      {/* Canvases — always in DOM but hidden until image loaded */}
      <div style={{ display: hasImage ? 'grid' : 'none' }} className="grid grid-cols-2 gap-4">
        <div className="card p-3">
          <p className="text-xs text-gray-500 mb-2">Original</p>
          <canvas ref={origCanvasRef} className="w-full rounded" />
        </div>
        <div className="card p-3">
          <p className="text-xs text-gray-500 mb-2">{activeFilter}</p>
          <canvas ref={procCanvasRef} className="w-full rounded" />
        </div>
      </div>

      {/* Histogram — always in DOM but hidden */}
      <div style={{ display: hasImage ? 'block' : 'none' }} className="card p-3">
        <p className="text-xs text-gray-500 mb-2">Pixel Intensity Histogram</p>
        <svg ref={histSvgRef} className="w-full" style={{ height: 80 }} />
      </div>
    </div>
  )
}
