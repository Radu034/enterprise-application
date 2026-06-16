import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const COLOR_DEFAULT  = 0x4A7EC7   // steel blue — visible on both dark and light backgrounds
const COLOR_AFFECTED = 0xE07020   // orange — patient's condition region
const COLOR_HOVER    = 0x6A9FE0   // lighter blue highlight
const COLOR_SELECTED = 0x00C9A7  // teal — clicked region

export default function BodyMap({ patient }) {
  const mountRef  = useRef(null)
  const meshesRef = useRef({})   // regionName → [THREE.Mesh, ...]

  const [selectedRegion, setSelectedRegion] = useState(null)
  const [hoveredRegion,  setHoveredRegion]  = useState(null)

  const affectedRegion = patient?.bodyRegion ?? null

  // ── Update mesh colours when selection/hover/patient changes ────────────────
  useEffect(() => {
    Object.entries(meshesRef.current).forEach(([name, meshes]) => {
      const color =
        name === selectedRegion ? COLOR_SELECTED :
        name === hoveredRegion  ? COLOR_HOVER    :
        name === affectedRegion ? COLOR_AFFECTED :
        COLOR_DEFAULT
      const emissive = (name === selectedRegion || name === hoveredRegion) ? 0.12 : 0
      meshes.forEach(m => {
        m.material.color.setHex(color)
        m.material.emissiveIntensity = emissive
      })
    })
  }, [selectedRegion, hoveredRegion, affectedRegion])

  // ── Build Three.js scene once ────────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current
    if (!el) return
    const W = el.clientWidth || 220
    const H = 300

    const scene  = new THREE.Scene()
    // transparent background — inherits card's themed surface color
    const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 100)
    camera.position.set(0, 1, 7)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const dir = new THREE.DirectionalLight(0xffffff, 0.9)
    dir.position.set(3, 5, 4); scene.add(dir)
    const fill = new THREE.DirectionalLight(0x8ecae6, 0.3)
    fill.position.set(-3, 2, -2); scene.add(fill)

    const mat = () => new THREE.MeshPhongMaterial({
      color: COLOR_DEFAULT, transparent: true, opacity: 0.88,
      emissive: new THREE.Color(0x00C9A7), emissiveIntensity: 0, shininess: 35,
    })

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.52, 16, 16), mat())
    head.position.set(0, 2.52, 0); scene.add(head)

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.3, 10), mat())
    neck.position.set(0, 1.95, 0); scene.add(neck)

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.22, 1.5, 0.52), mat())
    torso.position.set(0, 1.12, 0); scene.add(torso)

    // Abdomen
    const abd = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.62, 0.48), mat())
    abd.position.set(0, 0.18, 0); scene.add(abd)

    // Arms
    const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.13, 1.45, 10), mat())
    lArm.position.set(-0.88, 1.0, 0); lArm.rotation.z = 0.22; scene.add(lArm)
    const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.13, 1.45, 10), mat())
    rArm.position.set(0.88, 1.0, 0); rArm.rotation.z = -0.22; scene.add(rArm)

    // Legs
    const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.15, 1.85, 10), mat())
    lLeg.position.set(-0.34, -1.32, 0); scene.add(lLeg)
    const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.15, 1.85, 10), mat())
    rLeg.position.set(0.34, -1.32, 0); scene.add(rLeg)

    // Group meshes by region name — must match conditionToRegion() return values
    const meshMap = {
      'Head':           [head, neck],
      'Chest / Heart':  [torso],
      'Arms':           [lArm, rArm],
      'Abdomen':        [abd],
      'Legs':           [lLeg, rLeg],
    }
    meshesRef.current = meshMap

    // Tag every mesh with its region for raycasting
    const allMeshes = []
    Object.entries(meshMap).forEach(([name, meshes]) => {
      meshes.forEach(m => { m.userData.regionName = name; allMeshes.push(m) })
    })

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    function hitRegion(e) {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(allMeshes)
      return hits.length > 0 ? hits[0].object.userData.regionName : null
    }

    function onMove(e) { setHoveredRegion(hitRegion(e)) }
    function onClick(e) {
      const r = hitRegion(e)
      setSelectedRegion(prev => (prev === r ? null : r))
    }
    function onLeave() { setHoveredRegion(null) }

    renderer.domElement.addEventListener('mousemove', onMove)
    renderer.domElement.addEventListener('click', onClick)
    renderer.domElement.addEventListener('mouseleave', onLeave)
    renderer.domElement.style.cursor = 'pointer'

    // Slow idle sway
    let t = 0, raf
    function animate() {
      raf = requestAnimationFrame(animate)
      t += 0.004
      scene.rotation.y = Math.sin(t) * 0.18
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      renderer.domElement.removeEventListener('mousemove', onMove)
      renderer.domElement.removeEventListener('click', onClick)
      renderer.domElement.removeEventListener('mouseleave', onLeave)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  // Consultations for the selected region
  const consultations = selectedRegion
    ? (patient?.consultations || []).filter(c => c.bodyRegion === selectedRegion)
    : []

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Anatomy Overview</h3>
        {affectedRegion && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
            {affectedRegion}
          </span>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#E07020' }} />
          Active condition
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-teal" />
          Selected
        </span>
      </div>

      {/* 3D canvas */}
      <div ref={mountRef} className="rounded-lg overflow-hidden w-full" />

      {/* Hint */}
      {!selectedRegion && (
        <p className="text-xs text-gray-600 text-center">
          {hoveredRegion ? `Click to view consultations for ${hoveredRegion}` : 'Click a body region to view consultation history'}
        </p>
      )}

      {/* Consultation results panel */}
      {selectedRegion && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-teal">{selectedRegion}</p>
            <button onClick={() => setSelectedRegion(null)}
              className="text-xs text-gray-600 hover:text-white transition-colors">
              close
            </button>
          </div>
          {consultations.length > 0 ? consultations.map((c, i) => (
            <div key={i} className="bg-bg border border-border rounded-lg p-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{c.type}</span>
                <span className="text-xs text-gray-500">{c.date}</span>
              </div>
              <p className="text-xs text-gray-400">{c.doctor}</p>
              <p className="text-xs text-gray-300 leading-relaxed">{c.findings}</p>
            </div>
          )) : (
            <p className="text-xs text-gray-600 py-3 text-center">
              No consultations recorded for this region
            </p>
          )}
        </div>
      )}
    </div>
  )
}
