const GW = '/api'  // proxied to API Gateway at port 8080

async function get(url) {
  try {
    const res = await fetch(GW + url)
    if (!res.ok) throw new Error(res.status)
    return res.json()
  } catch {
    return null  // fall back to mock data on failure
  }
}

async function post(url, body) {
  try {
    const res = await fetch(GW + url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(res.status)
    return res.json()
  } catch {
    return null
  }
}

export const patientApi = {
  getAll:           () => get('/patients'),
  getById:          (id) => get(`/patients/${id}`),
  getDepartments:   () => get('/patients/departments/summary'),
}

export const appointmentApi = {
  getWeekly:        () => get('/appointments/analytics/weekly'),
  getHeatmap:       () => get('/appointments/analytics/heatmap'),
  getUpcoming:      () => get('/appointments/upcoming'),
  getByPatient:     (id) => get(`/appointments/patient/${id}`),
  schedule:         (body) => post('/appointments', body),
}

export const facilityApi = {
  getBeds:          () => get('/facility/beds'),
  updateBedStatus:  (id, status) => post(`/facility/beds/${id}/status`, { status }),
}

export const imagingApi = {
  uploadScan:       (formData) => fetch(GW + '/scans/upload', { method: 'POST', body: formData }).then(r => r.json()).catch(() => null),
  getSimilar:       (id) => get(`/scans/similar/${id}`),
}

export const diagnosticApi = {
  analyze:          (stats) => post('/diagnostic/analyze', stats),
}
