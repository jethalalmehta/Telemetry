export type TaskCategory =
  | 'Aptitude'
  | 'Logical Reasoning'
  | 'Verbal Ability'
  | 'Technical Subjects'
  | 'Coding Practice'
  | 'Communication'
  | 'Interview Preparation';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Task {
  id: string;
  userId: string;
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  targetDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type McqCategory =
  | 'Quantitative Aptitude'
  | 'Logical Reasoning'
  | 'Verbal Ability'
  | 'Basic Technical Knowledge';

export interface Question {
  id: string;
  category: McqCategory;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: [string, string, string, string]; // [A, B, C, D]
  correctAnswer: number; // 0 for A, 1 for B, 2 for C, 3 for D
  explanation: string;
}

// Client-safe question (without correct answer before submission)
export interface QuestionClient {
  id: string;
  category: McqCategory;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: [string, string, string, string];
}

export interface TestAttempt {
  id: string;
  userId: string;
  category: McqCategory;
  score: number;
  totalQuestions: number;
  percentage: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  accuracy: number;
  submittedAt: string;
  userAnswers: { [questionId: string]: number };
  questionIds: string[];
  timeSpentSeconds?: number;
}

export interface CompanyDrive {
  id: string;
  userId: string;
  companyName: string;
  jobRole: string;
  eligibilityCriteria: string;
  driveDate: string;
  linkOrNotes?: string;
  createdAt: string;
}

export interface JobOpportunity {
  id: string;
  userId?: string;
  companyName: string;
  jobRole: string;
  jobDescription: string;
  location: string;
  salary: string;
  jobType: string;
  qualification: string;
  degree: string;
  branch: string;
  minCgpa: number;
  maxBacklogs: number;
  graduationYear: string;
  requiredSkills: string[];
  applicationDeadline: string;
  postingDate: string;
  selectionRounds: string;
  applicationUrl: string;
  sourceInfo: string;
  isLiveFetched: boolean;
  isBookmarked?: boolean;
  createdAt: string;
}

export interface EligibilityResult {
  status: 'Eligible' | 'Not Eligible' | 'Eligibility Uncertain';
  reason: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  missingQualifications: string[];
}

export interface ResumeContactInfo {
  email?: string;
  phone?: string;
  links: string[];
}

export interface ResumeSectionAudit {
  contactInfo: boolean;
  education: boolean;
  technicalSkills: boolean;
  projects: boolean;
  experience: boolean;
  certifications: boolean;
}

export interface ResumeData {
  userId: string;
  fileName?: string;
  fileSize?: string;
  inputMethod?: 'pdf' | 'text';
  rawText: string;
  contactInfo?: ResumeContactInfo;
  extractedSkills: string[];
  extractedEducation: string;
  extractedProjects: string;
  extractedCertifications: string;
  extractedExperience: string;
  sectionAudit?: ResumeSectionAudit;
  updatedAt: string;
}

export type ApplicationStatus =
  | 'Saved'
  | 'Applied'
  | 'Assessment'
  | 'Interview'
  | 'Shortlisted'
  | 'Selected'
  | 'Rejected'
  | 'Offer Received'
  | 'Not Selected';

export interface StatusHistoryEntry {
  id: string;
  status: ApplicationStatus;
  changedAt: string;
  updatedBy: string;
  note?: string;
}

export interface Application {
  id: string;
  userId: string;
  jobId?: string;
  companyDriveId?: string;
  companyName: string;
  jobRole: string;
  location?: string;
  jobType?: string;
  salary?: string;
  eligibilityStatus?: 'Eligible' | 'Not Eligible' | 'Eligibility Uncertain';
  matchScore?: number;
  isBookmarked?: boolean;
  applicationUrl?: string;
  applicationDate: string;
  deadline?: string;
  status: ApplicationStatus;
  statusUpdatedBy?: string;
  statusUpdatedAt?: string;
  statusHistory?: StatusHistoryEntry[];
  notes?: string;
  interviewDate?: string;
  rejectionFeedback?: string;
  recommendedImprovements?: string[];
  selectionStage?: string;
  offerDetails?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  applicationId?: string;
  companyName: string;
  jobRole: string;
  title: string;
  message: string;
  statusUpdatedTo: ApplicationStatus;
  adminNote?: string;
  isRead: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  role?: 'student' | 'admin';
  createdAt: string;
}

export interface StudentProfile {
  userId: string;
  fullName: string;
  email: string;
  collegeName: string;
  branch: string;
  semester: string;
  graduationYear?: string;
  cgpa?: string;
  activeBacklogs?: number;
  technicalSkills: string[];
  areasOfInterest?: string;
  preferredRole: string;
  updatedAt: string;
}

export type ActiveTab =
  | 'home'
  | 'dashboard'
  | 'tasks'
  | 'mocktests'
  | 'drives'
  | 'jobs'
  | 'resume'
  | 'applications'
  | 'analysis'
  | 'profile';

export const BTECH_SEMESTERS = [
  'Semester 1 — First Year',
  'Semester 2 — First Year',
  'Semester 3 — Second Year',
  'Semester 4 — Second Year',
  'Semester 5 — Third Year',
  'Semester 6 — Third Year',
  'Semester 7 — Fourth Year',
  'Semester 8 — Fourth Year',
] as const;

export type BTechSemester = typeof BTECH_SEMESTERS[number];

export function normalizeSemester(sem?: string | null): BTechSemester {
  if (!sem) return 'Semester 7 — Fourth Year';
  const trimmed = sem.trim();
  if (BTECH_SEMESTERS.includes(trimmed as BTechSemester)) {
    return trimmed as BTechSemester;
  }
  const lower = trimmed.toLowerCase();
  if (lower.includes('1') || lower.includes('first')) return 'Semester 1 — First Year';
  if (lower.includes('2') || lower.includes('second')) return 'Semester 2 — First Year';
  if (lower.includes('3') || lower.includes('third')) return 'Semester 3 — Second Year';
  if (lower.includes('4')) return 'Semester 4 — Second Year';
  if (lower.includes('5')) return 'Semester 5 — Third Year';
  if (lower.includes('6')) return 'Semester 6 — Third Year';
  if (lower.includes('8') || lower.includes('eighth')) return 'Semester 8 — Fourth Year';
  if (lower.includes('7') || lower.includes('seventh') || lower.includes('final')) return 'Semester 7 — Fourth Year';
  return 'Semester 7 — Fourth Year';
}

