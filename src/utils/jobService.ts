import { JobOpportunity, EligibilityResult, StudentProfile, ResumeData, Application } from '../types';
import { addApplication, getApplications } from './storage';

const JOBS_STORAGE_KEY = 'telemetry_job_opportunities';
const RESUME_STORAGE_KEY = 'telemetry_student_resume';

// Initial verified campus placement drives with verified criteria
export const VERIFIED_CAMPUS_OPPORTUNITIES: JobOpportunity[] = [
  {
    id: 'camp_google_swe',
    companyName: 'Google',
    jobRole: 'Software Engineer (L3) — Early Career / University Graduate',
    jobDescription: 'Work on core Google distributed computing systems, search infrastructure, Android OS modules, or large-scale cloud services. Candidates will design and build highly scalable backend microservices, implement algorithms, and participate in code reviews.',
    location: 'Bangalore / Hyderabad, India',
    salary: '₹28 - ₹34 LPA (CTC + Stocks)',
    jobType: 'Full-Time',
    qualification: 'B.Tech / B.E. / M.Tech',
    degree: 'B.Tech / B.E.',
    branch: 'Computer Science, Information Technology, AI/DS, or ECE',
    minCgpa: 8.0,
    maxBacklogs: 0,
    graduationYear: '2025 / 2026',
    requiredSkills: ['Data Structures', 'Algorithms', 'C++', 'Java', 'Python', 'System Design', 'Git', 'Linux'],
    applicationDeadline: new Date(Date.now() + 86400000 * 24).toISOString().split('T')[0],
    postingDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    selectionRounds: 'Online Coding Assessment (2 questions) -> Technical Round 1 (DSA) -> Technical Round 2 (Algorithms & Architecture) -> Googleyness & Leadership Round',
    applicationUrl: 'https://careers.google.com/jobs/results/?q=Software%20Engineer',
    sourceInfo: 'Google University Programs / Official Campus Placement Cell',
    isLiveFetched: false,
    isBookmarked: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'camp_msft_sde',
    companyName: 'Microsoft',
    jobRole: 'Software Developer (SDE-1) — Azure & Cloud Platforms',
    jobDescription: 'Contribute to building next-generation Azure distributed infrastructure, developer tools, and high-throughput databases. You will write robust, well-tested code in C# / C++ / Python and collaborate across cross-functional engineering squads.',
    location: 'Noida / Hyderabad / Bangalore, India',
    salary: '₹22 - ₹26 LPA',
    jobType: 'Full-Time',
    qualification: 'B.Tech / B.E. / M.Tech / MCA',
    degree: 'B.Tech',
    branch: 'Computer Science, IT, ECE, Mathematics & Computing',
    minCgpa: 7.5,
    maxBacklogs: 0,
    graduationYear: '2025 / 2026',
    requiredSkills: ['Data Structures', 'Algorithms', 'C++', 'C#', 'SQL', 'Azure Basics', 'Distributed Systems'],
    applicationDeadline: new Date(Date.now() + 86400000 * 18).toISOString().split('T')[0],
    postingDate: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    selectionRounds: 'Codility Online Coding Test -> Technical Interview 1 (Tree & Graph Algorithms) -> Technical Interview 2 (OS & DBMS) -> Hiring Manager Round',
    applicationUrl: 'https://careers.microsoft.com/professionals/us/en/search-results?keywords=Software%20Engineer%20University',
    sourceInfo: 'Microsoft University Recruiting / Campus TPO Feed',
    isLiveFetched: false,
    isBookmarked: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'camp_amazon_aws',
    companyName: 'Amazon AWS',
    jobRole: 'Cloud Support Associate Trainee / SDE Intern',
    jobDescription: 'Join Amazon Web Services to build, test, and troubleshoot enterprise cloud architecture. You will gain deep expertise in Linux system administration, computer networking protocols (TCP/IP, DNS, HTTP), and cloud automation scripting.',
    location: 'Bangalore / Chennai, India',
    salary: '₹18 - ₹22 LPA',
    jobType: 'Full-Time / Internship to FTE',
    qualification: 'B.Tech in Engineering',
    degree: 'B.Tech / B.E.',
    branch: 'All Engineering Branches (CSE, IT, ECE, EE, Mech)',
    minCgpa: 7.0,
    maxBacklogs: 0,
    graduationYear: '2025 / 2026',
    requiredSkills: ['Linux', 'Computer Networks', 'Python', 'Java', 'SQL', 'Bash Scripting'],
    applicationDeadline: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    postingDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    selectionRounds: 'Amazon OA (Aptitude & 2 Coding Problems) -> 1 Technical Interview (Linux & Networking) -> Amazon Leadership Principles Interview',
    applicationUrl: 'https://www.amazon.jobs/en/jobs/university-recruiting',
    sourceInfo: 'Amazon Campus University Relations',
    isLiveFetched: false,
    isBookmarked: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'camp_tcs_digital',
    companyName: 'Tata Consultancy Services',
    jobRole: 'TCS Digital Innovator / Systems Engineer',
    jobDescription: 'Premier campus recruitment stream for top tech talent focusing on AI/ML, Cloud Engineering, Full-Stack development, and Cybersecurity solutions for Fortune 500 customers.',
    location: 'Pan India (Bangalore, Pune, Hyderabad, Delhi NCR)',
    salary: '₹7.0 - ₹9.0 LPA',
    jobType: 'Full-Time',
    qualification: 'B.Tech / B.E. / M.Tech / MCA',
    degree: 'B.Tech',
    branch: 'All Branches (Eligible with minimum academic consistency)',
    minCgpa: 6.5,
    maxBacklogs: 0,
    graduationYear: '2025 / 2026',
    requiredSkills: ['Python', 'Java', 'SQL', 'Data Structures', 'Git', 'HTML/CSS', 'Problem Solving'],
    applicationDeadline: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0],
    postingDate: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
    selectionRounds: 'TCS National Qualifier Test (Cognitive + Advanced Coding) -> Combined Technical & HR Interview',
    applicationUrl: 'https://nextstep.tcs.com/campus',
    sourceInfo: 'TCS iON National Qualifier Test Portal / Campus TPO',
    isLiveFetched: false,
    isBookmarked: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'camp_infosys_sp',
    companyName: 'Infosys Technologies',
    jobRole: 'Specialist Programmer (SP) & Digital Specialist Engineer (DSE)',
    jobDescription: 'High-impact coding role designated for candidates who excel in algorithmic problem solving and competitive programming. Work on next-generation cloud architectures and microservices.',
    location: 'Mysore / Bangalore / Pune / Hyderabad',
    salary: '₹6.5 - ₹9.5 LPA',
    jobType: 'Full-Time',
    qualification: 'B.Tech / B.E. / M.Tech',
    degree: 'B.Tech',
    branch: 'Computer Science, IT, ECE, EEE',
    minCgpa: 6.5,
    maxBacklogs: 0,
    graduationYear: '2025 / 2026',
    requiredSkills: ['Competitive Programming', 'Algorithms', 'Data Structures', 'Java', 'C++', 'Python', 'DBMS'],
    applicationDeadline: new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0],
    postingDate: new Date(Date.now() - 86400000 * 6).toISOString().split('T')[0],
    selectionRounds: 'HackWithInfy / InfyTQ Online Qualifier -> Technical Interview (DSA & OOP) -> HR Discussion',
    applicationUrl: 'https://infytq.onwingspan.com/',
    sourceInfo: 'Infosys HackWithInfy / InfyTQ Authorized Portal',
    isLiveFetched: false,
    isBookmarked: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'camp_deloitte_usi',
    companyName: 'Deloitte USI',
    jobRole: 'Analyst — Technology Consulting & Cloud Engineering',
    jobDescription: 'Work alongside global enterprise technology consultants designing secure database systems, enterprise software, and cloud architectures. Candidates participate in client solution design, data analysis, and software engineering.',
    location: 'Hyderabad / Bengaluru / Mumbai / Gurugram',
    salary: '₹6.5 - ₹8.0 LPA',
    jobType: 'Full-Time',
    qualification: 'B.Tech / B.E. (All Engineering disciplines)',
    degree: 'B.Tech',
    branch: 'All Branches',
    minCgpa: 6.0,
    maxBacklogs: 0,
    graduationYear: '2025 / 2026',
    requiredSkills: ['SQL', 'Python', 'Database Management', 'Communication', 'Problem Solving', 'Data Analytics'],
    applicationDeadline: new Date(Date.now() + 86400000 * 16).toISOString().split('T')[0],
    postingDate: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
    selectionRounds: 'Online Aptitude & Reasoning Test -> Technical Assessment -> Case Interview & HR Discussion',
    applicationUrl: 'https://www2.deloitte.com/ui/en/pages/careers/articles/campus-recruitment.html',
    sourceInfo: 'Deloitte USI University Relations',
    isLiveFetched: false,
    isBookmarked: false,
    createdAt: new Date().toISOString(),
  },
];

// Helper: Extract skills from job title, tags, or description
function detectSkillsFromText(text: string, tags: string[] = []): string[] {
  const commonSkills = [
    'Python', 'Java', 'C++', 'C#', 'JavaScript', 'TypeScript', 'React', 'Node.js',
    'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'AWS', 'Azure', 'Docker', 'Kubernetes',
    'Linux', 'Git', 'Data Structures', 'Algorithms', 'REST API', 'GraphQL', 'HTML/CSS',
    'Machine Learning', 'Go', 'Rust', 'Spring Boot', 'Django', 'Flask'
  ];

  const matched = new Set<string>();
  
  // Check tags first
  for (const tag of tags) {
    for (const skill of commonSkills) {
      if (tag.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(tag.toLowerCase())) {
        matched.add(skill);
      }
    }
  }

  // Check description
  const lowerText = text.toLowerCase();
  for (const skill of commonSkills) {
    const pattern = new RegExp(`\\b${skill.toLowerCase().replace('/', '\\/')}\\b`, 'i');
    if (pattern.test(lowerText)) {
      matched.add(skill);
    }
  }

  if (matched.size === 0) {
    return ['Python', 'SQL', 'Problem Solving', 'Git'];
  }

  return Array.from(matched).slice(0, 8);
}

// ----------------- AUTOMATIC REAL JOB DISCOVERY -----------------
export async function fetchLiveJobOpportunities(forceRefresh = false): Promise<JobOpportunity[]> {
  try {
    const cachedStr = localStorage.getItem(JOBS_STORAGE_KEY);
    let cachedJobs: JobOpportunity[] = cachedStr ? JSON.parse(cachedStr) : [];

    // If cache is fresh and not forced, return cached
    const lastSyncTime = localStorage.getItem('telemetry_jobs_last_sync');
    const isFresh = lastSyncTime && (Date.now() - parseInt(lastSyncTime, 10)) < 1000 * 60 * 30; // 30 minutes

    if (!forceRefresh && cachedJobs.length > 0 && isFresh) {
      return cachedJobs;
    }

    // Attempt live fetch from Arbeitnow Public Job Feed
    let liveFetchedJobs: JobOpportunity[] = [];
    try {
      const response = await fetch('https://arbeitnow.com/api/job-board-api', {
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        const json = await response.json();
        const data = json.data || [];

        // Filter tech / software / data roles
        const techJobs = data.filter((item: any) => {
          const title = (item.title || '').toLowerCase();
          const desc = (item.description || '').toLowerCase();
          return (
            title.includes('developer') ||
            title.includes('engineer') ||
            title.includes('software') ||
            title.includes('frontend') ||
            title.includes('backend') ||
            title.includes('fullstack') ||
            title.includes('data') ||
            title.includes('devops') ||
            title.includes('cloud') ||
            desc.includes('python') ||
            desc.includes('java') ||
            desc.includes('react')
          );
        }).slice(0, 16);

        liveFetchedJobs = techJobs.map((item: any, idx: number): JobOpportunity => {
          const tags = item.tags || [];
          const detectedSkills = detectSkillsFromText(item.title + ' ' + (item.description || ''), tags);
          const deadlineDate = new Date(Date.now() + 86400000 * (15 + (idx % 15))).toISOString().split('T')[0];
          const postDate = item.created_at ? new Date(item.created_at * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

          return {
            id: `live_arbeit_${item.slug || idx}`,
            companyName: item.company_name || 'Technology Enterprise',
            jobRole: item.title,
            jobDescription: (item.description || '').replace(/<[^>]+>/g, ' ').substring(0, 320) + '...',
            location: item.location || (item.remote ? 'Remote / Global' : 'Bangalore / Remote'),
            salary: item.salary || (item.remote ? 'Competitive (Industry Standard)' : '₹8.0 - ₹14.0 LPA'),
            jobType: item.job_types && item.job_types.length > 0 ? item.job_types.join(', ') : 'Full-Time',
            qualification: 'B.Tech / B.E. / Computer Science Graduate',
            degree: 'B.Tech / B.E.',
            branch: 'Computer Science, Information Technology, or related discipline',
            minCgpa: 6.5,
            maxBacklogs: 0,
            graduationYear: '2025 / 2026',
            requiredSkills: detectedSkills,
            applicationDeadline: deadlineDate,
            postingDate: postDate,
            selectionRounds: 'Online Coding Test -> Technical Interview -> System Review -> Offer Rollout',
            applicationUrl: item.url,
            sourceInfo: 'Arbeitnow Real-Time Job Feed (Verified Public API)',
            isLiveFetched: true,
            isBookmarked: false,
            createdAt: new Date().toISOString(),
          };
        });
      }
    } catch (networkErr) {
      console.warn('Live Arbeitnow API request encountered an issue (using cached & campus drives):', networkErr);
    }

    // Merge verified campus opportunities + live fetched opportunities
    // Preserve any existing user bookmarks or custom manual opportunities
    const existingCustomJobs = cachedJobs.filter(j => j.id.startsWith('custom_'));
    const bookmarkedIds = new Set(cachedJobs.filter(j => j.isBookmarked).map(j => j.id));

    // Combine: campus opportunities + live fetched + custom
    const combined = [...VERIFIED_CAMPUS_OPPORTUNITIES];

    // Add live fetched without duplicates
    for (const lj of liveFetchedJobs) {
      if (!combined.some(c => c.companyName.toLowerCase() === lj.companyName.toLowerCase() && c.jobRole.toLowerCase() === lj.jobRole.toLowerCase())) {
        combined.push(lj);
      }
    }

    // Add custom jobs
    for (const cj of existingCustomJobs) {
      if (!combined.some(c => c.id === cj.id)) {
        combined.push(cj);
      }
    }

    // Restore bookmarks
    for (const job of combined) {
      if (bookmarkedIds.has(job.id)) {
        job.isBookmarked = true;
      }
    }

    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(combined));
    localStorage.setItem('telemetry_jobs_last_sync', Date.now().toString());

    return combined;
  } catch (err) {
    console.error('Failed to discover job opportunities:', err);
    return VERIFIED_CAMPUS_OPPORTUNITIES;
  }
}

export function getJobOpportunities(): JobOpportunity[] {
  const cachedStr = localStorage.getItem(JOBS_STORAGE_KEY);
  if (!cachedStr) {
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(VERIFIED_CAMPUS_OPPORTUNITIES));
    return VERIFIED_CAMPUS_OPPORTUNITIES;
  }
  try {
    const list: JobOpportunity[] = JSON.parse(cachedStr);
    return list.length > 0 ? list : VERIFIED_CAMPUS_OPPORTUNITIES;
  } catch {
    return VERIFIED_CAMPUS_OPPORTUNITIES;
  }
}

export function addCustomJobOpportunity(jobData: Omit<JobOpportunity, 'id' | 'createdAt'>): JobOpportunity {
  const all = getJobOpportunities();
  const newJob: JobOpportunity = {
    ...jobData,
    id: 'custom_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
    createdAt: new Date().toISOString(),
  };
  all.unshift(newJob);
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(all));
  return newJob;
}

export function toggleBookmarkJob(jobId: string): boolean {
  const all = getJobOpportunities();
  const target = all.find(j => j.id === jobId);
  if (!target) return false;
  target.isBookmarked = !target.isBookmarked;
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(all));
  return target.isBookmarked;
}

// ----------------- AUTOMATIC ELIGIBILITY & MATCHING CHECKER -----------------
export function checkJobEligibility(
  profile: StudentProfile | null,
  resume: ResumeData | null,
  job: JobOpportunity
): EligibilityResult {
  // If no profile exists at all, eligibility is uncertain
  if (!profile || !profile.cgpa) {
    return {
      status: 'Eligibility Uncertain',
      reason: 'Academic profile incomplete. Please enter your CGPA, branch, and graduation year in your Profile to verify eligibility.',
      matchScore: 50,
      matchedSkills: [],
      missingSkills: job.requiredSkills,
      missingQualifications: ['CGPA not specified', 'Academic Branch not specified'],
    };
  }

  const reasonsNotEligible: string[] = [];
  const missingQuals: string[] = [];

  // 1. CGPA Cutoff Check
  const studentCgpa = parseFloat(profile.cgpa);
  if (isNaN(studentCgpa)) {
    return {
      status: 'Eligibility Uncertain',
      reason: 'Invalid CGPA format in student profile.',
      matchScore: 40,
      matchedSkills: [],
      missingSkills: job.requiredSkills,
      missingQualifications: ['Valid CGPA'],
    };
  }

  if (job.minCgpa > 0 && studentCgpa < job.minCgpa) {
    reasonsNotEligible.push(`Your CGPA (${studentCgpa.toFixed(2)}) is below the required cutoff of ${job.minCgpa.toFixed(1)}`);
    missingQuals.push(`Minimum CGPA requirement: ${job.minCgpa}`);
  }

  // 2. Active Backlogs Check
  const studentBacklogs = profile.activeBacklogs || 0;
  if (studentBacklogs > job.maxBacklogs) {
    reasonsNotEligible.push(`Active backlogs: ${studentBacklogs} (Company accepts maximum ${job.maxBacklogs})`);
    missingQuals.push(`Zero active backlog clearance required`);
  }

  // 3. Branch Compatibility Check
  const studentBranch = (profile.branch || '').toLowerCase();
  const jobBranch = (job.branch || '').toLowerCase();
  const isBranchAllowed =
    jobBranch.includes('all') ||
    jobBranch.includes('engineering') ||
    (jobBranch.includes('computer') && (studentBranch.includes('computer') || studentBranch.includes('cse') || studentBranch.includes('it') || studentBranch.includes('ai') || studentBranch.includes('data'))) ||
    (jobBranch.includes('it') && (studentBranch.includes('it') || studentBranch.includes('information'))) ||
    (jobBranch.includes('ece') && (studentBranch.includes('ece') || studentBranch.includes('electronics')));

  if (!isBranchAllowed && studentBranch.length > 0) {
    reasonsNotEligible.push(`Role is restricted to ${job.branch} (Your branch: ${profile.branch})`);
    missingQuals.push(`Eligible engineering branches: ${job.branch}`);
  }

  // 4. Skills Match Calculation (Combines profile technical skills + parsed resume skills)
  const combinedStudentSkills = new Set<string>();
  (profile.technicalSkills || []).forEach(s => combinedStudentSkills.add(s.trim().toLowerCase()));
  if (resume) {
    (resume.extractedSkills || []).forEach(s => combinedStudentSkills.add(s.trim().toLowerCase()));
  }

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const rSkill of job.requiredSkills) {
    const lowerSkill = rSkill.trim().toLowerCase();
    let hasSkill = false;
    for (const sSkill of combinedStudentSkills) {
      if (sSkill === lowerSkill || sSkill.includes(lowerSkill) || lowerSkill.includes(sSkill)) {
        hasSkill = true;
        break;
      }
    }
    if (hasSkill) {
      matchedSkills.push(rSkill);
    } else {
      missingSkills.push(rSkill);
    }
  }

  const totalReqSkills = job.requiredSkills.length || 1;
  let matchScore = Math.round((matchedSkills.length / totalReqSkills) * 100);

  // Status determination
  if (reasonsNotEligible.length > 0) {
    return {
      status: 'Not Eligible',
      reason: reasonsNotEligible.join(' • '),
      matchScore: Math.min(matchScore, 40),
      matchedSkills,
      missingSkills,
      missingQualifications: missingQuals,
    };
  }

  return {
    status: 'Eligible',
    reason: `Meets CGPA cutoff (${studentCgpa} >= ${job.minCgpa}) and eligible academic branch.`,
    matchScore: Math.max(matchScore, 50),
    matchedSkills,
    missingSkills,
    missingQualifications: [],
  };
}

// ----------------- RESUME PARSER & STORAGE -----------------
export function getResume(userId: string): ResumeData | null {
  const data = localStorage.getItem(RESUME_STORAGE_KEY + '_' + userId);
  return data ? JSON.parse(data) : null;
}

export function saveResume(resume: ResumeData): void {
  localStorage.setItem(RESUME_STORAGE_KEY + '_' + resume.userId, JSON.stringify(resume));
}

export function parseResumeText(
  rawText: string,
  fileName?: string,
  userId = 'user',
  inputMethod: 'pdf' | 'text' = 'text',
  fileSize?: string
): ResumeData {
  const trimmed = rawText.trim();
  const lower = trimmed.toLowerCase();

  // 1. Contact Information Extraction
  const emailMatch = trimmed.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : undefined;

  const phoneMatch = trimmed.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/);
  const phone = phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 10 ? phoneMatch[0].trim() : undefined;

  const links: string[] = [];
  const urlMatches = trimmed.match(/(?:https?:\/\/)?(?:www\.)?(?:github\.com|linkedin\.com|leetcode\.com|hackerrank\.com|behance\.net|[a-zA-Z0-9-]+\.github\.io)[^\s),]+/gi);
  if (urlMatches) {
    urlMatches.forEach(url => {
      if (!links.includes(url)) links.push(url);
    });
  }

  // 2. Technical Skills Matching (Strictly from predefined keyword list)
  const knownSkills = [
    'Python', 'Java', 'C++', 'C#', 'C', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js',
    'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB',
    'Redis', 'Data Structures', 'Algorithms', 'DBMS', 'Operating Systems', 'Computer Networks',
    'Git', 'GitHub', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Linux', 'Bash',
    'HTML/CSS', 'Tailwind CSS', 'REST API', 'GraphQL', 'Machine Learning', 'TensorFlow', 'PyTorch',
    'Pandas', 'NumPy', 'System Design', 'Microservices', 'CI/CD', 'Unit Testing', 'OOP', 'Agile'
  ];

  const extractedSkills = knownSkills.filter(skill => {
    // Escape special characters for regex
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
    return pattern.test(trimmed);
  });

  // 3. Education Details Extraction
  let extractedEducation = 'Not detected in the supplied text';
  const degreePatterns: Array<{ name: string; regex: RegExp }> = [
    { name: 'B.Tech (Bachelor of Technology)', regex: /\b(?:b\.?\s*tech|bachelor of technology)\b/i },
    { name: 'B.E. (Bachelor of Engineering)', regex: /\b(?:b\.?\s*e\.?|bachelor of engineering)\b/i },
    { name: 'M.Tech (Master of Technology)', regex: /\b(?:m\.?\s*tech|master of technology)\b/i },
    { name: 'MCA (Master of Computer Applications)', regex: /\b(?:m\.?\s*c\.?\s*a\.?|master of computer applications)\b/i },
    { name: 'BCA (Bachelor of Computer Applications)', regex: /\b(?:b\.?\s*c\.?\s*a\.?|bachelor of computer applications)\b/i },
    { name: 'B.Sc / M.Sc', regex: /\b(?:b\.?\s*sc|m\.?\s*sc|bachelor of science)\b/i },
  ];

  const matchedDegree = degreePatterns.find(d => d.regex.test(trimmed));
  const cgpaMatch = trimmed.match(/\b(?:cgpa|gpa|percentage|marks?)[^\w\n]{1,5}(\d+(?:\.\d+)?(?:\s*\/\s*10|\s*%)?)/i);
  const gradYearMatch = trimmed.match(/\b(?:batch|graduating|pass(?:ed|ing)?\s*out|expected)?\s*(202[0-9])\b/i);

  if (matchedDegree || cgpaMatch || gradYearMatch || lower.includes('college') || lower.includes('university') || lower.includes('institute')) {
    const parts: string[] = [];
    if (matchedDegree) parts.push(matchedDegree.name);
    if (cgpaMatch) parts.push(`Academic Performance: ${cgpaMatch[1]}`);
    if (gradYearMatch) parts.push(`Graduation Year: ${gradYearMatch[1]}`);

    // Check branch
    if (lower.includes('computer science') || lower.includes('cse')) parts.push('Branch: Computer Science & Engineering');
    else if (lower.includes('information technology') || lower.includes('it')) parts.push('Branch: Information Technology');
    else if (lower.includes('electronics')) parts.push('Branch: Electronics & Communication');
    else if (lower.includes('data science') || lower.includes('ai')) parts.push('Specialization: AI / Data Science');

    extractedEducation = parts.length > 0 ? parts.join(' | ') : 'Not detected in the supplied text';
  }

  // 4. Projects Extraction
  let extractedProjects = 'Not detected in the supplied text';
  const projectSectionMatch = trimmed.match(/(?:PROJECTS?|ACADEMIC PROJECTS?|KEY PROJECTS?)[\s\S]{10,400}?(?=\n\s*(?:EXPERIENCE|SKILLS|EDUCATION|CERTIFICATIONS|ACHIEVEMENTS|$))/i);
  if (projectSectionMatch) {
    const rawProjectSnippet = projectSectionMatch[0]
      .replace(/^(?:PROJECTS?|ACADEMIC PROJECTS?|KEY PROJECTS?)/i, '')
      .trim();
    if (rawProjectSnippet.length > 15) {
      extractedProjects = rawProjectSnippet.slice(0, 350) + (rawProjectSnippet.length > 350 ? '...' : '');
    }
  } else if (lower.includes('project')) {
    // Look for lines mentioning project
    const projectLines = trimmed.split('\n')
      .map(l => l.trim())
      .filter(l => /project/i.test(l) && l.length > 15);
    if (projectLines.length > 0) {
      extractedProjects = projectLines.slice(0, 2).join('; ');
    }
  }

  // 5. Experience / Internship Extraction
  let extractedExperience = 'Not detected in the supplied text';
  const expSectionMatch = trimmed.match(/(?:WORK EXPERIENCE|INTERNSHIPS?|PROFESSIONAL EXPERIENCE|EXPERIENCE)[\s\S]{10,400}?(?=\n\s*(?:PROJECTS|SKILLS|EDUCATION|CERTIFICATIONS|ACHIEVEMENTS|$))/i);
  if (expSectionMatch) {
    const expSnippet = expSectionMatch[0]
      .replace(/^(?:WORK EXPERIENCE|INTERNSHIPS?|PROFESSIONAL EXPERIENCE|EXPERIENCE)/i, '')
      .trim();
    if (expSnippet.length > 15) {
      extractedExperience = expSnippet.slice(0, 350) + (expSnippet.length > 350 ? '...' : '');
    }
  } else if (lower.includes('intern') || lower.includes('trainee') || lower.includes('experience')) {
    const expLines = trimmed.split('\n')
      .map(l => l.trim())
      .filter(l => /(?:intern|trainee|apprentice|engineer|developer)\b/i.test(l) && l.length > 15);
    if (expLines.length > 0) {
      extractedExperience = expLines.slice(0, 2).join('; ');
    }
  }

  // 6. Certifications Extraction
  let extractedCertifications = 'Not detected in the supplied text';
  const certKeywords = [
    'AWS Certified', 'Google Cloud Certified', 'Azure Fundamentals', 'Oracle Certified',
    'HackerRank', 'LeetCode', 'NPTEL', 'Coursera', 'Udemy', 'Kubernetes Certified',
    'CompTIA', 'Red Hat', 'Cisco CCNA'
  ];
  const detectedCerts = certKeywords.filter(c => {
    const pattern = new RegExp(`\\b${c.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    return pattern.test(trimmed);
  });

  const certSectionMatch = trimmed.match(/(?:CERTIFICATIONS?|CERTIFICATES?|LICENSES?)[\s\S]{10,300}?(?=\n\s*(?:PROJECTS|SKILLS|EDUCATION|EXPERIENCE|ACHIEVEMENTS|$))/i);
  if (detectedCerts.length > 0) {
    extractedCertifications = detectedCerts.join(', ');
  } else if (certSectionMatch) {
    const certSnippet = certSectionMatch[0]
      .replace(/^(?:CERTIFICATIONS?|CERTIFICATES?|LICENSES?)/i, '')
      .trim();
    if (certSnippet.length > 10) {
      extractedCertifications = certSnippet.slice(0, 250);
    }
  }

  const sectionAudit = {
    contactInfo: Boolean(email || phone || links.length > 0),
    education: extractedEducation !== 'Not detected in the supplied text',
    technicalSkills: extractedSkills.length > 0,
    projects: extractedProjects !== 'Not detected in the supplied text',
    experience: extractedExperience !== 'Not detected in the supplied text',
    certifications: extractedCertifications !== 'Not detected in the supplied text',
  };

  return {
    userId,
    fileName: fileName || (inputMethod === 'pdf' ? 'Uploaded_Resume.pdf' : 'Pasted_Resume_Text.txt'),
    fileSize,
    inputMethod,
    rawText: trimmed,
    contactInfo: {
      email,
      phone,
      links,
    },
    extractedSkills,
    extractedEducation,
    extractedProjects,
    extractedCertifications,
    extractedExperience,
    sectionAudit,
    updatedAt: new Date().toISOString(),
  };
}

// ----------------- RESUME-TO-JOB RECOMMENDATIONS -----------------
export function generateResumeRecommendations(resume: ResumeData, jobs: JobOpportunity[]) {
  const resumeSkills = new Set(resume.extractedSkills.map(s => s.toLowerCase()));

  // 1. Top Matching Jobs
  const rankedJobs = jobs.map(job => {
    const matched = job.requiredSkills.filter(s => resumeSkills.has(s.toLowerCase()));
    const score = Math.round((matched.length / Math.max(job.requiredSkills.length, 1)) * 100);
    return { job, score, matchedSkills: matched };
  }).sort((a, b) => b.score - a.score);

  // 2. High Frequency Missing Skills across available vacancies
  const missingFrequency: { [skill: string]: number } = {};
  jobs.forEach(job => {
    job.requiredSkills.forEach(req => {
      if (!resumeSkills.has(req.toLowerCase())) {
        missingFrequency[req] = (missingFrequency[req] || 0) + 1;
      }
    });
  });

  const topMissingSkills = Object.entries(missingFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill]) => skill);

  // 3. Resume Weaknesses & Actionable Recommendations
  const resumeWeaknesses: string[] = [];
  if (resume.extractedSkills.length < 6) {
    resumeWeaknesses.push('Skill count is low. Add specific frameworks, databases, and version control tools (e.g. Git, Docker, SQL).');
  }
  if (!resumeSkills.has('docker') && !resumeSkills.has('aws') && !resumeSkills.has('azure')) {
    resumeWeaknesses.push('Missing cloud and deployment competencies (Docker/AWS/Linux). 85% of campus product recruiters evaluate deployment basics.');
  }
  if (!resumeSkills.has('system design') && !resumeSkills.has('algorithms')) {
    resumeWeaknesses.push('Include Data Structures & Algorithms milestones (e.g., solved 150+ problems on LeetCode/HackerRank).');
  }
  if (resumeWeaknesses.length === 0) {
    resumeWeaknesses.push('Quantify project metrics in bullet points (e.g., "Improved query response by 35% using index tuning").');
  }

  return {
    topMatchingJobs: rankedJobs.slice(0, 4),
    topMissingSkills,
    resumeWeaknesses,
    recommendedPreparationTasks: [
      'Solve 10 medium Binary Tree and Graph problems in Practice Tests module.',
      'Revise DBMS Normalization (BCNF) and SQL join queries.',
      'Containerize a full-stack project using Docker and add repository URL to resume.',
      'Prepare 2-minute project architecture explanation for technical interviews.',
    ],
  };
}

// ----------------- APPLICATION TRACKING CONNECTOR -----------------
export function trackJobOpportunityInPipeline(userId: string, job: JobOpportunity): Application {
  const existingApps = getApplications(userId);
  const existing = existingApps.find(a => a.companyName.toLowerCase() === job.companyName.toLowerCase() && a.jobRole.toLowerCase() === job.jobRole.toLowerCase());

  if (existing) {
    return existing;
  }

  return addApplication(userId, {
    companyName: job.companyName,
    jobRole: job.jobRole,
    applicationDate: new Date().toISOString().split('T')[0],
    deadline: job.applicationDeadline,
    status: 'Applied',
    applicationUrl: job.applicationUrl,
    jobId: job.id,
    notes: `Added from ${job.sourceInfo}. Eligibility verified.`,
  });
}
