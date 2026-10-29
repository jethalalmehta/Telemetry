import React from 'react';
import { User, StudentProfile, ActiveTab } from '../types';
import { getDashboardStats, toggleTaskStatus, getTestAttempts, getCompanyDrives, getApplications } from '../utils/storage';
import { 
  CheckSquare, 
  User as UserIcon, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Plus, 
  BookOpen, 
  Code2, 
  Layers,
  GraduationCap,
  Award,
  Building2,
  FileSpreadsheet,
  PieChart
} from 'lucide-react';

interface DashboardViewProps {
  user: User;
  profile: StudentProfile | null;
  onNavigate: (tab: ActiveTab) => void;
  onRefresh: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  profile,
  onNavigate,
  onRefresh,
}) => {
  const stats = getDashboardStats(user.id);
  const attempts = getTestAttempts(user.id);
  const totalQuizAttempts = attempts.length;
  const avgQuizScore = totalQuizAttempts > 0 
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalQuizAttempts) 
    : 0;
  const bestQuizScore = totalQuizAttempts > 0 
    ? Math.max(...attempts.map((a) => a.percentage)) 
    : 0;

  const drives = getCompanyDrives(user.id);
  const applications = getApplications(user.id);
  const activeApplications = applications.filter(a => a.status !== 'Selected' && a.status !== 'Not Selected').length;
  const selectedOffers = applications.filter(a => a.status === 'Selected').length;
  const upcomingDrivesCount = drives.length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleToggleTask = (taskId: string) => {
    toggleTaskStatus(user.id, taskId);
    onRefresh();
  };

  const displayName = profile?.fullName || user.fullName;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* 1. Welcome Section: Student Name + Encouraging Message */}
      <div className="card-panel p-6 sm:p-7 bg-white relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#E7F0FA] text-[#203B53] text-xs font-semibold mb-2 border border-[#D0E2F5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#398879]" />
            <span>{profile?.branch || 'Engineering Student'} • {profile?.semester || 'Placement Season'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#203B53] tracking-tight">
            {getGreeting()}, {displayName}!
          </h1>

          <p className="text-xs sm:text-sm text-[#758392] mt-1.5 max-w-xl leading-relaxed">
            Consistent preparation turns opportunities into placement offers. Here is your current preparation status, assessment metrics, and application pipeline.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('mocktests')}
            className="btn-primary text-xs sm:text-sm !py-2 !px-3.5 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#FFFFFF]" />
            <span>Practice Tests</span>
          </button>
          <button
            onClick={() => onNavigate('tasks')}
            className="btn-secondary text-xs sm:text-sm !py-2 !px-3 cursor-pointer"
          >
            <CheckSquare className="w-4 h-4 text-[#398879]" />
            <span>Tasks</span>
          </button>
          <button
            onClick={() => onNavigate('jobs')}
            className="btn-secondary text-xs sm:text-sm !py-2 !px-3 cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-[#398879]" />
            <span>Find Jobs</span>
          </button>
          <button
            onClick={() => onNavigate('resume')}
            className="btn-secondary text-xs sm:text-sm !py-2 !px-3 cursor-pointer"
          >
            <UserIcon className="w-4 h-4 text-[#398879]" />
            <span>Resume Match</span>
          </button>
          <button
            onClick={() => onNavigate('applications')}
            className="btn-secondary text-xs sm:text-sm !py-2 !px-3 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#398879]" />
            <span>Pipeline</span>
          </button>
          <button
            onClick={() => onNavigate('analysis')}
            className="btn-secondary text-xs sm:text-sm !py-2 !px-3 cursor-pointer"
          >
            <PieChart className="w-4 h-4 text-[#398879]" />
            <span>Analysis</span>
          </button>
        </div>
      </div>

      {/* 2. Four Compact Placement Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Preparation Tasks */}
        <div className="card-panel p-4 flex items-center justify-between card-panel-interactive">
          <div>
            <span className="text-[11px] font-medium text-[#758392] block">Syllabus Progress</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-extrabold text-[#203B53]">
                {stats.progressPercent}%
              </span>
              <span className="text-[11px] text-[#758392]">({stats.completedTasks}/{stats.totalTasks})</span>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="mt-1.5 text-xs font-semibold text-[#398879] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage tasks</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#E7F0FA] text-[#203B53] flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5 text-[#398879]" />
          </div>
        </div>

        {/* Stat 2: Aptitude Tests Benchmark */}
        <div className="card-panel p-4 flex items-center justify-between card-panel-interactive">
          <div>
            <span className="text-[11px] font-medium text-[#758392] block">Aptitude Score</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-extrabold text-[#398879]">
                {avgQuizScore}%
              </span>
              <span className="text-[11px] text-[#758392]">avg ({totalQuizAttempts} tests)</span>
            </div>
            <button
              onClick={() => onNavigate('mocktests')}
              className="mt-1.5 text-xs font-semibold text-[#398879] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Launch quiz</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[rgba(57,136,121,0.12)] text-[#398879] flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 3: Active Applications */}
        <div className="card-panel p-4 flex items-center justify-between card-panel-interactive">
          <div>
            <span className="text-[11px] font-medium text-[#758392] block">Active Pipeline</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-extrabold text-[#203B53]">
                {activeApplications}
              </span>
              <span className="text-[11px] text-[#398879] font-semibold">{selectedOffers > 0 ? `• ${selectedOffers} offer(s)` : 'in process'}</span>
            </div>
            <button
              onClick={() => onNavigate('applications')}
              className="mt-1.5 text-xs font-semibold text-[#398879] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View pipeline</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center shrink-0 border border-[#DCFCE7]">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 4: Campus Drives */}
        <div className="card-panel p-4 flex items-center justify-between card-panel-interactive">
          <div>
            <span className="text-[11px] font-medium text-[#758392] block">Placement Drives</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-extrabold text-[#203B53]">
                {upcomingDrivesCount}
              </span>
              <span className="text-[11px] text-[#758392]">companies</span>
            </div>
            <button
              onClick={() => onNavigate('drives')}
              className="mt-1.5 text-xs font-semibold text-[#398879] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore drives</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FDF6EC] text-[#DCA65A] flex items-center justify-center shrink-0 border border-[#FDE68A]">
            <Building2 className="w-5 h-5 text-[#97651C]" />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Preparation + Weekly Progress & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Today's Preparation */}
        <div className="lg:col-span-2 card-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#398879]" />
                <h2 className="text-base font-bold text-[#203B53]">
                  Today's Preparation Tasks
                </h2>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs font-semibold text-[#398879] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Tracker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Empty State for new students */}
            {stats.todayTasks.length === 0 ? (
              <div className="py-10 text-center px-4 bg-[#F5F7FA] rounded-xl border border-dashed border-[#CFD9E4]">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#E7F0FA] flex items-center justify-center text-[#758392] mb-3">
                  <CheckSquare className="w-5 h-5 text-[#398879]" />
                </div>
                <p className="font-bold text-[#203B53] text-sm">
                  No preparation tasks yet
                </p>
                <p className="text-xs text-[#758392] mt-1 max-w-sm mx-auto mb-4">
                  Add your first preparation task to organize your aptitude, coding, or technical interview topics.
                </p>
                <button
                  onClick={() => onNavigate('tasks')}
                  className="btn-primary text-xs !py-2 !px-4"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Task</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {stats.todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] flex items-center justify-between gap-3 transition-colors hover:bg-white"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className="shrink-0 cursor-pointer focus:outline-none"
                        title="Click to toggle status"
                      >
                        {task.status === 'Completed' ? (
                          <div className="w-5 h-5 rounded-md bg-[#398879] text-white flex items-center justify-center animate-pop">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : task.status === 'In Progress' ? (
                          <div className="w-5 h-5 rounded-md bg-[#E7F0FA] text-[#203B53] flex items-center justify-center border border-[#D0E2F5]">
                            <Clock className="w-3.5 h-3.5 text-[#398879]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-md border-2 border-[#DCE3EB] hover:border-[#398879] bg-white transition-colors" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <p
                          className={`text-xs sm:text-sm font-semibold truncate ${
                            task.status === 'Completed'
                              ? 'line-through text-[#758392]'
                              : 'text-[#203B53]'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#758392]">
                          <span className="font-semibold text-[#263746]">{task.category}</span>
                          {task.targetDate && (
                            <>
                              <span>•</span>
                              <span>Target: {task.targetDate}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {task.status === 'Completed' && (
                        <span className="badge-teal px-2 py-0.5 rounded text-[10px]">Completed</span>
                      )}
                      {task.status === 'In Progress' && (
                        <span className="badge-sky px-2 py-0.5 rounded text-[10px]">In Progress</span>
                      )}
                      {task.status === 'Pending' && (
                        <span className="badge-amber px-2 py-0.5 rounded text-[10px]">Pending</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#758392]">
            <span>Click any checkbox to update status</span>
            <span className="font-semibold text-[#203B53]">Live Dashboard Sync</span>
          </div>
        </div>

        {/* Right Column: Progress & Quick Actions */}
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="card-panel p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#398879]" />
                <h3 className="text-base font-bold text-[#203B53]">
                  Preparation Progress
                </h3>
              </div>
              <span className="font-extrabold text-sm text-[#398879]">
                {stats.progressPercent}%
              </span>
            </div>

            <p className="text-xs text-[#758392] mb-3">
              Calculated dynamically from real completed preparation tasks.
            </p>

            {/* Progress bar */}
            <div className="w-full h-3 rounded-full bg-[#E2E8F0] overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-[#398879] progress-fill"
                style={{ width: `${Math.max(stats.progressPercent, stats.totalTasks > 0 ? 4 : 0)}%` }}
              />
            </div>

            {/* Formula Box */}
            <div className="mt-3.5 p-3 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] text-[11px] space-y-1">
              <div className="flex items-center justify-between text-[#758392]">
                <span>Calculation Formula:</span>
                <span className="font-mono text-[#203B53] font-semibold">(Completed ÷ Total) × 100</span>
              </div>
              <div className="flex items-center justify-between text-[#263746] pt-1 border-t border-[#E2E8F0]">
                <span>Actual Values:</span>
                <span className="font-semibold">
                  ({stats.completedTasks} ÷ {stats.totalTasks || 0}) = {stats.progressPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="card-panel p-5 bg-white space-y-2.5">
            <h3 className="text-xs font-bold text-[#203B53] uppercase tracking-wider">
              Quick Actions
            </h3>
            <button
              onClick={() => onNavigate('mocktests')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#E7F0FA] hover:bg-[#D0E2F5] text-xs font-semibold text-[#203B53] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-[#398879]" />
                <span>Launch Practice Test</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#203B53]" />
            </button>

            <button
              onClick={() => onNavigate('tasks')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#F5F7FA] hover:bg-[#E7F0FA] text-xs font-semibold text-[#203B53] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-[#398879]" />
                <span>Add Preparation Task</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#758392]" />
            </button>

            <button
              onClick={() => onNavigate('drives')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#F5F7FA] hover:bg-[#E7F0FA] text-xs font-semibold text-[#203B53] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-[#398879]" />
                <span>Placement Drives</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#758392]" />
            </button>

            <button
              onClick={() => onNavigate('applications')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#F5F7FA] hover:bg-[#E7F0FA] text-xs font-semibold text-[#203B53] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#398879]" />
                <span>Application Tracker</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#758392]" />
            </button>

            <button
              onClick={() => onNavigate('analysis')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#F5F7FA] hover:bg-[#E7F0FA] text-xs font-semibold text-[#203B53] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <PieChart className="w-3.5 h-3.5 text-[#398879]" />
                <span>Placement Analysis</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#758392]" />
            </button>

            <button
              onClick={() => onNavigate('profile')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#F5F7FA] hover:bg-[#E7F0FA] text-xs font-semibold text-[#203B53] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <UserIcon className="w-3.5 h-3.5 text-[#398879]" />
                <span>Edit Academic Profile</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#758392]" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Aptitude & Practice Test Performance */}
      <div className="card-panel p-6 bg-white border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E7F0FA] flex items-center justify-center text-[#203B53]">
              <Award className="w-4 h-4 text-[#398879]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#203B53]">
                Aptitude & Practice Assessment Benchmark
              </h2>
              <p className="text-xs text-[#758392]">
                Track test accuracy and question mastery across campus evaluation rounds.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('mocktests')}
            className="btn-primary text-xs !py-2 !px-4 self-start sm:self-auto cursor-pointer"
          >
            <span>Take a Practice Quiz</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Compact Assessment Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0]">
            <span className="text-[11px] text-[#758392] font-medium block">Tests Attempted</span>
            <p className="text-xl font-extrabold text-[#203B53] mt-0.5">
              {totalQuizAttempts} <span className="text-xs font-normal text-[#758392]">attempts</span>
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0]">
            <span className="text-[11px] text-[#758392] font-medium block">Average Assessment Score</span>
            <p className="text-xl font-extrabold text-[#398879] mt-0.5">
              {avgQuizScore}%
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0]">
            <span className="text-[11px] text-[#758392] font-medium block">Top Score Achieved</span>
            <p className="text-xl font-extrabold text-[#203B53] mt-0.5">
              {bestQuizScore}%
            </p>
          </div>
        </div>

        {/* Recent Attempts or Prompt */}
        {attempts.length > 0 ? (
          <div className="pt-2">
            <h4 className="text-xs font-bold text-[#203B53] mb-2">Recent Test Sessions:</h4>
            <div className="space-y-2">
              {attempts.slice(0, 3).map((att) => (
                <div
                  key={att.id}
                  className="p-3 rounded-lg bg-[#FAFCFE] border border-[#E2E8F0] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#398879]" />
                    <span className="font-semibold text-[#203B53]">{att.category}</span>
                    <span className="text-[#758392]">
                      ({new Date(att.submittedAt).toLocaleDateString()})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#203B53]">
                      {att.score}/{att.totalQuestions} ({att.percentage}%)
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      att.percentage >= 60 ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {att.percentage >= 60 ? 'Proficient' : 'Needs Practice'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#F5F7FA] border border-dashed border-[#CFD9E4] text-center text-xs text-[#758392]">
            No practice tests logged yet. Launch a 10-question test to establish your aptitude baseline.
          </div>
        )}
      </div>

      {/* 4. Placement Preparation Categories & Strategy */}
      <div className="card-panel p-6 bg-white border border-[#E2E8F0] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#E7F0FA] text-[#203B53] border border-[#D0E2F5] uppercase mb-1">
              Syllabus Coverage
            </div>
            <h2 className="text-base font-bold text-[#203B53]">
              Preparation Domains & Placement Strategy
            </h2>
          </div>
          <button
            onClick={() => onNavigate('tasks')}
            className="text-xs font-semibold text-[#398879] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Open Tracker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-[#758392] leading-relaxed">
          Maintain a balanced study schedule across technical depth and speed-based aptitude to maximize your campus selection chances:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Domain 1 */}
          <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
            <div className="flex items-center justify-between">
              <BookOpen className="w-4 h-4 text-[#398879]" />
              <span className="badge-teal px-2 py-0.5 rounded text-[9px]">Aptitude</span>
            </div>
            <h3 className="text-xs font-bold text-[#203B53]">
              Aptitude & Logical Reasoning
            </h3>
            <p className="text-[11px] text-[#758392] leading-relaxed">
              Focus on speed shortcuts for Time & Work, Percentages, Syllogisms, and Data Interpretation for screening rounds.
            </p>
          </div>

          {/* Domain 2 */}
          <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
            <div className="flex items-center justify-between">
              <Layers className="w-4 h-4 text-[#398879]" />
              <span className="badge-sky px-2 py-0.5 rounded text-[9px]">Core CS</span>
            </div>
            <h3 className="text-xs font-bold text-[#203B53]">
              Core Technical Knowledge
            </h3>
            <p className="text-[11px] text-[#758392] leading-relaxed">
              Revise DBMS Normalization, SQL queries, OS Process Scheduling, and Object-Oriented Design principles.
            </p>
          </div>

          {/* Domain 3 */}
          <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] space-y-2">
            <div className="flex items-center justify-between">
              <Code2 className="w-4 h-4 text-[#398879]" />
              <span className="badge-teal px-2 py-0.5 rounded text-[9px]">Coding</span>
            </div>
            <h3 className="text-xs font-bold text-[#203B53]">
              Coding Practice & Projects
            </h3>
            <p className="text-[11px] text-[#758392] leading-relaxed">
              Practise standard Data Structure patterns (Trees, Graphs, Two Pointers) and prepare crisp project summaries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
