import os
import uuid
import json
from functools import wraps
from datetime import datetime
from flask import (
    Flask, render_template, request, redirect, url_for, session, flash, jsonify, abort
)
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db, init_db
from resume_parser import (
    VALID_BTECH_SEMESTERS,
    validate_btech_semester,
    extract_text_from_pdf_bytes,
    analyze_resume_rule_based
)

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'telemetry_btech_cse_secret_2026')

# Initialize SQLite database schema and migrations on startup
with app.app_context():
    init_db()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please sign in to access your placement preparation workspace.', 'info')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# ----------------- PUBLIC ROUTES -----------------
@app.route('/')
def home():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('home.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        full_name = request.form.get('full_name', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')

        # Validations
        if not full_name or not email or not password:
            flash('All fields marked with an asterisk are required.', 'danger')
            return render_template('register.html')

        if len(password) < 6:
            flash('Password must be at least 6 characters long.', 'danger')
            return render_template('register.html')

        if password != confirm_password:
            flash('Passwords do not match. Please verify your entries.', 'danger')
            return render_template('register.html')

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM students WHERE email = ?", (email,))
        if cursor.fetchone():
            flash('An account with this email already exists. Please sign in.', 'warning')
            conn.close()
            return render_template('register.html')

        user_id = 'stu_' + str(uuid.uuid4())[:8]
        pwd_hash = generate_password_hash(password)

        cursor.execute(
            "INSERT INTO students (id, full_name, email, password_hash) VALUES (?, ?, ?, ?)",
            (user_id, full_name, email, pwd_hash)
        )
        conn.commit()
        conn.close()

        session['user_id'] = user_id
        session['user_name'] = full_name
        flash('Account registered successfully! Please set up your academic profile.', 'success')
        return redirect(url_for('profile', initial=1))

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')

        if not email or not password:
            flash('Please provide both your email address and password.', 'danger')
            return render_template('login.html')

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, full_name, password_hash FROM students WHERE email = ?", (email,))
        user = cursor.fetchone()
        conn.close()

        if not user or not check_password_hash(user['password_hash'], password):
            flash('Invalid email or password. Please verify your credentials and try again.', 'danger')
            return render_template('login.html')

        session['user_id'] = user['id']
        session['user_name'] = user['full_name']
        flash(f"Welcome back, {user['full_name']}!", 'success')
        return redirect(url_for('dashboard'))

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have successfully signed out of Telemetry.', 'info')
    return redirect(url_for('home'))

# ----------------- DEMO ACCOUNT & SEEDING ROUTE -----------------
@app.route('/demo-login')
@app.route('/seed-demo')
def demo_login():
    """
    Controlled Demo Login for faculty evaluators and quick demonstration.
    Initializes a dedicated demo student with rich sample records if not already created,
    sets up the session, and redirects to the student dashboard.
    """
    demo_email = 'demo.student@telemetry.edu'
    demo_name = 'Aarav Sharma (Demo Student)'
    demo_pass = 'Telemetry@2026'

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id, full_name FROM students WHERE email = ?", (demo_email,))
    row = cursor.fetchone()

    if not row:
        demo_id = 'stu_demo_2026'
        cursor.execute(
            "INSERT INTO students (id, full_name, email, password_hash) VALUES (?, ?, ?, ?)",
            (demo_id, demo_name, demo_email, generate_password_hash(demo_pass))
        )
    else:
        demo_id = row['id']

    # Ensure profile exists
    cursor.execute("SELECT user_id FROM student_profiles WHERE user_id = ?", (demo_id,))
    if not cursor.fetchone():
        cursor.execute("""
            INSERT INTO student_profiles (
                user_id, full_name, email, college_name, branch, semester, 
                graduation_year, cgpa, technical_skills, areas_of_interest, preferred_role
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            demo_id, demo_name, demo_email,
            'National Institute of Engineering & Technology', 'Computer Science & Engineering',
            'Semester 7 — Fourth Year', '2026', '8.65',
            'Python, Java, Data Structures, SQL, Flask, Git, Docker Basics',
            'Backend Engineering, Cloud Systems, Distributed Databases',
            'Graduate Software Engineer'
        ))

    # Ensure sample preparation tasks exist
    cursor.execute("SELECT COUNT(*) FROM preparation_tasks WHERE user_id = ?", (demo_id,))
    if cursor.fetchone()[0] == 0:
        tasks = [
            ('Revise Time & Work, Speed-Distance and Percentages formulas', 'Aptitude', 'Completed', '2026-11-05', 'Completed RS Aggarwal standard questions with speed shortcuts.'),
            ('Solve Binary Search Tree and Graph traversal problems', 'Coding Practice', 'In Progress', '2026-11-08', 'Practised DFS, BFS, and lowest common ancestor.'),
            ('Revise DBMS Normalization (1NF, 2NF, 3NF, BCNF) and ACID properties', 'Technical Subjects', 'Completed', '2026-11-02', 'Clarified transitive dependency rules.'),
            ('Prepare 90-second technical self-introduction and elevator pitch', 'Interview Preparation', 'Completed', '2026-11-01', 'Structured introduction focusing on B.Tech projects.'),
            ('Practice coding-decoding and seating arrangement reasoning puzzles', 'Logical Reasoning', 'Pending', '2026-11-12', 'Focus on circular table and linear row arrangements.'),
            ('Grammar revision: Subject-Verb agreement and sentence correction', 'Verbal Ability', 'In Progress', '2026-11-10', 'Reviewing third conditionals and idiom meanings.'),
        ]
        for t_title, t_cat, t_status, t_date, t_notes in tasks:
            tid = 'tsk_' + str(uuid.uuid4())[:8]
            cursor.execute("""
                INSERT INTO preparation_tasks (id, user_id, title, category, status, target_date, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (tid, demo_id, t_title, t_cat, t_status, t_date, t_notes))

    # Ensure sample quiz attempts exist
    cursor.execute("SELECT COUNT(*) FROM mock_test_attempts WHERE user_id = ?", (demo_id,))
    if cursor.fetchone()[0] == 0:
        cursor.execute("SELECT id, correct_answer FROM questions WHERE category = 'Quantitative Aptitude' LIMIT 10")
        qa_qs = cursor.fetchall()
        if qa_qs:
            q_ids = [q['id'] for q in qa_qs]
            answers = {}
            correct_cnt = 0
            for i, q in enumerate(qa_qs):
                if i < 8:
                    answers[q['id']] = q['correct_answer']
                    correct_cnt += 1
                else:
                    answers[q['id']] = (q['correct_answer'] + 1) % 4
            cursor.execute("""
                INSERT INTO mock_test_attempts (
                    id, user_id, category, score, total_questions, percentage,
                    correct_answers, incorrect_answers, unanswered, accuracy,
                    time_taken_seconds, question_ids_json, answers_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                'att_demo_qa_01', demo_id, 'Quantitative Aptitude', correct_cnt, len(q_ids),
                round((correct_cnt / len(q_ids)) * 100), correct_cnt, len(q_ids) - correct_cnt, 0,
                round((correct_cnt / len(q_ids)) * 100), 420, json.dumps(q_ids), json.dumps(answers)
            ))

    # Ensure sample placement drives exist
    cursor.execute("SELECT COUNT(*) FROM placement_drives WHERE user_id = ?", (demo_id,))
    if cursor.fetchone()[0] == 0:
        drives = [
            ('drv_demo_1', 'Tata Consultancy Services', 'Digital Innovator / Assistant Systems Engineer', '60%+ in 10th, 12th & B.Tech, 0 active backlogs', '2026-11-18', '2026-11-14', 'Python, Java, DSA, DBMS', 'https://nextstep.tcs.com/campus'),
            ('drv_demo_2', 'Infosys Technologies', 'Specialist Programmer (SP) / Systems Engineer', '65%+ or 6.5 CGPA throughout academics', '2026-11-25', '2026-11-20', 'Competitive Programming, Algorithms, SQL', 'College TPO registration mandatory before deadline.'),
            ('drv_demo_3', 'Amazon AWS', 'Cloud Support Associate Trainee', 'CGPA 7.0+, Strong networking & Linux fundamentals', '2026-12-04', '2026-11-28', 'Linux, TCP/IP, Python Scripting', 'Virtual assessment link will be sent directly by AWS recruiter.')
        ]
        for did, cname, jrole, elig, ddate, adeadline, rskills, notes in drives:
            cursor.execute("""
                INSERT INTO placement_drives (id, user_id, company_name, job_role, eligibility_criteria, drive_date, application_deadline, required_skills, link_or_notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (did, demo_id, cname, jrole, elig, ddate, adeadline, rskills, notes))

    # Ensure sample applications exist
    cursor.execute("SELECT COUNT(*) FROM placement_applications WHERE user_id = ?", (demo_id,))
    if cursor.fetchone()[0] == 0:
        apps = [
            ('app_demo_1', 'drv_demo_1', 'Tata Consultancy Services', 'Digital Innovator', '2026-10-15', 'Interview', 'Cleared Online Test with 82% score. Technical & HR rounds scheduled for Nov 18.'),
            ('app_demo_2', 'drv_demo_2', 'Infosys Technologies', 'Specialist Programmer', '2026-10-18', 'Assessment', 'Coding round scheduled on Infosys InfyTQ platform.'),
            ('app_demo_3', None, 'Cognizant Technology Solutions', 'GenC Elevate Trainee', '2026-10-05', 'Selected', 'Received official offer letter via College Placement Cell! CTC: 4.5 LPA.'),
            ('app_demo_4', None, 'Wipro Technologies', 'Project Engineer', '2026-09-28', 'Not Selected', 'Could not clear second technical round on System Design.')
        ]
        for aid, did, cname, jrole, app_date, astatus, anotes in apps:
            cursor.execute("""
                INSERT INTO placement_applications (id, user_id, company_drive_id, company_name, job_role, application_date, status, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (aid, demo_id, did, cname, jrole, app_date, astatus, anotes))

    conn.commit()
    conn.close()

    session['user_id'] = demo_id
    session['user_name'] = demo_name
    flash('Logged into Telemetry Demo Account. All modules populated with authentic sample data.', 'success')
    return redirect(url_for('dashboard'))

# ----------------- PROTECTED STUDENT ROUTES -----------------
@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        full_name = request.form.get('full_name', '').strip()
        college_name = request.form.get('college_name', '').strip()
        branch = request.form.get('branch', '').strip()
        semester = request.form.get('semester', '').strip()
        graduation_year = request.form.get('graduation_year', '').strip()
        cgpa = request.form.get('cgpa', '').strip()
        technical_skills = request.form.get('technical_skills', '').strip()
        areas_of_interest = request.form.get('areas_of_interest', '').strip()
        preferred_role = request.form.get('preferred_role', '').strip()

        if not full_name:
            flash('Student full name is required.', 'danger')
            return redirect(url_for('profile'))

        # Validate that only semester numbers 1 through 8 are accepted
        normalized_semester = validate_btech_semester(semester)
        if not normalized_semester:
            flash('Invalid semester selection. Only Semesters 1 through 8 are permitted.', 'danger')
            return redirect(url_for('profile'))

        semester = normalized_semester

        cursor.execute("SELECT user_id FROM student_profiles WHERE user_id = ?", (user_id,))
        exists = cursor.fetchone()

        if exists:
            cursor.execute("""
                UPDATE student_profiles 
                SET full_name = ?, college_name = ?, branch = ?, semester = ?, 
                    graduation_year = ?, cgpa = ?, technical_skills = ?, areas_of_interest = ?,
                    preferred_role = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            """, (full_name, college_name, branch, semester, graduation_year, cgpa, technical_skills, areas_of_interest, preferred_role, user_id))
        else:
            cursor.execute("SELECT email FROM students WHERE id = ?", (user_id,))
            student_row = cursor.fetchone()
            email = student_row['email'] if student_row else ''
            cursor.execute("""
                INSERT INTO student_profiles (
                    user_id, full_name, email, college_name, branch, semester,
                    graduation_year, cgpa, technical_skills, areas_of_interest, preferred_role
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (user_id, full_name, email, college_name, branch, semester, graduation_year, cgpa, technical_skills, areas_of_interest, preferred_role))

        conn.commit()
        session['user_name'] = full_name
        flash('Student academic profile updated successfully!', 'success')
        conn.close()
        return redirect(url_for('dashboard'))

    cursor.execute("SELECT * FROM student_profiles WHERE user_id = ?", (user_id,))
    prof = cursor.fetchone()
    conn.close()
    return render_template('profile.html', profile=prof, is_initial=request.args.get('initial') == '1')

@app.route('/dashboard')
@login_required
def dashboard():
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    # 1. Student profile
    cursor.execute("SELECT * FROM student_profiles WHERE user_id = ?", (user_id,))
    profile_data = cursor.fetchone()

    # 2. Preparation tasks metrics
    cursor.execute("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress
        FROM preparation_tasks 
        WHERE user_id = ?
    """, (user_id,))
    task_stats = cursor.fetchone()
    
    total_tasks = task_stats['total'] or 0
    completed_tasks = task_stats['completed'] or 0
    pending_tasks = task_stats['pending'] or 0
    in_progress_tasks = task_stats['in_progress'] or 0
    remaining_tasks = pending_tasks + in_progress_tasks
    progress_pct = round((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0

    # Recent preparation tasks
    cursor.execute("""
        SELECT * FROM preparation_tasks 
        WHERE user_id = ? 
        ORDER BY CASE WHEN status = 'Completed' THEN 1 ELSE 0 END, created_at DESC 
        LIMIT 4
    """, (user_id,))
    today_tasks = cursor.fetchall()

    # 3. Practice Test & Aptitude metrics
    cursor.execute("""
        SELECT 
            COUNT(*) as total_attempts,
            AVG(percentage) as avg_score,
            MAX(percentage) as best_score
        FROM mock_test_attempts
        WHERE user_id = ?
    """, (user_id,))
    q_stats = cursor.fetchone()
    total_quizzes = q_stats['total_attempts'] or 0
    avg_quiz_score = round(q_stats['avg_score']) if q_stats['avg_score'] is not None else 0
    best_quiz_score = q_stats['best_score'] or 0

    cursor.execute("""
        SELECT * FROM mock_test_attempts
        WHERE user_id = ?
        ORDER BY submitted_at DESC
        LIMIT 3
    """, (user_id,))
    recent_quizzes = cursor.fetchall()

    # 4. Placement Drives metrics
    cursor.execute("SELECT COUNT(*) FROM placement_drives WHERE user_id = ?", (user_id,))
    total_drives = cursor.fetchone()[0] or 0

    cursor.execute("""
        SELECT * FROM placement_drives 
        WHERE user_id = ? 
        ORDER BY drive_date ASC 
        LIMIT 3
    """, (user_id,))
    upcoming_drives = cursor.fetchall()

    # 5. Placement Applications metrics
    cursor.execute("""
        SELECT 
            COUNT(*) as total_apps,
            SUM(CASE WHEN status = 'Selected' THEN 1 ELSE 0 END) as selected_cnt,
            SUM(CASE WHEN status = 'Not Selected' THEN 1 ELSE 0 END) as rejected_cnt,
            SUM(CASE WHEN status IN ('Applied', 'Shortlisted', 'Assessment', 'Interview') THEN 1 ELSE 0 END) as active_cnt
        FROM placement_applications 
        WHERE user_id = ?
    """, (user_id,))
    app_stats = cursor.fetchone()
    total_apps = app_stats['total_apps'] or 0
    selected_apps = app_stats['selected_cnt'] or 0
    active_apps = app_stats['active_cnt'] or 0

    cursor.execute("""
        SELECT * FROM placement_applications 
        WHERE user_id = ? 
        ORDER BY updated_at DESC 
        LIMIT 4
    """, (user_id,))
    recent_applications = cursor.fetchall()

    conn.close()
    return render_template(
        'dashboard.html',
        profile=profile_data,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        pending_tasks=remaining_tasks,
        in_progress_tasks=in_progress_tasks,
        progress_pct=progress_pct,
        today_tasks=today_tasks,
        total_quizzes=total_quizzes,
        avg_quiz_score=avg_quiz_score,
        best_quiz_score=best_quiz_score,
        recent_quizzes=recent_quizzes,
        total_drives=total_drives,
        upcoming_drives=upcoming_drives,
        total_apps=total_apps,
        selected_apps=selected_apps,
        active_apps=active_apps,
        recent_applications=recent_applications
    )

# ----------------- PREPARATION TRACKER -----------------
@app.route('/tasks', methods=['GET', 'POST'])
@login_required
def tasks():
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        action = request.form.get('action')
        if action == 'add':
            title = request.form.get('title', '').strip()
            category = request.form.get('category', 'Aptitude')
            status = request.form.get('status', 'Pending')
            target_date = request.form.get('target_date', '').strip() or None
            notes = request.form.get('notes', '').strip() or None

            if title:
                task_id = 'tsk_' + str(uuid.uuid4())[:8]
                cursor.execute("""
                    INSERT INTO preparation_tasks (id, user_id, title, category, status, target_date, notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (task_id, user_id, title, category, status, target_date, notes))
                conn.commit()
                flash('Preparation task recorded in your syllabus tracker.', 'success')

        elif action == 'edit':
            task_id = request.form.get('task_id')
            title = request.form.get('title', '').strip()
            category = request.form.get('category', 'Aptitude')
            status = request.form.get('status', 'Pending')
            target_date = request.form.get('target_date', '').strip() or None
            notes = request.form.get('notes', '').strip() or None

            if task_id and title:
                cursor.execute("""
                    UPDATE preparation_tasks 
                    SET title = ?, category = ?, status = ?, target_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ? AND user_id = ?
                """, (title, category, status, target_date, notes, task_id, user_id))
                conn.commit()
                flash('Preparation task updated.', 'success')

        elif action == 'toggle':
            task_id = request.form.get('task_id')
            cursor.execute("SELECT status FROM preparation_tasks WHERE id = ? AND user_id = ?", (task_id, user_id))
            row = cursor.fetchone()
            if row:
                next_status = 'In Progress' if row['status'] == 'Pending' else ('Completed' if row['status'] == 'In Progress' else 'Pending')
                cursor.execute("UPDATE preparation_tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (next_status, task_id))
                conn.commit()

        elif action == 'delete':
            task_id = request.form.get('task_id')
            cursor.execute("DELETE FROM preparation_tasks WHERE id = ? AND user_id = ?", (task_id, user_id))
            conn.commit()
            flash('Preparation task removed.', 'info')

    # Category and Status filters
    category_filter = request.args.get('category', 'All')
    status_filter = request.args.get('status', 'All')
    search_query = request.args.get('q', '').strip()

    query = "SELECT * FROM preparation_tasks WHERE user_id = ?"
    params = [user_id]

    if category_filter != 'All':
        query += " AND category = ?"
        params.append(category_filter)
    if status_filter != 'All':
        query += " AND status = ?"
        params.append(status_filter)
    if search_query:
        query += " AND (title LIKE ? OR notes LIKE ?)"
        params.extend([f"%{search_query}%", f"%{search_query}%"])

    query += " ORDER BY CASE WHEN status = 'Completed' THEN 1 ELSE 0 END, created_at DESC"
    cursor.execute(query, params)
    task_list = cursor.fetchall()

    # Category completion stats
    cursor.execute("""
        SELECT 
            category,
            COUNT(*) as total,
            SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed
        FROM preparation_tasks 
        WHERE user_id = ?
        GROUP BY category
    """, (user_id,))
    cat_stats = {row['category']: {'total': row['total'], 'completed': row['completed']} for row in cursor.fetchall()}

    conn.close()

    return render_template(
        'tasks.html',
        tasks=task_list,
        selected_category=category_filter,
        selected_status=status_filter,
        search_query=search_query,
        cat_stats=cat_stats
    )

# ----------------- APTITUDE QUIZ & PRACTICE TESTS -----------------
@app.route('/mock-tests')
@login_required
def mock_tests():
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM mock_test_attempts 
        WHERE user_id = ? 
        ORDER BY submitted_at DESC
    """, (user_id,))
    attempts = cursor.fetchall()
    conn.close()

    total_attempts = len(attempts)
    avg_score = round(sum(a['percentage'] for a in attempts) / total_attempts) if total_attempts > 0 else 0
    best_score = max((a['percentage'] for a in attempts), default=0)

    categories = [
        {
            'name': 'Quantitative Aptitude',
            'desc': 'Percentages, Ratios, Time & Work, Speed & Distance, Profit & Loss, Averages, Number Systems.',
            'topics': '10 Practice MCQs'
        },
        {
            'name': 'Logical Reasoning',
            'desc': 'Number Series, Coding-Decoding, Syllogisms, Clocks, Blood Relations, Direction Sense.',
            'topics': '10 Practice MCQs'
        },
        {
            'name': 'Verbal Ability',
            'desc': 'Subject-Verb Agreement, Synonyms & Antonyms, Sentence Correction, Prepositions & Inference.',
            'topics': '10 Practice MCQs'
        },
        {
            'name': 'Basic Technical Knowledge',
            'desc': 'Data Structures, Algorithms, DBMS Normalization, OS Deadlocks & Computer Networks.',
            'topics': '10 Practice MCQs'
        }
    ]

    return render_template(
        'mock_tests.html',
        attempts=attempts,
        total_attempts=total_attempts,
        avg_score=avg_score,
        best_score=best_score,
        categories=categories
    )

@app.route('/mock-tests/take/<category>')
@login_required
def run_test(category):
    try:
        count = int(request.args.get('count', 10))
    except (ValueError, TypeError):
        count = 10
    count = max(1, min(count, 50))
    difficulty = request.args.get('difficulty', 'All')

    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT id, category, topic, difficulty, question, options_json FROM questions WHERE category = ?"
    params = [category]
    if difficulty and difficulty != 'All':
        query += " AND difficulty = ?"
        params.append(difficulty)
    query += " ORDER BY RANDOM() LIMIT ?"
    params.append(count)

    cursor.execute(query, params)
    raw_questions = cursor.fetchall()

    # Fallback to any difficulty if specific level had 0 questions
    if not raw_questions and difficulty != 'All':
        cursor.execute("SELECT id, category, topic, difficulty, question, options_json FROM questions WHERE category = ? ORDER BY RANDOM() LIMIT ?", (category, count))
        raw_questions = cursor.fetchall()

    conn.close()

    if not raw_questions:
        flash(f"No practice questions found for category: {category}", "error")
        return redirect(url_for('mock_tests'))

    questions = []
    for q in raw_questions:
        questions.append({
            'id': q['id'],
            'category': q['category'],
            'topic': q['topic'],
            'difficulty': q['difficulty'],
            'question': q['question'],
            'options': json.loads(q['options_json'])
        })

    return render_template('test_runner.html', category=category, questions=questions, count=len(questions))

@app.route('/mock-tests/submit', methods=['POST'])
@login_required
def submit_test():
    user_id = session['user_id']
    category = request.form.get('category', 'Quantitative Aptitude')
    question_ids = request.form.getlist('question_ids')

    if not question_ids:
        flash("No questions were submitted for evaluation.", "error")
        return redirect(url_for('mock_tests'))

    # Time taken in seconds from client timer
    try:
        time_taken_seconds = int(request.form.get('time_taken_seconds', 0))
    except (ValueError, TypeError):
        time_taken_seconds = 0
    time_taken_seconds = max(0, min(time_taken_seconds, 15 * 60))

    conn = get_db()
    cursor = conn.cursor()

    # Always fetch correct answers from SQLite backend - never trust client
    placeholders = ','.join('?' for _ in question_ids)
    cursor.execute(f"""
        SELECT id, category, topic, difficulty, question, options_json, correct_answer, explanation 
        FROM questions 
        WHERE id IN ({placeholders})
    """, question_ids)
    q_map = {row['id']: row for row in cursor.fetchall()}

    total_questions = len(question_ids)
    correct_answers = 0
    answered_questions = 0
    answers = {}

    for qid in question_ids:
        q_row = q_map.get(qid)
        if not q_row:
            continue
        ans_str = request.form.get(f'answer_{qid}')
        if ans_str is not None and ans_str.strip() != '':
            try:
                user_choice = int(ans_str)
                answers[qid] = user_choice
                answered_questions += 1
                if user_choice == q_row['correct_answer']:
                    correct_answers += 1
            except ValueError:
                answers[qid] = None
        else:
            answers[qid] = None

    unanswered = total_questions - answered_questions
    incorrect_answers = answered_questions - correct_answers
    score = correct_answers
    percentage = round((correct_answers / total_questions) * 100) if total_questions > 0 else 0
    accuracy = round((correct_answers / answered_questions) * 100) if answered_questions > 0 else 0

    attempt_id = 'att_' + str(uuid.uuid4())[:12]

    cursor.execute("""
        INSERT INTO mock_test_attempts (
            id, user_id, category, score, total_questions, percentage,
            correct_answers, incorrect_answers, unanswered, accuracy,
            time_taken_seconds, question_ids_json, answers_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        attempt_id, user_id, category, score, total_questions, percentage,
        correct_answers, incorrect_answers, unanswered, accuracy,
        time_taken_seconds, json.dumps(question_ids), json.dumps(answers)
    ))
    conn.commit()
    conn.close()

    flash(f"Quiz completed! Score: {score}/{total_questions} ({percentage}%)", "success")
    # Post/Redirect/Get pattern ensures refresh works cleanly and prevents duplicate submissions
    return redirect(url_for('view_test_result', attempt_id=attempt_id))

@app.route('/mock-tests/result/<attempt_id>')
@login_required
def view_test_result(attempt_id):
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    # Enforce student access control (attempt must belong to logged-in student)
    cursor.execute("""
        SELECT * FROM mock_test_attempts 
        WHERE id = ? AND user_id = ?
    """, (attempt_id, user_id))
    attempt = cursor.fetchone()

    if not attempt:
        conn.close()
        flash("Assessment attempt not found or access unauthorized.", "error")
        return redirect(url_for('mock_tests'))

    # Load question IDs and answers
    try:
        q_ids = json.loads(attempt['question_ids_json']) if attempt['question_ids_json'] else []
    except (ValueError, TypeError):
        q_ids = []

    try:
        answers = json.loads(attempt['answers_json']) if attempt['answers_json'] else {}
    except (ValueError, TypeError):
        answers = {}

    if not q_ids and answers:
        q_ids = list(answers.keys())

    placeholders = ','.join('?' for _ in q_ids) if q_ids else "''"
    if q_ids:
        cursor.execute(f"""
            SELECT id, category, topic, difficulty, question, options_json, correct_answer, explanation 
            FROM questions 
            WHERE id IN ({placeholders})
        """, q_ids)
        q_map = {row['id']: row for row in cursor.fetchall()}
    else:
        q_map = {}

    conn.close()

    detailed = []
    for qid in q_ids:
        q_row = q_map.get(qid)
        if not q_row:
            continue
        user_choice = answers.get(qid)
        is_unanswered = (user_choice is None)
        is_correct = (not is_unanswered and user_choice == q_row['correct_answer'])
        detailed.append({
            'id': qid,
            'topic': q_row['topic'],
            'difficulty': q_row['difficulty'],
            'question': q_row['question'],
            'options': json.loads(q_row['options_json']),
            'user_choice': user_choice,
            'correct_answer': q_row['correct_answer'],
            'is_correct': is_correct,
            'is_unanswered': is_unanswered,
            'explanation': q_row['explanation']
        })

    # Performance message
    pct = attempt['percentage']
    if pct >= 90:
        perf_level = "Outstanding"
        perf_message = "Outstanding Performance! You demonstrate top-tier campus placement readiness with high accuracy."
    elif pct >= 75:
        perf_level = "Very Good"
        perf_message = "Very Good Job! Strong conceptual understanding and command over question patterns."
    elif pct >= 60:
        perf_level = "Proficient"
        perf_message = "Good Effort! You meet typical screening cutoffs, but revising missed topics will build speed."
    elif pct >= 40:
        perf_level = "Needs Practice"
        perf_message = "Needs Practice. Go through the verified explanations below to clarify key formulas and rules."
    else:
        perf_level = "Revision Required"
        perf_message = "Focused Revision Required. Revisit core concepts, then retake the practice assessment."

    # Format time taken
    seconds = attempt['time_taken_seconds'] or 0
    mins = seconds // 60
    secs = seconds % 60
    time_formatted = f"{mins:02d}:{secs:02d}"

    return render_template(
        'test_result.html',
        attempt=attempt,
        detailed=detailed,
        perf_message=perf_message,
        perf_level=perf_level,
        time_formatted=time_formatted
    )

@app.route('/mock-tests/history')
@login_required
def quiz_history():
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM mock_test_attempts 
        WHERE user_id = ? 
        ORDER BY submitted_at DESC
    """, (user_id,))
    attempts = cursor.fetchall()
    conn.close()

    total_attempts = len(attempts)
    avg_score = round(sum(a['percentage'] for a in attempts) / total_attempts) if total_attempts > 0 else 0
    best_score = max((a['percentage'] for a in attempts), default=0)

    return render_template(
        'quiz_history.html',
        attempts=attempts,
        total_attempts=total_attempts,
        avg_score=avg_score,
        best_score=best_score
    )

# ----------------- PLACEMENT DRIVES MODULE -----------------
@app.route('/drives', methods=['GET', 'POST'])
@login_required
def drives():
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        action = request.form.get('action')
        if action == 'add':
            company_name = request.form.get('company_name', '').strip()
            job_role = request.form.get('job_role', '').strip()
            eligibility_criteria = request.form.get('eligibility_criteria', '').strip()
            drive_date = request.form.get('drive_date', '').strip()
            application_deadline = request.form.get('application_deadline', '').strip() or None
            required_skills = request.form.get('required_skills', '').strip() or None
            link_or_notes = request.form.get('link_or_notes', '').strip() or None

            if company_name and job_role and drive_date:
                drive_id = 'drv_' + str(uuid.uuid4())[:8]
                cursor.execute("""
                    INSERT INTO placement_drives (
                        id, user_id, company_name, job_role, eligibility_criteria,
                        drive_date, application_deadline, required_skills, link_or_notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (drive_id, user_id, company_name, job_role, eligibility_criteria, drive_date, application_deadline, required_skills, link_or_notes))
                conn.commit()
                flash('Placement drive notice logged successfully.', 'success')

        elif action == 'edit':
            drive_id = request.form.get('drive_id')
            company_name = request.form.get('company_name', '').strip()
            job_role = request.form.get('job_role', '').strip()
            eligibility_criteria = request.form.get('eligibility_criteria', '').strip()
            drive_date = request.form.get('drive_date', '').strip()
            application_deadline = request.form.get('application_deadline', '').strip() or None
            required_skills = request.form.get('required_skills', '').strip() or None
            link_or_notes = request.form.get('link_or_notes', '').strip() or None

            if drive_id and company_name and job_role and drive_date:
                cursor.execute("""
                    UPDATE placement_drives
                    SET company_name = ?, job_role = ?, eligibility_criteria = ?,
                        drive_date = ?, application_deadline = ?, required_skills = ?, link_or_notes = ?
                    WHERE id = ? AND user_id = ?
                """, (company_name, job_role, eligibility_criteria, drive_date, application_deadline, required_skills, link_or_notes, drive_id, user_id))
                conn.commit()
                flash('Placement drive details updated.', 'success')

        elif action == 'delete':
            drive_id = request.form.get('drive_id')
            cursor.execute("DELETE FROM placement_drives WHERE id = ? AND user_id = ?", (drive_id, user_id))
            conn.commit()
            flash('Placement drive record removed.', 'info')

    search_query = request.args.get('q', '').strip()
    query = "SELECT * FROM placement_drives WHERE user_id = ?"
    params = [user_id]

    if search_query:
        query += " AND (company_name LIKE ? OR job_role LIKE ? OR required_skills LIKE ?)"
        params.extend([f"%{search_query}%", f"%{search_query}%", f"%{search_query}%"])

    query += " ORDER BY drive_date ASC"
    cursor.execute(query, params)
    drive_list = cursor.fetchall()
    conn.close()

    return render_template('drives.html', drives=drive_list, search_query=search_query)

# ----------------- PLACEMENT APPLICATION TRACKER -----------------
@app.route('/applications', methods=['GET', 'POST'])
@login_required
def applications():
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        action = request.form.get('action')
        if action == 'add':
            company_name = request.form.get('company_name', '').strip()
            job_role = request.form.get('job_role', '').strip()
            application_date = request.form.get('application_date', '').strip()
            status = request.form.get('status', 'Applied')
            notes = request.form.get('notes', '').strip() or None
            company_drive_id = request.form.get('company_drive_id', '').strip() or None

            if company_name and job_role and application_date:
                app_id = 'app_' + str(uuid.uuid4())[:8]
                cursor.execute("""
                    INSERT INTO placement_applications (
                        id, user_id, company_drive_id, company_name, job_role, application_date, status, notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (app_id, user_id, company_drive_id, company_name, job_role, application_date, status, notes))
                conn.commit()
                flash('Placement application tracked successfully.', 'success')

        elif action == 'admin_status_update':
            app_id = request.form.get('app_id')
            new_status = request.form.get('status')
            admin_note = request.form.get('admin_note', '').strip() or None
            allowed_statuses = ['Saved', 'Applied', 'Assessment', 'Interview', 'Shortlisted', 'Selected', 'Rejected', 'Offer Received', 'Not Selected']
            if app_id and new_status in allowed_statuses:
                cursor.execute("SELECT company_name, job_role FROM placement_applications WHERE id = ? AND user_id = ?", (app_id, user_id))
                app_row = cursor.fetchone()
                if app_row:
                    cursor.execute("""
                        UPDATE placement_applications
                        SET status = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ? AND user_id = ?
                    """, (new_status, app_id, user_id))
                    notif_id = 'ntf_' + str(uuid.uuid4())[:8]
                    cursor.execute("""
                        INSERT INTO student_notifications (
                            id, user_id, application_id, company_name, job_role, title, message, status_updated_to, admin_note
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        notif_id, user_id, app_id, app_row['company_name'], app_row['job_role'],
                        f"Official Status Update: {new_status}",
                        f"Your application for {app_row['job_role']} at {app_row['company_name']} has been moved to {new_status}.",
                        new_status, admin_note
                    ))
                    conn.commit()
                    flash(f'Official status updated to {new_status} and notification created for student.', 'success')

        elif action == 'update_status':
            app_id = request.form.get('app_id')
            new_status = request.form.get('status')
            if app_id and new_status in ['Saved', 'Applied']:
                cursor.execute("""
                    UPDATE placement_applications
                    SET status = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ? AND user_id = ?
                """, (new_status, app_id, user_id))
                conn.commit()
                flash(f'Application state updated to {new_status}.', 'success')
            elif app_id and new_status in ['Shortlisted', 'Assessment', 'Interview', 'Selected', 'Rejected', 'Offer Received']:
                # Ordinary students cannot self-promote to employer-controlled statuses
                cursor.execute("SELECT status FROM placement_applications WHERE id = ? AND user_id = ?", (app_id, user_id))
                current = cursor.fetchone()
                flash('Employer-controlled statuses can only be recorded through the authorized Campus TPO action.', 'error')

        elif action == 'edit':
            app_id = request.form.get('app_id')
            company_name = request.form.get('company_name', '').strip()
            job_role = request.form.get('job_role', '').strip()
            application_date = request.form.get('application_date', '').strip()
            status = request.form.get('status', 'Applied')
            notes = request.form.get('notes', '').strip() or None

            if app_id and company_name and job_role:
                cursor.execute("""
                    UPDATE placement_applications
                    SET company_name = ?, job_role = ?, application_date = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ? AND user_id = ?
                """, (company_name, job_role, application_date, status, notes, app_id, user_id))
                conn.commit()
                flash('Application record updated.', 'success')

        elif action == 'delete':
            app_id = request.form.get('app_id')
            cursor.execute("DELETE FROM placement_applications WHERE id = ? AND user_id = ?", (app_id, user_id))
            conn.commit()
            flash('Placement application removed.', 'info')

    status_filter = request.args.get('status', 'All')
    search_query = request.args.get('q', '').strip()

    query = "SELECT * FROM placement_applications WHERE user_id = ?"
    params = [user_id]

    if status_filter != 'All':
        query += " AND status = ?"
        params.append(status_filter)
    if search_query:
        query += " AND (company_name LIKE ? OR job_role LIKE ? OR notes LIKE ?)"
        params.extend([f"%{search_query}%", f"%{search_query}%", f"%{search_query}%"])

    query += " ORDER BY updated_at DESC"
    cursor.execute(query, params)
    app_list = cursor.fetchall()

    # Get user's drives for dropdown linking
    cursor.execute("SELECT id, company_name, job_role FROM placement_drives WHERE user_id = ? ORDER BY company_name ASC", (user_id,))
    available_drives = cursor.fetchall()

    conn.close()

    return render_template(
        'applications.html',
        applications=app_list,
        drives=available_drives,
        selected_status=status_filter,
        search_query=search_query
    )

# ----------------- REAL PLACEMENT ANALYSIS -----------------
@app.route('/analysis')
@login_required
def analysis():
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    # 1. Application Counts & Selection Rate
    cursor.execute("""
        SELECT 
            COUNT(*) as total_apps,
            SUM(CASE WHEN status IN ('Applied', 'Shortlisted', 'Assessment', 'Interview') THEN 1 ELSE 0 END) as active_apps,
            SUM(CASE WHEN status = 'Selected' THEN 1 ELSE 0 END) as selected_apps,
            SUM(CASE WHEN status = 'Not Selected' THEN 1 ELSE 0 END) as rejected_apps,
            SUM(CASE WHEN status = 'Assessment' THEN 1 ELSE 0 END) as assessment_apps,
            SUM(CASE WHEN status = 'Interview' THEN 1 ELSE 0 END) as interview_apps
        FROM placement_applications 
        WHERE user_id = ?
    """, (user_id,))
    app_row = cursor.fetchone()

    total_apps = app_row['total_apps'] or 0
    active_apps = app_row['active_apps'] or 0
    selected_apps = app_row['selected_apps'] or 0
    rejected_apps = app_row['rejected_apps'] or 0
    assessment_apps = app_row['assessment_apps'] or 0
    interview_apps = app_row['interview_apps'] or 0

    resolved_apps = selected_apps + rejected_apps
    selection_rate = round((selected_apps / resolved_apps) * 100) if resolved_apps > 0 else 0

    # Stage breakdown
    cursor.execute("""
        SELECT status, COUNT(*) as count 
        FROM placement_applications 
        WHERE user_id = ? 
        GROUP BY status
    """, (user_id,))
    stage_counts = {row['status']: row['count'] for row in cursor.fetchall()}

    # 2. Preparation Task Stats
    cursor.execute("""
        SELECT 
            COUNT(*) as total_tasks,
            SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks
        FROM preparation_tasks 
        WHERE user_id = ?
    """, (user_id,))
    task_row = cursor.fetchone()
    total_tasks = task_row['total_tasks'] or 0
    completed_tasks = task_row['completed_tasks'] or 0
    prep_pct = round((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0

    # 3. Quiz Performance & Weaker Topics
    cursor.execute("""
        SELECT 
            COUNT(*) as total_attempts,
            AVG(percentage) as avg_score,
            MAX(percentage) as best_score
        FROM mock_test_attempts 
        WHERE user_id = ?
    """, (user_id,))
    q_row = cursor.fetchone()
    total_quizzes = q_row['total_attempts'] or 0
    avg_quiz_score = round(q_row['avg_score']) if q_row['avg_score'] is not None else 0
    best_quiz_score = q_row['best_score'] or 0

    # Category breakdown
    cursor.execute("""
        SELECT 
            category,
            COUNT(*) as attempts_count,
            AVG(percentage) as cat_avg,
            MAX(percentage) as cat_best
        FROM mock_test_attempts 
        WHERE user_id = ? 
        GROUP BY category
    """, (user_id,))
    cat_quiz_stats = cursor.fetchall()

    # Identify weaker topics (analyzing submitted questions)
    cursor.execute("SELECT answers_json, question_ids_json FROM mock_test_attempts WHERE user_id = ?", (user_id,))
    attempts_data = cursor.fetchall()

    topic_accuracy = {}
    for att in attempts_data:
        try:
            answers = json.loads(att['answers_json']) if att['answers_json'] else {}
            qids = json.loads(att['question_ids_json']) if att['question_ids_json'] else []
            if not qids and answers:
                qids = list(answers.keys())
            
            if qids:
                ph = ','.join('?' for _ in qids)
                cursor.execute(f"SELECT id, topic, correct_answer FROM questions WHERE id IN ({ph})", qids)
                for q in cursor.fetchall():
                    topic = q['topic']
                    if topic not in topic_accuracy:
                        topic_accuracy[topic] = {'total': 0, 'correct': 0}
                    topic_accuracy[topic]['total'] += 1
                    user_ans = answers.get(q['id'])
                    if user_ans is not None and user_ans == q['correct_answer']:
                        topic_accuracy[topic]['correct'] += 1
        except Exception:
            continue

    weaker_topics = []
    for topic, data in topic_accuracy.items():
        if data['total'] >= 1:
            acc = round((data['correct'] / data['total']) * 100)
            if acc < 65:
                weaker_topics.append({'topic': topic, 'accuracy': acc, 'tested': data['total']})
    weaker_topics.sort(key=lambda x: x['accuracy'])

    # 4. Upcoming placement drives
    cursor.execute("SELECT COUNT(*) FROM placement_drives WHERE user_id = ?", (user_id,))
    total_drives = cursor.fetchone()[0] or 0

    cursor.execute("""
        SELECT * FROM placement_drives 
        WHERE user_id = ? 
        ORDER BY drive_date ASC 
        LIMIT 5
    """, (user_id,))
    upcoming_drives = cursor.fetchall()

    conn.close()

    return render_template(
        'analysis.html',
        total_apps=total_apps,
        active_apps=active_apps,
        selected_apps=selected_apps,
        rejected_apps=rejected_apps,
        assessment_apps=assessment_apps,
        interview_apps=interview_apps,
        resolved_apps=resolved_apps,
        selection_rate=selection_rate,
        stage_counts=stage_counts,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        prep_pct=prep_pct,
        total_quizzes=total_quizzes,
        avg_quiz_score=avg_quiz_score,
        best_quiz_score=best_quiz_score,
        cat_quiz_stats=cat_quiz_stats,
        weaker_topics=weaker_topics[:5],
        total_drives=total_drives,
        upcoming_drives=upcoming_drives
    )

# ----------------- LIVE PLACEMENT OPPORTUNITIES & ELIGIBILITY MATCHING -----------------
def calculate_job_match(profile, job):
    if not profile or not profile['cgpa']:
        return {'status': 'Uncertain', 'reason': 'Academic profile CGPA not provided.', 'match_score': 50}
    try:
        student_cgpa = float(profile['cgpa'])
    except ValueError:
        student_cgpa = 0.0

    min_cgpa = float(job['min_cgpa'] or 6.0)
    if student_cgpa < min_cgpa:
        return {'status': 'Not Eligible', 'reason': f'CGPA {student_cgpa} is below minimum requirement {min_cgpa}', 'match_score': 30}

    student_skills = [s.strip().lower() for s in (profile['technical_skills'] or '').split(',') if s.strip()]
    job_skills = [s.strip().lower() for s in (job['required_skills'] or '').split(',') if s.strip()]
    
    if not job_skills:
        match_score = 75
    else:
        matched = sum(1 for js in job_skills if any(js in ss or ss in js for ss in student_skills))
        match_score = round((matched / len(job_skills)) * 100)
        match_score = max(match_score, 50)

    return {'status': 'Eligible', 'reason': '', 'match_score': match_score}

@app.route('/jobs')
@login_required
def jobs():
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    # Ensure sample job opportunities exist for demo / new students
    cursor.execute("SELECT COUNT(*) FROM job_opportunities WHERE user_id = ?", (user_id,))
    if cursor.fetchone()[0] == 0:
        sample_jobs = [
            ('job_1', user_id, 'Google', 'Software Engineer (L3)', 'Design, develop, and scale core distributed backend infrastructure and high-throughput microservices.', 'Bangalore / Hyderabad', '₹28 LPA', 'Full-Time', 'B.Tech / B.E.', 'Computer Science', 'Computer Science & Engineering', 8.0, 0, '2026', 'Python, Java, Data Structures, Algorithms, Git', '2026-11-20', '2026-10-25', 'Online Assessment, 2x Technical Rounds, HR Interview', 'https://careers.google.com', 'Authorized Campus Feed', 1),
            ('job_2', user_id, 'Microsoft', 'Software Developer (SDE)', 'Build next-generation cloud services and Azure distributed platforms with high reliability.', 'Noida / Bangalore', '₹24 LPA', 'Full-Time', 'B.Tech / M.Tech', 'CSE / ECE / IT', 'Computer Science & Engineering', 7.5, 0, '2026', 'C++, C#, Azure, Distributed Systems, SQL', '2026-11-25', '2026-10-26', 'Coding Test, System Design, HR', 'https://careers.microsoft.com', 'Direct University Portal', 0),
            ('job_3', user_id, 'Amazon AWS', 'Cloud Support Associate Trainee', 'Provide world-class technical support and cloud solutions for global enterprise customers.', 'Bangalore', '₹22 LPA', 'Full-Time', 'B.Tech', 'All Branches', 'Computer Science & Engineering', 7.0, 0, '2026', 'Linux, TCP/IP Networking, Python Scripting, SQL', '2026-12-02', '2026-10-28', 'Online Aptitude & Technical MCQs, 2x Interviews', 'https://amazon.jobs', 'Campus Placement Cell', 0),
            ('job_4', user_id, 'Tata Consultancy Services', 'Digital Innovator', 'Build enterprise applications using modern Java, Python, and cloud frameworks.', 'Pan India', '₹7.2 LPA', 'Full-Time', 'B.Tech', 'All Engineering', 'Computer Science & Engineering', 6.5, 0, '2026', 'Java, Python, SQL, HTML/CSS, Git', '2026-11-15', '2026-10-20', 'TCS NQT Assessment, Technical & HR', 'https://nextstep.tcs.com', 'TCS iON Portal', 1),
            ('job_5', user_id, 'Infosys', 'Specialist Programmer (SP)', 'Solve complex algorithmic challenges and develop high-performance software modules.', 'Mysore / Bangalore', '₹9.5 LPA', 'Full-Time', 'B.Tech / B.E.', 'CSE / IT', 'Computer Science & Engineering', 7.0, 0, '2026', 'Competitive Programming, Algorithms, Data Structures, Java', '2026-11-22', '2026-10-22', 'HackWithInfy Coding Rounds, Interview', 'https://infytq.infosys.com', 'InfyTQ Feed', 0),
            ('job_6', user_id, 'Deloitte USI', 'Analyst - Technology', 'Consult and engineer secure enterprise technology solutions for Fortune 500 clients.', 'Hyderabad / Mumbai', '₹6.5 LPA', 'Full-Time', 'B.Tech', 'All Branches', 'Computer Science & Engineering', 6.0, 0, '2026', 'SQL, Python, Communication, Problem Solving', '2026-11-30', '2026-10-24', 'Aptitude Test, Group Discussion, Partner Interview', 'https://deloitte.com', 'Campus Partner', 0)
        ]
        for j in sample_jobs:
            cursor.execute("""
                INSERT OR IGNORE INTO job_opportunities (
                    id, user_id, company_name, job_role, job_description, location, salary, job_type,
                    required_qualification, degree, branch, min_cgpa, max_backlogs, graduation_year,
                    required_skills, application_deadline, posting_date, selection_rounds, application_url,
                    source_info, is_bookmarked
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, j)
        conn.commit()

    search_query = request.args.get('q', '').strip()
    current_filter = request.args.get('filter', 'all')

    cursor.execute("SELECT * FROM student_profiles WHERE user_id = ?", (user_id,))
    profile = cursor.fetchone()

    query = "SELECT * FROM job_opportunities WHERE user_id = ?"
    params = [user_id]

    if search_query:
        query += " AND (company_name LIKE ? OR job_role LIKE ? OR required_skills LIKE ?)"
        term = f"%{search_query}%"
        params.extend([term, term, term])

    query += " ORDER BY application_deadline ASC"
    cursor.execute(query, params)
    raw_jobs = cursor.fetchall()
    conn.close()

    jobs_list = []
    for job in raw_jobs:
        match = calculate_job_match(profile, job)
        if current_filter == 'eligible' and match['status'] != 'Eligible':
            continue
        if current_filter == 'bookmarked' and not job['is_bookmarked']:
            continue
        jobs_list.append({'job': job, 'match': match})

    return render_template('jobs.html', jobs=jobs_list, search_query=search_query, current_filter=current_filter)

@app.route('/jobs/add', methods=['POST'])
@login_required
def add_job():
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    job_id = 'job_' + str(uuid.uuid4())[:8]
    cursor.execute("""
        INSERT INTO job_opportunities (
            id, user_id, company_name, job_role, job_description, location, salary, job_type,
            required_qualification, degree, branch, min_cgpa, max_backlogs, graduation_year,
            required_skills, application_deadline, posting_date, selection_rounds, application_url,
            source_info, is_bookmarked
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    """, (
        job_id, user_id,
        request.form.get('company_name'),
        request.form.get('job_role'),
        request.form.get('job_description'),
        request.form.get('location'),
        request.form.get('salary'),
        request.form.get('job_type'),
        'B.Tech', 'B.Tech',
        request.form.get('branch'),
        float(request.form.get('min_cgpa', 6.0)),
        0, '2026',
        request.form.get('required_skills'),
        request.form.get('application_deadline'),
        datetime.now().strftime('%Y-%m-%d'),
        request.form.get('selection_rounds'),
        request.form.get('application_url'),
        'Manual Addition'
    ))
    conn.commit()
    conn.close()
    flash('New placement opportunity added successfully!', 'success')
    return redirect(url_for('jobs'))

@app.route('/jobs/bookmark/<job_id>')
@login_required
def toggle_bookmark(job_id):
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT is_bookmarked FROM job_opportunities WHERE id = ? AND user_id = ?", (job_id, user_id))
    row = cursor.fetchone()
    if row:
        new_val = 0 if row['is_bookmarked'] else 1
        cursor.execute("UPDATE job_opportunities SET is_bookmarked = ? WHERE id = ? AND user_id = ?", (new_val, job_id, user_id))
        conn.commit()
    conn.close()
    return redirect(url_for('jobs'))

@app.route('/quick-apply/<job_id>')
@login_required
def quick_apply_job(job_id):
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM job_opportunities WHERE id = ? AND user_id = ?", (job_id, user_id))
    job = cursor.fetchone()
    if job:
        app_id = 'app_' + str(uuid.uuid4())[:8]
        cursor.execute("""
            INSERT INTO placement_applications (id, user_id, company_name, job_role, application_date, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (app_id, user_id, job['company_name'], job['job_role'], datetime.now().strftime('%Y-%m-%d'), 'Applied', f"Quickly applied via Live Opportunities feed. Source: {job['source_info']}"))
        conn.commit()
        flash(f"Successfully added application for {job['company_name']} to your tracking pipeline!", 'success')
    conn.close()
    return redirect(url_for('applications'))

# ----------------- RESUME UPLOAD & ANALYSIS -----------------
def extract_text_from_pdf_bytes(pdf_bytes):
    """
    Extracts text directly from a text-based PDF without converting to images.
    Tries pypdf if installed, otherwise uses pure Python standard library zlib decompression.
    """
    if not pdf_bytes.startswith(b'%PDF-'):
        raise ValueError("The uploaded file is not a valid PDF document (missing %PDF- header).")

    # Attempt pypdf if installed
    try:
        import pypdf
        import io
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        pages = []
        for page in reader.pages:
            pt = page.extract_text()
            if pt:
                pages.append(pt)
        combined = "\n\n".join(pages).strip()
        if len(combined) >= 30:
            return combined
    except Exception:
        pass

    # Pure Python built-in standard-library fallback: scan FlateDecode text streams
    import re
    import zlib
    stream_pattern = re.compile(b'stream[\r\n]+(.*?)[\r\n]+endstream', re.DOTALL)
    extracted_tokens = []

    for match in stream_pattern.finditer(pdf_bytes):
        stream_data = match.group(1)
        decompressed = None
        try:
            decompressed = zlib.decompress(stream_data)
        except Exception:
            try:
                decompressed = zlib.decompress(stream_data, -15)
            except Exception:
                decompressed = stream_data

        if decompressed:
            for tj in re.finditer(rb'\(([^)]+)\)\s*Tj', decompressed):
                raw_token = tj.group(1).decode('latin-1', errors='ignore')
                raw_token = re.sub(r'\\([()\\])', r'\1', raw_token).strip()
                if raw_token:
                    extracted_tokens.append(raw_token)

            for tj_arr in re.finditer(rb'\[(.*?)\]\s*TJ', decompressed):
                arr_content = tj_arr.group(1)
                for item in re.finditer(rb'\(([^)]+)\)', arr_content):
                    raw_token = item.group(1).decode('latin-1', errors='ignore')
                    raw_token = re.sub(r'\\([()\\])', r'\1', raw_token).strip()
                    if raw_token:
                        extracted_tokens.append(raw_token)

    if extracted_tokens:
        result = " ".join(extracted_tokens).strip()
        result = re.sub(r'[ \t]+', ' ', result)
        if len(result) >= 30:
            return result

    # Scan uncompressed strings
    direct_tokens = []
    for tj in re.finditer(rb'\(([^)]{2,})\)\s*(?:Tj|TJ|\'|")', pdf_bytes):
        token = tj.group(1).decode('latin-1', errors='ignore')
        token = re.sub(r'\\([()\\])', r'\1', token).strip()
        if len(token) > 1 and all(32 <= ord(c) < 127 for c in token):
            direct_tokens.append(token)
    if direct_tokens:
        res = " ".join(direct_tokens).strip()
        if len(res) >= 30:
            return res

    raise ValueError("The PDF could not be read or contains no selectable text (it may be a scanned image or empty). Please use Option 2: Paste Resume Text instead.")

def analyze_resume_rule_based(raw_text):
    """
    Transparent, rule-based text analysis without external AI or hallucinated qualifications.
    """
    import re
    trimmed = raw_text.strip()
    lower = trimmed.lower()

    # 1. Contact Information
    email_m = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', trimmed)
    email = email_m.group(0) if email_m else None

    phone_m = re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}', trimmed)
    phone = phone_m.group(0).strip() if (phone_m and len(re.sub(r'\D', '', phone_m.group(0))) >= 10) else None

    links = re.findall(r'(?:https?://)?(?:www\.)?(?:github\.com|linkedin\.com|leetcode\.com|hackerrank\.com)[^\s),]+', trimmed, re.I)
    contact_parts = []
    if email: contact_parts.append(f"Email: {email}")
    if phone: contact_parts.append(f"Phone: {phone}")
    if links: contact_parts.append(f"Links: {', '.join(set(links))}")
    contact_info = " | ".join(contact_parts) if contact_parts else "Not detected in the supplied text"

    # 2. Technical Skills Matching
    known_skills = [
        'Python', 'Java', 'C++', 'C#', 'C', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js',
        'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB',
        'Redis', 'Data Structures', 'Algorithms', 'DBMS', 'Operating Systems', 'Computer Networks',
        'Git', 'GitHub', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Linux', 'Bash',
        'HTML/CSS', 'Tailwind CSS', 'REST API', 'GraphQL', 'Machine Learning', 'TensorFlow', 'PyTorch',
        'Pandas', 'NumPy', 'System Design', 'Microservices', 'CI/CD', 'Unit Testing', 'OOP', 'Agile'
    ]
    detected_skills = []
    for skill in known_skills:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, trimmed, re.IGNORECASE):
            detected_skills.append(skill)

    # 3. Education
    degree_patterns = [
        ('B.Tech (Bachelor of Technology)', r'\b(?:b\.?\s*tech|bachelor of technology)\b'),
        ('B.E. (Bachelor of Engineering)', r'\b(?:b\.?\s*e\.?|bachelor of engineering)\b'),
        ('M.Tech (Master of Technology)', r'\b(?:m\.?\s*tech|master of technology)\b'),
        ('MCA (Master of Computer Applications)', r'\b(?:m\.?\s*c\.?\s*a\.?|master of computer applications)\b'),
        ('BCA (Bachelor of Computer Applications)', r'\b(?:b\.?\s*c\.?\s*a\.?|bachelor of computer applications)\b'),
        ('B.Sc / M.Sc', r'\b(?:b\.?\s*sc|m\.?\s*sc|bachelor of science)\b'),
    ]
    matched_degree = None
    for dname, dpat in degree_patterns:
        if re.search(dpat, trimmed, re.I):
            matched_degree = dname
            break

    cgpa_m = re.search(r'\b(?:cgpa|gpa|percentage|marks?)[^\w\n]{1,5}(\d+(?:\.\d+)?(?:\s*/\s*10|\s*%)?)', trimmed, re.I)
    grad_m = re.search(r'\b(?:batch|graduating|pass(?:ed|ing)?\s*out|expected)?\s*(202[0-9])\b', trimmed, re.I)

    if matched_degree or cgpa_m or grad_m or 'college' in lower or 'university' in lower or 'institute' in lower:
        edu_parts = []
        if matched_degree: edu_parts.append(matched_degree)
        if cgpa_m: edu_parts.append(f"Performance: {cgpa_m.group(1)}")
        if grad_m: edu_parts.append(f"Graduation: {grad_m.group(1)}")
        if 'computer science' in lower or 'cse' in lower: edu_parts.append("Branch: Computer Science & Engineering")
        elif 'information technology' in lower or 'it' in lower: edu_parts.append("Branch: Information Technology")
        elif 'electronics' in lower: edu_parts.append("Branch: Electronics & Communication")
        extracted_education = " | ".join(edu_parts) if edu_parts else "Academic credentials detected"
    else:
        extracted_education = "Not detected in the supplied text"

    # 4. Projects
    proj_m = re.search(r'(?:PROJECTS?|ACADEMIC PROJECTS?)[\s\S]{10,400}?(?=\n\s*(?:EXPERIENCE|SKILLS|EDUCATION|CERTIFICATIONS|$))', trimmed, re.I)
    if proj_m:
        raw_p = re.sub(r'^(?:PROJECTS?|ACADEMIC PROJECTS?)', '', proj_m.group(0), flags=re.I).strip()
        extracted_projects = (raw_p[:350] + '...') if len(raw_p) > 350 else raw_p
    elif 'project' in lower:
        p_lines = [l.strip() for l in trimmed.split('\n') if re.search(r'project', l, re.I) and len(l.strip()) > 15]
        extracted_projects = "; ".join(p_lines[:2]) if p_lines else "Not detected in the supplied text"
    else:
        extracted_projects = "Not detected in the supplied text"

    # 5. Experience / Internship
    exp_m = re.search(r'(?:WORK EXPERIENCE|INTERNSHIPS?|PROFESSIONAL EXPERIENCE|EXPERIENCE)[\s\S]{10,400}?(?=\n\s*(?:PROJECTS|SKILLS|EDUCATION|CERTIFICATIONS|$))', trimmed, re.I)
    if exp_m:
        raw_e = re.sub(r'^(?:WORK EXPERIENCE|INTERNSHIPS?|PROFESSIONAL EXPERIENCE|EXPERIENCE)', '', exp_m.group(0), flags=re.I).strip()
        extracted_experience = (raw_e[:350] + '...') if len(raw_e) > 350 else raw_e
    elif any(k in lower for k in ['intern', 'trainee', 'experience']):
        e_lines = [l.strip() for l in trimmed.split('\n') if re.search(r'\b(?:intern|trainee|developer|engineer)\b', l, re.I) and len(l.strip()) > 15]
        extracted_experience = "; ".join(e_lines[:2]) if e_lines else "Not detected in the supplied text"
    else:
        extracted_experience = "Not detected in the supplied text"

    # 6. Certifications
    cert_keywords = ['AWS Certified', 'Google Cloud Certified', 'Azure Fundamentals', 'Oracle Certified', 'HackerRank', 'LeetCode', 'NPTEL', 'Coursera', 'Udemy']
    found_certs = [c for c in cert_keywords if re.search(r'\b' + re.escape(c) + r'\b', trimmed, re.I)]
    if found_certs:
        extracted_certifications = ", ".join(found_certs)
    else:
        cert_m = re.search(r'(?:CERTIFICATIONS?|CERTIFICATES?|LICENSES?)[\s\S]{10,300}?(?=\n\s*(?:PROJECTS|SKILLS|EDUCATION|EXPERIENCE|$))', trimmed, re.I)
        if cert_m:
            raw_c = re.sub(r'^(?:CERTIFICATIONS?|CERTIFICATES?|LICENSES?)', '', cert_m.group(0), flags=re.I).strip()
            extracted_certifications = (raw_c[:250] + '...') if len(raw_c) > 250 else raw_c
        else:
            extracted_certifications = "Not detected in the supplied text"

    return {
        'contact_info': contact_info,
        'extracted_skills': ", ".join(detected_skills) if detected_skills else "No matching technical skills detected in the supplied text",
        'extracted_education': extracted_education,
        'extracted_projects': extracted_projects,
        'extracted_experience': extracted_experience,
        'extracted_certifications': extracted_certifications,
    }

@app.route('/resume', methods=['GET', 'POST'])
@login_required
def resume_analysis():
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        resume_file = request.files.get('resume_file')
        resume_text = request.form.get('resume_text', '').strip()
        has_file = resume_file is not None and bool(resume_file.filename.strip())
        has_text = bool(resume_text)

        if has_file and has_text:
            flash('Please use one input method at a time: either upload a PDF or paste your resume text.', 'warning')
            conn.close()
            return redirect(url_for('resume_analysis'))

        if not has_file and not has_text:
            flash('Please provide resume content by either uploading a PDF or pasting plain text.', 'danger')
            conn.close()
            return redirect(url_for('resume_analysis'))

        extracted_text = ""
        file_name = "Pasted_Resume_Text.txt"

        if has_file:
            orig_filename = resume_file.filename.strip()
            if not orig_filename.lower().endswith('.pdf'):
                flash('Unsupported file format. Only PDF documents (.pdf) are permitted.', 'danger')
                conn.close()
                return redirect(url_for('resume_analysis'))

            file_bytes = resume_file.read()
            if len(file_bytes) == 0:
                flash('The uploaded file is empty (0 bytes). Please upload a valid resume PDF.', 'danger')
                conn.close()
                return redirect(url_for('resume_analysis'))

            if len(file_bytes) > 5 * 1024 * 1024:
                flash('The uploaded file exceeds the 5 MB limit. Please choose a smaller PDF or paste resume text.', 'danger')
                conn.close()
                return redirect(url_for('resume_analysis'))

            try:
                extracted_text = extract_text_from_pdf_bytes(file_bytes)
                file_name = orig_filename
            except ValueError as ve:
                flash(str(ve), 'danger')
                conn.close()
                return redirect(url_for('resume_analysis'))
            except Exception:
                flash('Could not read the selected PDF file. Please try Option 2: Paste Resume Text.', 'danger')
                conn.close()
                return redirect(url_for('resume_analysis'))
        else:
            if len(resume_text) < 50:
                flash('The pasted resume text is too short to analyse meaningfully. Please provide at least 50 characters.', 'danger')
                conn.close()
                return redirect(url_for('resume_analysis'))
            extracted_text = resume_text

        # Analyze using transparent rule-based text processing
        analysis = analyze_resume_rule_based(extracted_text)

        cursor.execute("""
            INSERT OR REPLACE INTO student_resumes (
                user_id, resume_text, extracted_skills, extracted_education,
                extracted_projects, extracted_certifications, extracted_experience,
                contact_info, file_name, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (
            user_id,
            extracted_text,
            analysis['extracted_skills'],
            analysis['extracted_education'],
            analysis['extracted_projects'],
            analysis['extracted_certifications'],
            analysis['extracted_experience'],
            analysis['contact_info'],
            file_name,
        ))
        conn.commit()
        flash('Resume successfully parsed and analyzed!', 'success')

    cursor.execute("SELECT * FROM student_resumes WHERE user_id = ?", (user_id,))
    resume = cursor.fetchone()
    conn.close()

    return render_template('resume.html', resume=resume)

# ----------------- ERROR HANDLERS -----------------
@app.errorhandler(404)
def not_found_error(error):
    return render_template('home.html', error_msg="The requested page could not be located."), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('home.html', error_msg="An unexpected error occurred. Please try again."), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
