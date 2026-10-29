import unittest
import os
import sys
import tempfile
import sqlite3
import zlib
import io

# Ensure telemetry_flask directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from resume_parser import (
    VALID_BTECH_SEMESTERS,
    validate_btech_semester,
    extract_text_from_pdf_bytes,
    analyze_resume_rule_based
)
from database import init_db, get_db

class TelemetryFixesStandaloneTestCase(unittest.TestCase):
    def setUp(self):
        self.db_fd, self.db_path = tempfile.mkstemp(suffix='.db')
        os.environ['TELEMETRY_DB_PATH'] = self.db_path
        init_db(self.db_path)

        # Seed a demo student
        conn = get_db(self.db_path)
        c = conn.cursor()
        c.execute("""
            INSERT INTO students (id, email, full_name, password_hash)
            VALUES ('demo_user_001', 'demo.student@telemetry.edu', 'Aarav Sharma', 'hash123')
        """)
        c.execute("""
            INSERT INTO student_profiles (
                user_id, full_name, email, college_name, branch, semester, graduation_year, cgpa,
                technical_skills, areas_of_interest, preferred_role
            )
            VALUES (
                'demo_user_001', 'Aarav Sharma', 'demo.student@telemetry.edu',
                'National Institute of Engineering & Technology', 'Computer Science & Engineering',
                'Semester 7 — Fourth Year', '2026', '8.65',
                'Python, Java, Data Structures, SQL', 'Backend Systems', 'Software Engineer'
            )
        """)
        conn.commit()
        conn.close()

    def tearDown(self):
        try:
            os.close(self.db_fd)
            if os.path.exists(self.db_path):
                os.remove(self.db_path)
        except OSError:
            pass

    # =========================================================================
    # ISSUE 1: SEMESTER VALIDATION & DATABASE PERSISTENCE TESTS
    # =========================================================================

    def test_semester_1_validation_and_persistence(self):
        normalized = validate_btech_semester('Semester 1 — First Year')
        self.assertEqual(normalized, 'Semester 1 — First Year')

        conn = get_db(self.db_path)
        c = conn.cursor()
        c.execute("UPDATE student_profiles SET semester = ? WHERE user_id = 'demo_user_001'", (normalized,))
        conn.commit()

        c.execute("SELECT semester FROM student_profiles WHERE user_id = 'demo_user_001'")
        row = c.fetchone()
        self.assertEqual(row['semester'], 'Semester 1 — First Year')
        conn.close()

    def test_semester_2_validation_and_persistence(self):
        normalized = validate_btech_semester('Semester 2 — First Year')
        self.assertEqual(normalized, 'Semester 2 — First Year')

        conn = get_db(self.db_path)
        c = conn.cursor()
        c.execute("UPDATE student_profiles SET semester = ? WHERE user_id = 'demo_user_001'", (normalized,))
        conn.commit()

        c.execute("SELECT semester FROM student_profiles WHERE user_id = 'demo_user_001'")
        row = c.fetchone()
        self.assertEqual(row['semester'], 'Semester 2 — First Year')
        conn.close()

    def test_all_eight_semesters_supported_in_numerical_order(self):
        expected_order = [
            'Semester 1 — First Year',
            'Semester 2 — First Year',
            'Semester 3 — Second Year',
            'Semester 4 — Second Year',
            'Semester 5 — Third Year',
            'Semester 6 — Third Year',
            'Semester 7 — Fourth Year',
            'Semester 8 — Fourth Year',
        ]
        self.assertEqual(VALID_BTECH_SEMESTERS, expected_order)

        for sem in expected_order:
            val = validate_btech_semester(sem)
            self.assertEqual(val, sem)

            conn = get_db(self.db_path)
            c = conn.cursor()
            c.execute("UPDATE student_profiles SET semester = ? WHERE user_id = 'demo_user_001'", (val,))
            conn.commit()

            c.execute("SELECT semester FROM student_profiles WHERE user_id = 'demo_user_001'")
            self.assertEqual(c.fetchone()['semester'], sem)
            conn.close()

    def test_numerical_digit_semester_mapping(self):
        # Check that loose numerical inputs (e.g., '1st', '3rd', '8') correctly map to full label
        self.assertEqual(validate_btech_semester('1'), 'Semester 1 — First Year')
        self.assertEqual(validate_btech_semester('2nd semester'), 'Semester 2 — First Year')
        self.assertEqual(validate_btech_semester('3'), 'Semester 3 — Second Year')
        self.assertEqual(validate_btech_semester('4th'), 'Semester 4 — Second Year')
        self.assertEqual(validate_btech_semester('5'), 'Semester 5 — Third Year')
        self.assertEqual(validate_btech_semester('6th Semester'), 'Semester 6 — Third Year')
        self.assertEqual(validate_btech_semester('7'), 'Semester 7 — Fourth Year')
        self.assertEqual(validate_btech_semester('8th Semester'), 'Semester 8 — Fourth Year')

    def test_invalid_semesters_rejected(self):
        self.assertIsNone(validate_btech_semester('Semester 0'))
        self.assertIsNone(validate_btech_semester('Semester 9'))
        self.assertIsNone(validate_btech_semester('Semester 10 — Invalid Year'))
        self.assertIsNone(validate_btech_semester('Random Semester'))
        self.assertIsNone(validate_btech_semester(''))
        self.assertIsNone(validate_btech_semester(None))

    def test_existing_student_records_intact_and_preserved(self):
        conn = get_db(self.db_path)
        c = conn.cursor()
        c.execute("SELECT COUNT(*) as count FROM student_profiles")
        count = c.fetchone()['count']
        self.assertEqual(count, 1)

        c.execute("SELECT * FROM student_profiles WHERE user_id = 'demo_user_001'")
        profile = c.fetchone()
        self.assertEqual(profile['full_name'], 'Aarav Sharma')
        self.assertEqual(profile['email'], 'demo.student@telemetry.edu')
        self.assertEqual(profile['cgpa'], '8.65')
        conn.close()

    # =========================================================================
    # ISSUE 2: RESUME ANALYSIS TESTS
    # =========================================================================

    def _create_sample_pdf_bytes(self, text):
        stream_content = f'BT /F1 12 Tf 72 712 Td ({text}) Tj ET'.encode('latin-1')
        comp = zlib.compress(stream_content)
        pdf = (
            b'%PDF-1.4\n1 0 obj\n<< /Length '
            + str(len(comp)).encode()
            + b' /Filter /FlateDecode >>\nstream\n'
            + comp
            + b'\nendstream\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF'
        )
        return pdf

    def test_valid_text_based_pdf_extracted_and_analysed(self):
        resume_text = (
            "KAVYA SHARMA Email: kavya.sharma@college.edu Phone: +91 9876543210 "
            "B.Tech in Computer Science and Engineering CGPA: 8.85 Graduation: 2026 "
            "Skills: Python, Java, SQL, Git, Docker, React, Linux, Data Structures "
            "Projects: Placement Tracker and Cloud Analytics Portal "
            "Experience: Software Engineering Intern at TechVanguard Solutions "
            "Certifications: AWS Certified Cloud Practitioner"
        )
        pdf_bytes = self._create_sample_pdf_bytes(resume_text)

        # 1. Test extraction directly from PDF bytes
        extracted = extract_text_from_pdf_bytes(pdf_bytes)
        self.assertIn("KAVYA SHARMA", extracted)
        self.assertIn("kavya.sharma@college.edu", extracted)
        self.assertIn("Python", extracted)

        # 2. Test rule-based entity analysis
        analysis = analyze_resume_rule_based(extracted)
        self.assertIn("kavya.sharma@college.edu", analysis['contact_info'])
        self.assertIn("Python", analysis['extracted_skills'])
        self.assertIn("Java", analysis['extracted_skills'])
        self.assertIn("SQL", analysis['extracted_skills'])
        self.assertIn("B.Tech", analysis['extracted_education'])
        self.assertIn("AWS Certified", analysis['extracted_certifications'])

        # 3. Test persistence into database
        conn = get_db(self.db_path)
        c = conn.cursor()
        c.execute("""
            INSERT OR REPLACE INTO student_resumes (
                user_id, resume_text, extracted_skills, extracted_education,
                extracted_projects, extracted_certifications, extracted_experience,
                contact_info, file_name, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (
            'demo_user_001', extracted, analysis['extracted_skills'],
            analysis['extracted_education'], analysis['extracted_projects'],
            analysis['extracted_certifications'], analysis['extracted_experience'],
            analysis['contact_info'], 'kavya_resume.pdf'
        ))
        conn.commit()

        c.execute("SELECT * FROM student_resumes WHERE user_id = 'demo_user_001'")
        row = c.fetchone()
        self.assertIsNotNone(row)
        self.assertEqual(row['file_name'], 'kavya_resume.pdf')
        self.assertIn('kavya.sharma@college.edu', row['contact_info'])
        conn.close()

    def test_pasted_plain_text_works_independently(self):
        plain_text = (
            "ROHAN VERMA\n"
            "Email: rohan.verma@college.edu | Phone: +91 91234 56789\n"
            "EDUCATION:\n"
            "B.Tech in Computer Science and Engineering | CGPA: 8.40 | Expected 2026\n"
            "TECHNICAL SKILLS:\n"
            "Python, Java, C++, SQL, PostgreSQL, Git, Docker, REST API\n"
            "PROJECTS:\n"
            "Scalable Microservices Gateway with Redis and Python\n"
            "WORK EXPERIENCE:\n"
            "Backend Developer Trainee at CloudNative Systems\n"
            "CERTIFICATIONS:\n"
            "HackerRank 5-Star Problem Solving"
        )
        analysis = analyze_resume_rule_based(plain_text)
        self.assertIn('rohan.verma@college.edu', analysis['contact_info'])
        self.assertIn('Python', analysis['extracted_skills'])
        self.assertIn('PostgreSQL', analysis['extracted_skills'])
        self.assertIn('B.Tech', analysis['extracted_education'])
        self.assertIn('HackerRank', analysis['extracted_certifications'])

    def test_empty_text_detection(self):
        with self.assertRaises(ValueError):
            extract_text_from_pdf_bytes(b'')

    def test_non_pdf_file_renamed_to_pdf_rejected(self):
        fake_pdf = b'This is an ordinary text file masquerading with a .pdf extension.'
        with self.assertRaises(ValueError) as ctx:
            extract_text_from_pdf_bytes(fake_pdf)
        self.assertIn('missing %PDF- header', str(ctx.exception))

    def test_scanned_or_no_selectable_text_pdf_detected(self):
        # Valid PDF header and valid object stream, but empty or scanned image stream with zero text tokens
        empty_stream = zlib.compress(b'/Im1 Do Q')
        scanned_pdf = (
            b'%PDF-1.4\n1 0 obj\n<< /Length '
            + str(len(empty_stream)).encode()
            + b' /Filter /FlateDecode >>\nstream\n'
            + empty_stream
            + b'\nendstream\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF'
        )
        with self.assertRaises(ValueError) as ctx:
            extract_text_from_pdf_bytes(scanned_pdf)
        self.assertIn('could not be read or contains no selectable text', str(ctx.exception))
        self.assertIn('Option 2: Paste Resume Text', str(ctx.exception))

    def test_malformed_pdf_handled_gracefully(self):
        malformed = b'%PDF-corrupted-binary-trash\x00\xff\xee\xdd\x00\x00'
        with self.assertRaises(ValueError) as ctx:
            extract_text_from_pdf_bytes(malformed)
        self.assertIn('could not be read or contains no selectable text', str(ctx.exception))

    def test_results_correspond_strictly_to_input_without_hallucinations(self):
        # Input with NO skills, NO degree, NO certs, NO experience
        minimal_text = "Contact: testuser@college.edu Phone: 9876543210. No technical skills or degree listed here."
        analysis = analyze_resume_rule_based(minimal_text)
        self.assertIn('testuser@college.edu', analysis['contact_info'])
        self.assertIn('No matching technical skills detected', analysis['extracted_skills'])
        self.assertEqual(analysis['extracted_education'], 'Not detected in the supplied text')
        self.assertEqual(analysis['extracted_projects'], 'Not detected in the supplied text')
        self.assertEqual(analysis['extracted_experience'], 'Not detected in the supplied text')
        self.assertEqual(analysis['extracted_certifications'], 'Not detected in the supplied text')

if __name__ == '__main__':
    unittest.main()
