# LabourWallah 👷‍♂️🧱
> **Labor Management & Workforce Operations Platform for Contractors & Site Supervisors**

[![Deploy to GitHub Pages](https://github.com/smpneel0212-commits/LabourWallah/actions/workflows/pages.yml/badge.svg)](https://github.com/smpneel0212-commits/LabourWallah/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![Status: Live](https://img.shields.io/badge/Status-Live%20Online-emerald.svg)](https://smpneel0212-commits.github.io/LabourWallah/)

**LabourWallah** is an internal site management web application designed for construction contractors, site engineers, supervisors, and builders to streamline daily workforce management. It tracks real-time labor attendance, live work assignments, historical logs (Yesterday and the Day Before Yesterday), leave records, and contractor wage obligations.

---

## 🌐 Live Application
* **Live GitHub Pages URL:** [https://smpneel0212-commits.github.io/LabourWallah/](https://smpneel0212-commits.github.io/LabourWallah/)
* **Repository URL:** [https://github.com/smpneel0212-commits/LabourWallah.git](https://github.com/smpneel0212-commits/LabourWallah.git)

---

## 🔐 Default Access Credentials
Modeled after standard internal dashboards (such as Paisa Bhai and IPMC tracker style):

| Role | Username | Password | Notes |
|---|---|---|---|
| **Site Supervisor** | `SHARNU PATIL` | `02161301` | Default standard supervisor credentials |
| **Administrator** | `ADMIN` | `admin123` | Secondary administrative credentials |

*(A **"Quick Fill Demo"** button is also available on the login screen for instant one-click testing.)*

---

## ✨ Core Features & Highlights

### 1. 🛡️ Secure Authentication Gate
* Clean, professional authentication gate modeled after Paisa Bhai & IPMC internal trackers.
* Case-insensitive username validation, password eye toggle, and persistent session storage.
* Session recovery on browser refresh with instant sign-out control.

### 2. 📋 Real-Time Attendance Tracking
* One-click attendance toggle buttons for every laborer:
  * **[P] Present:** Full-day muster mark
  * **[HD] Half-Day:** Half-shift wage and muster calculation
  * **[L] On Leave:** Recorded against approved leave records
  * **[A] Absent:** Unexcused site absence
* Quick **"Mark All Present"** bulk operation for fast morning roll calls.

### 3. ⏱️ 3-Day Continuous Work Matrix (Today vs Yesterday vs Day Before Yesterday)
* High-visibility 72-hour operational matrix:
  * **Live Today Status:** Live assignment, location/zone, and completion progress slider (0%–100%).
  * **Yesterday's Completed Work:** Exact historical log of tasks accomplished yesterday.
  * **Day Before Yesterday's Log:** Historical record from 2 days ago for tracking productivity trends.
* Dedicated **3-Day Work Inspector Modal** showing detailed task records, material requisitions, and overtime.

### 4. 🔨 Work Task Assignment & Presets
* Dynamic modal for assigning work to any laborer.
* Built-in rapid construction presets:
  * *Brick Masonry Wall Construction*
  * *Column Shuttering & Formwork*
  * *Electrical Conduit Wiring & Chipping*
  * *Rebar Binding & Beam Reinforcement*
  * *Cement Mixing & Sand Shifting*
* Tracks task status: `In Progress`, `Completed`, `On Hold`, `Not Started`.

### 5. 🏖️ Leave & Absence Management
* Dedicated leave logging tab.
* Tracks leave categories (Casual, Medical/Sick, Festival, Uninformed, Emergency).
* Auto-syncs with today's attendance roster when leaves are active.

### 6. 💰 Daily Contractor Wage Report & Billing
* Calculates daily wage liabilities in real time based on base rate, attendance, and overtime.
* Printable format for physical muster roll sign-offs.
* One-click **Export to CSV** for contractor billing and accounting spreadsheets.

### 7. 🔍 Instant Search & Multi-Criteria Filtering
* Live search by name, phone number, laborer ID, trade, or task description.
* Filters by Trade / Skill category (Mason, Carpenter, Electrician, Plumber, Painter, Welder, Bar Bender, Helper, Foreman, Tile Mason, Equipment Operator).
* Filters by Attendance Status and Work Zone (Tower A, Tower B, Basement, Foundation, General Site).

### 8. 💾 Offline-First LocalStorage & Backup
* Operates completely offline with `localStorage` persistence.
* Full **JSON Database Backup & Restore** for site engineers.
* **Reset to Sample Data** button with 12 pre-seeded construction specialists.

---

## 🛠️ Technology Stack
* **HTML5:** Semantic, accessible layout.
* **Tailwind CSS:** Modern utility-first styling with responsive grid layouts.
* **Vanilla JavaScript (ES6+):** Zero external dependencies, pure browser runtime.
* **Lucide Icons:** Crisp vector iconography.
* **GitHub Actions & Pages:** Continuous automated deployment.

---

## 📁 Repository Structure
```
LabourWallah/
├── .github/
│   └── workflows/
│       └── pages.yml        # Automated GitHub Pages CI/CD workflow
├── index.html               # Main markup (Login + Dashboard + Modals)
├── style.css                # Custom styling, scrollbars & print stylesheets
├── script.js                # Core app logic, auth, CRUD & LocalStorage sync
├── LABOURWALLAH_SPEC.md     # Full specification document
├── README.md                # Project documentation & quick start guide
├── LICENSE                  # MIT License
└── .gitignore               # Standard git ignore definitions
```

---

## 🚀 Local Development Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/smpneel0212-commits/LabourWallah.git
   cd LabourWallah
   ```
2. Open `index.html` in any modern web browser:
   * Double click `index.html`, or
   * Use a live server:
     ```bash
     npx serve .
     ```
3. Sign in using:
   * **Username:** `SHARNU PATIL`
   * **Password:** `02161301`

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
