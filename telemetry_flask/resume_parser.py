import re
import zlib
import io

VALID_BTECH_SEMESTERS = [
    'Semester 1 — First Year',
    'Semester 2 — First Year',
    'Semester 3 — Second Year',
    'Semester 4 — Second Year',
    'Semester 5 — Third Year',
    'Semester 6 — Third Year',
    'Semester 7 — Fourth Year',
    'Semester 8 — Fourth Year',
]

def validate_btech_semester(semester_str):
    """
    Validates that only B.Tech Semesters 1 through 8 are accepted.
    Returns the normalized label if valid, or None if invalid.
    """
    if not semester_str or not isinstance(semester_str, str):
        return None

    trimmed = semester_str.strip()
    for vs in VALID_BTECH_SEMESTERS:
        if trimmed == vs:
            return vs

    # Check for semester digit 1 through 8
    m = re.search(r'\b([1-8])(?:st|nd|rd|th)?\b', trimmed, re.IGNORECASE)
    if m:
        sem_num = int(m.group(1))
        return VALID_BTECH_SEMESTERS[sem_num - 1]

    lower = trimmed.lower()
    if 'first' in lower and 'year' in lower:
        return VALID_BTECH_SEMESTERS[0]
    elif 'second' in lower and 'year' in lower:
        return VALID_BTECH_SEMESTERS[2]
    elif 'third' in lower and 'year' in lower:
        return VALID_BTECH_SEMESTERS[4]
    elif 'fourth' in lower and 'year' in lower:
        return VALID_BTECH_SEMESTERS[6]

    return None

def extract_text_from_pdf_bytes(pdf_bytes):
    """
    Extracts text directly from a text-based PDF without converting to images.
    Tries pypdf if installed; falls back to pure Python standard library zlib decompression.
    """
    if not pdf_bytes or not isinstance(pdf_bytes, (bytes, bytearray)):
        raise ValueError("Invalid PDF payload.")

    if not pdf_bytes.startswith(b'%PDF-'):
        raise ValueError("The uploaded file is not a valid PDF document (missing %PDF- header).")

    # Attempt pypdf if installed
    try:
        import pypdf
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

    # Pure Python standard-library fallback: scan FlateDecode text streams
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

    # 2. Technical Skills Matching (Predefined keyword list)
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
        extracted_education = " | ".join(edu_parts) if edu_parts else "Not detected in the supplied text"
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
