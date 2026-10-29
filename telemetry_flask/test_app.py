import unittest
import os
import sys
import tempfile
import json
import sqlite3

# Ensure telemetry_flask directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set test secret key before importing app
os.environ['SECRET_KEY'] = 'test_secret_key_12345'

class TelemetryTestCase(unittest.TestCase):
    def setUp(self):
        self.db_fd, self.db_path = tempfile.mkstemp(suffix='.db')
        os.environ['TELEMETRY_DB_PATH'] = self.db_path

        from database import init_db
        init_db(self.db_path)

        import seed_questions
        # Point seed_questions to test db
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        for q in seed_questions.QUESTIONS_DATA:
            c.execute("""
                INSERT OR REPLACE INTO questions (id, category, topic, difficulty, question, options_json, correct_answer, explanation)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, q)
        conn.commit()
        conn.close()

        from app import app
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False
        self.app = app
        self.client = app.test_client()

    def tearDown(self):
        try:
            os.close(self.db_fd)
            if os.path.exists(self.db_path):
                os.remove(self.db_path)
        except OSError:
            pass

    # ==================== 1. AUTHENTICATION TESTS ====================
    def test_registration_success(self):
        response = self.client.post('/register', data={
            'full_name': 'Rohan Verma',
            'email': 'rohan@college.edu',
            'password': 'Password123',
            'confirm_password': 'Password123'
        }, follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Account registered successfully', response.data)

        # Check DB entry
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("SELECT email, full_name, password_hash FROM students WHERE email = 'rohan@college.edu'")
        row = c.fetchone()
        self.assertIsNotNone(row)
        self.assertEqual(row[1], 'Rohan Verma')
        self.assertNotEqual(row[2], 'Password123') # Must be hashed!
        conn.close()

    def test_registration_duplicate_rejected(self):
        self.client.post('/register', data={
            'full_name': 'Rohan Verma',
            'email': 'rohan@college.edu',
            'password': 'Password123',
            'confirm_password': 'Password123'
        })
        self.client.get('/logout')
        response = self.client.post('/register', data={
            'full_name': 'Rohan Duplicate',
            'email': 'rohan@college.edu',
            'password': 'Password456',
            'confirm_password': 'Password456'
        }, follow_redirects=True)
        self.assertIn(b'already exists', response.data)

    def test_registration_password_mismatch(self):
        response = self.client.post('/register', data={
            'full_name': 'Mismatch User',
            'email': 'mismatch@college.edu',
            'password': 'Password123',
            'confirm_password': 'DifferentPassword'
        }, follow_redirects=True)
        self.assertIn(b'Passwords do not match', response.data)

    def test_login_valid_and_invalid(self):
        # Register user
        self.client.post('/register', data={
            'full_name': 'Priya Nair',
            'email': 'priya@college.edu',
            'password': 'SafePassword@1',
            'confirm_password': 'SafePassword@1'
        })
        self.client.get('/logout')

        # Incorrect password
        fail_resp = self.client.post('/login', data={
            'email': 'priya@college.edu',
            'password': 'WrongPassword'
        }, follow_redirects=True)
        self.assertIn(b'Invalid email or password', fail_resp.data)

        # Correct password
        success_resp = self.client.post('/login', data={
            'email': 'priya@college.edu',
            'password': 'SafePassword@1'
        }, follow_redirects=True)
        self.assertEqual(success_resp.status_code, 200)
        self.assertIn(b'Welcome back, Priya Nair', success_resp.data)

    def test_logout_and_protected_routes(self):
        # Unauthenticated access to dashboard redirects to login
        resp = self.client.get('/dashboard', follow_redirects=True)
        self.assertIn(b'Please sign in to access', resp.data)

        # Login, then logout
        self.client.post('/register', data={
            'full_name': 'Test User',
            'email': 'test@college.edu',
            'password': 'Password123',
            'confirm_password': 'Password123'
        })
        resp = self.client.get('/dashboard')
        self.assertEqual(resp.status_code, 200)

        # Logout
        self.client.get('/logout', follow_redirects=True)
        resp2 = self.client.get('/dashboard', follow_redirects=True)
        self.assertIn(b'Please sign in to access', resp2.data)

    # ==================== 2. DEMO LOGIN TESTS ====================
    def test_demo_login_idempotent(self):
        # First visit
        resp1 = self.client.get('/demo-login', follow_redirects=True)
        self.assertEqual(resp1.status_code, 200)
        self.assertIn(b'Aarav Sharma (Demo Student)', resp1.data)

        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM students WHERE email = 'demo.student@telemetry.edu'")
        self.assertEqual(c.fetchone()[0], 1)
        c.execute("SELECT COUNT(*) FROM preparation_tasks")
        first_count = c.fetchone()[0]
        self.assertGreaterEqual(first_count, 4)
        conn.close()

        # Re-run demo login - must NOT create duplicate student or duplicate tasks
        self.client.get('/logout')
        resp2 = self.client.get('/demo-login', follow_redirects=True)
        self.assertEqual(resp2.status_code, 200)

        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM students WHERE email = 'demo.student@telemetry.edu'")
        self.assertEqual(c.fetchone()[0], 1)
        c.execute("SELECT COUNT(*) FROM preparation_tasks")
        second_count = c.fetchone()[0]
        self.assertEqual(first_count, second_count)
        conn.close()

    # ==================== 3. STUDENT PROFILE TESTS ====================
    def test_student_profile_update(self):
        self.client.get('/demo-login')
        resp = self.client.post('/profile', data={
            'full_name': 'Aarav Updated',
            'college_name': 'BITS Pilani',
            'branch': 'Computer Science and Engineering',
            'semester': 'Semester 8 — Fourth Year',
            'graduation_year': '2026',
            'cgpa': '9.12',
            'technical_skills': 'Python, PyTorch, C++, Algorithms',
            'areas_of_interest': 'AI/ML Systems, High-Performance Computing',
            'preferred_role': 'Software Development Engineer'
        }, follow_redirects=True)
        self.assertEqual(resp.status_code, 200)

        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute("SELECT * FROM student_profiles WHERE email = 'demo.student@telemetry.edu'")
        row = c.fetchone()
        self.assertIsNotNone(row)
        self.assertEqual(row['college_name'], 'BITS Pilani')
        self.assertEqual(row['cgpa'], '9.12')
        self.assertEqual(row['graduation_year'], '2026')
        conn.close()

    # ==================== 4. PREPARATION TRACKER TESTS ====================
    def test_preparation_tasks_crud_and_calculations(self):
        self.client.get('/demo-login')
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("DELETE FROM preparation_tasks") # Start clean
        conn.commit()
        conn.close()

        # Add task 1 (Pending)
        self.client.post('/tasks', data={
            'action': 'add',
            'title': 'Master Graph BFS and DFS',
            'category': 'Coding Practice',
            'status': 'Pending',
            'target_date': '2026-11-20',
            'notes': 'LeetCode 200 & 133'
        }, follow_redirects=True)

        # Add task 2 (Completed)
        self.client.post('/tasks', data={
            'action': 'add',
            'title': 'Revise Percentages',
            'category': 'Aptitude',
            'status': 'Completed',
            'target_date': '2026-11-15',
            'notes': 'All formulas done'
        }, follow_redirects=True)

        # Check dashboard calculation: 1 completed / 2 total = 50%
        dash_resp = self.client.get('/dashboard')
        self.assertIn(b'50% of syllabus complete', dash_resp.data)

        # Toggle task 1 status
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute("SELECT id, status FROM preparation_tasks WHERE title = 'Master Graph BFS and DFS'")
        task = c.fetchone()
        self.assertIsNotNone(task)
        conn.close()

        self.client.post('/tasks', data={
            'action': 'toggle',
            'task_id': task['id']
        })

        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("SELECT status FROM preparation_tasks WHERE id = ?", (task['id'],))
        # Pending toggles to In Progress
        self.assertEqual(c.fetchone()[0], 'In Progress')

        # Delete task
        self.client.post('/tasks', data={
            'action': 'delete',
            'task_id': task['id']
        })
        c.execute("SELECT COUNT(*) FROM preparation_tasks WHERE id = ?", (task['id'],))
        self.assertEqual(c.fetchone()[0], 0)
        conn.close()

    # ==================== 5. APTITUDE QUIZ & SCORING TESTS ====================
    def test_question_bank_integrity(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM questions")
        total_q = c.fetchone()[0]
        self.assertGreaterEqual(total_q, 40)

        # Check each question has exactly 4 options and valid correct_answer in [0, 3]
        c.execute("SELECT id, options_json, correct_answer, explanation FROM questions")
        for q in c.fetchall():
            options = json.loads(q['options_json'])
            self.assertEqual(len(options), 4, f"Question {q['id']} must have 4 options")
            self.assertIn(q['correct_answer'], [0, 1, 2, 3], f"Question {q['id']} invalid correct_answer")
            self.assertTrue(len(q['explanation']) > 5, f"Question {q['id']} missing explanation")
        conn.close()

    def test_quiz_submission_and_backend_scoring(self):
        self.client.get('/demo-login')
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute("SELECT id, correct_answer FROM questions WHERE category = 'Logical Reasoning' LIMIT 5")
        questions = c.fetchall()
        conn.close()

        q_ids = [q['id'] for q in questions]

        # Submit: 3 correct, 1 wrong, 1 unanswered
        form_data = {
            'category': 'Logical Reasoning',
            'time_taken_seconds': '180',
            'question_ids': q_ids,
            f"answer_{q_ids[0]}": str(questions[0]['correct_answer']),
            f"answer_{q_ids[1]}": str(questions[1]['correct_answer']),
            f"answer_{q_ids[2]}": str(questions[2]['correct_answer']),
            f"answer_{q_ids[3]}": str((questions[3]['correct_answer'] + 1) % 4), # Wrong
            # q_ids[4] is intentionally omitted / unanswered
        }

        resp = self.client.post('/mock-tests/submit', data=form_data, follow_redirects=True)
        self.assertEqual(resp.status_code, 200)

        # Verification: Correct = 3, Total = 5, Percentage = 60%, Accuracy = 3 / 4 answered = 75%
        self.assertIn(b'3 of 5', resp.data)
        self.assertIn(b'60%', resp.data)
        self.assertIn(b'75%', resp.data) # accuracy
        self.assertIn(b'Not Answered', resp.data)
        self.assertIn(b'Retry Quiz', resp.data)
        self.assertIn(b'Practice Another Category', resp.data)
        self.assertIn(b'View Quiz History', resp.data)
        self.assertIn(b'Back to Dashboard', resp.data)

    def test_quiz_zero_answers_does_not_crash(self):
        self.client.get('/demo-login')
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute("SELECT id FROM questions LIMIT 3")
        q_ids = [r['id'] for r in c.fetchall()]
        conn.close()

        # Submit without any answers selected
        form_data = {
            'category': 'Verbal Ability',
            'time_taken_seconds': '50',
            'question_ids': q_ids,
        }
        resp = self.client.post('/mock-tests/submit', data=form_data, follow_redirects=True)
        self.assertEqual(resp.status_code, 200)
        self.assertIn(b'0%', resp.data)
        self.assertIn(b'3 Skipped', resp.data)

    def test_quiz_attempt_student_isolation(self):
        # User 1 registers and takes a test
        self.client.post('/register', data={
            'full_name': 'Student One',
            'email': 'student1@college.edu',
            'password': 'Password123',
            'confirm_password': 'Password123'
        })
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("SELECT id FROM questions LIMIT 2")
        qids = [r[0] for r in c.fetchall()]
        conn.close()

        sub_resp = self.client.post('/mock-tests/submit', data={
            'category': 'Quantitative Aptitude',
            'question_ids': qids,
            'time_taken_seconds': '60'
        }, follow_redirects=False)
        attempt_redirect = sub_resp.headers['Location']
        attempt_id = attempt_redirect.split('/')[-1]

        # User 1 can view it
        resp = self.client.get(f'/mock-tests/result/{attempt_id}')
        self.assertEqual(resp.status_code, 200)

        # User 2 logs in and tries to access User 1's attempt
        self.client.get('/logout')
        self.client.post('/register', data={
            'full_name': 'Student Two',
            'email': 'student2@college.edu',
            'password': 'Password123',
            'confirm_password': 'Password123'
        })
        resp2 = self.client.get(f'/mock-tests/result/{attempt_id}', follow_redirects=True)
        # Should be rejected with unauthorized message
        self.assertIn(b'access unauthorized', resp2.data)

    # ==================== 6. PLACEMENT DRIVES TESTS ====================
    def test_placement_drives_crud(self):
        self.client.get('/demo-login')

        # Add drive
        resp = self.client.post('/drives', data={
            'action': 'add',
            'company_name': 'Google Cloud India',
            'job_role': 'Cloud Engineer Apprentice',
            'eligibility_criteria': '70%+ throughout',
            'drive_date': '2026-12-15',
            'application_deadline': '2026-12-01',
            'required_skills': 'Python, Linux, Networking',
            'link_or_notes': 'Apply on Google Careers'
        }, follow_redirects=True)
        self.assertEqual(resp.status_code, 200)
        self.assertIn(b'Google Cloud India', resp.data)

        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute("SELECT id FROM placement_drives WHERE company_name = 'Google Cloud India'")
        drive = c.fetchone()
        self.assertIsNotNone(drive)
        drive_id = drive['id']
        conn.close()

        # Delete drive
        del_resp = self.client.post('/drives', data={
            'action': 'delete',
            'drive_id': drive_id
        }, follow_redirects=True)
        self.assertIn(b'record removed', del_resp.data)

    # ==================== 7. PLACEMENT APPLICATIONS TESTS ====================
    def test_placement_applications_and_stage_transitions(self):
        self.client.get('/demo-login')

        # Add application
        resp = self.client.post('/applications', data={
            'action': 'add',
            'company_name': 'Microsoft IDC',
            'job_role': 'Support Engineer',
            'application_date': '2026-10-20',
            'status': 'Applied',
            'notes': 'Submitted via careers portal'
        }, follow_redirects=True)
        self.assertIn(b'Microsoft IDC', resp.data)

        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute("SELECT id, status FROM placement_applications WHERE company_name = 'Microsoft IDC'")
        app_row = c.fetchone()
        self.assertIsNotNone(app_row)
        app_id = app_row['id']
        self.assertEqual(app_row['status'], 'Applied')
        conn.close()

        # Verify student cannot unilaterally self-promote to 'Interview'
        self.client.post('/applications', data={
            'action': 'update_status',
            'app_id': app_id,
            'status': 'Interview'
        }, follow_redirects=True)

        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("SELECT status FROM placement_applications WHERE id = ?", (app_id,))
        self.assertEqual(c.fetchone()[0], 'Applied') # Remained 'Applied' because employer-controlled
        conn.close()

        # Authorized Campus TPO status update
        self.client.post('/applications', data={
            'action': 'admin_status_update',
            'app_id': app_id,
            'status': 'Interview',
            'admin_note': 'Shortlisted for round 1 technical interview.'
        }, follow_redirects=True)

        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("SELECT status FROM placement_applications WHERE id = ?", (app_id,))
        self.assertEqual(c.fetchone()[0], 'Interview')

        # Verify notification was generated for student
        c.execute("SELECT title, status_updated_to FROM student_notifications WHERE application_id = ?", (app_id,))
        notif = c.fetchone()
        self.assertIsNotNone(notif)
        self.assertEqual(notif[1], 'Interview')
        conn.close()

    # ==================== 8. PLACEMENT ANALYSIS TESTS ====================
    def test_placement_analysis_calculations(self):
        self.client.get('/demo-login')
        resp = self.client.get('/analysis')
        self.assertEqual(resp.status_code, 200)

        # Check that analysis calculates selection rate and active applications
        self.assertIn(b'SELECTION RATE', resp.data)
        self.assertIn(b'RECRUITMENT STAGE BREAKDOWN', resp.data.upper())
        self.assertIn(b'PREPARATION COVERAGE', resp.data)
        self.assertIn(b'IDENTIFIED WEAKER TOPICS', resp.data.upper())

if __name__ == '__main__':
    unittest.main()
