import {
  User,
  StudentProfile,
  Task,
  Question,
  QuestionClient,
  TestAttempt,
  CompanyDrive,
  Application,
  McqCategory,
  TaskCategory,
  TaskStatus,
  ApplicationStatus,
  AppNotification,
  StatusHistoryEntry,
  normalizeSemester
} from '../types';
import { INITIAL_QUESTIONS } from '../data/questions';
import { EXPANDED_QUESTION_BANK } from '../data/expandedQuestions';

// LocalStorage Keys
const KEYS = {
  USERS: 'telemetry_users',
  PROFILES: 'telemetry_profiles',
  TASKS: 'telemetry_tasks',
  QUESTIONS: 'telemetry_questions',
  TEST_ATTEMPTS: 'telemetry_test_attempts',
  COMPANY_DRIVES: 'telemetry_company_drives',
  APPLICATIONS: 'telemetry_applications',
  NOTIFICATIONS: 'telemetry_notifications',
  CURRENT_USER_ID: 'telemetry_current_user_id',
};

// Simple cryptographic hash function using Web Crypto API
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt + 'telemetry_secret_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateId(): string {
  return 'tel_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
}

// ----------------- QUESTION BANK INITIALIZATION -----------------
export function initializeQuestionBank(): void {
  const existing = localStorage.getItem(KEYS.QUESTIONS);
  const masterQuestions = [...INITIAL_QUESTIONS];
  const seenIds = new Set(INITIAL_QUESTIONS.map(q => q.id));

  for (const q of EXPANDED_QUESTION_BANK) {
    if (!seenIds.has(q.id)) {
      masterQuestions.push(q);
      seenIds.add(q.id);
    }
  }

  if (!existing) {
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(masterQuestions));
    return;
  }

  try {
    const parsed: Question[] = JSON.parse(existing);
    if (!Array.isArray(parsed) || parsed.length < masterQuestions.length) {
      const currentIds = new Set(parsed.map(q => q.id));
      let changed = false;
      for (const mq of masterQuestions) {
        if (!currentIds.has(mq.id)) {
          parsed.push(mq);
          currentIds.add(mq.id);
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(parsed));
      }
    }
  } catch {
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(masterQuestions));
  }
}

export function getAllQuestions(): Question[] {
  initializeQuestionBank();
  const data = localStorage.getItem(KEYS.QUESTIONS);
  return data ? JSON.parse(data) : INITIAL_QUESTIONS;
}

export function getAvailableQuestionCount(
  category: McqCategory,
  difficulty?: 'All' | 'Easy' | 'Medium' | 'Hard'
): number {
  const all = getAllQuestions();
  let filtered = all.filter(q => q.category === category);
  if (difficulty && difficulty !== 'All') {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }
  return filtered.length;
}

// ----------------- USER AUTHENTICATION -----------------
export function getAllUsers(): User[] {
  const data = localStorage.getItem(KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

export async function registerUser(fullName: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
  const users = getAllUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, message: 'An account with this email already exists. Please sign in instead.' };
  }

  const salt = Math.random().toString(36).substring(2, 12);
  const passwordHash = await hashPassword(password, salt);

  const newUser: User = {
    id: generateId(),
    fullName: fullName.trim(),
    email: normalizedEmail,
    passwordHash,
    passwordSalt: salt,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  localStorage.setItem(KEYS.CURRENT_USER_ID, newUser.id);

  return { success: true, message: 'Registration successful!', user: newUser };
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
  const users = getAllUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return { success: false, message: 'No registered student found with this email address.' };
  }

  const salt = user.passwordSalt || '';
  const calculatedHash = await hashPassword(password, salt);
  let isValid = calculatedHash === user.passwordHash;

  // Backward compatibility: If salt was missing or format upgraded
  if (!isValid && !user.passwordSalt) {
    const legacyHash = await hashPassword(password, '');
    if (legacyHash === user.passwordHash) {
      isValid = true;
      // Upgrade user record with fresh salt and hash
      user.passwordSalt = Math.random().toString(36).substring(2, 12);
      user.passwordHash = await hashPassword(password, user.passwordSalt);
      const userIdx = users.findIndex(u => u.id === user.id);
      if (userIdx >= 0) {
        users[userIdx] = user;
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      }
    }
  }

  if (!isValid) {
    return { success: false, message: 'Incorrect password. Please verify your password and try again.' };
  }

  localStorage.setItem(KEYS.CURRENT_USER_ID, user.id);
  return { success: true, message: 'Welcome back!', user };
}

export function getCurrentUser(): User | null {
  const currentId = localStorage.getItem(KEYS.CURRENT_USER_ID);
  if (!currentId) return null;
  const users = getAllUsers();
  return users.find(u => u.id === currentId) || null;
}

export function logout(): void {
  localStorage.removeItem(KEYS.CURRENT_USER_ID);
}

// ----------------- STUDENT PROFILES -----------------
export function getProfile(userId: string): StudentProfile | null {
  const data = localStorage.getItem(KEYS.PROFILES);
  const profiles: StudentProfile[] = data ? JSON.parse(data) : [];
  const found = profiles.find(p => p.userId === userId);
  if (!found) return null;
  return {
    ...found,
    semester: normalizeSemester(found.semester)
  };
}

export function saveProfile(profile: StudentProfile): void {
  const data = localStorage.getItem(KEYS.PROFILES);
  const profiles: StudentProfile[] = data ? JSON.parse(data) : [];
  const normalized: StudentProfile = {
    ...profile,
    semester: normalizeSemester(profile.semester),
    updatedAt: new Date().toISOString(),
  };
  const idx = profiles.findIndex(p => p.userId === profile.userId);
  if (idx >= 0) {
    profiles[idx] = normalized;
  } else {
    profiles.push(normalized);
  }
  localStorage.setItem(KEYS.PROFILES, JSON.stringify(profiles));
}

// ----------------- PREPARATION TASKS -----------------
export function getTasks(userId: string, categoryFilter?: TaskCategory | 'All', statusFilter?: TaskStatus | 'All'): Task[] {
  const data = localStorage.getItem(KEYS.TASKS);
  let tasks: Task[] = data ? JSON.parse(data) : [];
  tasks = tasks.filter(t => t.userId === userId);

  if (categoryFilter && categoryFilter !== 'All') {
    tasks = tasks.filter(t => t.category === categoryFilter);
  }
  if (statusFilter && statusFilter !== 'All') {
    tasks = tasks.filter(t => t.status === statusFilter);
  }

  return tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addTask(userId: string, taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Task {
  const data = localStorage.getItem(KEYS.TASKS);
  const tasks: Task[] = data ? JSON.parse(data) : [];
  const newTask: Task = {
    ...taskData,
    id: generateId(),
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  return newTask;
}

export function updateTask(userId: string, updatedTask: Task): void {
  const data = localStorage.getItem(KEYS.TASKS);
  const tasks: Task[] = data ? JSON.parse(data) : [];
  const idx = tasks.findIndex(t => t.id === updatedTask.id && t.userId === userId);
  if (idx >= 0) {
    tasks[idx] = { ...updatedTask, updatedAt: new Date().toISOString() };
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  }
}

export function deleteTask(userId: string, taskId: string): boolean {
  const data = localStorage.getItem(KEYS.TASKS);
  let tasks: Task[] = data ? JSON.parse(data) : [];
  const initialLength = tasks.length;
  tasks = tasks.filter(t => !(t.id === taskId && t.userId === userId));
  localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  return tasks.length < initialLength;
}

export function toggleTaskStatus(userId: string, taskId: string): Task | null {
  const data = localStorage.getItem(KEYS.TASKS);
  const tasks: Task[] = data ? JSON.parse(data) : [];
  const task = tasks.find(t => t.id === taskId && t.userId === userId);
  if (!task) return null;

  if (task.status === 'Completed') {
    task.status = 'Pending';
  } else if (task.status === 'Pending') {
    task.status = 'In Progress';
  } else {
    task.status = 'Completed';
  }
  task.updatedAt = new Date().toISOString();
  localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  return task;
}

// ----------------- MOCK TESTS & EVALUATION -----------------
// Safely returns questions for test execution WITHOUT the correct answers
export function getTestQuestions(
  category: McqCategory,
  count: number = 10,
  difficulty?: 'All' | 'Easy' | 'Medium' | 'Hard'
): QuestionClient[] {
  const all = getAllQuestions();
  let categoryQuestions = all.filter(q => q.category === category);
  
  if (difficulty && difficulty !== 'All') {
    const diffMatch = categoryQuestions.filter(q => q.difficulty === difficulty);
    if (diffMatch.length > 0) {
      categoryQuestions = diffMatch;
    }
  }

  // True Fisher-Yates shuffle to guarantee unique, randomized question order
  const shuffled = [...categoryQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  return selected.map(q => ({
    id: q.id,
    category: q.category,
    topic: q.topic,
    difficulty: q.difficulty,
    question: q.question,
    options: q.options,
  }));
}

// Backend evaluation logic: calculates score against master bank and records attempt
export function submitTest(
  userId: string,
  category: McqCategory,
  userAnswers: { [questionId: string]: number },
  questionIds: string[],
  timeSpentSeconds?: number
): {
  attempt: TestAttempt;
  detailedResults: Array<{
    question: Question;
    selectedAnswer: number | null;
    isCorrect: boolean;
  }>;
} {
  const all = getAllQuestions();
  let correctCount = 0;
  const detailedResults: Array<{
    question: Question;
    selectedAnswer: number | null;
    isCorrect: boolean;
  }> = [];

  for (const qId of questionIds) {
    const question = all.find(q => q.id === qId);
    if (!question) continue;
    const selected = userAnswers[qId] !== undefined ? userAnswers[qId] : null;
    const isCorrect = selected === question.correctAnswer;
    if (isCorrect) correctCount++;
    detailedResults.push({
      question,
      selectedAnswer: selected,
      isCorrect,
    });
  }

  const total = questionIds.length;
  let answeredCount = 0;
  for (const qId of questionIds) {
    if (userAnswers[qId] !== undefined && userAnswers[qId] !== null) {
      answeredCount++;
    }
  }
  const unansweredCount = total - answeredCount;
  const incorrectCount = answeredCount - correctCount;
  const percentage = Math.round((correctCount / (total || 1)) * 100);
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  const attempt: TestAttempt = {
    id: generateId(),
    userId,
    category,
    score: correctCount,
    totalQuestions: total,
    percentage,
    correctAnswers: correctCount,
    incorrectAnswers: incorrectCount,
    unanswered: unansweredCount,
    accuracy,
    submittedAt: new Date().toISOString(),
    userAnswers,
    questionIds,
    timeSpentSeconds,
  };

  const data = localStorage.getItem(KEYS.TEST_ATTEMPTS);
  const attempts: TestAttempt[] = data ? JSON.parse(data) : [];
  attempts.push(attempt);
  localStorage.setItem(KEYS.TEST_ATTEMPTS, JSON.stringify(attempts));

  return { attempt, detailedResults };
}

export function getTestAttempts(userId: string): TestAttempt[] {
  const data = localStorage.getItem(KEYS.TEST_ATTEMPTS);
  const attempts: TestAttempt[] = data ? JSON.parse(data) : [];
  return attempts
    .filter(a => a.userId === userId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export function getTestAttemptById(userId: string, attemptId: string): {
  attempt: TestAttempt;
  detailedResults: Array<{
    question: Question;
    selectedAnswer: number | null;
    isCorrect: boolean;
  }>;
} | null {
  const attempts = getTestAttempts(userId);
  const attempt = attempts.find(a => a.id === attemptId);
  if (!attempt) return null;
  const all = getAllQuestions();
  const detailedResults: Array<{
    question: Question;
    selectedAnswer: number | null;
    isCorrect: boolean;
  }> = [];

  for (const qId of attempt.questionIds) {
    const question = all.find(q => q.id === qId);
    if (!question) continue;
    const selected = attempt.userAnswers[qId] !== undefined && attempt.userAnswers[qId] !== null
      ? attempt.userAnswers[qId]
      : null;
    const isCorrect = selected === question.correctAnswer;
    detailedResults.push({
      question,
      selectedAnswer: selected,
      isCorrect,
    });
  }

  return { attempt, detailedResults };
}

// ----------------- COMPANY & PLACEMENT DRIVES -----------------
export function getCompanyDrives(userId: string): CompanyDrive[] {
  const data = localStorage.getItem(KEYS.COMPANY_DRIVES);
  const drives: CompanyDrive[] = data ? JSON.parse(data) : [];
  return drives
    .filter(d => d.userId === userId)
    .sort((a, b) => new Date(a.driveDate).getTime() - new Date(b.driveDate).getTime());
}

export function addCompanyDrive(userId: string, driveData: Omit<CompanyDrive, 'id' | 'userId' | 'createdAt'>): CompanyDrive {
  const data = localStorage.getItem(KEYS.COMPANY_DRIVES);
  const drives: CompanyDrive[] = data ? JSON.parse(data) : [];
  const newDrive: CompanyDrive = {
    ...driveData,
    id: generateId(),
    userId,
    createdAt: new Date().toISOString(),
  };
  drives.push(newDrive);
  localStorage.setItem(KEYS.COMPANY_DRIVES, JSON.stringify(drives));
  return newDrive;
}

export function updateCompanyDrive(userId: string, updatedDrive: CompanyDrive): void {
  const data = localStorage.getItem(KEYS.COMPANY_DRIVES);
  const drives: CompanyDrive[] = data ? JSON.parse(data) : [];
  const idx = drives.findIndex(d => d.id === updatedDrive.id && d.userId === userId);
  if (idx >= 0) {
    drives[idx] = updatedDrive;
    localStorage.setItem(KEYS.COMPANY_DRIVES, JSON.stringify(drives));
  }
}

export function deleteCompanyDrive(userId: string, driveId: string): boolean {
  const data = localStorage.getItem(KEYS.COMPANY_DRIVES);
  let drives: CompanyDrive[] = data ? JSON.parse(data) : [];
  const initial = drives.length;
  drives = drives.filter(d => !(d.id === driveId && d.userId === userId));
  localStorage.setItem(KEYS.COMPANY_DRIVES, JSON.stringify(drives));
  return drives.length < initial;
}

// ----------------- PLACEMENT APPLICATIONS -----------------
export function getApplications(userId: string): Application[] {
  const data = localStorage.getItem(KEYS.APPLICATIONS);
  const apps: Application[] = data ? JSON.parse(data) : [];
  return apps
    .filter(a => a.userId === userId)
    .sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime());
}

export function addApplication(userId: string, appData: Omit<Application, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Application {
  const data = localStorage.getItem(KEYS.APPLICATIONS);
  const apps: Application[] = data ? JSON.parse(data) : [];
  const now = new Date().toISOString();
  
  // Student-initiated applications begin with 'Saved' or 'Applied'
  const initialStatus: ApplicationStatus = (appData.status === 'Saved' || appData.status === 'Applied') 
    ? appData.status 
    : 'Applied';

  const initialHistory: StatusHistoryEntry[] = appData.statusHistory && appData.statusHistory.length > 0 
    ? appData.statusHistory 
    : [
        {
          id: generateId(),
          status: initialStatus,
          changedAt: now,
          updatedBy: 'Student',
          note: initialStatus === 'Saved' ? 'Opportunity bookmarked by student.' : 'Application submitted by student.'
        }
      ];

  const newApp: Application = {
    ...appData,
    status: initialStatus,
    id: generateId(),
    userId,
    statusUpdatedBy: 'Student',
    statusUpdatedAt: now,
    statusHistory: initialHistory,
    createdAt: now,
    updatedAt: now,
  };
  apps.push(newApp);
  localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
  return newApp;
}

export function updateApplication(userId: string, updatedApp: Application): void {
  const data = localStorage.getItem(KEYS.APPLICATIONS);
  const apps: Application[] = data ? JSON.parse(data) : [];
  const idx = apps.findIndex(a => a.id === updatedApp.id && a.userId === userId);
  if (idx >= 0) {
    const existing = apps[idx];
    // Preserve employer-controlled status unless authorized update
    const safeStatus = (updatedApp.status === 'Saved' || updatedApp.status === 'Applied') 
      ? updatedApp.status 
      : existing.status;

    apps[idx] = { 
      ...existing,
      ...updatedApp, 
      status: safeStatus,
      statusHistory: existing.statusHistory || [],
      updatedAt: new Date().toISOString() 
    };
    localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
  }
}

export function deleteApplication(userId: string, appId: string): boolean {
  const data = localStorage.getItem(KEYS.APPLICATIONS);
  let apps: Application[] = data ? JSON.parse(data) : [];
  const initial = apps.length;
  apps = apps.filter(a => !(a.id === appId && a.userId === userId));
  localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
  return apps.length < initial;
}

// ----------------- AUTHORIZED STATUS UPDATE & NOTIFICATIONS -----------------
export function updateApplicationStatusByAdmin(
  applicationId: string,
  newStatus: ApplicationStatus,
  adminNote?: string,
  adminDesignation: string = 'Campus TPO / Placement Cell'
): { success: boolean; application?: Application; notification?: AppNotification; error?: string } {
  const data = localStorage.getItem(KEYS.APPLICATIONS);
  const apps: Application[] = data ? JSON.parse(data) : [];
  const idx = apps.findIndex(a => a.id === applicationId);
  if (idx === -1) {
    return { success: false, error: 'Application record not found.' };
  }

  const app = apps[idx];
  const prevStatus = app.status;
  const now = new Date().toISOString();

  const historyEntry: StatusHistoryEntry = {
    id: generateId(),
    status: newStatus,
    changedAt: now,
    updatedBy: adminDesignation,
    note: adminNote?.trim() || `Official placement status changed from ${prevStatus} to ${newStatus}.`
  };

  const currentHistory = Array.isArray(app.statusHistory) ? app.statusHistory : [];
  const updatedHistory = [...currentHistory, historyEntry];

  const updatedApp: Application = {
    ...app,
    status: newStatus,
    statusUpdatedBy: adminDesignation,
    statusUpdatedAt: now,
    statusHistory: updatedHistory,
    updatedAt: now,
  };

  apps[idx] = updatedApp;
  localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));

  // Create real persistent notification for the student
  const notification = createStatusNotification(app.userId, updatedApp, newStatus, adminNote, adminDesignation);

  return { success: true, application: updatedApp, notification };
}

export function getNotifications(userId: string): AppNotification[] {
  const data = localStorage.getItem(KEYS.NOTIFICATIONS);
  const notifs: AppNotification[] = data ? JSON.parse(data) : [];
  return notifs
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getUnreadNotificationCount(userId: string): number {
  return getNotifications(userId).filter(n => !n.isRead).length;
}

export function markNotificationAsRead(userId: string, notifId: string): void {
  const data = localStorage.getItem(KEYS.NOTIFICATIONS);
  const notifs: AppNotification[] = data ? JSON.parse(data) : [];
  const idx = notifs.findIndex(n => n.id === notifId && n.userId === userId);
  if (idx >= 0) {
    notifs[idx].isRead = true;
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }
}

export function markAllNotificationsAsRead(userId: string): void {
  const data = localStorage.getItem(KEYS.NOTIFICATIONS);
  const notifs: AppNotification[] = data ? JSON.parse(data) : [];
  const updated = notifs.map(n => n.userId === userId ? { ...n, isRead: true } : n);
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(updated));
}

export function createStatusNotification(
  userId: string,
  application: Application,
  newStatus: ApplicationStatus,
  adminNote?: string,
  adminDesignation: string = 'Campus TPO / Placement Cell'
): AppNotification {
  const data = localStorage.getItem(KEYS.NOTIFICATIONS);
  const notifs: AppNotification[] = data ? JSON.parse(data) : [];

  let title = `Status Update: ${newStatus}`;
  let message = `Your application for ${application.jobRole} at ${application.companyName} has been moved to '${newStatus}'.`;

  switch (newStatus) {
    case 'Assessment':
      title = `Online Assessment Scheduled — ${application.companyName}`;
      message = `You are scheduled for the online screening assessment for ${application.jobRole}.`;
      break;
    case 'Interview':
      title = `Interview Stage Reached — ${application.companyName}`;
      message = `Congratulations! Your application for ${application.jobRole} has advanced to the Interview round.`;
      break;
    case 'Shortlisted':
      title = `Shortlisted by ${application.companyName}`;
      message = `Your profile has been shortlisted for the ${application.jobRole} campus drive.`;
      break;
    case 'Selected':
    case 'Offer Received':
      title = `🎉 Placement Offer — ${application.companyName}`;
      message = `Official offer recorded for ${application.jobRole}! View placement details and onboarding notes.`;
      break;
    case 'Rejected':
    case 'Not Selected':
      title = `Application Outcome — ${application.companyName}`;
      message = `Your application for ${application.jobRole} was not selected in this evaluation round.`;
      break;
    default:
      break;
  }

  const newNotif: AppNotification = {
    id: generateId(),
    userId,
    applicationId: application.id,
    companyName: application.companyName,
    jobRole: application.jobRole,
    title,
    message,
    statusUpdatedTo: newStatus,
    adminNote: adminNote?.trim(),
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  notifs.unshift(newNotif);
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  return newNotif;
}

// ----------------- DASHBOARD STATISTICS -----------------
export function getDashboardStats(userId: string) {
  const tasks = getTasks(userId);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Real preparation tasks: prefer pending & in progress first, otherwise newest
  const todayTasks = [...tasks].sort((a, b) => {
    if (a.status !== 'Completed' && b.status === 'Completed') return -1;
    if (a.status === 'Completed' && b.status !== 'Completed') return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  }).slice(0, 4);

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    inProgressTasks,
    progressPercent,
    todayTasks,
  };
}

// ----------------- DEMO DATA SEEDER -----------------
// Seeds realistic student profile and authentic preparation tasks (no fake drives or scores)
export async function seedDemoDataForUser(user: User): Promise<void> {
  // 1. Student Profile
  saveProfile({
    userId: user.id,
    fullName: user.fullName,
    email: user.email,
    collegeName: 'National Institute of Engineering & Technology',
    branch: 'Computer Science and Engineering',
    semester: 'Semester 7 — Fourth Year',
    graduationYear: '2026',
    cgpa: '8.65',
    technicalSkills: ['Java', 'Python', 'SQL', 'Data Structures & Algorithms', 'HTML/CSS', 'Git', 'Docker Basics'],
    areasOfInterest: 'Backend Engineering, Distributed Systems, Cloud Architecture',
    preferredRole: 'Graduate Software Engineer / Full Stack Trainee',
    updatedAt: new Date().toISOString(),
  });

  // 2. Real Academic Preparation Tasks
  const existingTasks = getTasks(user.id);
  if (existingTasks.length === 0) {
    const sampleTasks: Array<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> = [
      {
        title: 'Revise Time & Work formulas and shortcuts',
        category: 'Aptitude',
        status: 'Completed',
        targetDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
        notes: 'Reviewed standard formulas, solved 20 practice questions on efficiency and pipes.',
      },
      {
        title: 'Practice Binary Tree traversals (In-order, Pre-order, Post-order)',
        category: 'Coding Practice',
        status: 'In Progress',
        targetDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        notes: 'Implement recursive and iterative stack-based traversal algorithms in Java/C++.',
      },
      {
        title: 'Revise DBMS Normalization (1NF, 2NF, 3NF & BCNF)',
        category: 'Technical Subjects',
        status: 'Completed',
        targetDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        notes: 'Understand transitive and partial functional dependencies for technical interview questions.',
      },
      {
        title: 'Prepare 90-second technical self-introduction & project pitch',
        category: 'Interview Preparation',
        status: 'In Progress',
        targetDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
        notes: 'Highlight B.Tech academic coursework, project architecture, and problem-solving skills.',
      },
      {
        title: 'Practice Coding-Decoding and Syllogism puzzles',
        category: 'Logical Reasoning',
        status: 'Pending',
        targetDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        notes: 'Speed drills on circular seating and syllogism conclusion validity.',
      },
    ];
    for (const t of sampleTasks) {
      addTask(user.id, t);
    }
  }

  // 3. Sample Placement Drives
  const existingDrives = getCompanyDrives(user.id);
  if (existingDrives.length === 0) {
    addCompanyDrive(user.id, {
      companyName: 'Tata Consultancy Services',
      jobRole: 'Digital Innovator / Systems Engineer',
      eligibilityCriteria: '60%+ in 10th, 12th & B.Tech, 0 active backlogs',
      driveDate: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0],
      linkOrNotes: 'TPO registration deadline: Nov 14. Assessment scheduled on TCS iON platform.',
    });
    addCompanyDrive(user.id, {
      companyName: 'Infosys Technologies',
      jobRole: 'Specialist Programmer (SP)',
      eligibilityCriteria: '65%+ or 6.5 CGPA throughout academics',
      driveDate: new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0],
      linkOrNotes: 'HackWithInfy / InfyTQ qualifier round scheduled.',
    });
    addCompanyDrive(user.id, {
      companyName: 'Amazon AWS',
      jobRole: 'Cloud Support Associate Trainee',
      eligibilityCriteria: 'CGPA 7.0+, strong Linux & networking fundamentals',
      driveDate: new Date(Date.now() + 86400000 * 28).toISOString().split('T')[0],
      linkOrNotes: 'Online test link will be emailed to eligible candidates.',
    });
  }

  // 4. Sample Applications
  const existingApps = getApplications(user.id);
  if (existingApps.length === 0) {
    addApplication(user.id, {
      companyName: 'Tata Consultancy Services',
      jobRole: 'Digital Innovator',
      applicationDate: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
      status: 'Interview',
      notes: 'Cleared online test with 82%. Technical round scheduled for next week.',
    });
    addApplication(user.id, {
      companyName: 'Infosys Technologies',
      jobRole: 'Specialist Programmer',
      applicationDate: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
      status: 'Assessment',
      notes: 'InfyTQ assessment slot booked.',
    });
    addApplication(user.id, {
      companyName: 'Cognizant Technology Solutions',
      jobRole: 'GenC Elevate Trainee',
      applicationDate: new Date(Date.now() - 86400000 * 25).toISOString().split('T')[0],
      status: 'Selected',
      notes: 'Official campus offer letter received! CTC: 4.5 LPA.',
    });
    addApplication(user.id, {
      companyName: 'Wipro Technologies',
      jobRole: 'Project Engineer',
      applicationDate: new Date(Date.now() - 86400000 * 30).toISOString().split('T')[0],
      status: 'Not Selected',
      notes: 'Could not clear technical round 2.',
    });
  }

  // 5. Sample Practice Test Attempt
  const existingAttempts = getTestAttempts(user.id);
  if (existingAttempts.length === 0) {
    const allQs = getAllQuestions().filter(q => q.category === 'Quantitative Aptitude').slice(0, 10);
    if (allQs.length > 0) {
      const qIds = allQs.map(q => q.id);
      const answers: { [key: string]: number } = {};
      allQs.forEach((q, idx) => {
        answers[q.id] = idx < 8 ? q.correctAnswer : (q.correctAnswer + 1) % 4;
      });
      submitTest(user.id, 'Quantitative Aptitude', answers, qIds, 420);
    }
  }
}

