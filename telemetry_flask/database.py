import sqlite3
import os

DEFAULT_DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'telemetry.db')
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), 'schema.sql')

def get_db(db_path=None):
    path = db_path or os.environ.get('TELEMETRY_DB_PATH', DEFAULT_DATABASE_PATH)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db(db_path=None):
    path = db_path or os.environ.get('TELEMETRY_DB_PATH', DEFAULT_DATABASE_PATH)
    conn = get_db(path)
    with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
        conn.executescript(f.read())
    conn.commit()

    # Safe schema migration for existing databases: ensure new columns exist without dropping data
    cursor = conn.cursor()
    
    # student_profiles new columns
    cursor.execute("PRAGMA table_info(student_profiles)")
    profile_cols = [row['name'] for row in cursor.fetchall()]
    if 'graduation_year' not in profile_cols:
        cursor.execute("ALTER TABLE student_profiles ADD COLUMN graduation_year TEXT")
    if 'cgpa' not in profile_cols:
        cursor.execute("ALTER TABLE student_profiles ADD COLUMN cgpa TEXT")
    if 'areas_of_interest' not in profile_cols:
        cursor.execute("ALTER TABLE student_profiles ADD COLUMN areas_of_interest TEXT")

    # placement_drives new columns
    cursor.execute("PRAGMA table_info(placement_drives)")
    drive_cols = [row['name'] for row in cursor.fetchall()]
    if 'application_deadline' not in drive_cols:
        cursor.execute("ALTER TABLE placement_drives ADD COLUMN application_deadline TEXT")
    if 'required_skills' not in drive_cols:
        cursor.execute("ALTER TABLE placement_drives ADD COLUMN required_skills TEXT")

    # placement_applications new columns
    cursor.execute("PRAGMA table_info(placement_applications)")
    app_cols = [row['name'] for row in cursor.fetchall()]
    if 'interview_date' not in app_cols:
        cursor.execute("ALTER TABLE placement_applications ADD COLUMN interview_date TEXT")
    if 'rejection_feedback' not in app_cols:
        cursor.execute("ALTER TABLE placement_applications ADD COLUMN rejection_feedback TEXT")
    if 'offer_details' not in app_cols:
        cursor.execute("ALTER TABLE placement_applications ADD COLUMN offer_details TEXT")

    # student_resumes new columns (safe migration preserving existing records)
    cursor.execute("PRAGMA table_info(student_resumes)")
    resume_cols = [row['name'] for row in cursor.fetchall()]
    if 'extracted_experience' not in resume_cols:
        cursor.execute("ALTER TABLE student_resumes ADD COLUMN extracted_experience TEXT")
    if 'contact_info' not in resume_cols:
        cursor.execute("ALTER TABLE student_resumes ADD COLUMN contact_info TEXT")
    if 'file_name' not in resume_cols:
        cursor.execute("ALTER TABLE student_resumes ADD COLUMN file_name TEXT")

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Telemetry SQLite database initialized successfully.")
