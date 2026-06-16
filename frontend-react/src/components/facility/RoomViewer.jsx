import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { bedSchedule } from '../../data/mockData.js'

const BED_COLORS     = { available: 0x00C9A7, occupied: 0xe74c3c, reserved: 0xF07B3D }
const BED_COLORS_HEX = { available: '#00C9A7', occupied: '#e74c3c', reserved: '#F07B3D' }

const ROOMS = [
  { id: 1, name: 'Cardiology — A',  col: 0, row: 0 },
  { id: 2, name: 'Neurology — A',   col: 1, row: 0 },
  { id: 3, name: 'Orthopedics — A', col: 2, row: 0 },
  { id: 4, name: 'Cardiology — B',  col: 0, row: 1 },
  { id: 5, name: 'Pediatrics',      col: 1, row: 1 },
  { id: 6, name: 'General Ward',    col: 2, row: 1 },
]

const ROOM_W = 10
const ROOM_D = 9
const CORRIDOR = 3
const GAP = 1.5
const WALL_H = 3
const WALL_T = 0.18

function roomCenter(col, row) {
  const x = (ROOM_W + GAP) * col - (ROOM_W + GAP)
  const z = row === 0 ? -(ROOM_D / 2 + CORRIDOR / 2) : (ROOM_D / 2 + CORRIDOR / 2)
  return { x, z }
}

const BED_OFFSETS = [
  { bx: -2.8, bz: -2.2 }, { bx: 2.8, bz: -2.2 },
  { bx: -2.8, bz:  2.2 }, { bx: 2.8, bz:  2.2 },
]

function makeLabel(text, width = 256, height = 64) {
  const canvas = document.createElement('canvas')
  canvas.width = width; canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'rgba(22,27,34,0.85)'
  ctx.roundRect(2, 2, width - 4, height - 4, 8)
  ctx.fill()
  ctx.fillStyle = '#e6edf3'
  ctx.font = 'bold 22px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, width / 2, height / 2)
  return new THREE.CanvasTexture(canvas)
}

// ── Date navigator helpers ────────────────────────────────────────────────────
const SCHED_START = new Date('2026-06-10')
const SCHED_END   = new Date('2026-07-20')
const DAY_NAMES   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r }
function weekStart(d) {
  const r = new Date(d); const dow = r.getDay()
  r.setDate(r.getDate() + (dow === 0 ? -6 : 1 - dow)); r.setHours(0,0,0,0); return r
}
function buildWeek(monday) {
  const todayStr = toStr(new Date())
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(monday, i)
    const ds = toStr(d)
    return {
      date: ds, label: ds === todayStr ? 'Today' : DAY_NAMES[d.getDay()],
      short: d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      inRange: d >= SCHED_START && d <= SCHED_END,
    }
  })
}

export default function RoomViewer() {
  const mountRef  = useRef(null)
  const rendRef   = useRef(null)
  const bedMeshes = useRef([])   // array of THREE.Group, index matches bed index 0-23

  // ── Date state ──────────────────────────────────────────────────────────────
  const todayStr = toStr(new Date())
  const initDate = bedSchedule[todayStr] ? todayStr : '2026-06-10'
  const [monday,    setMonday]    = useState(() => weekStart(new Date(initDate)))
  const [activeDay, setActiveDay] = useState(initDate)

  const [selectedBed, setSelectedBed] = useState(null)
  const [wireframe,   setWireframe]   = useState(false)

  const week       = buildWeek(monday)
  const weekLabel  = `${week[0].short} – ${week[6].short}`
  const prevMonday = addDays(monday, -7)
  const nextMonday = addDays(monday,  7)
  const canGoPrev  = prevMonday <= SCHED_END && addDays(prevMonday, 6) >= SCHED_START
  const canGoNext  = nextMonday <= SCHED_END

  function goWeek(dir) {
    const nm = addDays(monday, dir * 7)
    setMonday(nm)
    const nw = buildWeek(nm)
    const first = nw.find(d => d.inRange)
    if (first) setActiveDay(first.date)
    setSelectedBed(null)
  }

  // Current beds for the selected day
  const dayBeds = bedSchedule[activeDay] ?? bedSchedule['2026-06-10']

  // ── Update bed colours when day changes ─────────────────────────────────────
  useEffect(() => {
    bedMeshes.current.forEach((group, i) => {
      const bed = dayBeds[i]
      if (!bed) return
      group.userData.bedData = bed
      // The first child is the frame — update its colour
      const frame = group.children[0]
      if (frame?.isMesh) frame.material.color.setHex(BED_COLORS[bed.status])
    })
    setSelectedBed(null)
  }, [activeDay, dayBeds])

  // ── Build Three.js scene once ────────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current
    // clientWidth can be 0 if flex layout hasn't resolved yet — use fallback
    const W  = el.clientWidth || el.parentElement?.clientWidth || 640
    const H  = 500

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0D1117)
    scene.fog = new THREE.Fog(0x0D1117, 40, 80)

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 200)
    camera.position.set(0, 28, 28)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    el.appendChild(renderer.domElement)
    rendRef.current = renderer

    // Resize when the container changes width
    const ro = new ResizeObserver(() => {
      const nw = el.clientWidth
      if (nw > 0) { renderer.setSize(nw, H); camera.aspect = nw / H; camera.updateProjectionMatrix() }
    })
    ro.observe(el)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.maxPolarAngle = Math.PI / 2.1
    controls.minDistance = 8
    controls.maxDistance = 60

    // Three.js r155+ uses physical lighting — intensities need to be ~π× legacy values
    scene.add(new THREE.AmbientLight(0xffffff, 1.0))
    const sun = new THREE.DirectionalLight(0xffffff, 1.8)
    sun.position.set(8, 20, 10); sun.castShadow = true
    sun.shadow.mapSize.width = 2048; sun.shadow.mapSize.height = 2048
    sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 80
    sun.shadow.camera.left = -30; sun.shadow.camera.right = 30
    sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -30
    scene.add(sun)
    const fill = new THREE.DirectionalLight(0x8ecae6, 0.6)
    fill.position.set(-10, 10, -10); scene.add(fill)

    const floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(46, 36),
      new THREE.MeshLambertMaterial({ color: 0x0f1419 })
    )
    floorMesh.rotation.x = -Math.PI / 2; floorMesh.receiveShadow = true; scene.add(floorMesh)
    scene.add(new THREE.GridHelper(46, 46, 0x1e2a38, 0x1e2a38))

    const corrMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(34, CORRIDOR),
      new THREE.MeshLambertMaterial({ color: 0x161b22 })
    )
    corrMesh.rotation.x = -Math.PI / 2; corrMesh.position.set(0, 0.01, 0); scene.add(corrMesh)

    bedMeshes.current = []
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x1e2a38, transparent: true, opacity: 0.85 })

    // Use the initial day's beds for first render
    const initBeds = bedSchedule[initDate] ?? bedSchedule['2026-06-10']

    ROOMS.forEach(room => {
      const { x, z } = roomCenter(room.col, room.row)

      const tileMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM_W - 0.2, ROOM_D - 0.2),
        new THREE.MeshLambertMaterial({ color: 0x131820 })
      )
      tileMesh.rotation.x = -Math.PI / 2
      tileMesh.position.set(x, 0.005, z); tileMesh.receiveShadow = true; scene.add(tileMesh)

      const wallDefs = [
        { w: ROOM_W, h: WALL_H, t: WALL_T, px: x, py: WALL_H/2, pz: z + (room.row===0 ? -ROOM_D/2 : ROOM_D/2), ry: 0 },
        { w: ROOM_D, h: WALL_H, t: WALL_T, px: x - ROOM_W/2, py: WALL_H/2, pz: z, ry: Math.PI/2 },
        { w: ROOM_D, h: WALL_H, t: WALL_T, px: x + ROOM_W/2, py: WALL_H/2, pz: z, ry: -Math.PI/2 },
      ]
      wallDefs.forEach(def => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(def.w, def.h, def.t), wallMat)
        mesh.position.set(def.px, def.py, def.pz); mesh.rotation.y = def.ry; mesh.castShadow = true; scene.add(mesh)
      })

      const tex = makeLabel(room.name)
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }))
      const labelZ = room.row === 0 ? z - ROOM_D/2 + 0.3 : z + ROOM_D/2 - 0.3
      sprite.position.set(x, WALL_H + 0.8, labelZ); sprite.scale.set(4.5, 1.1, 1); scene.add(sprite)

      const roomBeds = initBeds.slice((room.id - 1) * 4, room.id * 4)
      roomBeds.forEach((bed, bi) => {
        const off = BED_OFFSETS[bi]
        const bx = x + off.bx
        const bz = z + off.bz

        const group = new THREE.Group()
        group.position.set(bx, 0, bz)

        const frame = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 0.35, 2.4),
          new THREE.MeshPhongMaterial({ color: BED_COLORS[bed.status], shininess: 60 })
        )
        frame.position.y = 0.42; frame.castShadow = true; group.add(frame)

        const mattress = new THREE.Mesh(
          new THREE.BoxGeometry(1.3, 0.18, 2.1),
          new THREE.MeshPhongMaterial({ color: 0xdde6ed, shininess: 20 })
        )
        mattress.position.y = 0.68; group.add(mattress)

        const pillow = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 0.12, 0.45),
          new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 30 })
        )
        pillow.position.set(0, 0.79, -0.8); group.add(pillow)

        const headboard = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 0.8, 0.1),
          new THREE.MeshPhongMaterial({ color: 0x2a3446, shininess: 10 })
        )
        headboard.position.set(0, 0.7, -1.25); group.add(headboard)

        ;[[-0.6,-1.05],[0.6,-1.05],[-0.6,1.05],[0.6,1.05]].forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8),
            new THREE.MeshPhongMaterial({ color: 0x3a4a5a })
          )
          leg.position.set(lx, 0.175, lz); group.add(leg)
        })

        group.userData = { bedId: bed.id, bedData: bed, roomName: room.name }
        scene.add(group)
        bedMeshes.current.push(group)
      })
    })

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    // Collect every mesh that belongs to a bed group for precise raycasting
    const bedChildMeshes = []
    bedMeshes.current.forEach(g => g.traverse(c => { if (c.isMesh) bedChildMeshes.push(c) }))

    // Use pointerdown/pointerup instead of 'click' — OrbitControls can swallow click events
    let downX = 0, downY = 0
    function onPointerDown(e) { downX = e.clientX; downY = e.clientY }
    function onPointerUp(e) {
      const dx = e.clientX - downX
      const dy = e.clientY - downY
      if (Math.sqrt(dx * dx + dy * dy) > 5) return  // was a drag, ignore
      const rect = renderer.domElement.getBoundingClientRect()
      if (rect.width === 0) return
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(bedChildMeshes, false)
      if (hits.length > 0) {
        const group = hits[0].object.parent
        if (group?.userData?.bedData) { setSelectedBed({ ...group.userData.bedData }); return }
      }
      setSelectedBed(null)
    }
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointerup', onPointerUp)

    let raf
    function animate() {
      raf = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      controls.dispose()
      renderer.dispose()
      if (el && renderer.domElement.parentNode === el) el.removeChild(renderer.domElement)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Wireframe toggle
  useEffect(() => {
    bedMeshes.current.forEach(g => {
      g.traverse(c => { if (c.isMesh) c.material.wireframe = wireframe })
    })
  }, [wireframe])

  const counts = { available: 0, occupied: 0, reserved: 0 }
  dayBeds.forEach(b => counts[b.status]++)

  return (
    <div className="space-y-4">
      {/* Week navigator */}
      <div className="flex items-center gap-3">
        <button onClick={() => goWeek(-1)} disabled={!canGoPrev}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex gap-1.5 flex-1">
          {week.map(d => (
            <button key={d.date}
              onClick={() => { if (d.inRange) { setActiveDay(d.date) } }}
              disabled={!d.inRange}
              className={`flex flex-col items-center flex-1 py-2 rounded-lg border transition-all duration-150 min-w-0
                ${d.date === activeDay && d.inRange
                  ? 'bg-teal text-black border-teal'
                  : d.isWeekend
                  ? 'bg-surface border-border/40 text-gray-700 cursor-default'
                  : d.inRange
                  ? 'bg-surface border-border text-gray-400 hover:text-white hover:border-white/20 cursor-pointer'
                  : 'bg-surface border-border/20 text-gray-800 cursor-default'
                }`}>
              <span className="text-xs font-semibold truncate">{d.label}</span>
              <span className={`text-xs mt-0.5 ${d.date === activeDay && d.inRange ? 'text-black/60' : 'text-gray-600'}`}>{d.short}</span>
            </button>
          ))}
        </div>

        <button onClick={() => goWeek(1)} disabled={!canGoNext}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-5">
          {Object.entries(BED_COLORS_HEX).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
              <span className="capitalize">{status}</span>
              <span className="text-gray-600">({counts[status]})</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600">Week of {weekLabel}</span>
          <button onClick={() => setWireframe(w => !w)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
              wireframe ? 'border-teal text-teal bg-teal/10' : 'border-border text-gray-400 hover:border-teal/30 hover:text-white'
            }`}>
            Wireframe {wireframe ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <div ref={mountRef} className="flex-1 rounded-xl overflow-hidden border border-border min-h-[500px]" />

        <div className="w-60 space-y-3 flex-shrink-0">
          <div className="card">
            <p className="text-xs font-semibold text-gray-400 mb-3">Selected Bed</p>
            {selectedBed ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: BED_COLORS_HEX[selectedBed.status] }} />
                  <span className="text-white font-semibold">Bed #{selectedBed.id}</span>
                  <span className="text-gray-500">{selectedBed.room}</span>
                </div>
                <div className="capitalize font-medium" style={{ color: BED_COLORS_HEX[selectedBed.status] }}>
                  {selectedBed.status}
                </div>
                {selectedBed.patient && (
                  <div className="pt-2 border-t border-border space-y-1.5">
                    <div><span className="text-gray-500">Patient </span><span className="text-white">{selectedBed.patient}</span></div>
                    {selectedBed.doctor    && <div><span className="text-gray-500">Doctor </span><span className="text-white">{selectedBed.doctor}</span></div>}
                    {selectedBed.admitted  && <div><span className="text-gray-500">Admitted </span><span className="text-white">{selectedBed.admitted}</span></div>}
                    {selectedBed.discharge && <div><span className="text-gray-500">Discharge </span><span className="text-white">{selectedBed.discharge}</span></div>}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-600">Click a bed to inspect it</p>
            )}
          </div>

          <div className="card space-y-3">
            <p className="text-xs font-semibold text-gray-400">Rooms</p>
            {ROOMS.map(r => {
              const roomBeds = dayBeds.slice((r.id - 1) * 4, r.id * 4)
              const occ = roomBeds.filter(b => b.status === 'occupied').length
              return (
                <div key={r.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 truncate">{r.name}</span>
                    <span className="text-gray-600 flex-shrink-0 ml-1">{occ}/4</span>
                  </div>
                  <div className="flex gap-0.5">
                    {roomBeds.map(b => (
                      <div key={b.id} className="flex-1 h-1.5 rounded-full" style={{ background: BED_COLORS_HEX[b.status] }} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-600 text-center">Drag to orbit · Scroll to zoom · Click a bed to inspect</p>
    </div>
  )
}
