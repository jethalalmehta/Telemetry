-- Telemetry - Placement Preparation & Tracking System
-- B.Tech CSE Mini Project - SQLite Schema

CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_profiles (
    user_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    college_name TEXT NOT NULL,
    branch TEXT NOT NULL,
    semester TEXT NOT NULL,
    graduation_year TEXT,
    cgpa TEXT,
    technical_skills TEXT NOT NULL,
    areas_of_interest TEXT,
    preferred_role TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS preparation_tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    target_date TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    question TEXT NOT NULL,
    options_json TEXT NOT NULL,
    correct_answer INTEGER NOT NULL,
    explanation TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mock_test_attempts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    category TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    incorrect_answers INTEGER NOT NULL DEFAULT 0,
    unanswered INTEGER NOT NULL DEFAULT 0,
    accuracy INTEGER NOT NULL DEFAULT 0,
    time_taken_seconds INTEGER DEFAULT 0,
    question_ids_json TEXT DEFAULT '[]',
    answers_json TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS placement_drives (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    company_name TEXT NOT NULL,
    job_role TEXT NOT NULL,
    eligibility_criteria TEXT NOT NULL,
    drive_date TEXT NOT NULL,
    application_deadline TEXT,
    required_skills TEXT,
    link_or_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS placement_applications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    company_drive_id TEXT,
    company_name TEXT NOT NULL,
    job_role TEXT NOT NULL,
    application_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Applied',
    notes TEXT,
    interview_date TEXT,
    rejection_feedback TEXT,
    offer_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (company_drive_id) REFERENCES placement_drives(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS job_opportunities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    company_name TEXT NOT NULL,
    job_role TEXT NOT NULL,
    job_description TEXT NOT NULL,
    location TEXT NOT NULL,
    salary TEXT NOT NULL,
    job_type TEXT NOT NULL,
    required_qualification TEXT NOT NULL,
    degree TEXT NOT NULL,
    branch TEXT NOT NULL,
    min_cgpa REAL DEFAULT 6.0,
    max_backlogs INTEGER DEFAULT 0,
    graduation_year TEXT NOT NULL,
    required_skills TEXT NOT NULL,
    application_deadline TEXT NOT NULL,
    posting_date TEXT NOT NULL,
    selection_rounds TEXT NOT NULL,
    application_url TEXT NOT NULL,
    source_info TEXT NOT NULL,
    is_bookmarked INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_resumes (
    user_id TEXT PRIMARY KEY,
    resume_text TEXT NOT NULL,
    extracted_skills TEXT NOT NULL,
    extracted_education TEXT NOT NULL,
    extracted_projects TEXT NOT NULL,
    extracted_certifications TEXT NOT NULL,
    extracted_experience TEXT,
    contact_info TEXT,
    file_name TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    application_id TEXT,
    company_name TEXT,
    job_role TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    status_updated_to TEXT,
    admin_note TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES students(id) ON DELETE CASCADE
);

