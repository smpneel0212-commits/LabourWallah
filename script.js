/**
 * LabourWallah - Labor Management & Workforce Tracking App
 * Core Application Logic, Authentication, LocalStorage Sync & Dynamic UI
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. CONFIGURATION & AUTHENTICATION (Paisa Bhai / IPMC Compatible)
  // =========================================================================
  const AUTH_CONFIG = {
    validUsers: [
      { username: 'SHARNU PATIL', password: '02161301', role: 'Site Supervisor' },
      { username: 'ADMIN', password: 'admin123', role: 'Site Administrator' }
    ],
    storageKey: 'labourwallah_auth_session_v1',
    dataStorageKey: 'labourwallah_data_v1'
  };

  // Trade list & color coding accents
  const TRADE_COLORS = {
    'Mason': 'bg-amber-100 text-amber-800 border-amber-200',
    'Carpenter': 'bg-orange-100 text-orange-800 border-orange-200',
    'Electrician': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Plumber': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'Painter': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Welder': 'bg-rose-100 text-rose-800 border-rose-200',
    'Bar Bender': 'bg-blue-100 text-blue-800 border-blue-200',
    'Helper': 'bg-slate-100 text-slate-800 border-slate-200',
    'Foreman': 'bg-purple-100 text-purple-800 border-purple-200',
    'Tile Mason': 'bg-teal-100 text-teal-800 border-teal-200',
    'Operator': 'bg-indigo-100 text-indigo-800 border-indigo-200'
  };

  // =========================================================================
  // 2. MAIN APPLICATION CLASS
  // =========================================================================
  class LabourWallahApp {
    constructor() {
      this.currentUser = null;
      this.currentDate = this.getTodayDateString();
      this.currentTab = 'roster';
      this.laborers = [];
      this.leaveRecords = [];
      
      // Filters
      this.filterText = '';
      this.filterSkill = 'ALL';
      this.filterStatus = 'ALL';
      this.filterSite = 'ALL';

      // Editing state
      this.activeLaborerForTask = null;
    }

    init() {
      this.loadDatabase();
      this.checkAuth();
      this.setupGlobalShortcuts();
    }

    // Helper: format YYYY-MM-DD
    getTodayDateString(d = new Date()) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // Helper: offset date by N days
    offsetDate(baseDateStr, days) {
      const parts = baseDateStr.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      d.setDate(d.getDate() + days);
      return this.getTodayDateString(d);
    }

    // Helper: friendly formatted date
    formatFriendlyDate(dateStr) {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }

    // =========================================================================
    // 3. AUTHENTICATION LOGIC
    // =========================================================================
    checkAuth() {
      const session = localStorage.getItem(AUTH_CONFIG.storageKey);
      if (session) {
        try {
          this.currentUser = JSON.parse(session);
          this.showAppShell();
          return;
        } catch (e) {
          localStorage.removeItem(AUTH_CONFIG.storageKey);
        }
      }
      this.showLoginView();
    }

    showLoginView() {
      const loginView = document.getElementById('view-login');
      const appShell = document.getElementById('app-shell');
      if (loginView) loginView.classList.remove('hidden');
      if (appShell) appShell.classList.add('hidden');

      const userEl = document.getElementById('login-username');
      if (userEl) {
        userEl.value = 'SHARNU PATIL';
        setTimeout(() => userEl.focus(), 100);
      }
      const passEl = document.getElementById('login-password');
      if (passEl) passEl.value = '02161301';

      const errEl = document.getElementById('login-error');
      if (errEl) errEl.classList.add('hidden');

      this.refreshIcons();
    }

    showAppShell() {
      const loginView = document.getElementById('view-login');
      const appShell = document.getElementById('app-shell');
      if (loginView) loginView.classList.add('hidden');
      if (appShell) appShell.classList.remove('hidden');

      // Update header username
      const userBadge = document.getElementById('header-user-name');
      if (userBadge && this.currentUser) {
        userBadge.textContent = this.currentUser.username;
      }

      this.updateDateDisplay();
      this.renderAll();
    }

    handleLogin(e) {
      if (e) e.preventDefault();
      const userEl = document.getElementById('login-username');
      const passEl = document.getElementById('login-password');
      const errEl = document.getElementById('login-error');
      const errText = document.getElementById('login-error-text');

      const username = userEl ? userEl.value.trim().toUpperCase() : '';
      const password = passEl ? passEl.value.trim() : '';

      const matched = AUTH_CONFIG.validUsers.find(
        u => u.username === username && u.password === password
      );

      if (matched) {
        this.currentUser = {
          username: matched.username,
          role: matched.role,
          loggedInAt: new Date().toISOString()
        };
        localStorage.setItem(AUTH_CONFIG.storageKey, JSON.stringify(this.currentUser));
        if (errEl) errEl.classList.add('hidden');
        this.showToast(`Welcome back, ${matched.username}!`, 'success');
        this.showAppShell();
      } else {
        if (errEl) {
          errEl.classList.remove('hidden');
          if (errText) errText.textContent = 'Invalid username or password. Check credentials.';
        }
        if (passEl) passEl.focus();
      }
    }

    handleLogout() {
      if (confirm('Are you sure you want to sign out from LabourWallah?')) {
        localStorage.removeItem(AUTH_CONFIG.storageKey);
        this.currentUser = null;
        this.showToast('Logged out successfully.', 'info');
        this.showLoginView();
      }
    }

    fillDemoCredentials() {
      const userEl = document.getElementById('login-username');
      const passEl = document.getElementById('login-password');
      if (userEl) userEl.value = 'SHARNU PATIL';
      if (passEl) passEl.value = '02161301';
      this.showToast('Credentials filled. Click "Sign In" to enter.', 'info');
    }

    togglePasswordVisibility() {
      const passEl = document.getElementById('login-password');
      const icon = document.getElementById('login-pwd-toggle-icon');
      if (!passEl) return;
      if (passEl.type === 'password') {
        passEl.type = 'text';
        if (icon) icon.setAttribute('data-lucide', 'eye-off');
      } else {
        passEl.type = 'password';
        if (icon) icon.setAttribute('data-lucide', 'eye');
      }
      this.refreshIcons();
    }

    // =========================================================================
    // 4. DATABASE & SEED DATA INITIALIZATION
    // =========================================================================
    loadDatabase() {
      const stored = localStorage.getItem(AUTH_CONFIG.dataStorageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          this.laborers = parsed.laborers || [];
          this.leaveRecords = parsed.leaveRecords || [];
          if (this.laborers.length > 0) return;
        } catch (e) {
          console.error('Failed to parse database, reseeding...', e);
        }
      }
      this.seedInitialData();
    }

    saveDatabase() {
      const payload = {
        laborers: this.laborers,
        leaveRecords: this.leaveRecords,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(AUTH_CONFIG.dataStorageKey, JSON.stringify(payload));
    }

    seedInitialData() {
      const today = this.currentDate;
      const yesterday = this.offsetDate(today, -1);
      const dby = this.offsetDate(today, -2);

      this.laborers = [
        {
          id: 'LW-101',
          name: 'Ramesh Kumar',
          phone: '+91 98450 12345',
          skill: 'Mason',
          wage: 850,
          site: 'Tower A - Floor 4',
          notes: 'Specialist in 9-inch brickwork & exterior plumb alignment',
          logs: {
            [dby]: {
              attendance: 'PRESENT',
              taskTitle: 'Ground floor boundary wall foundation plastering',
              location: 'Boundary Wall East',
              status: 'Completed',
              progress: 100,
              notes: 'Finished 45 running feet. Cement mortar mix 1:4 verified.',
              overtimeHours: 0
            },
            [yesterday]: {
              attendance: 'PRESENT',
              taskTitle: 'Brick masonry on Tower A Flat 401 partition walls',
              location: 'Tower A - Flat 401',
              status: 'Completed',
              progress: 100,
              notes: 'Completed bedroom wall up to lintel level (7 feet).',
              overtimeHours: 1
            },
            [today]: {
              attendance: 'PRESENT',
              taskTitle: 'Lintel beam brickwork & outer balcony parapet',
              location: 'Tower A - Floor 4 Balcony',
              status: 'In Progress',
              progress: 65,
              notes: 'Working with helper Bablu. 6 bags cement issued.',
              overtimeHours: 0
            }
          }
        },
        {
          id: 'LW-102',
          name: 'Suresh Sharma',
          phone: '+91 98110 56789',
          skill: 'Bar Bender',
          wage: 800,
          site: 'Tower B - Slab 5',
          notes: 'Master bar bender, certified rebar cutter',
          logs: {
            [dby]: {
              attendance: 'PRESENT',
              taskTitle: 'Column starter steel cutting & ring fabrication',
              location: 'Rebar Yard',
              status: 'Completed',
              progress: 100,
              notes: 'Cut 16mm and 20mm Fe500D TMT bars as per BBS drawing.',
              overtimeHours: 0
            },
            [yesterday]: {
              attendance: 'PRESENT',
              taskTitle: 'Beam reinforcement tying for Tower B 5th slab',
              location: 'Tower B - Slab 5',
              status: 'Completed',
              progress: 100,
              notes: 'Bound bottom main bars and shear stirrups with 18G wire.',
              overtimeHours: 2
            },
            [today]: {
              attendance: 'PRESENT',
              taskTitle: 'Crank bar placement & electrical conduit mesh tying',
              location: 'Tower B - Slab 5 North Span',
              status: 'In Progress',
              progress: 80,
              notes: 'Chair bar spacers placed. Inspection scheduled at 4:30 PM.',
              overtimeHours: 0
            }
          }
        },
        {
          id: 'LW-103',
          name: 'Mohammed Arif',
          phone: '+91 97230 44556',
          skill: 'Carpenter',
          wage: 850,
          site: 'Tower B - Columns',
          notes: 'Shuttering lead carpenter, ply and steel plate specialist',
          logs: {
            [dby]: {
              attendance: 'PRESENT',
              taskTitle: 'Fabrication of column shuttering boxes (450x600mm)',
              location: 'Carpentry Yard',
              status: 'Completed',
              progress: 100,
              notes: 'Prepared 8 column shuttering sets with release oil coat.',
              overtimeHours: 0
            },
            [yesterday]: {
              attendance: 'PRESENT',
              taskTitle: 'Column formwork staging and tie rod fixing',
              location: 'Tower B - Columns C1 to C6',
              status: 'Completed',
              progress: 100,
              notes: 'Vertical plumb verified within 2mm tolerance.',
              overtimeHours: 0
            },
            [today]: {
              attendance: 'PRESENT',
              taskTitle: 'Beam bottom prop staging & plywood decking',
              location: 'Tower B - 5th Floor Deck',
              status: 'In Progress',
              progress: 55,
              notes: 'Acro jacks adjusted. Props secured with horizontal ledger pipes.',
              overtimeHours: 0
            }
          }
        },
        {
          id: 'LW-104',
          name: 'Vijay Yadav',
          phone: '+91 96540 88990',
          skill: 'Electrician',
          wage: 900,
          site: 'Tower A - Flats',
          notes: 'Licensed wireman, conduit routing and distribution board lead',
          logs: {
            [dby]: {
              attendance: 'PRESENT',
              taskTitle: 'Wall chasing & 25mm PVC conduit fitting in Flat 301',
              location: 'Tower A - Flat 301',
              status: 'Completed',
              progress: 100,
              notes: 'Chased brickwork and fixed metal junction boxes.',
              overtimeHours: 0
            },
            [yesterday]: {
              attendance: 'PRESENT',
              taskTitle: 'Slab conduit pipe laying before concrete pour',
              location: 'Tower B - Slab 5',
              status: 'Completed',
              progress: 100,
              notes: 'Installed fan hook boxes and deep switch routing.',
              overtimeHours: 1
            },
            [today]: {
              attendance: 'PRESENT',
              taskTitle: 'Main distribution board cable pulling & circuit wiring',
              location: 'Tower A - Flat 302 & 303',
              status: 'In Progress',
              progress: 70,
              notes: 'FRLS 2.5 sq mm and 4 sq mm copper wiring ongoing.',
              overtimeHours: 0
            }
          }
        },
        {
          id: 'LW-105',
          name: 'Rajesh Paswan',
          phone: '+91 95400 11223',
          skill: 'Helper',
          wage: 550,
          site: 'General Site',
          notes: 'General manual labor and material lifting',
          logs: {
            [dby]: {
              attendance: 'PRESENT',
              taskTitle: 'Unloading 400 cement bags from delivery truck to godown',
              location: 'Central Cement Storage',
              status: 'Completed',
              progress: 100,
              notes: 'Stacked cement bags on wooden pallets off damp floor.',
              overtimeHours: 1
            },
            [yesterday]: {
              attendance: 'PRESENT',
              taskTitle: 'Shifting concrete aggregate & sand to batching mixer',
              location: 'Mixer Unit #2',
              status: 'Completed',
              progress: 100,
              notes: 'Continuous wheelbarrow transit for morning pour.',
              overtimeHours: 0
            },
            [today]: {
              attendance: 'ON_LEAVE',
              taskTitle: 'On approved leave for village visit',
              location: 'Offsite',
              status: 'On Hold',
              progress: 0,
              notes: 'Informed site supervisor on 20th Oct.',
              overtimeHours: 0
            }
          }
        },
        {
          id: 'LW-106',
          name: 'Anil Bind',
          phone: '+91 94150 99887',
          skill: 'Tile Mason',
          wage: 900,
          site: 'Tower A - Flats',
          notes: 'Vitrified tile and bathroom ceramic tile specialist',
          logs: {
            [dby]: {
              attendance: 'PRESENT',
              taskTitle: 'Bathroom waterproofing membrane verification & screed',
              location: 'Tower A - Flats 201-202',
              status: 'Completed',
              progress: 100,
              notes: '48hr ponding test passed. Base cement mortar bed laid.',
              overtimeHours: 0
            },
            [yesterday]: {
              attendance: 'PRESENT',
              taskTitle: 'Wall dado tiling up to 7ft height in master toilet',
              location: 'Tower A - Flat 201 Toilet',
              status: 'Completed',
              progress: 100,
              notes: '300x450mm digital tiles fixed with tile adhesive paste.',
              overtimeHours: 0
            },
            [today]: {
              attendance: 'PRESENT',
              taskTitle: 'Living room 600x1200mm vitrified tile dry layout & fixing',
              location: 'Tower A - Flat 202 Living Area',
              status: 'In Progress',
              progress: 45,
              notes: 'Using 2mm tile spacers and levelling clips.',
              overtimeHours: 0
            }
          }
        },
        {
          id: 'LW-107',
          name: 'Santosh Chauhan',
          phone: '+91 93220 33445',
          skill: 'Welder',
          wage: 850,
          site: 'Basement & Gate',
          notes: 'Arc welding, structural MS fabrication, safety railing',
          logs: {
            [dby]: {
              attendance: 'PRESENT',
              taskTitle: 'Staircase MS handrail cutting and tack welding',
              location: 'Tower A - Fire Staircase 2',
              status: 'Completed',
              progress: 100,
              notes: 'Completed balusters for 2 flights.',
              overtimeHours: 0
            },
            [yesterday]: {
              attendance: 'PRESENT',
              taskTitle: 'Full seam welding and slag chipping on stair handrail',
              location: 'Tower A - Fire Staircase 2',
              status: 'Completed',
              progress: 100,
              notes: 'Grinding joints smooth for red oxide primer coat.',
              overtimeHours: 1
            },
            [today]: {
              attendance: 'PRESENT',
              taskTitle: 'Main security gate structural channel welding',
              location: 'Site Main Entry Gate',
              status: 'In Progress',
              progress: 60,
              notes: '100x50mm MS channel framing with heavy duty hinges.',
              overtimeHours: 0
            }
          }
        },
        {
          id: 'LW-108',
          name: 'Manoj Sahani',
          phone: '+91 92230 77665',
          skill: 'Plumber',
          wage: 850,
          site: 'Plumbing Shaft 1',
          notes: 'CPVC water supply and SWR drainage piping expert',
          logs: {
            [dby]: {
              attendance: 'PRESENT',
              taskTitle: '110mm SWR soil and waste pipe vertical shaft clamping',
              location: 'Tower A - Shaft 1',
              status: 'Completed',
              progress: 100,
              notes: 'Fixed heavy rubber-lined brackets on concrete wall.',
              overtimeHours: 0
            },
            [yesterday]: {
              attendance: 'PRESENT',
              taskTitle: 'CPVC waterline pressure testing at 10 kg/cm2',
              location: 'Tower A - 3rd Floor Plumbing',
              status: 'Completed',
              progress: 100,
              notes: 'Held pressure for 2 hours without any joint seepage.',
              overtimeHours: 0
            },
            [today]: {
              attendance: 'PRESENT',
              taskTitle: 'Overhead tank manifold connection & air release valves',
              location: 'Tower A - Terrace Water Tank',
              status: 'In Progress',
              progress: 75,
              notes: 'Connecting 50mm ring main delivery loop to shafts.',
              overtimeHours: 0
            }
          }
        },
        {
          id: 'LW-109',
          name: 'Dharmendra Singh',
          phone: '+91 91230 88776',
          skill: 'Foreman',
          wage: 1100,
          site: 'Site Wide',
          notes: 'General site foreman, 15 years RCC building construction experience',
          logs: {
            [dby]: {
              attendance: 'PRESENT',
              taskTitle: 'Daily labor allocation, morning toolbox safety talk',
              location: 'Entire Site',
              status: 'Completed',
              progress: 100,
              notes: 'Enforced safety helmets, boots, and safety harness on height.',
              overtimeHours: 0
            },
            [yesterday]: {
              attendance: 'PRESENT',
              taskTitle: 'Pre-pour shuttering and reinforcement inspection',
              location: 'Tower B - Slab 5',
              status: 'Completed',
              progress: 100,
              notes: 'Cleared site with consulting structural engineer.',
              overtimeHours: 1
            },
            [today]: {
              attendance: 'PRESENT',
              taskTitle: 'Supervision of concrete pour and cube sample casting',
              location: 'Tower B & Batching Plant',
              status: 'In Progress',
              progress: 80,
              notes: 'Casted 6 test cubes for 7-day and 28-day compressive tests.',
              overtimeHours: 0
            }
          }
        },
        {
          id: 'LW-110',
          name: 'Bablu Mahto',
          phone: '+91 90120 55443',
          skill: 'Helper',
          wage: 550,
          site: 'Tower A - Floor 4',
          notes: 'Masonry assistant, mortar mixing & block shifting',
          logs: {
            [dby]: {
              attendance: 'PRESENT',
              taskTitle: 'Water curing of fresh brickwork walls on 3rd floor',
              location: 'Tower A - Floor 3',
              status: 'Completed',
              progress: 100,
              notes: 'Three cycles of curing completed morning, noon, evening.',
              overtimeHours: 0
            },
            [yesterday]: {
              attendance: 'PRESENT',
              taskTitle: 'Carrying red clay bricks and cement mortar to mason',
              location: 'Tower A - Floor 4',
              status: 'Completed',
              progress: 100,
              notes: 'Supplied 600 bricks via manual hoist to 4th floor.',
              overtimeHours: 0
            },
            [today]: {
              attendance: 'HALFDAY',
              taskTitle: 'Assisting Ramesh Kumar on balcony parapet brickwork',
              location: 'Tower A - Floor 4',
              status: 'Completed',
              progress: 100,
              notes: 'Worked 8:30 AM to 1:30 PM (half-day shift approved).',
              overtimeHours: 0
            }
          }
        },
        {
          id: 'LW-111',
          name: 'Sunil Verma',
          phone: '+91 89120 66778',
          skill: 'Painter',
          wage: 750,
          site: 'Tower A - Basement',
          notes: 'Wall putty, primer coat, epoxy flooring specialist',
          logs: {
            [dby]: {
              attendance: 'PRESENT',
              taskTitle: 'Wire-brush surface cleaning and wall scraping',
              location: 'Tower A - Basement Parking',
              status: 'Completed',
              progress: 100,
              notes: 'Removed efflorescence and cement splashes on ceiling.',
              overtimeHours: 0
            },
            [yesterday]: {
              attendance: 'PRESENT',
              taskTitle: 'Waterproof exterior primer application on columns',
              location: 'Tower A - Basement Columns',
              status: 'Completed',
              progress: 100,
              notes: 'Applied alkali-resistant primer coat with 9-inch roller.',
              overtimeHours: 0
            },
            [today]: {
              attendance: 'PRESENT',
              taskTitle: 'White acrylic distemper first coat on parking ceiling',
              location: 'Tower A - Basement Bay 1-4',
              status: 'In Progress',
              progress: 50,
              notes: 'Scaffolding wheeled setup in place. 200 sqm covered.',
              overtimeHours: 0
            }
          }
        },
        {
          id: 'LW-112',
          name: 'Ajay Rajbhar',
          phone: '+91 88120 44332',
          skill: 'Operator',
          wage: 1000,
          site: 'External Yard',
          notes: 'JCB excavator and mini-dumper operator',
          logs: {
            [dby]: {
              attendance: 'PRESENT',
              taskTitle: 'Stormwater drain trench excavation along west boundary',
              location: 'West Perimeter Trench',
              status: 'Completed',
              progress: 100,
              notes: 'Dug 1.2m depth trench with JCB 3DX.',
              overtimeHours: 1
            },
            [yesterday]: {
              attendance: 'PRESENT',
              taskTitle: 'Backfilling and soil levelling around building plinth',
              location: 'Tower B Surrounds',
              status: 'Completed',
              progress: 100,
              notes: 'Pushed surplus earth and consolidated with roller.',
              overtimeHours: 0
            },
            [today]: {
              attendance: 'PRESENT',
              taskTitle: 'Excavation for septic tank & sewage soak pit',
              location: 'Utility Yard Behind Tower B',
              status: 'In Progress',
              progress: 70,
              notes: '4m x 3m pit excavated to 3.5m depth. Shoring timber fixed.',
              overtimeHours: 0
            }
          }
        }
      ];

      this.leaveRecords = [
        {
          id: 'LV-501',
          laborerId: 'LW-105',
          laborerName: 'Rajesh Paswan',
          type: 'Festival / Native Visit',
          startDate: today,
          duration: 3,
          reason: 'Chhath festival village visit in Bihar; informed supervisor beforehand.',
          status: 'Approved'
        }
      ];

      this.saveDatabase();
    }

    // Helper: get log for a laborer on a given date
    getLogForDate(laborer, dateStr) {
      if (!laborer.logs) laborer.logs = {};
      if (!laborer.logs[dateStr]) {
        laborer.logs[dateStr] = {
          attendance: 'PRESENT',
          taskTitle: 'Assigned to general trade activities',
          location: laborer.site || 'Site General',
          status: 'In Progress',
          progress: 50,
          notes: 'Standard shift allocation',
          overtimeHours: 0
        };
      }
      return laborer.logs[dateStr];
    }

    // =========================================================================
    // 5. DATE NAVIGATION & HEADER UPDATES
    // =========================================================================
    changeDate(offsetDays) {
      this.currentDate = this.offsetDate(this.currentDate, offsetDays);
      this.updateDateDisplay();
      this.renderAll();
    }

    resetDateToToday() {
      this.currentDate = this.getTodayDateString();
      this.updateDateDisplay();
      this.renderAll();
    }

    updateDateDisplay() {
      const el = document.getElementById('current-date-display');
      if (el) {
        const isToday = this.currentDate === this.getTodayDateString();
        const formatted = this.formatFriendlyDate(this.currentDate);
        el.textContent = isToday ? `Today, ${formatted}` : formatted;
      }
      const repDateEl = document.getElementById('report-date-str');
      if (repDateEl) {
        repDateEl.textContent = this.formatFriendlyDate(this.currentDate);
      }
    }

    // =========================================================================
    // 6. DASHBOARD METRICS CALCULATION
    // =========================================================================
    updateMetrics() {
      const total = this.laborers.length;
      let presentCount = 0;
      let halfdayCount = 0;
      let leaveCount = 0;
      let absentCount = 0;
      let activeTasks = 0;
      let totalWages = 0;

      this.laborers.forEach(l => {
        const log = this.getLogForDate(l, this.currentDate);
        const att = log.attendance;
        const wage = Number(l.wage) || 0;

        if (att === 'PRESENT') {
          presentCount++;
          totalWages += wage;
          if (log.overtimeHours && log.overtimeHours > 0) {
            totalWages += log.overtimeHours * (wage / 8) * 1.5;
          }
        } else if (att === 'HALFDAY') {
          halfdayCount++;
          totalWages += wage * 0.5;
        } else if (att === 'ON_LEAVE') {
          leaveCount++;
        } else if (att === 'ABSENT') {
          absentCount++;
        }

        if (att === 'PRESENT' && log.status === 'In Progress') {
          activeTasks++;
        }
      });

      const pct = total > 0 ? Math.round((presentCount / total) * 100) : 0;

      // Update UI metric counters
      const elTotal = document.getElementById('metric-total-labor');
      if (elTotal) elTotal.textContent = total;

      const elPres = document.getElementById('metric-present');
      if (elPres) elPres.textContent = presentCount;

      const elPresPct = document.getElementById('metric-present-pct');
      if (elPresPct) elPresPct.textContent = `${pct}%`;

      const elHalf = document.getElementById('metric-halfday');
      if (elHalf) elHalf.textContent = halfdayCount;

      const elLeave = document.getElementById('metric-leave');
      if (elLeave) elLeave.textContent = leaveCount + absentCount;

      const elTasks = document.getElementById('metric-active-tasks');
      if (elTasks) elTasks.textContent = activeTasks;

      const elWages = document.getElementById('metric-wages');
      if (elWages) elWages.textContent = `₹${Math.round(totalWages).toLocaleString('en-IN')}`;

      const elRepWages = document.getElementById('report-total-wages');
      if (elRepWages) elRepWages.textContent = `₹${Math.round(totalWages).toLocaleString('en-IN')}`;
    }

    // =========================================================================
    // 7. FILTER & SEARCH LOGIC
    // =========================================================================
    handleFilterChange() {
      const searchEl = document.getElementById('filter-search');
      const skillEl = document.getElementById('filter-skill');
      const statusEl = document.getElementById('filter-status');
      const siteEl = document.getElementById('filter-site');

      this.filterText = searchEl ? searchEl.value.trim().toLowerCase() : '';
      this.filterSkill = skillEl ? skillEl.value : 'ALL';
      this.filterStatus = statusEl ? statusEl.value : 'ALL';
      this.filterSite = siteEl ? siteEl.value : 'ALL';

      this.renderCurrentView();
    }

    resetFilters() {
      const searchEl = document.getElementById('filter-search');
      const skillEl = document.getElementById('filter-skill');
      const statusEl = document.getElementById('filter-status');
      const siteEl = document.getElementById('filter-site');

      if (searchEl) searchEl.value = '';
      if (skillEl) skillEl.value = 'ALL';
      if (statusEl) statusEl.value = 'ALL';
      if (siteEl) siteEl.value = 'ALL';

      this.filterText = '';
      this.filterSkill = 'ALL';
      this.filterStatus = 'ALL';
      this.filterSite = 'ALL';

      this.renderCurrentView();
    }

    getFilteredLaborers() {
      return this.laborers.filter(l => {
        const log = this.getLogForDate(l, this.currentDate);

        // Search text filter
        if (this.filterText) {
          const matchName = l.name.toLowerCase().includes(this.filterText);
          const matchId = l.id.toLowerCase().includes(this.filterText);
          const matchPhone = (l.phone || '').toLowerCase().includes(this.filterText);
          const matchSkill = l.skill.toLowerCase().includes(this.filterText);
          const matchTask = (log.taskTitle || '').toLowerCase().includes(this.filterText);
          if (!matchName && !matchId && !matchPhone && !matchSkill && !matchTask) {
            return false;
          }
        }

        // Skill filter
        if (this.filterSkill !== 'ALL' && l.skill !== this.filterSkill) {
          return false;
        }

        // Status filter
        if (this.filterStatus !== 'ALL' && log.attendance !== this.filterStatus) {
          return false;
        }

        // Site zone filter
        if (this.filterSite !== 'ALL' && (!l.site || !l.site.toLowerCase().includes(this.filterSite.toLowerCase()))) {
          return false;
        }

        return true;
      });
    }

    // =========================================================================
    // 8. TAB NAVIGATION
    // =========================================================================
    switchTab(tabId) {
      this.currentTab = tabId;

      const tabs = ['roster', 'matrix', 'leave', 'report'];
      tabs.forEach(t => {
        const btn = document.getElementById(`tab-btn-${t}`);
        const view = document.getElementById(`tab-view-${t}`);
        if (btn && view) {
          if (t === tabId) {
            btn.className = 'px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 bg-slate-900 text-white shadow-sm transition whitespace-nowrap';
            view.classList.remove('hidden');
          } else {
            btn.className = 'px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-slate-200 transition whitespace-nowrap';
            view.classList.add('hidden');
          }
        }
      });

      this.renderCurrentView();
    }

    renderCurrentView() {
      this.updateMetrics();
      if (this.currentTab === 'roster') {
        this.renderRosterTable();
      } else if (this.currentTab === 'matrix') {
        this.renderMatrixTable();
      } else if (this.currentTab === 'leave') {
        this.renderLeaveTable();
      } else if (this.currentTab === 'report') {
        this.renderReportTable();
      }
      this.refreshIcons();
    }

    renderAll() {
      this.updateMetrics();
      this.renderRosterTable();
      this.renderMatrixTable();
      this.renderLeaveTable();
      this.renderReportTable();
      this.refreshIcons();
    }

    // =========================================================================
    // 9. TAB 1: RENDER ROSTER & ATTENDANCE TABLE
    // =========================================================================
    renderRosterTable() {
      const tbody = document.getElementById('labor-roster-tbody');
      const emptyState = document.getElementById('roster-empty-state');
      const countLabel = document.getElementById('filter-count-label');
      if (!tbody) return;

      const filtered = this.getFilteredLaborers();
      if (countLabel) countLabel.textContent = filtered.length;

      if (filtered.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
      }
      if (emptyState) emptyState.classList.add('hidden');

      tbody.innerHTML = filtered.map(l => {
        const log = this.getLogForDate(l, this.currentDate);
        const tradeClass = TRADE_COLORS[l.skill] || 'bg-slate-100 text-slate-700 border-slate-200';
        
        // Yesterday's task peek
        const yesterdayDate = this.offsetDate(this.currentDate, -1);
        const yesterdayLog = l.logs && l.logs[yesterdayDate] ? l.logs[yesterdayDate].taskTitle : 'No past log';

        // Attendance button states
        const isPresent = log.attendance === 'PRESENT';
        const isHalfDay = log.attendance === 'HALFDAY';
        const isLeave = log.attendance === 'ON_LEAVE';
        const isAbsent = log.attendance === 'ABSENT';

        // Task status badge
        let taskBadge = '';
        if (log.status === 'Completed') {
          taskBadge = '<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Done 100%</span>';
        } else if (log.status === 'In Progress') {
          taskBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Active ${log.progress || 50}%</span>`;
        } else if (log.status === 'On Hold') {
          taskBadge = '<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">On Hold</span>';
        } else {
          taskBadge = '<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Not Started</span>';
        }

        return `
          <tr class="hover:bg-amber-50/30 transition-colors">
            <!-- Laborer Details -->
            <td class="py-3 px-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 font-extrabold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                  ${this.getInitials(l.name)}
                </div>
                <div>
                  <div class="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>${l.name}</span>
                    <span class="text-[10px] text-slate-400 font-mono">#${l.id}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 font-normal">
                    ${l.phone || 'No Phone'}
                  </div>
                </div>
              </div>
            </td>

            <!-- Trade / Skill -->
            <td class="py-3 px-3">
              <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-extrabold border ${tradeClass}">
                ${l.skill}
              </span>
            </td>

            <!-- Site / Zone -->
            <td class="py-3 px-3 text-slate-600 font-medium">
              <div class="flex items-center gap-1 text-[11px]">
                <i data-lucide="map-pin" class="w-3.5 h-3.5 text-amber-500 flex-shrink-0"></i>
                <span class="truncate max-w-[130px]">${l.site || 'Site General'}</span>
              </div>
            </td>

            <!-- Attendance Toggle Buttons -->
            <td class="py-3 px-4 text-center">
              <div class="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 gap-1 shadow-inner">
                <button type="button" onclick="app.setAttendance('${l.id}', 'PRESENT')" title="Mark Present (Full Day)"
                  class="px-2.5 py-1 rounded-lg text-xs font-black transition ${isPresent ? 'att-btn-active-present' : 'text-slate-600 hover:text-emerald-700'}">
                  P
                </button>
                <button type="button" onclick="app.setAttendance('${l.id}', 'HALFDAY')" title="Mark Half-Day"
                  class="px-2.5 py-1 rounded-lg text-xs font-black transition ${isHalfDay ? 'att-btn-active-halfday' : 'text-slate-600 hover:text-amber-700'}">
                  HD
                </button>
                <button type="button" onclick="app.setAttendance('${l.id}', 'ON_LEAVE')" title="Mark On Leave"
                  class="px-2.5 py-1 rounded-lg text-xs font-black transition ${isLeave ? 'att-btn-active-leave' : 'text-slate-600 hover:text-purple-700'}">
                  L
                </button>
                <button type="button" onclick="app.setAttendance('${l.id}', 'ABSENT')" title="Mark Absent"
                  class="px-2.5 py-1 rounded-lg text-xs font-black transition ${isAbsent ? 'att-btn-active-absent' : 'text-slate-600 hover:text-rose-700'}">
                  A
                </button>
              </div>
            </td>

            <!-- Current Work / Live Assignment -->
            <td class="py-3 px-4">
              <div class="space-y-1 max-w-xs">
                <div class="flex items-center gap-2">
                  ${taskBadge}
                  <span class="font-bold text-slate-800 text-[11px] truncate" title="${log.taskTitle}">
                    ${log.taskTitle}
                  </span>
                </div>
                <!-- Yesterday Hint -->
                <div class="text-[10px] text-slate-400 flex items-center gap-1">
                  <i data-lucide="history" class="w-3 h-3 text-slate-400"></i>
                  <span class="truncate">Yesterday: ${yesterdayLog}</span>
                </div>
              </div>
            </td>

            <!-- Daily Wage Rate -->
            <td class="py-3 px-3 font-bold text-slate-800">
              ₹${l.wage}
            </td>

            <!-- Row Actions -->
            <td class="py-3 px-4 text-right">
              <div class="inline-flex items-center gap-1.5">
                <button onclick="app.openTaskModal('${l.id}')" title="Assign / Update Task"
                  class="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1 transition">
                  <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                  <span class="hidden sm:inline">Assign</span>
                </button>
                <button onclick="app.openHistoryModal('${l.id}')" title="View 3-Day History"
                  class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition">
                  <i data-lucide="history" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="app.openEditLaborModal('${l.id}')" title="Edit Profile"
                  class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition">
                  <i data-lucide="user" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="app.deleteLaborer('${l.id}')" title="Delete Profile"
                  class="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    // =========================================================================
    // 10. TAB 2: 3-DAY WORK MATRIX (TODAY vs YESTERDAY vs DAY BEFORE YESTERDAY)
    // =========================================================================
    renderMatrixTable() {
      const tbody = document.getElementById('matrix-tbody');
      if (!tbody) return;

      const today = this.currentDate;
      const yesterday = this.offsetDate(today, -1);
      const dby = this.offsetDate(today, -2);

      // Update Column Header Titles with dynamic dates
      const elColDby = document.getElementById('matrix-col-dby-title');
      if (elColDby) elColDby.textContent = `2 Days Ago (${this.formatFriendlyDate(dby)})`;

      const elColYest = document.getElementById('matrix-col-yesterday-title');
      if (elColYest) elColYest.textContent = `Yesterday (${this.formatFriendlyDate(yesterday)})`;

      const elColToday = document.getElementById('matrix-col-today-title');
      if (elColToday) elColToday.textContent = `Today (${this.formatFriendlyDate(today)}) - LIVE`;

      const filtered = this.getFilteredLaborers();

      tbody.innerHTML = filtered.map(l => {
        const dbyLog = l.logs && l.logs[dby] ? l.logs[dby] : { attendance: 'PRESENT', taskTitle: 'Standard site operations', status: 'Completed', progress: 100 };
        const yestLog = l.logs && l.logs[yesterday] ? l.logs[yesterday] : { attendance: 'PRESENT', taskTitle: 'Standard site operations', status: 'Completed', progress: 100 };
        const todayLog = this.getLogForDate(l, today);

        const tradeClass = TRADE_COLORS[l.skill] || 'bg-slate-100 text-slate-700';

        return `
          <tr class="hover:bg-slate-50/80 transition-colors">
            
            <!-- Laborer Profile -->
            <td class="py-3.5 px-4 font-bold">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-slate-800 text-amber-400 text-xs font-black flex items-center justify-center flex-shrink-0">
                  ${this.getInitials(l.name)}
                </div>
                <div>
                  <div class="text-slate-900">${l.name}</div>
                  <span class="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded border ${tradeClass}">
                    ${l.skill}
                  </span>
                </div>
              </div>
            </td>

            <!-- Day Before Yesterday Log -->
            <td class="py-3.5 px-4 bg-slate-50/40 border-r border-slate-100">
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold text-slate-500 uppercase">${this.getAttendancePill(dbyLog.attendance)}</span>
                  <span class="text-[10px] text-emerald-700 font-bold">Completed</span>
                </div>
                <div class="text-slate-700 text-xs font-semibold leading-tight">
                  ${dbyLog.taskTitle}
                </div>
                ${dbyLog.notes ? `<div class="text-[10px] text-slate-500 italic truncate">${dbyLog.notes}</div>` : ''}
              </div>
            </td>

            <!-- Yesterday Log -->
            <td class="py-3.5 px-4 bg-slate-50/80 border-r border-slate-100">
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold uppercase">${this.getAttendancePill(yestLog.attendance)}</span>
                  <span class="text-[10px] text-indigo-700 font-bold">Yesterday's Log</span>
                </div>
                <div class="text-slate-800 text-xs font-semibold leading-tight">
                  ${yestLog.taskTitle}
                </div>
                ${yestLog.notes ? `<div class="text-[10px] text-slate-500 italic truncate">${yestLog.notes}</div>` : ''}
              </div>
            </td>

            <!-- Today's Live Assignment -->
            <td class="py-3.5 px-4 bg-amber-50/20 border-l-2 border-amber-500 border-r border-slate-100">
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <span>${this.getAttendancePill(todayLog.attendance)}</span>
                  <span class="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    ${todayLog.status} (${todayLog.progress || 50}%)
                  </span>
                </div>
                <div class="text-slate-900 text-xs font-bold leading-tight">
                  ${todayLog.taskTitle}
                </div>
                <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-amber-500 h-1.5 rounded-full" style="width: ${todayLog.progress || 50}%"></div>
                </div>
              </div>
            </td>

            <!-- Actions -->
            <td class="py-3.5 px-3 text-right">
              <button onclick="app.openTaskModal('${l.id}')" title="Update Today's Task"
                class="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition">
                Update Task
              </button>
            </td>

          </tr>
        `;
      }).join('');
    }

    // =========================================================================
    // 11. TAB 3: LEAVE & ABSENCE RECORDS
    // =========================================================================
    renderLeaveTable() {
      const tbody = document.getElementById('leave-records-tbody');
      if (!tbody) return;

      if (this.leaveRecords.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="py-8 text-center text-slate-400 font-medium">
              No leave records found. Use "Record Leave Request" to add leave entries.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = this.leaveRecords.map(r => {
        return `
          <tr class="hover:bg-purple-50/20 transition-colors">
            <td class="py-3.5 px-4 font-bold text-slate-900">
              ${r.laborerName}
              <span class="block text-[10px] text-slate-400 font-mono">ID: ${r.laborerId}</span>
            </td>
            <td class="py-3.5 px-3 font-semibold text-purple-700">
              ${r.type}
            </td>
            <td class="py-3.5 px-3 text-slate-700 font-medium">
              ${this.formatFriendlyDate(r.startDate)}
            </td>
            <td class="py-3.5 px-3 font-bold text-slate-800">
              ${r.duration} Day(s)
            </td>
            <td class="py-3.5 px-4 text-slate-600 max-w-xs truncate" title="${r.reason}">
              ${r.reason || 'No description provided'}
            </td>
            <td class="py-3.5 px-3 text-center">
              <span class="inline-flex px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                ${r.status || 'Approved'}
              </span>
            </td>
            <td class="py-3.5 px-4 text-right">
              <button onclick="app.deleteLeaveRecord('${r.id}')" title="Delete Leave Record"
                class="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // =========================================================================
    // 12. TAB 4: CONTRACTOR WAGE & DAILY REPORT
    // =========================================================================
    renderReportTable() {
      const tbody = document.getElementById('report-tbody');
      if (!tbody) return;

      tbody.innerHTML = this.laborers.map((l, idx) => {
        const log = this.getLogForDate(l, this.currentDate);
        const wage = Number(l.wage) || 0;
        let dayWage = 0;
        let otPay = 0;

        if (log.attendance === 'PRESENT') {
          dayWage = wage;
          if (log.overtimeHours) {
            otPay = Math.round(log.overtimeHours * (wage / 8) * 1.5);
            dayWage += otPay;
          }
        } else if (log.attendance === 'HALFDAY') {
          dayWage = wage * 0.5;
        }

        return `
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="py-2.5 px-3 text-slate-400 font-mono">${idx + 1}</td>
            <td class="py-2.5 px-3 font-bold text-slate-900">${l.name}</td>
            <td class="py-2.5 px-3 text-slate-600">${l.skill}</td>
            <td class="py-2.5 px-3">${this.getAttendancePill(log.attendance)}</td>
            <td class="py-2.5 px-3 text-slate-700">₹${wage}</td>
            <td class="py-2.5 px-3 text-slate-600">${log.overtimeHours || 0} hrs</td>
            <td class="py-2.5 px-3 text-right font-black text-slate-900">₹${Math.round(dayWage).toLocaleString('en-IN')}</td>
            <td class="py-2.5 px-3 text-slate-600 truncate max-w-xs">${log.taskTitle}</td>
          </tr>
        `;
      }).join('');
    }

    // Attendance helper pill
    getAttendancePill(status) {
      if (status === 'PRESENT') {
        return '<span class="inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">Present</span>';
      } else if (status === 'HALFDAY') {
        return '<span class="inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">Half-Day</span>';
      } else if (status === 'ON_LEAVE') {
        return '<span class="inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">On Leave</span>';
      } else {
        return '<span class="inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">Absent</span>';
      }
    }

    // =========================================================================
    // 13. CRUD ACTIONS & ATTENDANCE LOGIC
    // =========================================================================
    setAttendance(laborerId, status) {
      const laborer = this.laborers.find(l => l.id === laborerId);
      if (!laborer) return;

      const log = this.getLogForDate(laborer, this.currentDate);
      log.attendance = status;

      if (status === 'ON_LEAVE') {
        log.status = 'On Hold';
      } else if (status === 'PRESENT' && log.status === 'On Hold') {
        log.status = 'In Progress';
      }

      this.saveDatabase();
      this.updateMetrics();
      this.renderCurrentView();
      this.showToast(`${laborer.name} marked ${status.replace('_', ' ')}`, 'success');
    }

    markAllPresent() {
      if (confirm(`Mark all ${this.laborers.length} laborers as PRESENT for ${this.formatFriendlyDate(this.currentDate)}?`)) {
        this.laborers.forEach(l => {
          const log = this.getLogForDate(l, this.currentDate);
          log.attendance = 'PRESENT';
          if (log.status === 'On Hold') log.status = 'In Progress';
        });
        this.saveDatabase();
        this.renderAll();
        this.showToast('All laborers marked as PRESENT for today.', 'success');
      }
    }

    openAddLaborModal() {
      document.getElementById('modal-laborer-title').textContent = 'Add New Laborer';
      document.getElementById('laborer-id').value = '';
      document.getElementById('laborer-name').value = '';
      document.getElementById('laborer-phone').value = '';
      document.getElementById('laborer-skill').value = 'Mason';
      document.getElementById('laborer-wage').value = '800';
      document.getElementById('laborer-site').value = 'Tower A';
      document.getElementById('laborer-notes').value = '';

      this.openModal('modal-laborer');
    }

    openEditLaborModal(laborerId) {
      const laborer = this.laborers.find(l => l.id === laborerId);
      if (!laborer) return;

      document.getElementById('modal-laborer-title').textContent = `Edit Profile: ${laborer.name}`;
      document.getElementById('laborer-id').value = laborer.id;
      document.getElementById('laborer-name').value = laborer.name;
      document.getElementById('laborer-phone').value = laborer.phone || '';
      document.getElementById('laborer-skill').value = laborer.skill;
      document.getElementById('laborer-wage').value = laborer.wage;
      document.getElementById('laborer-site').value = laborer.site || '';
      document.getElementById('laborer-notes').value = laborer.notes || '';

      this.openModal('modal-laborer');
    }

    handleSaveLaborer(e) {
      if (e) e.preventDefault();

      const id = document.getElementById('laborer-id').value.trim();
      const name = document.getElementById('laborer-name').value.trim();
      const phone = document.getElementById('laborer-phone').value.trim();
      const skill = document.getElementById('laborer-skill').value;
      const wage = Number(document.getElementById('laborer-wage').value) || 800;
      const site = document.getElementById('laborer-site').value.trim();
      const notes = document.getElementById('laborer-notes').value.trim();

      if (!name) {
        this.showToast('Laborer name is required', 'error');
        return;
      }

      if (id) {
        // Update existing
        const existing = this.laborers.find(l => l.id === id);
        if (existing) {
          existing.name = name;
          existing.phone = phone;
          existing.skill = skill;
          existing.wage = wage;
          existing.site = site;
          existing.notes = notes;
          this.showToast(`Updated profile for ${name}`, 'success');
        }
      } else {
        // Create new
        const newId = `LW-${Math.floor(100 + Math.random() * 900)}`;
        const newLaborer = {
          id: newId,
          name: name,
          phone: phone,
          skill: skill,
          wage: wage,
          site: site,
          notes: notes,
          logs: {
            [this.currentDate]: {
              attendance: 'PRESENT',
              taskTitle: `General ${skill} site work`,
              location: site || 'Site Area',
              status: 'In Progress',
              progress: 40,
              notes: 'Newly assigned to roster',
              overtimeHours: 0
            }
          }
        };
        this.laborers.push(newLaborer);
        this.showToast(`Added ${name} to workforce roster (#${newId})`, 'success');
      }

      this.saveDatabase();
      this.closeModal('modal-laborer');
      this.renderAll();
    }

    deleteLaborer(laborerId) {
      const laborer = this.laborers.find(l => l.id === laborerId);
      if (!laborer) return;

      if (confirm(`Are you sure you want to remove ${laborer.name} (#${laborer.id}) from the active roster?`)) {
        this.laborers = this.laborers.filter(l => l.id !== laborerId);
        this.saveDatabase();
        this.renderAll();
        this.showToast(`Removed ${laborer.name} from roster.`, 'info');
      }
    }

    // =========================================================================
    // 14. TASK ASSIGNMENT MODAL & LOGS
    // =========================================================================
    openTaskModal(laborerId) {
      const laborer = this.laborers.find(l => l.id === laborerId);
      if (!laborer) return;

      this.activeLaborerForTask = laborer;
      const log = this.getLogForDate(laborer, this.currentDate);

      const infoEl = document.getElementById('modal-task-laborer-info');
      if (infoEl) infoEl.textContent = `For ${laborer.name} (${laborer.skill}) - ${this.formatFriendlyDate(this.currentDate)}`;

      document.getElementById('task-laborer-id').value = laborer.id;
      document.getElementById('task-title').value = log.taskTitle || '';
      document.getElementById('task-location').value = log.location || laborer.site || '';
      document.getElementById('task-status').value = log.status || 'In Progress';
      
      const prog = log.progress !== undefined ? log.progress : 50;
      document.getElementById('task-progress').value = prog;
      document.getElementById('task-progress-val').innerText = prog + '%';
      document.getElementById('task-notes').value = log.notes || '';

      this.openModal('modal-task');
    }

    applyTaskPreset(title, location, status, progress) {
      document.getElementById('task-title').value = title;
      document.getElementById('task-location').value = location;
      document.getElementById('task-status').value = status;
      document.getElementById('task-progress').value = progress;
      document.getElementById('task-progress-val').innerText = progress + '%';
    }

    handleSaveTask(e) {
      if (e) e.preventDefault();

      const laborerId = document.getElementById('task-laborer-id').value;
      const laborer = this.laborers.find(l => l.id === laborerId);
      if (!laborer) return;

      const taskTitle = document.getElementById('task-title').value.trim();
      const location = document.getElementById('task-location').value.trim();
      const status = document.getElementById('task-status').value;
      const progress = parseInt(document.getElementById('task-progress').value, 10);
      const notes = document.getElementById('task-notes').value.trim();

      const log = this.getLogForDate(laborer, this.currentDate);
      log.taskTitle = taskTitle;
      log.location = location;
      log.status = status;
      log.progress = progress;
      log.notes = notes;

      this.saveDatabase();
      this.closeModal('modal-task');
      this.renderAll();
      this.showToast(`Updated task assignment for ${laborer.name}`, 'success');
    }

    // =========================================================================
    // 15. 3-DAY & HISTORICAL INSPECTOR MODAL
    // =========================================================================
    openHistoryModal(laborerId) {
      const laborer = this.laborers.find(l => l.id === laborerId);
      if (!laborer) return;

      const today = this.currentDate;
      const yesterday = this.offsetDate(today, -1);
      const dby = this.offsetDate(today, -2);

      const dbyLog = laborer.logs && laborer.logs[dby] ? laborer.logs[dby] : { attendance: 'PRESENT', taskTitle: 'Standard site operations', status: 'Completed', notes: '' };
      const yesterdayLog = laborer.logs && laborer.logs[yesterday] ? laborer.logs[yesterday] : { attendance: 'PRESENT', taskTitle: 'Standard site operations', status: 'Completed', notes: '' };
      const todayLog = this.getLogForDate(laborer, today);

      document.getElementById('history-modal-laborer-name').textContent = `${laborer.name} - Work Logs`;
      document.getElementById('history-modal-laborer-trade').textContent = `Trade: ${laborer.skill} | Daily Rate: ₹${laborer.wage} | Zone: ${laborer.site || 'General'}`;

      // 2 Days ago card
      document.getElementById('history-dby-date').textContent = this.formatFriendlyDate(dby);
      document.getElementById('history-dby-badge').textContent = dbyLog.attendance;
      document.getElementById('history-dby-task').textContent = dbyLog.taskTitle;

      // Yesterday card
      document.getElementById('history-yesterday-date').textContent = this.formatFriendlyDate(yesterday);
      document.getElementById('history-yesterday-badge').textContent = yesterdayLog.attendance;
      document.getElementById('history-yesterday-task').textContent = yesterdayLog.taskTitle;

      // Today card
      document.getElementById('history-today-date').textContent = this.formatFriendlyDate(today);
      document.getElementById('history-today-badge').textContent = `${todayLog.status} (${todayLog.progress || 50}%)`;
      document.getElementById('history-today-task').textContent = todayLog.taskTitle;

      // Historical log table
      const tbody = document.getElementById('history-table-tbody');
      if (tbody) {
        const sortedDates = Object.keys(laborer.logs || {}).sort().reverse();
        tbody.innerHTML = sortedDates.map(dateKey => {
          const item = laborer.logs[dateKey];
          return `
            <tr>
              <td class="py-2 px-3 font-bold text-slate-800">${this.formatFriendlyDate(dateKey)}</td>
              <td class="py-2 px-3">${this.getAttendancePill(item.attendance)}</td>
              <td class="py-2 px-3 text-slate-700">${item.taskTitle} ${item.notes ? `<span class="text-[10px] text-slate-400 block">${item.notes}</span>` : ''}</td>
              <td class="py-2 px-3 text-slate-600 font-mono">${item.overtimeHours ? `8h + ${item.overtimeHours}h OT` : '8 hrs'}</td>
            </tr>
          `;
        }).join('');
      }

      this.openModal('modal-history');
    }

    // =========================================================================
    // 16. LEAVE REQUEST MODAL
    // =========================================================================
    openLeaveModal() {
      const select = document.getElementById('leave-laborer-id');
      if (select) {
        select.innerHTML = this.laborers.map(l => `<option value="${l.id}">${l.name} (${l.skill})</option>`).join('');
      }
      document.getElementById('leave-date').value = this.currentDate;
      document.getElementById('leave-duration').value = '1';
      document.getElementById('leave-reason').value = '';
      this.openModal('modal-leave');
    }

    handleSaveLeave(e) {
      if (e) e.preventDefault();

      const laborerId = document.getElementById('leave-laborer-id').value;
      const laborer = this.laborers.find(l => l.id === laborerId);
      if (!laborer) return;

      const type = document.getElementById('leave-type').value;
      const startDate = document.getElementById('leave-date').value;
      const duration = parseInt(document.getElementById('leave-duration').value, 10) || 1;
      const reason = document.getElementById('leave-reason').value.trim();

      const record = {
        id: `LV-${Math.floor(100 + Math.random() * 900)}`,
        laborerId: laborer.id,
        laborerName: laborer.name,
        type: type,
        startDate: startDate,
        duration: duration,
        reason: reason,
        status: 'Approved'
      };

      this.leaveRecords.unshift(record);

      // If leave starts on current date, mark attendance as ON_LEAVE
      if (startDate === this.currentDate) {
        const log = this.getLogForDate(laborer, this.currentDate);
        log.attendance = 'ON_LEAVE';
        log.taskTitle = `On Leave: ${type}`;
        log.status = 'On Hold';
      }

      this.saveDatabase();
      this.closeModal('modal-leave');
      this.renderAll();
      this.showToast(`Leave recorded for ${laborer.name}`, 'success');
    }

    deleteLeaveRecord(recordId) {
      if (confirm('Delete this leave record entry?')) {
        this.leaveRecords = this.leaveRecords.filter(r => r.id !== recordId);
        this.saveDatabase();
        this.renderAll();
        this.showToast('Leave entry deleted.', 'info');
      }
    }

    // =========================================================================
    // 17. DATA EXPORT & BACKUP OPERATIONS
    // =========================================================================
    openDataManagementModal() {
      this.openModal('modal-data');
    }

    exportAttendanceCSV() {
      const headers = ['Laborer_ID', 'Name', 'Phone', 'Skill', 'Daily_Wage', 'Site_Zone', 'Date', 'Attendance', 'Task_Assignment', 'Task_Status', 'Progress_Pct', 'OT_Hours', 'Notes'];
      const rows = this.laborers.map(l => {
        const log = this.getLogForDate(l, this.currentDate);
        return [
          `"${l.id}"`,
          `"${l.name}"`,
          `"${l.phone || ''}"`,
          `"${l.skill}"`,
          l.wage,
          `"${l.site || ''}"`,
          `"${this.currentDate}"`,
          `"${log.attendance}"`,
          `"${(log.taskTitle || '').replace(/"/g, '""')}"`,
          `"${log.status || ''}"`,
          log.progress || 0,
          log.overtimeHours || 0,
          `"${(log.notes || '').replace(/"/g, '""')}"`
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      this.downloadBlob(csvContent, `LabourWallah_Attendance_${this.currentDate}.csv`, 'text/csv');
      this.showToast('Attendance CSV downloaded.', 'success');
    }

    exportWageReportCSV() {
      const headers = ['Serial_No', 'Laborer_ID', 'Name', 'Trade', 'Attendance', 'Base_Rate_INR', 'OT_Hours', 'Day_Total_Wage_INR', 'Assignment'];
      const rows = this.laborers.map((l, idx) => {
        const log = this.getLogForDate(l, this.currentDate);
        const wage = Number(l.wage) || 0;
        let dayWage = 0;
        if (log.attendance === 'PRESENT') {
          dayWage = wage + (log.overtimeHours ? log.overtimeHours * (wage / 8) * 1.5 : 0);
        } else if (log.attendance === 'HALFDAY') {
          dayWage = wage * 0.5;
        }
        return [
          idx + 1,
          `"${l.id}"`,
          `"${l.name}"`,
          `"${l.skill}"`,
          `"${log.attendance}"`,
          wage,
          log.overtimeHours || 0,
          Math.round(dayWage),
          `"${(log.taskTitle || '').replace(/"/g, '""')}"`
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      this.downloadBlob(csvContent, `LabourWallah_Wage_Report_${this.currentDate}.csv`, 'text/csv');
      this.showToast('Wage report CSV downloaded.', 'success');
    }

    backupDatabaseJSON() {
      const payload = {
        laborers: this.laborers,
        leaveRecords: this.leaveRecords,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      const json = JSON.stringify(payload, null, 2);
      this.downloadBlob(json, `LabourWallah_Backup_${this.currentDate}.json`, 'application/json');
      this.showToast('Database JSON backup downloaded.', 'success');
    }

    restoreDatabaseJSON(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (Array.isArray(parsed.laborers)) {
            this.laborers = parsed.laborers;
            this.leaveRecords = parsed.leaveRecords || [];
            this.saveDatabase();
            this.closeModal('modal-data');
            this.renderAll();
            this.showToast('Database successfully restored from backup!', 'success');
          } else {
            alert('Invalid backup file format: laborers array missing.');
          }
        } catch (err) {
          alert('Failed to parse JSON file.');
        }
      };
      reader.readAsText(file);
    }

    confirmResetSampleData() {
      if (confirm('Reset workforce database back to initial 12 sample laborers with multi-day logs? Any custom changes will be overwritten.')) {
        this.seedInitialData();
        this.closeModal('modal-data');
        this.renderAll();
        this.showToast('Workforce database reset to sample data.', 'info');
      }
    }

    downloadBlob(content, filename, mimeType) {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // =========================================================================
    // 18. MODAL CONTROLS & UTILITIES
    // =========================================================================
    openModal(modalId) {
      const el = document.getElementById(modalId);
      if (el) {
        el.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }
      this.refreshIcons();
    }

    closeModal(modalId) {
      const el = document.getElementById(modalId);
      if (el) {
        el.classList.add('hidden');
        document.body.style.overflow = '';
      }
    }

    getInitials(name) {
      if (!name) return 'LW';
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }

    refreshIcons() {
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }

    showToast(message, type = 'info') {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      let bg = 'bg-slate-900 text-white';
      let icon = 'info';

      if (type === 'success') {
        bg = 'bg-emerald-600 text-white shadow-emerald-600/30';
        icon = 'check-circle';
      } else if (type === 'error') {
        bg = 'bg-rose-600 text-white shadow-rose-600/30';
        icon = 'alert-triangle';
      }

      toast.className = `toast-msg px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold ${bg} animate-fade-in`;
      toast.innerHTML = `
        <i data-lucide="${icon}" class="w-4 h-4 flex-shrink-0"></i>
        <span>${message}</span>
      `;

      container.appendChild(toast);
      this.refreshIcons();

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    setupGlobalShortcuts() {
      // Close modals on Escape key
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const openModals = ['modal-laborer', 'modal-task', 'modal-history', 'modal-leave', 'modal-data'];
          openModals.forEach(m => this.closeModal(m));
        }
      });
    }
  }

  // Instantiate and expose globally to window.app
  const app = new LabourWallahApp();
  window.app = app;

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
  } else {
    app.init();
  }
})();
