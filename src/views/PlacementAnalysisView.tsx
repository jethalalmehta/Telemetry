import React from 'react';
import { User, ActiveTab } from '../types';
import { 
  getApplications, 
  getCompanyDrives, 
  getTasks, 
  getTestAttempts, 
  getAllQuestions 
} from '../utils/storage';
import { 
  Briefcase, 
  Award, 
  BookOpen, 
  Calendar, 
  AlertCircle, 
  TrendingUp, 
  ArrowRight, 
  Building2, 
  Clock, 
  CheckCircle2, 
  Target,
  Sparkles,
  PieChart,
  Percent,
  Compass
} from 'lucide-react';

interface PlacementAnalysisViewProps {
  user: User;
  onNavigate: (tab: ActiveTab) => void;
}

export const PlacementAnalysisView: React.FC<PlacementAnalysisViewProps> = ({
  user,
  onNavigate,
}) => {
  const applications = getApplications(user.id);
  const drives = getCompanyDrives(user.id);
  const tasks = getTasks(user.id);
  const attempts = getTestAttempts(user.id);
  const allQuestions = getAllQuestions();

  // 1. Application Funnel Calculations
  const totalApps = applications.length;
  const activeApps = applications.filter(a => 
    ['Applied', 'Shortlisted', 'Assessment', 'Interview'].includes(a.status)
  ).length;
  const selectedApps = applications.filter(a => a.status === 'Selected').length;
  const rejectedApps = applications.filter(a => a.status === 'Not Selected').length;
  const assessmentApps = applications.filter(a => a.status === 'Assessment').length;
  const interviewApps = applications.filter(a => a.status === 'Interview').length;

  const resolvedApps = selectedApps + rejectedApps;
  const selectionRate = resolvedApps > 0 ? Math.round((selectedApps / resolvedApps) * 100) : 0;

  // Conversion rates (Section 5 requirement)
  const interviewPool = interviewApps + selectedApps;
  const appToInterviewRate = totalApps > 0 ? Math.round((interviewPool / totalApps) * 100) : 0;
  const interviewToSelectionRate = interviewPool > 0 ? Math.round((selectedApps / interviewPool) * 100) : 0;

  // Stage distribution map
  const stageCounts: { [key: string]: number } = {
    'Applied': applications.filter(a => a.status === 'Applied').length,
    'Shortlisted': applications.filter(a => a.status === 'Shortlisted').length,
    'Assessment': assessmentApps,
    'Interview': interviewApps,
    'Selected': selectedApps,
    'Not Selected': rejectedApps,
  };

  // 2. Preparation Syllabus Coverage
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const prepProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 3. Quiz Benchmarks & Topic Accuracy Analysis
  const totalQuizzes = attempts.length;
  const avgQuizScore = totalQuizzes > 0
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalQuizzes)
    : 0;
  const bestQuizScore = totalQuizzes > 0
    ? Math.max(...attempts.map(a => a.percentage))
    : 0;

  // Calculate topic-level accuracy from actual attempts
  const topicStats: { [topic: string]: { total: number; correct: number } } = {};
  attempts.forEach(att => {
    att.questionIds.forEach(qid => {
      const q = allQuestions.find(item => item.id === qid);
      if (q) {
        if (!topicStats[q.topic]) {
          topicStats[q.topic] = { total: 0, correct: 0 };
        }
        topicStats[q.topic].total += 1;
        const userAns = att.userAnswers[qid];
        if (userAns !== undefined && userAns === q.correctAnswer) {
          topicStats[q.topic].correct += 1;
        }
      }
    });
  });

  const weakerTopics = Object.entries(topicStats)
    .filter(([_, data]) => data.total >= 1)
    .map(([topic, data]) => ({
      topic,
      accuracy: Math.round((data.correct / data.total) * 100),
      totalTested: data.total
    }))
    .filter(t => t.accuracy < 65)
    .sort((a, b) => a.accuracy - b.accuracy);

  // Category average scores
  const categoryStats: { [cat: string]: { total: number; sum: number } } = {};
  attempts.forEach(att => {
    if (!categoryStats[att.category]) {
      categoryStats[att.category] = { total: 0, sum: 0 };
    }
    categoryStats[att.category].total += 1;
    categoryStats[att.category].sum += att.percentage;
  });

  // Rejection feedback aggregated
  const rejectedRecords = applications.filter(a => a.status === 'Not Selected' && (a.rejectionFeedback || a.notes));

  // Upcoming placement drives sorted by date
  const upcomingDrives = [...drives].sort((a, b) => 
    new Date(a.driveDate).getTime() - new Date(b.driveDate).getTime()
  ).slice(0, 4);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E7F0FA] text-[#203B53] text-xs font-bold border border-[#D0E2F5] mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#398879]" />
            <span>Placement Intelligence & Telemetry</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#203B53] tracking-tight">
            Placement Analysis & Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#758392] mt-0.5">
            Real performance telemetry evaluating recruitment conversion, syllabus mastery, and test readiness.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('jobs')}
            className="btn-secondary text-xs !py-2 !px-3.5 cursor-pointer"
          >
            <span>Find Jobs</span>
          </button>
          <button
            onClick={() => onNavigate('applications')}
            className="btn-primary text-xs !py-2 !px-3.5 cursor-pointer"
          >
            <span>Applications Tracker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 1. Executive Summary Grid: Conversion Rates & Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Applications */}
        <div className="card-panel p-4 bg-white border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#758392] font-semibold">Total Applications</span>
            <div className="w-8 h-8 rounded-lg bg-[#E7F0FA] flex items-center justify-center text-[#203B53]">
              <Briefcase className="w-4 h-4 text-[#398879]" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#203B53] mt-2">
            {totalApps}
          </p>
          <span className="text-[11px] text-[#758392] mt-0.5 block">
            {activeApps} currently in active pipeline
          </span>
        </div>

        {/* Metric 2: Selection Rate */}
        <div className="card-panel p-4 bg-white border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#758392] font-semibold">Selection Rate</span>
            <div className="w-8 h-8 rounded-lg bg-[#E7F4F1] flex items-center justify-center text-[#206053]">
              <Target className="w-4 h-4 text-[#206053]" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#398879] mt-2">
            {selectionRate}%
          </p>
          <span className="text-[11px] text-[#758392] mt-0.5 block" title="(Selected ÷ Concluded) × 100">
            {selectedApps} of {resolvedApps} concluded outcomes
          </span>
        </div>

        {/* Metric 3: Application to Interview Conversion */}
        <div className="card-panel p-4 bg-white border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#758392] font-semibold">Interview Conversion</span>
            <div className="w-8 h-8 rounded-lg bg-[#FDF6EC] flex items-center justify-center text-[#97651C]">
              <TrendingUp className="w-4 h-4 text-[#97651C]" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#DCA65A] mt-2">
            {appToInterviewRate}%
          </p>
          <span className="text-[11px] text-[#758392] mt-0.5 block" title="(Interviewed ÷ Total) × 100">
            {interviewPool} of {totalApps} reached interview
          </span>
        </div>

        {/* Metric 4: Interview to Offer Conversion */}
        <div className="card-panel p-4 bg-white border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#758392] font-semibold">Offer Conversion</span>
            <div className="w-8 h-8 rounded-lg bg-[#E7F4F1] flex items-center justify-center text-[#206053]">
              <Award className="w-4 h-4 text-[#398879]" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#398879] mt-2">
            {interviewToSelectionRate}%
          </p>
          <span className="text-[11px] text-[#758392] mt-0.5 block" title="(Selected ÷ Interview Pool) × 100">
            {selectedApps} offers from {interviewPool} interviews
          </span>
        </div>
      </div>

      {/* 2. Recruitment Stage Distribution */}
      <div className="card-panel p-6 bg-white border border-[#E2E8F0] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-base font-bold text-[#203B53]">
              Recruitment Funnel & Stage Breakdown
            </h2>
            <p className="text-xs text-[#758392]">
              Live status counts calculated directly from your placement application records.
            </p>
          </div>
          <button
            onClick={() => onNavigate('applications')}
            className="text-xs font-semibold text-[#398879] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Update Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {totalApps > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] text-center">
              <span className="text-[11px] font-semibold text-[#758392] block">Applied</span>
              <p className="text-xl font-extrabold text-[#203B53] mt-0.5">{stageCounts['Applied']}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] text-center">
              <span className="text-[11px] font-semibold text-[#758392] block">Shortlisted</span>
              <p className="text-xl font-extrabold text-[#203B53] mt-0.5">{stageCounts['Shortlisted']}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F3E8FF] border border-[#E9D5FF] text-center">
              <span className="text-[11px] font-semibold text-[#6B21A8] block">Assessment</span>
              <p className="text-xl font-extrabold text-[#6B21A8] mt-0.5">{assessmentApps}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FDF6EC] border border-[#F3DBB3] text-center">
              <span className="text-[11px] font-semibold text-[#97651C] block">Interview</span>
              <p className="text-xl font-extrabold text-[#97651C] mt-0.5">{interviewApps}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#E7F4F1] border border-[#B2DDD5] text-center">
              <span className="text-[11px] font-semibold text-[#206053] block">Selected</span>
              <p className="text-xl font-extrabold text-[#206053] mt-0.5">{selectedApps}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
              <span className="text-[11px] font-semibold text-rose-700 block">Not Selected</span>
              <p className="text-xl font-extrabold text-rose-700 mt-0.5">{rejectedApps}</p>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-[#F5F7FA] border border-dashed border-[#CFD9E4] text-center space-y-2">
            <Briefcase className="w-8 h-8 text-[#758392] mx-auto mb-1" />
            <h3 className="text-sm font-bold text-[#203B53]">No placement applications recorded yet</h3>
            <p className="text-xs text-[#758392] max-w-sm mx-auto">
              Track job opportunities from the live vacancies feed to view your recruitment conversion funnel.
            </p>
            <button
              onClick={() => onNavigate('jobs')}
              className="btn-primary text-xs !py-2 !px-4 mt-2 inline-block cursor-pointer"
            >
              Browse Live Opportunities
            </button>
          </div>
        )}
      </div>

      {/* 3. Rejection Feedback Trends & Repeated Skill Gaps (Section 4 & 5 Requirement) */}
      {rejectedRecords.length > 0 && (
        <div className="card-panel p-6 bg-white border border-[#E2E8F0] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <div>
              <h2 className="text-base font-bold text-[#172B3A]">
                Rejection Feedback Analysis & Identified Gaps
              </h2>
              <p className="text-xs text-[#758392]">
                Actionable improvement suggestions synthesized from recorded candidate interview feedback.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {rejectedRecords.map(app => (
              <div key={app.id} className="p-4 rounded-xl bg-[#FDF2F2] border border-[#F8B4AC] text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#7F1D1D]">{app.companyName} — {app.jobRole}</span>
                  <span className="text-[10px] text-[#991B1B] font-semibold bg-white px-2 py-0.5 rounded border border-[#F8B4AC]">
                    {app.selectionStage || 'Interview Stage'}
                  </span>
                </div>
                <p className="text-[#991B1B] italic">"{app.rejectionFeedback || app.notes}"</p>
                {app.recommendedImprovements && app.recommendedImprovements.length > 0 && (
                  <div className="pt-2 border-t border-[#F8B4AC] text-[11px] text-[#7F1D1D]">
                    <span className="font-semibold block mb-0.5">Recommended Remediation:</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {app.recommendedImprovements.map((imp, idx) => (
                        <li key={idx}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Aptitude Quiz Category Benchmarks + Weaker Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <div className="card-panel p-6 bg-white border border-[#E2E8F0] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-base font-bold text-[#203B53]">
                Category Mastery Benchmark
              </h3>
              <p className="text-xs text-[#758392]">
                Average quiz scores by subject domain.
              </p>
            </div>
            <button
              onClick={() => onNavigate('mocktests')}
              className="text-xs font-semibold text-[#398879] hover:underline cursor-pointer"
            >
              Take Quiz →
            </button>
          </div>

          {Object.keys(categoryStats).length > 0 ? (
            <div className="space-y-3 pt-1">
              {Object.entries(categoryStats).map(([cat, stat]) => {
                const avg = Math.round(stat.sum / stat.total);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#203B53]">{cat}</span>
                      <span className={avg >= 60 ? 'text-[#398879]' : 'text-amber-700'}>
                        {avg}% ({stat.total} tests)
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          avg >= 60 ? 'bg-[#398879]' : 'bg-[#DCA65A]'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, avg))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-[#F5F7FA] border border-dashed border-[#CFD9E4] text-center">
              <p className="text-xs text-[#758392]">
                No quiz attempts on record. Take an aptitude or reasoning quiz to measure your category scores.
              </p>
              <button
                onClick={() => onNavigate('mocktests')}
                className="btn-primary text-xs !py-1.5 !px-3 mt-3 cursor-pointer"
              >
                Launch Practice Quiz
              </button>
            </div>
          )}
        </div>

        {/* Identified Weaker Topics */}
        <div className="card-panel p-6 bg-white border border-[#E2E8F0] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-base font-bold text-[#203B53]">
                Identified Weaker Topics
              </h3>
              <p className="text-xs text-[#758392]">
                Topics with accuracy &lt; 65% in tested question history.
              </p>
            </div>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Needs Revision
            </span>
          </div>

          {weakerTopics.length > 0 ? (
            <div className="space-y-2 pt-1">
              {weakerTopics.slice(0, 4).map(item => (
                <div
                  key={item.topic}
                  className="p-3 rounded-lg bg-rose-50/60 border border-rose-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-rose-900 block font-bold">{item.topic}</strong>
                    <span className="text-[11px] text-rose-700">
                      Tested in {item.totalTested} questions
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-300">
                      {item.accuracy}% Accuracy
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : totalQuizzes > 0 ? (
            <div className="p-6 rounded-xl bg-[#E7F4F1] border border-[#B2DDD5] text-center">
              <p className="text-xs font-bold text-[#206053]">
                Strong Topic Accuracy
              </p>
              <p className="text-[11px] text-[#206053] mt-1">
                No topics currently fall below the 65% threshold in your saved practice quiz records.
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-[#F5F7FA] border border-dashed border-[#CFD9E4] text-center">
              <p className="text-xs text-[#758392]">
                Weaker topic analytics will populate automatically as you answer multiple choice questions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
