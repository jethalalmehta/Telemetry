import React, { useState, useEffect } from 'react';
import { User, StudentProfile, JobOpportunity, EligibilityResult } from '../types';
import { getProfile } from '../utils/storage';
import { 
  getJobOpportunities, 
  fetchLiveJobOpportunities, 
  checkJobEligibility, 
  toggleBookmarkJob, 
  addCustomJobOpportunity, 
  getResume,
  trackJobOpportunityInPipeline 
} from '../utils/jobService';
import { 
  Building2, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Plus, 
  MapPin, 
  DollarSign, 
  Clock, 
  GraduationCap, 
  Calendar, 
  Briefcase, 
  ArrowUpDown, 
  SlidersHorizontal,
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';

interface JobDiscoveryViewProps {
  user: User;
  profile?: StudentProfile | null;
  onRefreshStats: () => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToApplications?: () => void;
  onNavigateToProfile?: () => void;
}

export const JobDiscoveryView: React.FC<JobDiscoveryViewProps> = ({
  user,
  profile: propProfile,
  onRefreshStats,
  showToast,
  onNavigateToApplications,
  onNavigateToProfile,
}) => {
  const [profile, setProfile] = useState<StudentProfile | null>(() => getProfile(user.id));
  const [resume] = useState(() => getResume(user.id));
  const [jobs, setJobs] = useState<JobOpportunity[]>(() => getJobOpportunities());
  const [isLoading, setIsLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>('Just now');

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'eligible' | 'best_match' | 'live' | 'campus' | 'bookmarked'>('all');
  const [sortBy, setSortBy] = useState<'match' | 'deadline' | 'cgpa' | 'company'>('match');

  // Manual Add Modal (Fallback)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalCompany, setModalCompany] = useState('');
  const [modalRole, setModalRole] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalLocation, setModalLocation] = useState('Bangalore / Hybrid');
  const [modalSalary, setModalSalary] = useState('₹8.0 - ₹12.0 LPA');
  const [modalMinCgpa, setModalMinCgpa] = useState('6.5');
  const [modalBranch, setModalBranch] = useState('Computer Science & Engineering');
  const [modalSkills, setModalSkills] = useState('Java, Python, SQL, DSA');
  const [modalDeadline, setModalDeadline] = useState(
    new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0]
  );
  const [modalApplyUrl, setModalApplyUrl] = useState('https://careers.google.com');

  // Load fresh jobs on initial mount
  useEffect(() => {
    let isMounted = true;
    const loadJobs = async () => {
      setIsLoading(true);
      try {
        const fetched = await fetchLiveJobOpportunities(false);
        if (isMounted) {
          setJobs(fetched);
          setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadJobs();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      showToast('Refreshing Vacancies', 'Querying live job feed & campus placement records...', 'info');
      const updated = await fetchLiveJobOpportunities(true);
      setJobs(updated);
      setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      showToast('Jobs Synchronized', `Updated ${updated.length} opportunities from live feeds.`, 'success');
      onRefreshStats();
    } catch {
      showToast('Sync Warning', 'Unable to reach remote feed. Showing cached records.', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBookmark = (jobId: string) => {
    const isBookmarked = toggleBookmarkJob(jobId);
    setJobs(getJobOpportunities());
    showToast(
      isBookmarked ? 'Bookmarked' : 'Bookmark Removed',
      isBookmarked ? 'Saved to your bookmarked opportunities list.' : 'Removed from bookmarks.',
      'info'
    );
  };

  const handleTrackApplication = (job: JobOpportunity) => {
    trackJobOpportunityInPipeline(user.id, job);
    onRefreshStats();
    showToast(
      'Added to Pipeline',
      `Application for ${job.companyName} (${job.jobRole}) tracked as Applied.`,
      'success'
    );
  };

  const handleSaveManualOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCompany.trim() || !modalRole.trim()) return;

    const newJob = addCustomJobOpportunity({
      companyName: modalCompany.trim(),
      jobRole: modalRole.trim(),
      jobDescription: modalDesc.trim() || 'Campus recruitment drive logged by student/TPO.',
      location: modalLocation.trim(),
      salary: modalSalary.trim(),
      jobType: 'Full-Time',
      qualification: 'B.Tech / B.E.',
      degree: 'B.Tech',
      branch: modalBranch.trim(),
      minCgpa: parseFloat(modalMinCgpa) || 6.0,
      maxBacklogs: 0,
      graduationYear: '2025 / 2026',
      requiredSkills: modalSkills.split(',').map((s) => s.trim()).filter(Boolean),
      applicationDeadline: modalDeadline,
      postingDate: new Date().toISOString().split('T')[0],
      selectionRounds: 'Online Assessment -> Technical Interview -> HR Round',
      applicationUrl: modalApplyUrl.trim() || 'https://placement.college.edu',
      sourceInfo: 'Campus Placement Cell / TPO Notice (Manual Addition)',
      isLiveFetched: false,
    });

    setJobs(getJobOpportunities());
    setIsAddModalOpen(false);
    showToast('Opportunity Saved', `Added ${newJob.companyName} drive.`, 'success');
    onRefreshStats();
  };

  // Evaluate eligibility for all current jobs
  const evaluatedJobs = jobs.map((job) => {
    const eligibility = checkJobEligibility(profile, resume, job);
    return { job, eligibility };
  });

  // Filter jobs
  const filteredJobs = evaluatedJobs.filter(({ job, eligibility }) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCompany = job.companyName.toLowerCase().includes(q);
      const matchRole = job.jobRole.toLowerCase().includes(q);
      const matchLocation = job.location.toLowerCase().includes(q);
      const matchSkills = job.requiredSkills.some((s) => s.toLowerCase().includes(q));
      if (!matchCompany && !matchRole && !matchLocation && !matchSkills) {
        return false;
      }
    }

    // 2. Tab Filter
    if (filterTab === 'eligible') {
      return eligibility.status === 'Eligible';
    }
    if (filterTab === 'best_match') {
      return eligibility.matchScore >= 70;
    }
    if (filterTab === 'live') {
      return job.isLiveFetched;
    }
    if (filterTab === 'campus') {
      return !job.isLiveFetched;
    }
    if (filterTab === 'bookmarked') {
      return !!job.isBookmarked;
    }

    return true;
  });

  // Sort jobs
  filteredJobs.sort((a, b) => {
    if (sortBy === 'match') {
      return b.eligibility.matchScore - a.eligibility.matchScore;
    }
    if (sortBy === 'deadline') {
      return new Date(a.job.applicationDeadline).getTime() - new Date(b.job.applicationDeadline).getTime();
    }
    if (sortBy === 'cgpa') {
      return a.job.minCgpa - b.job.minCgpa;
    }
    if (sortBy === 'company') {
      return a.job.companyName.localeCompare(b.job.companyName);
    }
    return 0;
  });

  // Stats counters
  const totalCount = jobs.length;
  const eligibleCount = evaluatedJobs.filter((e) => e.eligibility.status === 'Eligible').length;
  const bestMatchCount = evaluatedJobs.filter((e) => e.eligibility.matchScore >= 70).length;
  const bookmarkedCount = evaluatedJobs.filter((e) => e.job.isBookmarked).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in pb-12">
      {/* 1. Header Banner */}
      <div className="card-panel p-6 sm:p-7 bg-white flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#E7F0FA] text-[#203B53] text-xs font-semibold mb-2 border border-[#D0E2F5]">
            <span className="w-2 h-2 rounded-full bg-[#398879] animate-pulse" />
            <span>Live Job Discovery & Real-Time Placement Matching</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B3A] tracking-tight">
            Find Jobs & Placements
          </h1>
          <p className="text-xs sm:text-sm text-[#758392] mt-1 max-w-2xl leading-relaxed">
            Real software engineering vacancies and verified campus placement drives matched against your academic profile ({profile?.cgpa ? `CGPA: ${profile.cgpa}` : 'CGPA not set'}) and skills.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="btn-secondary text-xs sm:text-sm !py-2.5 !px-3.5 flex items-center gap-2 cursor-pointer"
            title="Fetch latest job vacancies"
          >
            <RefreshCw className={`w-4 h-4 text-[#398879] ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Fetching...' : 'Refresh Feed'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary text-xs sm:text-sm !py-2.5 !px-4 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Campus Notice</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Navigation & Search Bar */}
      <div className="space-y-3">
        {/* Interactive Segmented Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F5F7FA] rounded-xl border border-[#E2E8F0]">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-white text-[#203B53] shadow-xs font-bold'
                  : 'text-[#758392] hover:text-[#203B53]'
              }`}
            >
              All Jobs ({totalCount})
            </button>

            <button
              onClick={() => setFilterTab('eligible')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                filterTab === 'eligible'
                  ? 'bg-[#E7F4F1] text-[#206053] shadow-xs font-bold border border-[#B2DDD5]'
                  : 'text-[#758392] hover:text-[#203B53]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#398879]" />
              <span>Eligible for Me ({eligibleCount})</span>
            </button>

            <button
              onClick={() => setFilterTab('best_match')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                filterTab === 'best_match'
                  ? 'bg-[#E7F0FA] text-[#203B53] shadow-xs font-bold border border-[#D0E2F5]'
                  : 'text-[#758392] hover:text-[#203B53]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#DCA65A]" />
              <span>Best Match (70%+) ({bestMatchCount})</span>
            </button>

            <button
              onClick={() => setFilterTab('live')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterTab === 'live'
                  ? 'bg-white text-[#203B53] shadow-xs font-bold'
                  : 'text-[#758392] hover:text-[#203B53]'
              }`}
            >
              Live API Feed
            </button>

            <button
              onClick={() => setFilterTab('campus')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterTab === 'campus'
                  ? 'bg-white text-[#203B53] shadow-xs font-bold'
                  : 'text-[#758392] hover:text-[#203B53]'
              }`}
            >
              Campus Drives
            </button>

            <button
              onClick={() => setFilterTab('bookmarked')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                filterTab === 'bookmarked'
                  ? 'bg-white text-[#203B53] shadow-xs font-bold'
                  : 'text-[#758392] hover:text-[#203B53]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-[#DCA65A]" />
              <span>Saved ({bookmarkedCount})</span>
            </button>
          </div>

          {/* Sync Time */}
          <div className="text-[11px] text-[#758392] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#398879]" />
            <span>Synced: {lastSynced}</span>
          </div>
        </div>

        {/* Search & Sort Row */}
        <div className="card-panel p-3.5 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-[#758392] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company, job role, skill (e.g. Python, SQL)..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-xs sm:text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-[#758392]">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-xs font-semibold text-[#203B53] focus:outline-none focus:border-[#398879] cursor-pointer"
            >
              <option value="match">Skill Match Score (High to Low)</option>
              <option value="deadline">Application Deadline (Urgent First)</option>
              <option value="cgpa">CGPA Requirement (Ascending)</option>
              <option value="company">Company Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Opportunities List / Empty State */}
      {filteredJobs.length === 0 ? (
        <div className="card-panel py-16 px-4 text-center bg-white space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#E7F0FA] text-[#398879] flex items-center justify-center mb-2">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#172B3A]">No matching opportunities found</h3>
          <p className="text-xs text-[#758392] max-w-sm mx-auto">
            {searchQuery
              ? `No vacancies matched "${searchQuery}". Try a different keyword or reset filters.`
              : 'No opportunities currently in this filter view.'}
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterTab('all');
              }}
              className="btn-primary text-xs !py-2 !px-4"
            >
              Reset Filters
            </button>
            <button onClick={handleRefresh} className="btn-secondary text-xs !py-2 !px-4">
              Refresh Live Feed
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredJobs.map(({ job, eligibility }) => {
            const isEligible = eligibility.status === 'Eligible';
            const isUncertain = eligibility.status === 'Eligibility Uncertain';
            const isNotEligible = eligibility.status === 'Not Eligible';

            return (
              <div
                key={job.id}
                className="card-panel p-5 sm:p-6 bg-white flex flex-col justify-between gap-4 card-panel-interactive border border-[#E2E8F0] relative overflow-hidden"
              >
                <div>
                  {/* Top Bar: Company Name, Role & Badges */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#398879] uppercase tracking-wider">
                          {{ ...job }.companyName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            job.isLiveFetched
                              ? 'bg-[#E7F0FA] text-[#203B53] border border-[#D0E2F5]'
                              : 'bg-[#FDF6EC] text-[#97651C] border border-[#FDE68A]'
                          }`}
                        >
                          {job.isLiveFetched ? '🌐 Live API Vacancy' : '🏛️ Campus Placement Drive'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#172B3A] mt-1 leading-snug">
                        {job.jobRole}
                      </h3>
                    </div>

                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => handleToggleBookmark(job.id)}
                      className="p-1.5 rounded-lg text-[#758392] hover:text-[#DCA65A] hover:bg-[#FDF6EC] transition-colors cursor-pointer shrink-0"
                      title={job.isBookmarked ? 'Remove bookmark' : 'Bookmark opportunity'}
                    >
                      {job.isBookmarked ? (
                        <BookmarkCheck className="w-5 h-5 text-[#DCA65A]" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Salary, Location, Type Pill Cluster Replacement (Clean Unboxed Typography) */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#758392] mb-3.5">
                    <span className="font-semibold text-[#172B3A] flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-[#398879]" />
                      {job.salary}
                    </span>
                    <span aria-hidden="true">•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#758392]" />
                      {job.location}
                    </span>
                    <span aria-hidden="true">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#758392]" />
                      {job.jobType}
                    </span>
                  </div>

                  {/* AUTOMATIC ELIGIBILITY & MATCH SCORE CARD */}
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5 mb-3.5">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isEligible && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#E7F4F1] text-[#206053] border border-[#B2DDD5] text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Eligible for You</span>
                          </div>
                        )}
                        {isNotEligible && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FDF2F2] text-[#C92A2A] border border-[#F8B4AC] text-xs font-bold">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Not Eligible</span>
                          </div>
                        )}
                        {isUncertain && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FDF6EC] text-[#97651C] border border-[#F3DBB3] text-xs font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Eligibility Uncertain</span>
                          </div>
                        )}
                      </div>

                      {/* Match Score */}
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-[#758392]">Skill Match:</span>
                        <span className="font-extrabold text-[#398879]">
                          {eligibility.matchScore}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          eligibility.matchScore >= 70
                            ? 'bg-[#398879]'
                            : eligibility.matchScore >= 40
                            ? 'bg-[#DCA65A]'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${eligibility.matchScore}%` }}
                      />
                    </div>

                    {/* Eligibility Reason / Missing Requirements Note */}
                    <p className="text-[11px] text-[#758392] leading-relaxed">
                      {eligibility.reason}
                    </p>

                    {/* Missing Skills Warning */}
                    {eligibility.missingSkills.length > 0 && (
                      <div className="text-[11px] text-[#758392] pt-1 border-t border-[#E2E8F0]">
                        <span className="font-semibold text-[#172B3A]">Missing Skills: </span>
                        <span>{eligibility.missingSkills.slice(0, 4).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Description Excerpt */}
                  <p className="text-xs text-[#758392] line-clamp-2 leading-relaxed mb-3">
                    {job.jobDescription}
                  </p>

                  {/* Required Skills Badges */}
                  <div className="space-y-1.5 mb-3">
                    <span className="text-[11px] font-semibold text-[#172B3A] block">
                      Required Skills:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.requiredSkills.map((skill) => {
                        const hasSkill = eligibility.matchedSkills.includes(skill);
                        return (
                          <span
                            key={skill}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                              hasSkill
                                ? 'bg-[#E7F4F1] text-[#206053] font-semibold border border-[#B2DDD5]'
                                : 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]'
                            }`}
                          >
                            {hasSkill ? '✓ ' : ''}{skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Academic Criteria & Selection Rounds */}
                  <div className="p-3 rounded-lg bg-[#FAFCFE] border border-[#E2E8F0] text-[11px] space-y-1 text-[#758392]">
                    <div className="flex justify-between">
                      <span>Cutoff: <strong className="text-[#172B3A]">{job.minCgpa > 0 ? `${job.minCgpa} CGPA` : 'No CGPA Cutoff'}</strong></span>
                      <span>Branch: <strong className="text-[#172B3A]">{job.branch}</strong></span>
                    </div>
                    <div>
                      <span>Selection: <strong className="text-[#172B3A]">{job.selectionRounds}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Metadata and Action Buttons */}
                <div className="pt-3 border-t border-[#E2E8F0] space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-[#758392]">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#398879]" />
                      <span>Deadline: <strong className="text-[#172B3A]">{job.applicationDeadline}</strong></span>
                    </div>
                    <span className="truncate max-w-[200px]" title={job.sourceInfo}>
                      Source: {job.sourceInfo.split('(')[0]}
                    </span>
                  </div>

                  {/* Working Action Buttons */}
                  <div className="flex items-center gap-2">
                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs !py-2 flex-1 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => handleTrackApplication(job)}
                      className="btn-primary text-xs !py-2 flex-1 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Track Application</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Manual Add Opportunity Modal (Fallback) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-panel p-6 bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-base font-bold text-[#172B3A]">
                  Add College Placement Notice
                </h3>
                <p className="text-xs text-[#758392]">
                  Manual fallback for offline or campus-specific placement announcements.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-[#758392] hover:bg-[#F5F7FA] text-lg font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualOpportunity} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#172B3A] block mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={modalCompany}
                    onChange={(e) => setModalCompany(e.target.value)}
                    placeholder="e.g. Oracle, Cisco, Wipro"
                    className="w-full px-3 py-2 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0] focus:bg-white focus:outline-none focus:border-[#398879]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#172B3A] block mb-1">Job Role *</label>
                  <input
                    type="text"
                    required
                    value={modalRole}
                    onChange={(e) => setModalRole(e.target.value)}
                    placeholder="e.g. Associate Software Engineer"
                    className="w-full px-3 py-2 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0] focus:bg-white focus:outline-none focus:border-[#398879]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#172B3A] block mb-1">Job Description</label>
                <textarea
                  rows={2}
                  value={modalDesc}
                  onChange={(e) => setModalDesc(e.target.value)}
                  placeholder="Overview of the role, work requirements, and team details..."
                  className="w-full px-3 py-2 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0] focus:bg-white focus:outline-none focus:border-[#398879]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-[#172B3A] block mb-1">Location</label>
                  <input
                    type="text"
                    value={modalLocation}
                    onChange={(e) => setModalLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#172B3A] block mb-1">Salary / CTC</label>
                  <input
                    type="text"
                    value={modalSalary}
                    onChange={(e) => setModalSalary(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#172B3A] block mb-1">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={modalMinCgpa}
                    onChange={(e) => setModalMinCgpa(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#172B3A] block mb-1">Eligible Branch</label>
                  <input
                    type="text"
                    value={modalBranch}
                    onChange={(e) => setModalBranch(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#172B3A] block mb-1">Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={modalDeadline}
                    onChange={(e) => setModalDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#172B3A] block mb-1">
                  Required Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={modalSkills}
                  onChange={(e) => setModalSkills(e.target.value)}
                  placeholder="Java, Python, SQL, DSA"
                  className="w-full px-3 py-2 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#172B3A] block mb-1">Application URL</label>
                <input
                  type="url"
                  value={modalApplyUrl}
                  onChange={(e) => setModalApplyUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary !py-2 !px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary !py-2 !px-4 cursor-pointer">
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
