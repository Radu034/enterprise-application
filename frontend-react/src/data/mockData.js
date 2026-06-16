// ── Seeded PRNG for stable data across renders ────────────────────────────────
function makePrng(seed) {
  let s = seed >>> 0
  return {
    next()         { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return (s >>> 0) / 0xFFFFFFFF },
    int(lo, hi)    { return Math.floor(this.next() * (hi - lo + 1)) + lo },
    pick(arr)      { return arr[Math.floor(this.next() * arr.length)] },
    weighted(arr, weights) {
      const total = weights.reduce((a, b) => a + b, 0)
      let r = this.next() * total
      for (let i = 0; i < arr.length; i++) { r -= weights[i]; if (r <= 0) return arr[i] }
      return arr[arr.length - 1]
    }
  }
}

// ── Name pools ────────────────────────────────────────────────────────────────
const MALE_FIRST = [
  'Alexandru','Andrei','Bogdan','Călin','Cătălin','Constantin','Cosmin','Cristian','Dan','Daniel',
  'Dragoș','Dumitru','Emil','Eugen','Florentin','Florin','Gabriel','George','Gheorghe','Horia',
  'Ioan','Ion','Ionuț','Lucian','Marian','Mihai','Mircea','Nelu','Nicolae','Octavian',
  'Paul','Petre','Radu','Răzvan','Robert','Sebastian','Sergiu','Silviu','Sorin','Ștefan',
  'Teodor','Tiberiu','Tudor','Valentin','Vasile','Victor','Vlad','Viorel','Cristinel','Laurențiu',
]
const FEMALE_FIRST = [
  'Adriana','Alexandra','Alina','Ana','Ana-Maria','Andreea','Bianca','Carmen','Claudia','Corina',
  'Cristina','Daniela','Diana','Elena','Floarea','Florentina','Gabriela','Georgiana','Ioana','Iulia',
  'Laura','Larisa','Liliana','Luminița','Maria','Mihaela','Monica','Nicoleta','Oana','Petronela',
  'Raluca','Rodica','Roxana','Simona','Sorina','Teodora','Valentina','Viorica','Loredana','Ramona',
]
const LAST_NAMES = [
  'Alexandrescu','Andrei','Apostol','Ardelean','Barbu','Badea','Bădescu','Chirilă','Chiș','Ciobanu',
  'Cojocaru','Constantin','Costache','Cristea','Dănilă','Dobre','Dragomir','Dumitrescu','Ene','Florescu',
  'Georgescu','Ghiță','Grigorescu','Iancu','Ionescu','Ioniță','Lascu','Luca','Lazăr','Manea',
  'Marinescu','Marin','Matei','Mihalache','Moldovan','Moise','Munteanu','Neagu','Neagu','Nistor',
  'Olteanu','Popa','Popescu','Preda','Rusu','Rădulescu','Sandu','Stan','Stănescu','Stoica',
  'Toma','Tudor','Ungureanu','Vasilescu','Vlad','Voicu','Zaharia','Zaman','Bucur','Dima',
]

const CITIES = [
  'București','Cluj-Napoca','Iași','Timișoara','Constanța','Craiova','Brașov','Galați','Ploiești',
  'Oradea','Brăila','Arad','Pitești','Sibiu','Bacău','Târgu Mureș','Baia Mare','Buzău','Satu Mare',
]
const STREETS = [
  'Str. Victoriei','Bd. Unirii','Calea Floreasca','Bd. Dacia','Str. Mihai Eminescu','Str. Libertății',
  'Str. Republicii','Calea Moților','Bd. Tomis','Str. Traian','Calea Griviței','Str. Horea',
  'Bd. Regina Elisabeta','Str. Plevnei','Aleea Trandafirilor','Str. Avram Iancu','Calea Văcărești',
  'Str. Alexandru cel Bun','Str. Cuza Vodă','Bd. Decebal','Str. 1 Decembrie','Str. Berzei',
  'Calea Victoriei','Str. Zorilor','Str. Florilor','Str. Ștefan cel Mare','Bd. Mamaia',
]
const BLOOD_TYPES = ['O+','O+','O+','A+','A+','A+','B+','AB+','O-','A-','B-','AB-']
const DEPTS = ['Cardiology','Neurology','Orthopedics','Pediatrics','Radiology','General']

const DEPT_CONDITIONS = {
  Cardiology:  ['Hypertension','Coronary artery disease','Atrial fibrillation','Heart failure',
                'Arrhythmia','Ischemic heart disease','Mitral valve regurgitation','Aortic stenosis',
                'Pericarditis','Dilated cardiomyopathy','Tachycardia','Angina pectoris'],
  Neurology:   ['Migraine','Epilepsy (controlled)','Multiple sclerosis','Parkinson disease',
                'Alzheimer disease','Ischemic stroke','TIA','Peripheral neuropathy',
                'Vestibular vertigo','Vascular dementia','Myasthenia gravis','Restless leg syndrome'],
  Orthopedics: ['Lumbar disc herniation','Osteoporosis','Total knee arthroplasty follow-up',
                'Hip replacement follow-up','ACL reconstruction post-op','Scoliosis',
                'Tibial fracture rehabilitation','Rotator cuff tear','Carpal tunnel syndrome',
                'Rheumatoid arthritis','Cervical spondylosis','Plantar fasciitis'],
  Pediatrics:  ['Asthma','Febrile seizures','Type 1 diabetes','Congenital heart defect (ASD)',
                'ADHD','Atopic dermatitis','Childhood obesity','Recurrent tonsillitis',
                'Celiac disease','Autism spectrum disorder','Juvenile arthritis','Enuresis'],
  Radiology:   ['Lung nodule follow-up','Bone density assessment','Post-CT review',
                'MRI brain evaluation','Abdominal ultrasound review','Mammography follow-up',
                'Thyroid nodule imaging','PET scan review','Chest X-ray review','Liver lesion follow-up'],
  General:     ['Type 2 diabetes','COPD','Arterial hypertension','Iron deficiency anemia',
                'Hypothyroidism','Obesity','Major depressive disorder','Generalized anxiety',
                'Obstructive sleep apnea','Chronic kidney disease stage 3','GERD','Hyperlipidemia'],
}

export const doctors = [
  { id:1,  name:'Dr. Mihai Popescu',     specialty:'Cardiology',   rating:4.9, patients:52 },
  { id:2,  name:'Dr. Elena Dumitrescu',  specialty:'Neurology',    rating:4.8, patients:41 },
  { id:3,  name:'Dr. Andrei Constantin', specialty:'Orthopedics',  rating:4.7, patients:38 },
  { id:4,  name:'Dr. Ioana Stancu',      specialty:'Pediatrics',   rating:4.9, patients:35 },
  { id:5,  name:'Dr. Vlad Ionescu',      specialty:'Radiology',    rating:4.6, patients:29 },
  { id:6,  name:'Dr. Carmen Florescu',   specialty:'General',      rating:4.7, patients:60 },
  { id:7,  name:'Dr. George Marin',      specialty:'Cardiology',   rating:4.8, patients:47 },
  { id:8,  name:'Dr. Raluca Popa',       specialty:'Neurology',    rating:4.6, patients:33 },
]

const DEPT_DOCTORS = {
  Cardiology:  ['Dr. Mihai Popescu','Dr. George Marin'],
  Neurology:   ['Dr. Elena Dumitrescu','Dr. Raluca Popa'],
  Orthopedics: ['Dr. Andrei Constantin'],
  Pediatrics:  ['Dr. Ioana Stancu'],
  Radiology:   ['Dr. Vlad Ionescu'],
  General:     ['Dr. Carmen Florescu'],
}

const APPT_TYPES = {
  Cardiology:  ['ECG Review','Echocardiography','Blood Pressure Check','Cardiology Consult','Holter Review','Stress Test'],
  Neurology:   ['MRI Review','Neurological Exam','EEG Review','Cognitive Assessment','Follow-up Consult','EMG Study'],
  Orthopedics: ['X-ray Review','Physical Therapy Eval','Post-op Review','Joint Injection','Orthopedic Consult','Bone Density'],
  Pediatrics:  ['Pediatric Exam','Vaccination Review','Growth Assessment','Developmental Screening','Allergy Test','Follow-up'],
  Radiology:   ['Scan Review','Imaging Consultation','Report Discussion','Follow-up Imaging','CT Review','MRI Discussion'],
  General:     ['Annual Checkup','Blood Panel Review','Medication Review','General Consultation','Chronic Disease Follow-up','Preventive Screen'],
}

// ── Consultation findings per department ─────────────────────────────────────
const DEPT_FINDINGS = {
  Cardiology: [
    'ECG within normal limits. BP controlled on current medication. Continue current regimen.',
    'Echocardiogram: mild mitral regurgitation. Follow-up echo scheduled in 6 months.',
    'Stress test completed. No significant ischemia detected. Exercise tolerance adequate.',
    'Holter monitor results: occasional PVCs, benign pattern. No intervention required.',
    'BP 148/92. Medication dosage adjusted. Recheck in 4 weeks.',
    'Troponin negative. Chest discomfort attributed to musculoskeletal origin.',
    'LDL 4.2 mmol/L. Statin therapy initiated. Diet modification advised.',
    'Sinus rhythm, rate 68 bpm. No clinically significant arrhythmia detected.',
    'Coronary CT angiography: mild non-obstructive atherosclerosis. Medical management continued.',
    'BNP elevated at 320 pg/mL. Diuretic dose adjusted. Fluid restriction advised.',
  ],
  Neurology: [
    'MRI brain: no acute lesion. Headache pattern consistent with migraine without aura.',
    'EEG normal. Seizure-free for 12 months on current medication. Continue and recheck annually.',
    'MMSE score 24/30. Mild cognitive impairment. Neurocognitive referral placed.',
    'Nerve conduction study: mild bilateral sensory neuropathy in feet. Vitamin B12 supplemented.',
    'Balance and gait assessment normal. Vertigo attributed to benign positional cause.',
    'Parkinson symptoms stable on current Levodopa dose. No adjustment required at this time.',
    'MS relapse: single new T2 lesion on MRI. Short corticosteroid course prescribed.',
    'TIA confirmed. Antiplatelet therapy initiated. Carotid ultrasound ordered.',
    'Tension-type headache pattern. Amitriptyline low-dose prophylaxis initiated.',
    'EMG: no active denervation. Neuropathy non-progressive. Monitoring continued.',
  ],
  Orthopedics: [
    'Post-operative X-ray satisfactory. Full weight bearing now permitted.',
    'Range of motion 0-118 degrees. Physiotherapy 3x per week recommended.',
    'MRI knee: medial meniscus posterior horn tear confirmed. Arthroscopy scheduled.',
    'Bone density T-score -2.7 (lumbar spine). Bisphosphonate therapy initiated.',
    'Shoulder impingement confirmed. Corticosteroid injection administered to subacromial space.',
    'Lumbar MRI: L4-L5 disc herniation with right-sided nerve root compression. Conservative management.',
    'ACL graft intact at 9-month follow-up. Return to sport activity cleared.',
    'Carpal tunnel syndrome: nerve conduction confirms moderate median nerve compression. Splint fitted.',
    'Hip X-ray: satisfactory implant position. No signs of loosening. Review in 12 months.',
    'Cervical spondylosis: physiotherapy and NSAIDs. Surgical referral deferred.',
  ],
  Pediatrics: [
    'Spirometry: FEV1 86% predicted. Inhaler technique reviewed with parent and child.',
    'HbA1c 7.4%. Insulin-to-carb ratio adjusted. Dietitian follow-up arranged.',
    'Growth chart: 40th percentile. Development appropriate for age. No concerns.',
    'Third tonsillitis episode this year. ENT referral placed for consideration of tonsillectomy.',
    'EEG: generalised epileptiform activity. Valproate dose increased. Monitoring intensified.',
    'SCORAD 32 (moderate atopic dermatitis). Topical steroid step-up. Allergy panel ordered.',
    'BMI at 97th percentile. Structured nutritional counselling initiated with family.',
    'Developmental assessment completed. Early intervention program referral placed.',
    'Febrile convulsion: brief, self-limiting. Parents counselled. EEG arranged.',
    'Type 1 diabetes well-controlled. Ophthalmology and renal screening up to date.',
  ],
  Radiology: [
    '6mm pulmonary nodule stable at 12-month CT. Annual surveillance CT recommended.',
    'MRI brain: no significant white matter change. Findings age-appropriate.',
    'Abdominal ultrasound: 1.4cm simple hepatic cyst, benign morphology. 6-month follow-up.',
    'DEXA scan: osteopenia at lumbar spine (T-score -1.8). Calcium and Vitamin D supplementation started.',
    'Mammography BI-RADS 2. No suspicious findings. Routine annual screening to continue.',
    'Thyroid ultrasound: 9mm hypoechoic nodule, TI-RADS 3. Fine needle aspiration recommended.',
    'PET-CT: no FDG-avid lesion. Complete metabolic response to treatment confirmed.',
    'Chest X-ray: hyperinflation consistent with COPD. No consolidation or effusion.',
    'MRI abdomen: liver lesion stable, likely haemangioma. No further intervention.',
    'Bone scintigraphy: no skeletal metastatic activity detected.',
  ],
  General: [
    'HbA1c 7.9%. Metformin dose increased to 1000mg twice daily. Dietary advice reinforced.',
    'BP 138/86. Continue antihypertensive. Sodium restriction and exercise counselling provided.',
    'TSH 8.6 mIU/L. Levothyroxine dose adjusted. Recheck thyroid function in 6 weeks.',
    'Spirometry: FEV1/FVC 0.60. COPD GOLD II confirmed. Long-acting bronchodilator initiated.',
    'BMI 34.1. Structured weight management referral. Bariatric assessment considered.',
    'PHQ-9 score 15 (moderate depression). SSRI initiated at low dose. Follow-up in 4 weeks.',
    'eGFR 46 mL/min. CKD stage 3b. Nephrology outpatient referral placed. ACE inhibitor dose reviewed.',
    'Total cholesterol 6.3 mmol/L. Rosuvastatin 10mg initiated. Repeat lipid panel in 3 months.',
    'GERD symptoms controlled on PPI. Upper GI endoscopy arranged to exclude Barrett\'s.',
    'Sleep study: AHI 22 (moderate OSA). CPAP therapy initiated. Driving advice given.',
  ],
}

// Map condition text + department to a body region shown in BodyMap
function conditionToRegion(dept, condition) {
  const c = (condition || '').toLowerCase()
  if (/brain|skull|migraine|epilep|alzheimer|parkinson|vertigo|tia|dementia|cognitive|sclerosis|myasthenia|stroke|neurolog/.test(c)) return 'Head'
  if (/heart|cardiac|cardio|coronary|arrhythmia|fibrillation|aortic|mitral|angina|lung|pulmon|chest|mammograph|thyroid|pericardi|tachycard/.test(c)) return 'Chest / Heart'
  if (/knee|hip|tibial|plantar|acl|femur|ankle|foot/.test(c)) return 'Legs'
  if (/shoulder|carpal|rotator|humerus|elbow|wrist|hand/.test(c)) return 'Arms'
  if (/lumbar|cervical|spine|disc|scoliosis|abdom|liver|hepatic|gastro|intestin|colon|kidney|renal|pancrea|ovary|uterine|bladder|diabet|obesity|thyroid|copd|hypertension|anemia|hypothy/.test(c)) return 'Abdomen'
  // Department fallback
  if (dept === 'Cardiology') return 'Chest / Heart'
  if (dept === 'Neurology')  return 'Head'
  return 'Abdomen'
}

function generateConsultations(patient) {
  const r = makePrng(patient.id * 1009 + 7)
  const count = r.int(2, 4)
  const findings = DEPT_FINDINGS[patient.department] || DEPT_FINDINGS.General
  const region = conditionToRegion(patient.department, patient.condition)
  const types = ['Consultation', 'Follow-up', 'Examination', 'Review']
  const consultations = []
  for (let i = 0; i < count; i++) {
    const daysBack = r.int((i + 1) * 25, (i + 1) * 110)
    const d = new Date('2026-06-11'); d.setDate(d.getDate() - daysBack)
    consultations.push({
      date: d.toISOString().split('T')[0],
      doctor: patient.doctor,
      bodyRegion: region,
      type: r.pick(types),
      findings: r.pick(findings),
    })
  }
  consultations.sort((a, b) => b.date.localeCompare(a.date))
  return consultations
}

// ── Generate 500 patients ─────────────────────────────────────────────────────
function generatePatients() {
  const r = makePrng(42)
  const statuses = ['Active','Active','Active','Active','Active','Active','Active','Discharged','Discharged','Critical']
  const result = []
  const usedNames = new Set()

  // Keep the original 30 patients as the first entries (names preserved for backward compat)
  const origNames = [
    ['Alexandru','Ionescu'],['Maria','Georgescu'],['Ioan','Popa'],['Elena','Moldovan'],
    ['Gheorghe','Dănilă'],['Ana-Maria','Stoica'],['Vasile','Luca'],['Cristina','Munteanu'],
    ['Mihai','Vlad'],['Ioana','Nistor'],['Radu','Florescu'],['Simona','Apostol'],
    ['Dumitru','Cojocaru'],['Laura','Neagu'],['Florin','Marinescu'],['Gabriela','Toma'],
    ['Nicolae','Barbu'],['Rodica','Ene'],['Cătălin','Rusu'],['Mihaela','Stan'],
    ['Petre','Dragomir'],['Carmen','Olteanu'],['Bogdan','Stănescu'],['Liliana','Preda'],
    ['Viorel','Chirilă'],['Daniela','Moise'],['Sorin','Ghiță'],['Adriana','Lazăr'],
    ['Lucian','Dobre'],['Teodora','Ioniță'],
  ]
  const origDepts  = ['Cardiology','Neurology','Orthopedics','Pediatrics','Cardiology','Neurology','Orthopedics','Cardiology','Pediatrics','Neurology','Orthopedics','Cardiology','Neurology','Pediatrics','Cardiology','Orthopedics','Neurology','Pediatrics','Cardiology','Orthopedics','Neurology','Cardiology','Pediatrics','Orthopedics','Neurology','Cardiology','Orthopedics','Pediatrics','Neurology','Cardiology']
  const origAges   = [54,42,67,8,71,35,58,49,5,63,45,52,74,11,60,39,55,7,47,62,68,44,3,56,50,38,43,9,72,65]
  const origStatus = ['Active','Active','Discharged','Active','Critical','Active','Active','Active','Active','Discharged','Active','Active','Critical','Active','Active','Active','Active','Discharged','Active','Active','Active','Active','Critical','Active','Active','Active','Discharged','Active','Active','Active']

  for (let i = 0; i < 30; i++) {
    const [fn, ln] = origNames[i]
    const dept = origDepts[i]
    const age  = origAges[i]
    const status = origStatus[i]
    const docPool = DEPT_DOCTORS[dept]
    const doc = docPool[i % docPool.length]

    const birthYear = new Date().getFullYear() - age
    const dob = `${birthYear}-${String(r.int(1,12)).padStart(2,'0')}-${String(r.int(1,28)).padStart(2,'0')}`
    const admitDaysAgo = r.int(1, 90)
    const admitDate = new Date(); admitDate.setDate(admitDate.getDate() - admitDaysAgo)
    const admitted = admitDate.toISOString().split('T')[0]
    const phone = `+40 7${r.int(10,99)} ${r.int(100,999)} ${r.int(100,999)}`
    const addr = `${r.pick(STREETS)} ${r.int(1,120)}, ${r.pick(CITIES)}`
    const condition = r.pick(DEPT_CONDITIONS[dept])

    const p = { id: i+1, name: `${fn} ${ln}`, firstName: fn, lastName: ln, department: dept,
      age, doctor: doc, status, admitted, dob, phone,
      address: addr, bloodType: r.pick(BLOOD_TYPES), condition }
    result.push(p)
    usedNames.add(p.name)
  }

  // Generate 470 more patients (ids 31-500)
  for (let i = 30; i < 500; i++) {
    const isMale = r.next() > 0.48
    let fn, ln, fullName
    let tries = 0
    do {
      fn = isMale ? r.pick(MALE_FIRST) : r.pick(FEMALE_FIRST)
      ln = r.pick(LAST_NAMES)
      fullName = `${fn} ${ln}`
      tries++
    } while (usedNames.has(fullName) && tries < 20)
    usedNames.add(fullName)

    const dept    = r.pick(DEPTS)
    const age     = dept === 'Pediatrics' ? r.int(1, 17) : r.int(18, 82)
    const status  = r.pick(statuses)
    const doc     = r.pick(DEPT_DOCTORS[dept])
    const birthYear = new Date().getFullYear() - age
    const dob = `${birthYear}-${String(r.int(1,12)).padStart(2,'0')}-${String(r.int(1,28)).padStart(2,'0')}`
    const admitDaysAgo = r.int(1, 180)
    const admitDate = new Date(); admitDate.setDate(admitDate.getDate() - admitDaysAgo)
    const admitted = admitDate.toISOString().split('T')[0]
    const phone = `+40 7${r.int(10,99)} ${r.int(100,999)} ${r.int(100,999)}`
    const addr = `${r.pick(STREETS)} ${r.int(1,200)}, ${r.pick(CITIES)}`
    const condition = r.pick(DEPT_CONDITIONS[dept])

    result.push({ id: i+1, name: fullName, firstName: fn, lastName: ln,
      department: dept, age, doctor: doc, status, admitted,
      dob, phone, address: addr, bloodType: r.pick(BLOOD_TYPES), condition })
  }
  return result
}

export const patients = generatePatients()

// Attach bodyRegion and consultation history to every patient
patients.forEach(p => {
  p.bodyRegion    = conditionToRegion(p.department, p.condition)
  p.consultations = generateConsultations(p)
})

// ── Derived collections (backward compat) ────────────────────────────────────
export const departments = [
  { name:'Cardiology',  patients: patients.filter(p=>p.department==='Cardiology').length,  color:'#3D8EF0' },
  { name:'Neurology',   patients: patients.filter(p=>p.department==='Neurology').length,   color:'#00C9A7' },
  { name:'Orthopedics', patients: patients.filter(p=>p.department==='Orthopedics').length, color:'#F07B3D' },
  { name:'Pediatrics',  patients: patients.filter(p=>p.department==='Pediatrics').length,  color:'#a78bfa' },
]

// 30-day appointment history for charts
export const appointmentHistory = Array.from({ length: 30 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (29 - i))
  return { date: d.toISOString().split('T')[0], count: Math.floor(Math.random() * 31) + 8 }
})
export const weeklyAppointments = appointmentHistory.slice(-7)

// ── Bed reservations: Jun 10 – Jul 20, 2026 ─────────────────────────────────
// bedSchedule[dateStr][bedIndex 0-23] = { status, patient, doctor, admitted, discharge }
function generateBedSchedule() {
  const schedule = {}
  const start = new Date('2026-06-10')
  const end   = new Date('2026-07-20')

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    const dayBeds = []
    for (let i = 0; i < 24; i++) {
      // XOR-shift PRNG degenerates on small seeds — avalanche with Knuth multiplicative hash
      const rawSeed = 55 + i * 31 + d.getDate() * 7 + d.getMonth() * 97
      const r = makePrng(Math.imul(rawSeed, 2654435761) >>> 0 || 1)
      const status = r.weighted(['available','occupied','reserved'], [5, 13, 6])
      const p = status !== 'available' ? patients[r.int(0, 499)] : null
      // discharge 1-5 days from this date
      const dischargeDate = new Date(d)
      dischargeDate.setDate(dischargeDate.getDate() + r.int(1, 5))
      dayBeds.push({
        id: i + 1,
        room: `Room ${Math.floor(i / 4) + 1}`,
        bedNumber: (i % 4) + 1,
        status,
        patient:   p?.name    ?? null,
        doctor:    p?.doctor  ?? null,
        admitted:  p?.admitted ?? null,
        discharge: status !== 'available' ? dischargeDate.toISOString().split('T')[0] : null,
      })
    }
    schedule[dateStr] = dayBeds
  }
  return schedule
}

export const bedSchedule = generateBedSchedule()

// beds for today (or first available date) — used as default by RoomViewer
const _today = new Date().toISOString().split('T')[0]
export const beds = bedSchedule[_today] ?? bedSchedule['2026-06-10']

// ── Clinic schedule: today → July 20, 2026 ───────────────────────────────────
const TIME_SLOTS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
                    '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00']

function generateSchedule() {
  const schedule = {}
  const r = makePrng(77)
  const start = new Date('2026-06-10')
  const end   = new Date('2026-07-20')

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    const dow = d.getDay()  // 0=Sun, 6=Sat
    const isWeekend = dow === 0 || dow === 6
    const count = isWeekend ? r.int(3, 8) : r.int(12, 22)

    // Pick `count` unique time slots (sorted)
    const slots = [...TIME_SLOTS].sort(() => r.next() - 0.5).slice(0, count).sort()
    const appts = []

    slots.forEach((time, idx) => {
      const dept   = r.pick(DEPTS)
      const doc    = r.pick(DEPT_DOCTORS[dept])
      const patient = r.pick(patients)
      const type   = r.pick(APPT_TYPES[dept])
      const statusRoll = r.next()
      const status = statusRoll < 0.05 ? 'Urgent' : statusRoll < 0.2 ? 'Pending' : 'Confirmed'

      appts.push({
        id:        `${dateStr}-${idx}`,
        time,
        patient:   patient.name,
        patientId: patient.id,
        doctor:    doc,
        specialty: dept,
        type,
        status,
      })
    })
    schedule[dateStr] = appts
  }
  return schedule
}

export const clinicSchedule = generateSchedule()

// ── Today's upcoming appointments (for dashboard widget) ─────────────────────
const todayStr = new Date().toISOString().split('T')[0]
const todayAppts = clinicSchedule[todayStr] || []

export const upcomingAppointments = [
  ...todayAppts.slice(0, 4).map(a => ({ ...a, date: 'Today' })),
  ...(() => {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
    const ts = tomorrow.toISOString().split('T')[0]
    return (clinicSchedule[ts] || []).slice(0, 2).map(a => ({ ...a, date: 'Tomorrow' }))
  })(),
]
