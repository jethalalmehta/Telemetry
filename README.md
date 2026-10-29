# Telemetry — Placement Preparation & Tracking System
### B.Tech Computer Science & Engineering (CSE) Mini Project
#### 30% Mid-Term Implementation Phase

**Telemetry** is an individual academic mini project built for B.Tech CSE students to systematically organize placement preparation, schedule syllabus topics across core subjects, and track genuine academic progress leading up to campus recruitment drives.

In accordance with academic instructions for the **mid-term evaluation**, this repository implements approximately **30% of the project scope**:
1. **Student Registration & Authentication**
2. **Student Profile Setup & Onboarding**
3. **Preparation Tracker (Main Working Feature)**
4. **Working Student Dashboard (Real Data)**

The remaining modules (*Mock Tests & MCQ Question Bank*, *Company & Drive Management*, *Placement Application Pipeline*) are documented as the **Next Development Phase** for subsequent evaluation.

---

## 1. Project Specifications
- **Product Name**: **Telemetry** everywhere (never PrepPal)
- **Formal Project Title**: **Placement Preparation & Tracking System**
- **Course**: B.Tech CSE Individual Mini Project (Mid-Term 30% Milestone)
- **Zero AI Dependencies**: Strictly 0% AI. No chatbots, automated ML recommendations, or external paid API calls. Pure deterministic academic web engineering.
- **Visual Design Identity**:
  - Deep navy blue: `#203B53`
  - Muted teal: `#398879`
  - Soft sky blue: `#E7F0FA`
  - Cool off-white background: `#F5F7FA`
  - White surfaces: `#FFFFFF`
  - Muted amber accent: `#DCA65A`
  - Dark slate text: `#263746`
  - Clean typography, balanced whitespace, restrained lift & glow hover animations, and smooth progress transitions.

---

## 2. Phase 1 Core Functional Modules (30% Scope)

### 1. Student Registration & Login
- Input validation for required fields, duplicate emails, and password confirmation.
- Secure cryptographic password hashing (SHA-256 with salts in React client / PBKDF2 in Flask).
- Session-based state management and route protection for private workspace screens.

### 2. Student Profile Setup & Onboarding
- Automatic redirection upon first registration to complete academic profile details.
- Captures Full Name, College/University, Branch, Semester/Year, Technical Skills (tag input), and Preferred Job Role.
- Persistent and editable at any time from the profile view.

### 3. Preparation Task Tracker (Main Working Feature)
- Full CRUD operations: Add, view, edit, and delete tasks (with deletion confirmation).
- Cycle status seamlessly: `Pending` → `In Progress` → `Completed`.
- Syllabus categorized into 7 approved areas:
  - *Aptitude*
  - *Logical Reasoning*
  - *Verbal Ability*
  - *Technical Subjects*
  - *Coding Practice*
  - *Communication*
  - *Interview Preparation*
- Real-time instant synchronization with the student dashboard.

### 4. Working Student Dashboard
- **Welcome section**: Personalized greeting with the student's actual name and encouraging message.
- **Three compact statistics**:
  - Total preparation tasks
  - Completed tasks
  - Pending tasks
- **Today's Preparation**: Short list of actual preparation tasks with status badges and one-click status toggle.
- **Weekly Progress**: Smooth progress bar calculated dynamically from real completed tasks: `(Completed ÷ Total) × 100%`.
- **Quick Actions**: Direct working links to Preparation Tracker and Student Profile.
- **Empty States**: Clear, encouraging empty states when 0 tasks exist for a new student.
- **Zero fake data**: No fabricated test scores or artificial placement statistics.

---

## 3. Approved Project Roadmap (Next Development Phase)
The remaining modules specified in the approved synopsis are reserved for Phases 2 & 3:
- **Phase 2**: Mock Tests & MCQ Question Bank (30+ questions across Quant, Reasoning, and Technical fundamentals with instant scoring and solution review).
- **Phase 2**: Company & Placement Drive Management (campus visit schedules, eligible branches, and cutoffs).
- **Phase 3**: Placement Application Pipeline (tracking through Applied, Shortlisted, Assessment, Interview, and Offer status).

---

## 4. How to Run

### Option A: Interactive Web Application (Vite / Dev Server)
Runs directly in the browser environment:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option B: Standalone Python 3 + Flask + SQLite Implementation
Located in `/telemetry_flask` for offline laptop demonstration to your college teacher:
```bash
cd telemetry_flask
pip install -r requirements.txt
python app.py
```
Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser.

---

## 5. First-Phase User Journey & Viva Demonstration Checklist
Demonstrate this sequence to your evaluation teacher:
1. **Register**: Create a new account at `/register` (demonstrate password matching and validation).
2. **Onboarding**: Observe automatic redirection to `/profile` to complete academic credentials.
3. **Dashboard**: Verify the personalized welcome banner, 0-task empty state, and 3 statistic cards.
4. **Add Tasks**: Navigate to Preparation Tracker and add syllabus tasks across *Aptitude*, *Technical Subjects*, and *Coding Practice*.
5. **Update Status**: Click a task checkbox to cycle it from *Pending* to *Completed*.
6. **Dashboard Sync**: Return to the Dashboard and show that Completed Tasks increments and Weekly Progress updates dynamically.
7. **Logout & Guard**: Sign out and demonstrate that protected pages cannot be accessed without logging in.
8. **Persistence**: Log back in and confirm that all records remain saved.
