/* ============================================================
   AI Hospital Queue Prediction System
   Plain JavaScript (no libraries) — sample/static data only
   ============================================================ */

/* ---- 1. Sample data ---------------------------------------- */

// Departments and their doctors
const DOCTORS = {
  "General Medicine": ["Dr. Anitha Rao", "Dr. Vikram Singh"],
  "Cardiology":       ["Dr. Rajesh Khanna"],
  "Pediatrics":       ["Dr. Meera Nair"],
  "Orthopedics":      ["Dr. Suresh Patel"],
  "Dermatology":      ["Dr. Kavya Reddy"]
};

// Doctor availability + current patient (for the Doctor section)
const DOCTOR_INFO = [
  { name: "Dr. Anitha Rao",   dept: "General Medicine", available: true,  currentToken: 7, estTime: "8 mins" },
  { name: "Dr. Vikram Singh", dept: "General Medicine", available: true,  currentToken: 5, estTime: "6 mins" },
  { name: "Dr. Rajesh Khanna",dept: "Cardiology",       available: false, currentToken: 4, estTime: "12 mins" },
  { name: "Dr. Meera Nair",   dept: "Pediatrics",       available: true,  currentToken: 3, estTime: "5 mins" },
  { name: "Dr. Suresh Patel", dept: "Orthopedics",      available: true,  currentToken: 6, estTime: "9 mins" },
  { name: "Dr. Kavya Reddy",  dept: "Dermatology",       available: false, currentToken: 2, estTime: "10 mins" }
];

// Sample queue (token numbers in order, with status)
let queuePatients = [
  { token: 1, name: "Ravi Kumar",   dept: "General Medicine", status: "Completed" },
  { token: 2, name: "Sneha Iyer",   dept: "Dermatology",       status: "Completed" },
  { token: 3, name: "Arjun Das",    dept: "Pediatrics",        status: "In Consultation" },
  { token: 4, name: "Fatima Sheikh",dept: "Cardiology",        status: "Waiting" },
  { token: 5, name: "Karthik Menon",dept: "General Medicine",  status: "Waiting" },
  { token: 6, name: "Divya Sharma", dept: "Orthopedics",       status: "Waiting" }
];

// Predicted waiting time (minutes) across the day
const WAIT_TREND = [
  { label: "9AM",  value: 20 },
  { label: "10AM", value: 28 },
  { label: "11AM", value: 35 },
  { label: "12PM", value: 40 },
  { label: "1PM",  value: 38 },
  { label: "2PM",  value: 30 },
  { label: "3PM",  value: 25 },
  { label: "4PM",  value: 18 }
];

// The currently logged-in patient's token (updated on registration)
let myToken = null;

/* ---- 2. Navigation between sections ------------------------ */
function showSection(id) {
  // Hide every section, then show the chosen one
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");

  // Update active link highlight
  document.querySelectorAll(".nav-links a").forEach(a => a.classList.remove("active"));
  const link = document.querySelector(`.nav-links a[data-section="${id}"]`);
  if (link) link.classList.add("active");

  // Scroll to top for a clean view
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---- 3. Patient Registration -------------------------------- */
function populateDepartments() {
  const deptSelect = document.getElementById("department");
  for (const dept of Object.keys(DOCTORS)) {
    const opt = document.createElement("option");
    opt.value = dept;
    opt.textContent = dept;
    deptSelect.appendChild(opt);
  }
}

function populateDoctors() {
  const deptSelect = document.getElementById("department");
  const docSelect  = document.getElementById("doctor");
  const dept = deptSelect.value;

  // Clear current options (keep the placeholder)
  docSelect.innerHTML = '<option value="">-- Select Doctor --</option>';
  if (!dept) return;

  DOCTORS[dept].forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    docSelect.appendChild(opt);
  });
}

function handleRegistration(event) {
  event.preventDefault();

  // Read form values
  const name = document.getElementById("pname").value.trim();
  const age  = document.getElementById("age").value.trim();
  const phone= document.getElementById("phone").value.trim();
  const dept = document.getElementById("department").value;
  const doctor = document.getElementById("doctor").value;
  const date = document.getElementById("apptDate").value;
  const time = document.getElementById("apptTime").value;

  // Simple validation
  if (!name || !age || !phone || !dept || !doctor || !date || !time) {
    showAlert("Please fill in all the fields before submitting.", false);
    return;
  }

  // Generate a new token number (1 above the highest existing token)
  const nextToken = queuePatients.length
    ? Math.max(...queuePatients.map(p => p.token)) + 1
    : 1;

  // Add the new patient to our sample queue
  queuePatients.push({ token: nextToken, name, dept, status: "Waiting" });
  myToken = nextToken;

  // Show success message
  showAlert(
    `Registration successful! Your token number is ${nextToken}. ` +
    `Please check the Queue Status section.`,
    true
  );

  // Reset the form
  document.getElementById("regForm").reset();
  populateDoctors();

  // Refresh the queue display with the new patient
  renderQueue();

  // After a short pause, jump to the Queue Status section
  setTimeout(() => showSection("queue"), 1500);
}

function showAlert(message, isSuccess) {
  const alert = document.getElementById("regAlert");
  alert.textContent = message;
  alert.className = "alert show " + (isSuccess ? "alert-success" : "alert-success");
}

/* ---- 4. Queue Status ---------------------------------------- */
function renderQueue() {
  // Figure out the "current" token being served
  const inConsult = queuePatients.find(p => p.status === "In Consultation");
  const currentToken = inConsult ? inConsult.token : 1;

  // The patient we care about (newly registered or the first waiting one)
  const mine = myToken
    ? queuePatients.find(p => p.token === myToken)
    : queuePatients.find(p => p.status === "Waiting");

  if (mine) {
    const patientsAhead = queuePatients.filter(
      p => p.status === "Waiting" && p.token < mine.token
    ).length;
    const estWait = patientsAhead * 6; // ~6 minutes per patient ahead

    document.getElementById("myToken").textContent = mine.token;
    document.getElementById("patientsAhead").textContent = patientsAhead;
    document.getElementById("currentToken").textContent = currentToken;
    document.getElementById("estWait").textContent = estWait + " mins";
    document.getElementById("myStatus").innerHTML = statusBadge(mine.status);
  }

  // Build the full queue table
  const tbody = document.getElementById("queueTableBody");
  tbody.innerHTML = "";
  queuePatients.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>#${p.token}</td>
      <td>${p.name}</td>
      <td>${p.dept}</td>
      <td>${statusBadge(p.status)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function statusBadge(status) {
  if (status === "Waiting")         return `<span class="badge badge-waiting">Waiting</span>`;
  if (status === "In Consultation") return `<span class="badge badge-consultation">In Consultation</span>`;
  return `<span class="badge badge-completed">Completed</span>`;
}

/* ---- 5. AI Prediction Dashboard ----------------------------- */
function renderDashboard() {
  // Stat cards use the values requested in the brief
  document.getElementById("statTotal").textContent = "25";
  document.getElementById("statQueue").textContent = "12";
  document.getElementById("statWait").textContent  = "35";
  document.getElementById("statDocs").textContent   = "4";

  // Bar chart of predicted waiting time
  const max = Math.max(...WAIT_TREND.map(d => d.value));
  const bars = document.getElementById("barChart");
  bars.innerHTML = "";
  WAIT_TREND.forEach(d => {
    const heightPct = Math.round((d.value / max) * 100);
    const col = document.createElement("div");
    col.className = "bar-col";
    col.innerHTML = `
      <div class="bar" style="height:0%">
        <span class="bar-val">${d.value}</span>
      </div>
      <span class="bar-label">${d.label}</span>`;
    bars.appendChild(col);
    // animate the bar growing to its target height
    setTimeout(() => { col.querySelector(".bar").style.height = heightPct + "%"; }, 60);
  });

  // Line chart (SVG) of the same trend
  renderLineChart();
}

function renderLineChart() {
  const svg = document.getElementById("lineChart");
  const data = WAIT_TREND;
  const W = 560, H = 240, pad = 40;
  const max = Math.max(...data.map(d => d.value)) * 1.15;
  const stepX = (W - pad * 2) / (data.length - 1);

  // Build the points string
  const points = data.map((d, i) => {
    const x = pad + i * stepX;
    const y = H - pad - (d.value / max) * (H - pad * 2);
    return { x, y };
  });

  const lineStr = points.map(p => `${p.x},${p.y}`).join(" ");
  const areaStr = `${pad},${H - pad} ${lineStr} ${W - pad},${H - pad}`;

  // Horizontal grid lines + y labels
  let grid = "";
  for (let i = 0; i <= 4; i++) {
    const y = pad + ((H - pad * 2) / 4) * i;
    const val = Math.round(max - (max / 4) * i);
    grid += `<line class="grid-line" x1="${pad}" y1="${y}" x2="${W - pad}" y2="${y}" />`;
    grid += `<text class="axis-label" x="${pad - 8}" y="${y + 4}" text-anchor="end">${val}</text>`;
  }

  // X labels
  let xlabels = data.map((d, i) =>
    `<text class="axis-label" x="${points[i].x}" y="${H - pad + 18}" text-anchor="middle">${d.label}</text>`
  ).join("");

  // Dots
  const dots = points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4" />`).join("");

  svg.innerHTML = `
    ${grid}
    <polygon class="area" points="${areaStr}" />
    <polyline points="${lineStr}" />
    ${dots}
    ${xlabels}
  `;
}

/* ---- 6. Doctor Section -------------------------------------- */
function renderDoctors() {
  const wrap = document.getElementById("doctorList");
  wrap.innerHTML = "";
  DOCTOR_INFO.forEach(doc => {
    const initials = doc.name.replace("Dr. ", "").split(" ").map(s => s[0]).join("").slice(0, 2);
    const statusHtml = doc.available
      ? `<span class="badge badge-consultation">Available</span>`
      : `<span class="badge badge-waiting">Busy</span>`;

    const card = document.createElement("div");
    card.className = "card doctor-card";
    card.innerHTML = `
      <div class="doc-head">
        <div class="doc-avatar">${initials}</div>
        <div>
          <div class="doc-name">${doc.name}</div>
          <div class="doc-dept">${doc.dept}</div>
        </div>
      </div>
      <div class="doc-row"><span>Availability</span><span>${statusHtml}</span></div>
      <div class="doc-row"><span>Current Token</span><span>#${doc.currentToken}</span></div>
      <div class="doc-row"><span>Est. Consultation Time</span><span>${doc.estTime}</span></div>
    `;
    wrap.appendChild(card);
  });
}

/* ---- 7. Initialise everything on page load ------------------ */
document.addEventListener("DOMContentLoaded", () => {
  populateDepartments();

  // Navigation links
  document.querySelectorAll(".nav-links a").forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      showSection(a.dataset.section);
    });
  });

  // Brand logo returns to home
  document.querySelector(".brand").addEventListener("click", () => showSection("home"));

  // Hero buttons
  document.getElementById("btnBook").addEventListener("click", () => showSection("register"));
  document.getElementById("btnQueue").addEventListener("click", () => showSection("queue"));

  // Department change updates doctors
  document.getElementById("department").addEventListener("change", populateDoctors);

  // Form submit
  document.getElementById("regForm").addEventListener("submit", handleRegistration);

  // Render dynamic content
  renderQueue();
  renderDashboard();
  renderDoctors();

  // Start on the home section
  showSection("home");
});
