# Telemetry — Placement Preparation & Tracking System

**Telemetry** is a centralized placement preparation and recruitment tracking web platform engineered for undergraduate engineering students. Built strictly using the approved B.Tech Computer Science & Engineering syllabus stack: **Python 3, Flask, HTML5, CSS3, Vanilla JavaScript, Jinja2 templates, and SQLite database**.

---

## 1. Project Overview & Approved Modules

Telemetry provides a complete student preparation workflow without relying on external APIs, synthetic bots, or complex cloud infrastructure:

1. **Student Authentication & Academic Profile**
   - Secure student registration, password confirmation, server-side validation, password hashing with PBKDF2/SHA-256 (`werkzeug.security`).
   - Profile management: College/University, Degree & Branch (CSE, IT, ECE, AI/DS), Semester, Graduation Year, CGPA, Technical Skills, Areas of Interest, and Preferred Role.
2. **Syllabus Preparation Tracker**
   - 7 core placement categories: *Aptitude, Logical Reasoning, Verbal Ability, Technical Subjects, Coding Practice, Communication, Interview Preparation*.
   - Full CRUD: Add task, edit details, delete, search, filter by category/status, and toggle status (*Pending → In Progress → Completed*).
   - Mathematically verified syllabus progress calculation: `(Completed Tasks ÷ Total Tasks) × 100`.
3. **Aptitude Quiz & Practice Test Engine**
   - 40 verified multiple-choice questions across *Quantitative Aptitude, Logical Reasoning, Verbal Ability, and Basic Technical Knowledge*.
   - Timed quiz-taking interface with live countdown timer, status palette, question navigator, and confirmation modal.
   - Server-side scoring engine computing Total Score, Percentage, Correct, Incorrect, Unanswered, Time Taken, and Accuracy (`Correct ÷ Answered × 100`).
   - Detailed Results Screen displaying question-by-question review with all 4 options, student choice, correct answer, and verified explanations.
   - Student attempt isolation (one student cannot view or tamper with another student's test records).
4. **Companies & Placement Drives Module**
   - Log campus and off-campus recruitment drive notices, company name, job designation, drive dates, application deadlines, eligibility criteria, required skills, and portal links.
   - Search, filter, edit, and delete operations.
5. **Placement Application Tracker**
   - Complete recruitment pipeline tracking through the 6 approved stages:
     `Applied` → `Shortlisted` → `Assessment` → `Interview` → `Selected` → `Not Selected`.
   - Link applications to logged placement drives with auto-filling.
   - Interactive stage status dropdowns with instant SQLite persistence.
6. **Real Placement Analysis & Reports**
   - Data-backed analytics calculated directly from database records:
     - Total Applications, Active Applications in pipeline, and Concluded outcomes.
     - Documented **Selection Rate**: `(Selected ÷ (Selected + Not Selected)) × 100`.
     - Stage breakdown distribution.
     - Category-wise quiz performance benchmarks.
     - Identified Weaker Topics (topics tested with accuracy < 65% in quiz history).
     - Upcoming drives and application deadlines.
7. **Dedicated Demo Mode (`/demo-login`)**
   - Instant evaluator access with a single click.
   - Automatically populates authentic sample student profile, tasks, quiz attempt, drives, and applications without creating duplicate records.

---

## 2. Directory Structure

```
telemetry_flask/
├── app.py                # Main Flask application with all routes, auth guards, & scoring engine
├── database.py           # SQLite connection, PRAGMA foreign_keys = ON, schema migrations
├── schema.sql            # SQLite schema (students, profiles, tasks, questions, attempts, drives, applications)
├── seed_questions.py     # Idempotent seeder with 40 placement MCQs and explanations
├── test_app.py           # Comprehensive automated test suite (15 unit/integration tests)
├── requirements.txt      # Python dependencies (Flask, Werkzeug, Jinja2, pytest)
├── static/
│   └── style.css         # Minimal Navy (#203B53), Teal (#398879), Amber (#DCA65A) styling
├── templates/
│   ├── base.html         # Base layout with responsive navigation, brand logo, and flash messages
│   ├── home.html         # Public landing page with feature cards and Demo button
│   ├── login.html        # Student sign-in form with one-click Demo launch
│   ├── register.html     # Registration form with input validation and password confirmation
│   ├── profile.html      # Academic profile form (CGPA, graduation year, skills, target role)
│   ├── dashboard.html    # Student dashboard with live metrics, today's checklist, and drive summaries
│   ├── tasks.html        # 7-category syllabus task tracker with filters, search, and status toggle
│   ├── mock_tests.html   # Practice Tests hub with category cards and student test history
│   ├── test_runner.html  # Timed MCQ test runner with live timer, question palette, and auto-submit
│   ├── test_result.html  # Dedicated quiz results scorecard with full solutions and explanations
│   ├── quiz_history.html # Past test attempts history with review links
│   ├── drives.html       # Placement drives noticeboard with search, skills, and deadlines
│   ├── applications.html # Application pipeline tracker with 6 stage statuses
│   └── analysis.html     # Real placement analysis, selection rate, and weaker topics
└── README.md             # Complete setup, execution, and demonstration guide
```

---

## 3. Local Setup & Running Instructions

### Prerequisites
- Python 3.8, 3.9, 3.10, 3.11, or 3.12 installed.
- SQLite3 (included in standard Python).

### Windows (Command Prompt / PowerShell)
1. Open terminal and navigate to the project directory:
   ```cmd
   cd telemetry_flask
   ```
2. Create and activate a Python virtual environment:
   ```cmd
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install dependencies:
   ```cmd
   pip install -r requirements.txt
   ```
4. Initialize database and seed MCQ question bank:
   ```cmd
   python database.py
   python seed_questions.py
   ```
5. Start the Flask application:
   ```cmd
   python app.py
   ```
6. Open your browser and navigate to:
   ```
   http://127.0.0.1:5000
   ```

### Linux / macOS (Bash / Zsh)
1. Navigate to the project directory:
   ```bash
   cd telemetry_flask
   ```
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Initialize the database and questions:
   ```bash
   python3 database.py
   python3 seed_questions.py
   ```
5. Launch the application:
   ```bash
   python3 app.py
   ```
6. Open browser at:
   ```
   http://127.0.0.1:5000
   ```

---

## 4. Running the Automated Test Suite

A comprehensive automated test suite is provided in `test_app.py`. Tests run against an isolated temporary SQLite database and verify all modules.

To execute tests:
```bash
# Using Python's standard unittest runner:
python3 -m unittest -v test_app.py

# Or using pytest:
pytest -v test_app.py
```

### Verified Test Cases (15/15 Passed):
- `test_registration_success`: Account created, input validated, password securely hashed.
- `test_registration_duplicate_rejected`: Duplicate email addresses rejected.
- `test_registration_password_mismatch`: Password confirmation mismatch flagged.
- `test_login_valid_and_invalid`: Correct credentials succeed; wrong credentials safely rejected.
- `test_logout_and_protected_routes`: Session invalidated upon logout; protected routes require auth.
- `test_demo_login_idempotent`: Demo student created with sample data; repeated visits do not duplicate records.
- `test_student_profile_update`: Academic details, CGPA, graduation year, and skills update persistently.
- `test_preparation_tasks_crud_and_calculations`: Add, toggle, delete tasks, and verify `(Completed ÷ Total) × 100`.
- `test_question_bank_integrity`: 40 verified questions with 4 options and valid answer indices.
- `test_quiz_submission_and_backend_scoring`: Backend calculates correct, incorrect, unanswered, percentage, and accuracy.
- `test_quiz_zero_answers_does_not_crash`: Unanswered test submissions handled gracefully.
- `test_quiz_attempt_student_isolation`: Student cannot access another student's quiz attempt.
- `test_placement_drives_crud`: Placement drives added, displayed, filtered, and deleted.
- `test_placement_applications_and_stage_transitions`: Applications tracked across 6 stages.
- `test_placement_analysis_calculations`: Selection rate and stage breakdown calculated correctly from SQLite.

---

## 5. Important Application Routes

| Route | Method | Access | Description |
|---|---|---|---|
| `/` | GET | Public | Landing page with placement feature overview and demo buttons |
| `/demo-login` | GET | Public | One-click demo login for evaluators with pre-seeded data |
| `/register` | GET, POST | Public | Student account registration with password confirmation |
| `/login` | GET, POST | Public | Student login with password hash validation |
| `/logout` | GET | Protected | Terminates session and redirects to home |
| `/dashboard` | GET | Protected | Executive dashboard with metrics, today's checklist, and drive summaries |
| `/profile` | GET, POST | Protected | Academic profile view and update (CGPA, degree, skills, target role) |
| `/tasks` | GET, POST | Protected | 7-category syllabus task tracker with filters and status cycle |
| `/mock-tests` | GET | Protected | Aptitude quiz hub with category cards and performance summary |
| `/mock-tests/take/<category>` | GET | Protected | Timed MCQ quiz runner with live countdown timer and question palette |
| `/mock-tests/submit` | POST | Protected | Backend scoring engine with SQLite answer validation |
| `/mock-tests/result/<id>` | GET | Protected | Dedicated scorecard with detailed review and full explanations |
| `/mock-tests/history` | GET | Protected | Past test attempts log with solution review links |
| `/drives` | GET, POST | Protected | Placement drives directory with search, criteria, and deadlines |
| `/applications` | GET, POST | Protected | Application pipeline tracker with 6 stage statuses |
| `/analysis` | GET | Protected | Data-backed placement analysis, selection rate, and weaker topics |
| `/resume` | GET, POST | Protected | Dual-input (PDF / Plain text) rule-based resume verification & section audit |

---

## 6. Semester Options & Resume Verification Modules

### A. All Eight B.Tech Semesters Supported
Students can select their academic semester across all four engineering years in numerical order:
- `Semester 1 — First Year`
- `Semester 2 — First Year`
- `Semester 3 — Second Year`
- `Semester 4 — Second Year`
- `Semester 5 — Third Year`
- `Semester 6 — Third Year`
- `Semester 7 — Fourth Year`
- `Semester 8 — Fourth Year`

Both client-side dropdowns and server-side routes validate that only Semesters 1 through 8 are accepted. Existing records are safely preserved without schema corruption.

### B. Dual-Method Resume Analysis & Section Audit
Students can verify their resume using two dedicated, mutually exclusive input methods:
1. **Option 1: Upload a PDF**
   - Accepts text-based PDF resumes up to 5 MB.
   - Extracts text directly without converting pages into images.
   - Scanned or non-selectable PDFs are detected and prompted to use Option 2.
2. **Option 2: Paste Resume Text**
   - Dedicated textarea supporting direct pasting (minimum 50 characters).
   - Operates independently without requiring a file upload.

**Transparent Rule-Based Extraction:**
- Identifies Contact Information (email, phone, profile URLs).
- Identifies Academic Education details.
- Matches Technical Skills against an approved placement keyword dictionary.
- Identifies Projects, Work Experience/Internships, and Certifications.
- Displays a Section Audit (Present / Not detected in the supplied text) without inventing credentials or hallucinating fake qualifications.

### C. Automated Test Verification
Run the comprehensive test suite verifying both features:
```bash
python3 test_fixes.py
```
All 13 unit tests covering semester persistence, bounds validation, PDF extraction, plain text parsing, oversized file rejection, and scanned PDF detection execute in under 0.1s.

---

## 7. End-to-End Demonstration Guide for Viva

1. **Start the app**: Run `python3 app.py` and open `http://127.0.0.1:5000`.
2. **Demo Mode**: Click **"⚡ Try Interactive Demo"** on the landing page or login screen to immediately load Aarav Sharma's sample workspace.
3. **Student Profile**: Navigate to **Profile**; select any semester from **Semester 1 — First Year** through **Semester 8 — Fourth Year**. Save and reload to verify persistence.
4. **Resume Verification**: Navigate to **Resume**; test Option 1 by uploading a PDF or Option 2 by pasting resume text. Review the section audit and extracted skills.
5. **Syllabus Tracker**: Navigate to **Syllabus Tracker**; add a task (e.g., *"Revise Graph Shortest Path algorithms"* in *Coding Practice*). Click status badge to cycle to *Completed*. Return to **Dashboard** to see the syllabus progress bar update.
6. **Practice Tests**: Navigate to **Practice Tests**; select *Quantitative Aptitude* or *Verbal Ability*. Answer questions, clear response, navigate via question buttons, and click **Submit Quiz**.
7. **Scorecard**: Review the immediate score, percentage, time taken, verified answers, and concise solution explanations.
8. **Placement Drives**: Navigate to **Placement Drives**; log a new recruitment notice (e.g. *Microsoft Cloud Trainee* with drive date and deadline).
9. **Application Tracker**: Navigate to **Applications**; add an application, link it to the drive, and change its stage to *Interview* or *Selected*.
10. **Placement Analysis**: Navigate to **Placement Analysis**; verify that total applications, selection rate, stage distribution, and weaker topics accurately reflect the database records.
11. **Student Isolation**: Log out, register a new account (e.g. `student2@college.edu`), and observe that the new account starts with clean, isolated records.
