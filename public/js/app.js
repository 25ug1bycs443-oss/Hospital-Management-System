// Hospital Management System - Core Frontend Script

document.addEventListener('DOMContentLoaded', () => {
  // Identify active page by body ID
  const pageId = document.body.id;
  
  if (pageId === 'dashboard-page') {
    initDashboard();
  } else if (pageId === 'patients-page') {
    initPatients();
  } else if (pageId === 'doctors-page') {
    initDoctors();
  } else if (pageId === 'appointments-page') {
    initAppointments();
  } else if (pageId === 'wards-page') {
    initWards();
  } else if (pageId === 'billing-page') {
    initBilling();
  }
});

// Common Auth logout helper
async function logoutAdmin() {
  try {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    if (res.ok) {
      window.location.href = '/login.html';
    }
  } catch (err) {
    console.error('Logout failed', err);
  }
}

// Common formatting helpers
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

// ==========================================
// 1. DASHBOARD INITIALIZER
// ==========================================
async function initDashboard() {
  try {
    // 1. Fetch Stats Cards & Tables
    const statsRes = await fetch('/api/dashboard/stats');
    if (statsRes.ok) {
      const stats = await statsRes.json();
      
      document.getElementById('stat-patients').textContent = stats.totalPatients;
      document.getElementById('stat-doctors').textContent = stats.totalDoctors;
      document.getElementById('stat-appointments').textContent = stats.totalAppointments;
      document.getElementById('stat-revenue').textContent = formatCurrency(stats.totalRevenue);
      document.getElementById('stat-occupied-beds').textContent = stats.occupiedBeds;
      document.getElementById('stat-available-beds').textContent = stats.availableBeds;

      // Populate Recent Appointments table
      const appTable = document.getElementById('table-recent-appointments');
      appTable.innerHTML = '';
      if (stats.recentAppointments.length === 0) {
        appTable.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No appointments</td></tr>';
      } else {
        stats.recentAppointments.forEach(a => {
          const badgeClass = a.status === 'CONFIRMED' ? 'badge-confirmed' : 'badge-pending';
          appTable.innerHTML += `
            <tr>
              <td>
                <div class="fw-bold">${a.doctor_name}</div>
                <div class="text-muted" style="font-size: 12px;">${a.specialization}</div>
              </td>
              <td>${a.patient_name}</td>
              <td>${formatDate(a.date)}</td>
              <td><span class="badge-hms ${badgeClass}">${a.status}</span></td>
            </tr>
          `;
        });
      }

      // Populate Recent Bills table
      const billTable = document.getElementById('table-recent-bills');
      billTable.innerHTML = '';
      if (stats.recentBills.length === 0) {
        billTable.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No billing logs</td></tr>';
      } else {
        stats.recentBills.forEach(b => {
          const badgeClass = b.payment_status === 'PAID' ? 'badge-paid' : 'badge-unpaid';
          billTable.innerHTML += `
            <tr>
              <td class="fw-bold">${b.bill_id}</td>
              <td>${b.patient_name}</td>
              <td class="fw-bold text-success">${formatCurrency(b.total_amount)}</td>
              <td><span class="badge-hms ${badgeClass}">${b.payment_status}</span></td>
            </tr>
          `;
        });
      }
    }

    // 2. Fetch Charts statistics
    const chartsRes = await fetch('/api/dashboard/charts');
    if (chartsRes.ok) {
      const chartData = await chartsRes.json();
      
      // Patient Growth Chart
      new Chart(document.getElementById('chart-patient-growth'), {
        type: 'line',
        data: {
          labels: chartData.patientGrowth.map(r => r.month),
          datasets: [{
            label: 'New Registrations',
            data: chartData.patientGrowth.map(r => r.count),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.3
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });

      // Specialization Departments Chart
      new Chart(document.getElementById('chart-departments'), {
        type: 'doughnut',
        data: {
          labels: chartData.departmentStats.map(r => r.specialization),
          datasets: [{
            data: chartData.departmentStats.map(r => r.count),
            backgroundColor: ['#3b82f6', '#a855f7', '#22c55e', '#f97316', '#ef4444', '#06b6d4']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });

      // Revenue analytics
      new Chart(document.getElementById('chart-revenue'), {
        type: 'bar',
        data: {
          labels: chartData.revenueAnalytics.map(r => r.month),
          datasets: [{
            label: 'Monthly Revenue ($)',
            data: chartData.revenueAnalytics.map(r => parseFloat(r.revenue)),
            backgroundColor: '#ff6b00',
            borderRadius: 6
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });

      // Bed Occupancy
      new Chart(document.getElementById('chart-beds'), {
        type: 'pie',
        data: {
          labels: ['Occupied', 'Available'],
          datasets: [{
            data: [chartData.bedOccupancy.occupied, chartData.bedOccupancy.available],
            backgroundColor: ['#ef4444', '#22c55e']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  } catch (err) {
    console.error('Failed dashboard dashboard initialization', err);
  }
}

// ==========================================
// 2. PATIENTS MODULE CRUD
// ==========================================
async function initPatients() {
  await loadPatientsTable();

  // Add Patient Form Submit
  document.getElementById('add-patient-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('p-name').value,
      age: document.getElementById('p-age').value,
      gender: document.getElementById('p-gender').value,
      contact: document.getElementById('p-contact').value,
      blood_group: document.getElementById('p-blood').value
    };

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('addPatientModal')).hide();
        document.getElementById('add-patient-form').reset();
        await loadPatientsTable();
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (e) {
      console.error(e);
    }
  });

  // Edit Patient Form Submit
  document.getElementById('edit-patient-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-p-id').value;
    const payload = {
      name: document.getElementById('edit-p-name').value,
      age: document.getElementById('edit-p-age').value,
      gender: document.getElementById('edit-p-gender').value,
      contact: document.getElementById('edit-p-contact').value,
      blood_group: document.getElementById('edit-p-blood').value
    };

    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('editPatientModal')).hide();
        await loadPatientsTable();
      }
    } catch (e) {
      console.error(e);
    }
  });
}

async function loadPatientsTable(patientsData = null) {
  const tbody = document.getElementById('patients-table-body');
  tbody.innerHTML = '';

  try {
    const list = patientsData || await (await fetch('/api/patients')).json();
    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No patient records found.</td></tr>';
      return;
    }

    list.forEach(p => {
      tbody.innerHTML += `
        <tr>
          <td class="fw-bold">${p.patient_id}</td>
          <td>${p.name}</td>
          <td>${p.age}</td>
          <td>${p.gender}</td>
          <td>${p.contact}</td>
          <td class="fw-bold text-primary">${p.blood_group}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditPatient('${p.patient_id}')"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="deletePatientRecord('${p.patient_id}')"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error(err);
  }
}

async function openEditPatient(id) {
  try {
    const res = await fetch(`/api/patients/${id}`);
    if (res.ok) {
      const p = await res.json();
      document.getElementById('edit-p-id').value = p.patient_id;
      document.getElementById('edit-p-name').value = p.name;
      document.getElementById('edit-p-age').value = p.age;
      document.getElementById('edit-p-gender').value = p.gender;
      document.getElementById('edit-p-contact').value = p.contact;
      document.getElementById('edit-p-blood').value = p.blood_group;

      const editModal = new bootstrap.Modal(document.getElementById('editPatientModal'));
      editModal.show();
    }
  } catch (err) {
    console.error(err);
  }
}

async function deletePatientRecord(id) {
  if (confirm(`Are you sure you want to delete patient record ${id}?`)) {
    try {
      const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadPatientsTable();
      }
    } catch (err) {
      console.error(err);
    }
  }
}

async function searchPatientsList() {
  const q = document.getElementById('patient-search-input').value;
  if (q.trim() === '') {
    await loadPatientsTable();
    return;
  }
  try {
    const res = await fetch(`/api/patients/search?q=${q}`);
    const results = await res.json();
    await loadPatientsTable(results);
  } catch (e) {
    console.error(e);
  }
}

// ==========================================
// 3. DOCTORS MODULE CRUD
// ==========================================
async function initDoctors() {
  await loadDoctorsTable();

  // Add Doctor Form Submit
  document.getElementById('add-doctor-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('d-name').value,
      specialization: document.getElementById('d-spec').value,
      experience_years: document.getElementById('d-exp').value
    };

    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('addDoctorModal')).hide();
        document.getElementById('add-doctor-form').reset();
        await loadDoctorsTable();
      }
    } catch (e) {
      console.error(e);
    }
  });

  // Edit Doctor Form Submit
  document.getElementById('edit-doctor-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-d-id').value;
    const payload = {
      name: document.getElementById('edit-d-name').value,
      specialization: document.getElementById('edit-d-spec').value,
      experience_years: document.getElementById('edit-d-exp').value
    };

    try {
      const res = await fetch(`/api/doctors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('editDoctorModal')).hide();
        await loadDoctorsTable();
      }
    } catch (e) {
      console.error(e);
    }
  });
}

async function loadDoctorsTable(doctorsData = null) {
  const tbody = document.getElementById('doctors-table-body');
  tbody.innerHTML = '';

  try {
    const list = doctorsData || await (await fetch('/api/doctors')).json();
    
    // Count specialization to populate top summary cards
    let cardio = 0, neuro = 0, peds = 0, gen = 0;
    list.forEach(d => {
      const sp = d.specialization.toLowerCase();
      if (sp.includes('cardio')) cardio++;
      else if (sp.includes('neuro')) neuro++;
      else if (sp.includes('pediat')) peds++;
      else if (sp.includes('general') || sp.includes('med')) gen++;
    });

    document.getElementById('spec-cardio').textContent = `${cardio} Doctor${cardio !== 1 ? 's' : ''}`;
    document.getElementById('spec-neuro').textContent = `${neuro} Doctor${neuro !== 1 ? 's' : ''}`;
    document.getElementById('spec-pediatric').textContent = `${peds} Doctor${peds !== 1 ? 's' : ''}`;
    document.getElementById('spec-general').textContent = `${gen} Doctor${gen !== 1 ? 's' : ''}`;

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No doctors found in the system.</td></tr>';
      return;
    }

    list.forEach(d => {
      tbody.innerHTML += `
        <tr>
          <td class="fw-bold">${d.doctor_id}</td>
          <td class="fw-semibold">${d.name}</td>
          <td><span class="badge bg-light text-secondary border px-2 py-1">${d.specialization}</span></td>
          <td>${d.experience_years} Years</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditDoctor('${d.doctor_id}')"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteDoctorRecord('${d.doctor_id}')"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `;
    });
  } catch (e) {
    console.error(e);
  }
}

async function openEditDoctor(id) {
  try {
    const res = await fetch(`/api/doctors/${id}`);
    if (res.ok) {
      const d = await res.json();
      document.getElementById('edit-d-id').value = d.doctor_id;
      document.getElementById('edit-d-name').value = d.name;
      document.getElementById('edit-d-spec').value = d.specialization;
      document.getElementById('edit-d-exp').value = d.experience_years;

      const modal = new bootstrap.Modal(document.getElementById('editDoctorModal'));
      modal.show();
    }
  } catch (e) {
    console.error(e);
  }
}

async function deleteDoctorRecord(id) {
  if (confirm(`Are you sure you want to remove doctor ${id} from directory?`)) {
    try {
      const res = await fetch(`/api/doctors/${id}`, { method: 'DELETE' });
      if (res.ok) await loadDoctorsTable();
    } catch (e) {
      console.error(e);
    }
  }
}

async function searchDoctorsList() {
  const q = document.getElementById('doctor-search-input').value;
  if (q.trim() === '') {
    await loadDoctorsTable();
    return;
  }
  try {
    const res = await fetch(`/api/doctors/search?q=${q}`);
    const results = await res.json();
    await loadDoctorsTable(results);
  } catch (e) {
    console.error(e);
  }
}

// ==========================================
// 4. APPOINTMENTS SCHEDULER
// ==========================================
let activeFilter = 'All';
let appointmentsList = [];

async function initAppointments() {
  await populateAppointmentDropdowns();
  await loadAppointmentsBoard();

  // Book Appointment submission
  document.getElementById('book-appointment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      patient_id: document.getElementById('app-patient').value,
      doctor_id: document.getElementById('app-doctor').value,
      hospital_name: document.getElementById('app-hospital').value,
      date: document.getElementById('app-date').value,
      time: document.getElementById('app-time').value,
      reason: document.getElementById('app-reason').value,
      status: 'PENDING'
    };

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('bookAppointmentModal')).hide();
        document.getElementById('book-appointment-form').reset();
        await loadAppointmentsBoard();
      }
    } catch (e) {
      console.error(e);
    }
  });
}

async function populateAppointmentDropdowns() {
  try {
    const patients = await (await fetch('/api/patients')).json();
    const doctors = await (await fetch('/api/doctors')).json();

    const pSel = document.getElementById('app-patient');
    const dSel = document.getElementById('app-doctor');

    patients.forEach(p => {
      pSel.innerHTML += `<option value="${p.patient_id}">${p.name} (${p.patient_id})</option>`;
    });

    doctors.forEach(d => {
      dSel.innerHTML += `<option value="${d.doctor_id}">${d.name} (${d.specialization})</option>`;
    });
  } catch (e) {
    console.error(e);
  }
}

async function loadAppointmentsBoard() {
  const row = document.getElementById('appointments-cards-row');
  row.innerHTML = '';

  try {
    appointmentsList = await (await fetch('/api/appointments')).json();
    renderAppointmentsCards();
  } catch (e) {
    console.error(e);
  }
}

function renderAppointmentsCards() {
  const row = document.getElementById('appointments-cards-row');
  row.innerHTML = '';

  let filtered = appointmentsList;
  if (activeFilter !== 'All') {
    filtered = filtered.filter(a => a.status === activeFilter);
  }

  // search filter inside card rows
  const searchVal = document.getElementById('appointment-search-input').value.toLowerCase();
  if (searchVal.trim() !== '') {
    filtered = filtered.filter(a => 
      a.doctor_name.toLowerCase().includes(searchVal) || 
      a.patient_name.toLowerCase().includes(searchVal) || 
      a.specialization.toLowerCase().includes(searchVal) || 
      a.hospital_name.toLowerCase().includes(searchVal)
    );
  }

  if (filtered.length === 0) {
    row.innerHTML = `<div class="col-12 text-center text-muted py-5">No appointments found matching constraints.</div>`;
    return;
  }

  filtered.forEach(a => {
    const badgeClass = a.status === 'CONFIRMED' ? 'badge-confirmed' : 'badge-pending';
    
    // Accept/Confirm action button if pending
    let actionBtnHtml = '';
    if (a.status === 'PENDING') {
      actionBtnHtml = `
        <button class="btn btn-sm btn-success rounded-pill px-3 py-1 me-2" onclick="confirmAppointment('${a.appointment_id}')">
          <i class="bi bi-check-lg"></i> Confirm
        </button>
      `;
    }

    row.innerHTML += `
      <div class="col-md-6 mb-4">
        <div class="appointment-card-hms">
          <div class="appointment-card-header">
            <div class="doc-info">
              <h3>${a.doctor_name}</h3>
              <div class="specialty">${a.specialization}</div>
              <div class="patient-lbl">Patient: ${a.patient_name}</div>
            </div>
            <span class="badge-hms ${badgeClass}">${a.status}</span>
          </div>
          
          <div class="appointment-date-time-row">
            <div class="date-time-block">
              <i class="bi bi-calendar-event"></i>
              <div>
                DATE
                <span>${formatDate(a.date)}</span>
              </div>
            </div>
            <div class="date-time-block">
              <i class="bi bi-clock"></i>
              <div>
                TIME
                <span>${a.time}</span>
              </div>
            </div>
          </div>
          
          <div class="appointment-card-footer justify-content-between">
            <div class="d-flex align-items-center gap-1">
              <i class="bi bi-geo-alt-fill"></i>
              <span>${a.hospital_name}</span>
            </div>
            <div class="d-flex align-items-center">
              ${actionBtnHtml}
              <button class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1" onclick="cancelAppointment('${a.appointment_id}')">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
}

function filterAppointments(filter, btn) {
  activeFilter = filter;
  const tabs = document.querySelectorAll('.filter-tab-btn');
  tabs.forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderAppointmentsCards();
}

function searchAppointmentsList() {
  renderAppointmentsCards();
}

async function confirmAppointment(id) {
  try {
    const res = await fetch(`/api/appointments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CONFIRMED' })
    });
    if (res.ok) await loadAppointmentsBoard();
  } catch (e) {
    console.error(e);
  }
}

async function cancelAppointment(id) {
  if (confirm('Are you sure you want to cancel this appointment?')) {
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      if (res.ok) await loadAppointmentsBoard();
    } catch (e) {
      console.error(e);
    }
  }
}

// ==========================================
// 5. WARDS & BEDS INTERACTIVE
// ==========================================
async function initWards() {
  await loadWardsDashboard();

  // Add Ward Form Submit
  document.getElementById('add-ward-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('w-name').value,
      capacity: parseInt(document.getElementById('w-capacity').value),
      floor: parseInt(document.getElementById('w-floor').value)
    };

    try {
      const res = await fetch('/api/wards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('addWardModal')).hide();
        document.getElementById('add-ward-form').reset();
        await loadWardsDashboard();
      }
    } catch (e) {
      console.error(e);
    }
  });
}

async function loadWardsDashboard() {
  const grid = document.getElementById('wards-grid-row');
  grid.innerHTML = '';

  try {
    const wards = await (await fetch('/api/wards/occupancy')).json();
    
    // Update summary counters
    let totalBeds = 0;
    let occupiedBeds = 0;
    
    wards.forEach(w => {
      totalBeds += w.total_beds;
      occupiedBeds += w.occupied_beds;
    });

    document.getElementById('ward-stat-active').textContent = wards.length;
    document.getElementById('ward-stat-installed').textContent = totalBeds;
    document.getElementById('ward-stat-available').textContent = (totalBeds - occupiedBeds);

    if (wards.length === 0) {
      grid.innerHTML = '<div class="col-12 text-center text-muted py-5">No wards created yet.</div>';
      return;
    }

    for (const w of wards) {
      // Fetch beds for this specific ward
      const bedsRes = await fetch(`/api/wards/${w.ward_id}/beds`);
      const beds = await bedsRes.json();
      
      const occupancyPercent = w.total_beds > 0 ? Math.round((w.occupied_beds / w.total_beds) * 100) : 0;
      const progressColor = occupancyPercent >= 75 ? 'bg-orange-fill' : 'bg-green-fill';
      
      // Bed pills list HTML
      let bedPillsHtml = '';
      beds.forEach(b => {
        const stateClass = b.is_occupied ? 'occupied' : 'available';
        bedPillsHtml += `
          <button class="bed-pill ${stateClass}" onclick="toggleBedOccupancy('${b.bed_id}', ${b.is_occupied})">
            ${b.bed_id}
          </button>
        `;
      });

      const wardCard = `
        <div class="col-md-6">
          <div class="card-table-hms">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h3 class="fw-bold m-0 fs-5">${w.name}</h3>
                <div class="text-muted" style="font-size: 13px;">Floor ${w.floor} | Head Nurse: Sister in Charge</div>
              </div>
              <span class="badge bg-light text-orange border px-2 py-1 fs-6">${w.name.toUpperCase().includes('ICU') ? 'INTENSIVE CARE' : 'GENERAL'}</span>
            </div>
            
            <div class="ward-occupancy-progress mt-3">
              <span class="text-muted fs-7">Occupancy</span>
              <span>${occupancyPercent}%</span>
            </div>
            <div class="ward-progress-bar-container">
              <div class="ward-progress-fill ${progressColor}" style="width: ${occupancyPercent}%;"></div>
            </div>

            <div class="bed-layout-section">
              <div class="bed-layout-header">
                <span class="bed-layout-title">Bed Layout</span>
                <button class="btn btn-sm btn-link text-primary text-decoration-none p-0 fw-semibold" onclick="addBed('${w.ward_id}')">+ Add Bed</button>
              </div>
              <div class="bed-grid">
                ${bedPillsHtml}
              </div>
            </div>

            <div class="ward-footer-stats">
              <div class="ward-footer-col occupied">
                Occupied
                <span>${w.occupied_beds}</span>
              </div>
              <div class="ward-footer-col available">
                Available
                <span>${w.total_beds - w.occupied_beds}</span>
              </div>
            </div>
          </div>
        </div>
      `;
      grid.innerHTML += wardCard;
    }
  } catch (err) {
    console.error(err);
  }
}

async function toggleBedOccupancy(bedId, currentStatus) {
  try {
    const res = await fetch(`/api/wards/beds/${bedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_occupied: !currentStatus })
    });
    if (res.ok) {
      await loadWardsDashboard();
    }
  } catch (err) {
    console.error(err);
  }
}

async function addBed(wardId) {
  try {
    const res = await fetch(`/api/wards/${wardId}/beds`, { method: 'POST' });
    if (res.ok) {
      await loadWardsDashboard();
    }
  } catch (e) {
    console.error(e);
  }
}

// ==========================================
// 6. BILLING MODULE
// ==========================================
async function initBilling() {
  await loadBillingHistory();
  await populateBillingPatients();

  // Generate Bill Form Submit
  document.getElementById('generate-bill-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      patient_id: document.getElementById('b-patient').value,
      total_amount: parseFloat(document.getElementById('b-amount').value),
      payment_status: document.getElementById('b-status').value,
      bill_date: document.getElementById('b-date').value
    };

    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('generateBillModal')).hide();
        document.getElementById('generate-bill-form').reset();
        await loadBillingHistory();
      }
    } catch (e) {
      console.error(e);
    }
  });
}

async function populateBillingPatients() {
  try {
    const patients = await (await fetch('/api/patients')).json();
    const pSel = document.getElementById('b-patient');
    patients.forEach(p => {
      pSel.innerHTML += `<option value="${p.patient_id}">${p.name} (${p.patient_id})</option>`;
    });
  } catch (e) {
    console.error(e);
  }
}

async function loadBillingHistory(billsData = null) {
  const tbody = document.getElementById('billing-table-body');
  tbody.innerHTML = '';

  try {
    const list = billsData || await (await fetch('/api/billing')).json();
    
    // Calculate finance summaries
    let revenue = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    list.forEach(b => {
      if (b.payment_status === 'PAID') {
        revenue += parseFloat(b.total_amount);
        paidCount++;
      } else {
        unpaidCount++;
      }
    });

    document.getElementById('billing-revenue').textContent = formatCurrency(revenue);
    document.getElementById('billing-paid-count').textContent = paidCount;
    document.getElementById('billing-unpaid-count').textContent = unpaidCount;

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No invoices generated yet.</td></tr>';
      return;
    }

    list.forEach(b => {
      const badgeClass = b.payment_status === 'PAID' ? 'badge-paid' : 'badge-unpaid';
      
      // Status Toggle action button
      const actionBtnHtml = b.payment_status === 'UNPAID'
        ? `<button class="btn btn-sm btn-outline-success me-1" onclick="toggleBillStatus('${b.bill_id}', 'PAID')"><i class="bi bi-check-circle"></i> Mark Paid</button>`
        : `<button class="btn btn-sm btn-outline-warning me-1" onclick="toggleBillStatus('${b.bill_id}', 'UNPAID')"><i class="bi bi-x-circle"></i> Mark Unpaid</button>`;

      tbody.innerHTML += `
        <tr>
          <td class="fw-bold">${b.bill_id}</td>
          <td>${b.patient_id}</td>
          <td class="fw-semibold">${b.patient_name}</td>
          <td>${formatDate(b.bill_date)}</td>
          <td class="fw-bold text-success">${formatCurrency(b.total_amount)}</td>
          <td><span class="badge-hms ${badgeClass}">${b.payment_status}</span></td>
          <td>
            ${actionBtnHtml}
            <button class="btn btn-sm btn-outline-danger" onclick="deleteBillRecord('${b.bill_id}')"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error(err);
  }
}

async function toggleBillStatus(id, newStatus) {
  try {
    const res = await fetch(`/api/billing/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_status: newStatus })
    });
    if (res.ok) await loadBillingHistory();
  } catch (e) {
    console.error(e);
  }
}

async function deleteBillRecord(id) {
  if (confirm(`Are you sure you want to delete invoice ${id}?`)) {
    try {
      const res = await fetch(`/api/billing/${id}`, { method: 'DELETE' });
      if (res.ok) await loadBillingHistory();
    } catch (e) {
      console.error(e);
    }
  }
}

async function searchBillsList() {
  const q = document.getElementById('bill-search-input').value;
  if (q.trim() === '') {
    await loadBillingHistory();
    return;
  }
  try {
    const res = await fetch(`/api/billing/search?q=${q}`);
    const results = await res.json();
    await loadBillingHistory(results);
  } catch (e) {
    console.error(e);
  }
}
