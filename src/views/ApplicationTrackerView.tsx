import React, { useState, useMemo } from 'react';
import { User, Application, ApplicationStatus, CompanyDrive, StatusHistoryEntry } from '../types';
import { 
  getApplications, 
  addApplication, 
  updateApplication, 
  deleteApplication, 
  getCompanyDrives,
  updateApplicationStatusByAdmin 
} from '../utils/storage';
import { ConfirmModal } from '../components/ConfirmModal';
import { 
  Briefcase, 
  Plus, 
  Calendar, 
  Edit3, 
  Trash2, 
  Filter, 
  X,
  Search,
  Building2,
  ExternalLink,
  Award,
  AlertCircle,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  BellRing,
  Bookmark,
  MapPin,
  Check,
  ShieldCheck,
  Info
} from 'lucide-react';

interface ApplicationTrackerViewProps {
  user: User;
  onRefreshStats: () => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToJobs?: () => void;
  initialExpandedAppId?: string;
}

const ALL_STATUSES: ApplicationStatus[] = [
  'Saved',
  'Applied',
  'Assessment',
  'Interview',
  'Shortlisted',
  'Selected',
  'Rejected',
  'Offer Received',
];

export const ApplicationTrackerView: React.FC<ApplicationTrackerViewProps> = ({
  user,
  onRefreshStats,
  showToast,
  onNavigateToJobs,
  initialExpandedAppId,
}) => {
  const [applications, setApplications] = useState<Application[]>(() => getApplications(user.id));
  const drives = getCompanyDrives(user.id);

  // Filters & Search
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'deadline' | 'company'>('updated');

  // Expanded card IDs for collapsible detail view
  const [expandedCardIds, setExpandedCardIds] = useState<{ [appId: string]: boolean }>(() => {
    return initialExpandedAppId ? { [initialExpandedAppId]: true } : {};
  });

  // Student Add/Edit Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [location, setLocation] = useState('Bengaluru / Hybrid');
  const [jobType, setJobType] = useState('Full-Time');
  const [applicationDate, setApplicationDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [studentStatus, setStudentStatus] = useState<'Saved' | 'Applied'>('Applied');
  const [notes, setNotes] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [selectedDriveId, setSelectedDriveId] = useState<string>('');

  // Authorized Admin/TPO Status Update Modal
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [targetAppForAdmin, setTargetAppForAdmin] = useState<Application | null>(null);
  const [adminSelectedStatus, setAdminSelectedStatus] = useState<ApplicationStatus>('Interview');
  const [adminNoteText, setAdminNoteText] = useState('');

  // Delete Confirmation Modal
  const [deletingAppId, setDeletingAppId] = useState<string | null>(null);

  const refreshList = () => {
    setApplications(getApplications(user.id));
    onRefreshStats();
  };

  const toggleExpand = (appId: string) => {
    setExpandedCardIds((prev) => ({
      ...prev,
      [appId]: !prev[appId],
    }));
  };

  // Toggle bookmark / saved status
  const handleToggleBookmark = (app: Application) => {
    const updated: Application = {
      ...app,
      isBookmarked: !app.isBookmarked,
    };
    updateApplication(user.id, updated);
    refreshList();
    showToast(
      updated.isBookmarked ? 'Application Bookmarked' : 'Bookmark Removed',
      `${app.companyName} (${app.jobRole})`,
      'info'
    );
  };

  const handleOpenAdd = () => {
    setEditingApp(null);
    setCompanyName('');
    setJobRole('');
    setLocation('Bengaluru / Hybrid');
    setJobType('Full-Time');
    setApplicationDate(new Date().toISOString().split('T')[0]);
    setDeadline(new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]);
    setStudentStatus('Applied');
    setNotes('');
    setApplicationUrl('');
    setSelectedDriveId('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (app: Application) => {
    setEditingApp(app);
    setCompanyName(app.companyName);
    setJobRole(app.jobRole);
    setLocation(app.location || 'Bengaluru / Hybrid');
    setJobType(app.jobType || 'Full-Time');
    setApplicationDate(app.applicationDate);
    setDeadline(app.deadline || '');
    setStudentStatus(app.status === 'Saved' ? 'Saved' : 'Applied');
    setNotes(app.notes || '');
    setApplicationUrl(app.applicationUrl || '');
    setSelectedDriveId(app.companyDriveId || '');
    setIsFormOpen(true);
  };

  const handleDriveSelect = (driveId: string) => {
    setSelectedDriveId(driveId);
    if (!driveId) return;
    const drive = drives.find((d) => d.id === driveId);
    if (drive) {
      setCompanyName(drive.companyName);
      setJobRole(drive.jobRole);
    }
  };

  const handleSaveStudentApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !jobRole.trim() || !applicationDate) return;

    if (editingApp) {
      updateApplication(user.id, {
        ...editingApp,
        companyName: companyName.trim(),
        jobRole: jobRole.trim(),
        location: location.trim(),
        jobType: jobType.trim(),
        applicationDate,
        deadline: deadline.trim() || undefined,
        notes: notes.trim() || undefined,
        applicationUrl: applicationUrl.trim() || undefined,
        companyDriveId: selectedDriveId || undefined,
      });
      showToast('Application Updated', `${companyName} (${jobRole}) details saved.`, 'success');
    } else {
      addApplication(user.id, {
        companyName: companyName.trim(),
        jobRole: jobRole.trim(),
        location: location.trim(),
        jobType: jobType.trim(),
        applicationDate,
        deadline: deadline.trim() || undefined,
        status: studentStatus,
        notes: notes.trim() || undefined,
        applicationUrl: applicationUrl.trim() || undefined,
        companyDriveId: selectedDriveId || undefined,
        eligibilityStatus: 'Eligible',
        matchScore: 85,
        isBookmarked: false,
      });
      showToast('Application Tracked', `${companyName} (${jobRole}) added to your pipeline.`, 'success');
    }

    setIsFormOpen(false);
    refreshList();
  };

  const handleConfirmDelete = () => {
    if (!deletingAppId) return;
    const toDelete = applications.find(a => a.id === deletingAppId);
    deleteApplication(user.id, deletingAppId);
    setDeletingAppId(null);
    refreshList();
    showToast('Application Removed', toDelete ? `${toDelete.companyName} removed from tracker.` : 'Record removed.', 'info');
  };

  // Open Authorized Admin Update modal
  const handleOpenAdminModal = (app: Application) => {
    setTargetAppForAdmin(app);
    setAdminSelectedStatus(app.status);
    setAdminNoteText('');
    setIsAdminModalOpen(true);
  };

  // Submit Authorized Status Update
  const handleSaveAdminStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAppForAdmin) return;

    const res = updateApplicationStatusByAdmin(
      targetAppForAdmin.id,
      adminSelectedStatus,
      adminNoteText,
      'Campus TPO / Placement Cell'
    );

    if (res.success) {
      showToast(
        'Official Status Published',
        `${targetAppForAdmin.companyName} status updated to ${adminSelectedStatus}. Student notification sent!`,
        'success'
      );
      setIsAdminModalOpen(false);
      setTargetAppForAdmin(null);
      refreshList();
    } else {
      showToast('Update Failed', res.error || 'Could not update status.', 'error');
    }
  };

  // 1-Click Active Applications Seeder
  const handleSeedActiveApplications = () => {
    const now = new Date();
    const demoItems: Array<Omit<Application, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> = [
      {
        companyName: 'Amazon AWS',
        jobRole: 'Cloud Support Associate Trainee',
        location: 'Hyderabad • Hybrid',
        jobType: 'Full-Time',
        salary: '₹14.5 LPA CTC',
        applicationDate: new Date(now.getTime() - 86400000 * 12).toISOString().split('T')[0],
        deadline: new Date(now.getTime() + 86400000 * 8).toISOString().split('T')[0],
        status: 'Interview',
        statusUpdatedBy: 'Campus TPO / Placement Cell',
        statusUpdatedAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
        statusHistory: [
          {
            id: 'sh_amz_1',
            status: 'Applied',
            changedAt: new Date(now.getTime() - 86400000 * 12).toISOString(),
            updatedBy: 'Student',
            note: 'Application submitted via Amazon University portal.'
          },
          {
            id: 'sh_amz_2',
            status: 'Shortlisted',
            changedAt: new Date(now.getTime() - 86400000 * 7).toISOString(),
            updatedBy: 'Campus TPO / Placement Cell',
            note: 'Cleared CGPA cutoff (7.5+) and online code test.'
          },
          {
            id: 'sh_amz_3',
            status: 'Interview',
            changedAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
            updatedBy: 'Campus TPO / Placement Cell',
            note: 'Technical Interview Round 1 scheduled for Friday 10:30 AM.'
          }
        ],
        notes: 'Prepare Linux networking, OSI model, and AWS EC2 basics.',
        interviewDate: new Date(now.getTime() + 86400000 * 3).toISOString().split('T')[0],
        applicationUrl: 'https://amazon.jobs',
        eligibilityStatus: 'Eligible',
        matchScore: 92,
        isBookmarked: true,
      },
      {
        companyName: 'Tata Consultancy Services',
        jobRole: 'Digital Innovator',
        location: 'Mumbai / Pune',
        jobType: 'Full-Time',
        salary: '₹7.5 LPA CTC',
        applicationDate: new Date(now.getTime() - 86400000 * 16).toISOString().split('T')[0],
        deadline: new Date(now.getTime() + 86400000 * 4).toISOString().split('T')[0],
        status: 'Assessment',
        statusUpdatedBy: 'Campus TPO / Placement Cell',
        statusUpdatedAt: new Date(now.getTime() - 86400000 * 4).toISOString(),
        statusHistory: [
          {
            id: 'sh_tcs_1',
            status: 'Applied',
            changedAt: new Date(now.getTime() - 86400000 * 16).toISOString(),
            updatedBy: 'Student',
            note: 'Registered through TCS NextStep campus portal.'
          },
          {
            id: 'sh_tcs_2',
            status: 'Assessment',
            changedAt: new Date(now.getTime() - 86400000 * 4).toISOString(),
            updatedBy: 'Campus TPO / Placement Cell',
            note: 'TCS National Qualifier Test (NQT) login credentials issued.'
          }
        ],
        notes: 'Online aptitude and coding test on iON platform.',
        applicationUrl: 'https://nextstep.tcs.com',
        eligibilityStatus: 'Eligible',
        matchScore: 88,
        isBookmarked: false,
      },
      {
        companyName: 'Infosys Technologies',
        jobRole: 'Specialist Programmer (SP)',
        location: 'Bengaluru • On-site',
        jobType: 'Full-Time',
        salary: '₹9.5 LPA CTC',
        applicationDate: new Date(now.getTime() - 86400000 * 22).toISOString().split('T')[0],
        deadline: new Date(now.getTime() - 86400000 * 2).toISOString().split('T')[0],
        status: 'Offer Received',
        statusUpdatedBy: 'Campus TPO / Placement Cell',
        statusUpdatedAt: new Date(now.getTime() - 86400000 * 1).toISOString(),
        statusHistory: [
          {
            id: 'sh_inf_1',
            status: 'Applied',
            changedAt: new Date(now.getTime() - 86400000 * 22).toISOString(),
            updatedBy: 'Student',
            note: 'Participated through college hackathon route.'
          },
          {
            id: 'sh_inf_2',
            status: 'Shortlisted',
            changedAt: new Date(now.getTime() - 86400000 * 14).toISOString(),
            updatedBy: 'Campus TPO / Placement Cell',
            note: 'Selected in top 5% of coding round.'
          },
          {
            id: 'sh_inf_3',
            status: 'Selected',
            changedAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
            updatedBy: 'Campus TPO / Placement Cell',
            note: 'Cleared final Technical & HR evaluation.'
          },
          {
            id: 'sh_inf_4',
            status: 'Offer Received',
            changedAt: new Date(now.getTime() - 86400000 * 1).toISOString(),
            updatedBy: 'Campus TPO / Placement Cell',
            note: 'Official Letter of Intent received by College Placement Office.'
          }
        ],
        offerDetails: '₹9.5 LPA CTC • Software Engineering Specialist • Joining July 2026',
        applicationUrl: 'https://infosys.com/careers',
        eligibilityStatus: 'Eligible',
        matchScore: 94,
        isBookmarked: true,
      },
      {
        companyName: 'Deloitte USI',
        jobRole: 'Analyst - Technology Consulting',
        location: 'Hyderabad / Gurugram',
        jobType: 'Full-Time',
        salary: '₹8.1 LPA CTC',
        applicationDate: new Date(now.getTime() - 86400000 * 5).toISOString().split('T')[0],
        deadline: new Date(now.getTime() + 86400000 * 15).toISOString().split('T')[0],
        status: 'Saved',
        statusUpdatedBy: 'Student',
        statusUpdatedAt: new Date(now.getTime() - 86400000 * 5).toISOString(),
        statusHistory: [
          {
            id: 'sh_del_1',
            status: 'Saved',
            changedAt: new Date(now.getTime() - 86400000 * 5).toISOString(),
            updatedBy: 'Student',
            note: 'Opportunity bookmarked for upcoming campus drive.'
          }
        ],
        notes: 'Group discussion and case study round preparation needed.',
        applicationUrl: 'https://jobs2.deloitte.com',
        eligibilityStatus: 'Eligible',
        matchScore: 82,
        isBookmarked: true,
      }
    ];

    demoItems.forEach(item => addApplication(user.id, item));
    refreshList();
    showToast('Campus Applications Loaded', 'Populated verified active placement opportunities.', 'success');
  };

  // Filtered & Sorted Applications
  const filteredApps = useMemo(() => {
    return applications
      .filter((app) => {
        const matchesStatus = selectedStatus === 'All' || app.status === selectedStatus;
        const matchesQuery =
          app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.jobRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (app.location && app.location.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'deadline') {
          const dA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const dB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          return dA - dB;
        }
        if (sortBy === 'company') {
          return a.companyName.localeCompare(b.companyName);
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [applications, selectedStatus, searchQuery, sortBy]);

  // Status Badge Styling Helper
  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Saved':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Applied':
        return 'bg-[#E7F0FA] text-[#203B53] border-[#D0E2F5]';
      case 'Assessment':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Interview':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Shortlisted':
        return 'bg-sky-50 text-sky-800 border-sky-300';
      case 'Selected':
      case 'Offer Received':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'Rejected':
      case 'Not Selected':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in pb-16">
      {/* Header Bar */}
      <div className="pb-4 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#203B53] tracking-tight">
            Placement Application Tracker
          </h1>
          <p className="text-xs sm:text-sm text-[#758392] mt-0.5">
            Compact application pipeline with verified campus placement status updates and audit timelines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {applications.length === 0 && (
            <button
              onClick={handleSeedActiveApplications}
              className="px-3.5 py-2 rounded-lg bg-[#E7F0FA] text-[#203B53] border border-[#D0E2F5] text-xs font-semibold hover:bg-[#D8E6F5] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>⚡ Load Active Campus Applications</span>
            </button>
          )}

          {onNavigateToJobs && (
            <button
              onClick={onNavigateToJobs}
              className="btn-secondary text-xs !py-2 !px-3.5 cursor-pointer flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-[#398879]" />
              <span>Find Opportunities</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="btn-primary text-xs !py-2 !px-4 shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Track Application</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-panel p-3.5 bg-white border border-[#E2E8F0] shadow-2xs">
          <span className="text-[11px] text-[#758392] font-medium block">Total Tracked</span>
          <p className="text-xl font-extrabold text-[#203B53] mt-0.5">{applications.length}</p>
        </div>
        <div className="card-panel p-3.5 bg-white border border-[#E2E8F0] shadow-2xs">
          <span className="text-[11px] text-[#758392] font-medium block">In Active Review</span>
          <p className="text-xl font-extrabold text-[#398879] mt-0.5">
            {applications.filter(a => ['Applied', 'Assessment', 'Interview', 'Shortlisted'].includes(a.status)).length}
          </p>
        </div>
        <div className="card-panel p-3.5 bg-white border border-[#E2E8F0] shadow-2xs">
          <span className="text-[11px] text-[#758392] font-medium block">Offers / Selected</span>
          <p className="text-xl font-extrabold text-emerald-700 mt-0.5">
            {applications.filter(a => ['Selected', 'Offer Received'].includes(a.status)).length}
          </p>
        </div>
        <div className="card-panel p-3.5 bg-white border border-[#E2E8F0] shadow-2xs">
          <span className="text-[11px] text-[#758392] font-medium block">Not Selected</span>
          <p className="text-xl font-extrabold text-rose-700 mt-0.5">
            {applications.filter(a => ['Rejected', 'Not Selected'].includes(a.status)).length}
          </p>
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="card-panel p-4 bg-white border border-[#E2E8F0] space-y-3 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#758392] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name, role, or location..."
              className="w-full text-xs pl-9 pr-8 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#398879] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[#758392] font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs p-2 rounded-lg border border-[#E2E8F0] bg-white font-medium text-[#203B53] focus:outline-none focus:ring-1 focus:ring-[#398879]"
            >
              <option value="updated">Recently Updated</option>
              <option value="deadline">Application Deadline</option>
              <option value="company">Company Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <button
            onClick={() => setSelectedStatus('All')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              selectedStatus === 'All'
                ? 'bg-[#203B53] text-white'
                : 'bg-[#F5F7FA] text-[#758392] hover:bg-gray-200'
            }`}
          >
            All ({applications.length})
          </button>
          {ALL_STATUSES.map((st) => {
            const count = applications.filter((a) => a.status === st).length;
            if (count === 0 && selectedStatus !== st) return null;
            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-[#398879] text-white'
                    : 'bg-[#F5F7FA] text-[#758392] hover:bg-gray-200'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <div className="card-panel p-10 bg-white border border-[#E2E8F0] text-center space-y-3 rounded-xl">
          <Briefcase className="w-10 h-10 text-[#758392]/40 mx-auto" />
          <h3 className="text-base font-bold text-[#203B53]">No matching applications found</h3>
          <p className="text-xs text-[#758392] max-w-sm mx-auto">
            {searchQuery || selectedStatus !== 'All'
              ? 'Try clearing your search query or status filter to see other tracked roles.'
              : 'Start tracking job opportunities to monitor screening rounds, interview schedules, and official offers.'}
          </p>
          <div className="pt-2">
            <button
              onClick={handleOpenAdd}
              className="btn-primary text-xs !py-2 !px-4 shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Track Your First Opportunity</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApps.map((app) => {
            const isExpanded = !!expandedCardIds[app.id];
            const companyInitials = app.companyName
              .split(' ')
              .map(w => w[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            const isPlacementCellVerified = app.statusUpdatedBy?.includes('TPO') || app.statusUpdatedBy?.includes('Placement');

            return (
              <div
                key={app.id}
                className="card-panel bg-white border border-[#E2E8F0] hover:border-[#398879]/40 transition-all rounded-xl shadow-2xs overflow-hidden"
              >
                {/* Compact Row Header */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Identity & Badges */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    {/* Logo/Initials Badge */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#203B53] to-[#172B3A] text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-2xs">
                      {companyInitials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <h2 className="text-base font-bold text-[#203B53] truncate">
                          {app.jobRole}
                        </h2>
                        <span className="text-[#DCE3EB] hidden sm:inline">•</span>
                        <span className="text-xs font-semibold text-[#758392]">
                          {app.companyName}
                        </span>
                      </div>

                      {/* Compact Details Strip */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#758392]">
                        {app.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#398879]" />
                            {app.location}
                          </span>
                        )}
                        {app.deadline && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#758392]" />
                            Deadline: {app.deadline}
                          </span>
                        )}
                        {app.matchScore && (
                          <span className="flex items-center gap-1 text-[#398879] font-semibold">
                            <Sparkles className="w-3 h-3" />
                            {app.matchScore}% Match
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Pill & Controls */}
                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E2E8F0]">
                    {/* Verified Status Pill */}
                    <div className="flex flex-col items-start sm:items-end">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusBadge(app.status)}`}>
                        {app.status}
                      </span>
                      <span className="text-[10px] text-[#758392] mt-0.5 flex items-center gap-1">
                        {isPlacementCellVerified ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-[#398879]" />
                            <span>TPO Verified</span>
                          </>
                        ) : (
                          <span>Self-Reported</span>
                        )}
                      </span>
                    </div>

                    {/* Bookmark action */}
                    <button
                      onClick={() => handleToggleBookmark(app)}
                      className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                        app.isBookmarked
                          ? 'bg-[#E7F0FA] text-[#203B53] border-[#D0E2F5]'
                          : 'bg-white text-gray-400 border-[#E2E8F0] hover:text-[#203B53]'
                      }`}
                      title={app.isBookmarked ? 'Bookmarked' : 'Bookmark this opportunity'}
                    >
                      <Bookmark className={`w-4 h-4 ${app.isBookmarked ? 'fill-current text-[#203B53]' : ''}`} />
                    </button>

                    {/* View Details Toggle */}
                    <button
                      onClick={() => toggleExpand(app.id)}
                      className="btn-secondary text-xs !py-1.5 !px-3 cursor-pointer flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Details Drawer */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-[#E2E8F0] bg-[#FAFCFE] space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Left Sub-column: Application Specifics */}
                      <div className="space-y-3">
                        <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] space-y-1.5">
                          <span className="text-[11px] font-bold text-[#758392] uppercase tracking-wider block">
                            Application Specifics
                          </span>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500 block text-[11px]">Applied Date:</span>
                              <span className="font-semibold text-[#203B53]">{app.applicationDate}</span>
                            </div>
                            {app.salary && (
                              <div>
                                <span className="text-gray-500 block text-[11px]">Package / CTC:</span>
                                <span className="font-semibold text-[#398879]">{app.salary}</span>
                              </div>
                            )}
                            {app.interviewDate && (
                              <div>
                                <span className="text-gray-500 block text-[11px]">Interview Date:</span>
                                <span className="font-semibold text-purple-700">{app.interviewDate}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-500 block text-[11px]">Eligibility:</span>
                              <span className="font-semibold text-emerald-700">
                                {app.eligibilityStatus || 'Eligible'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Personal Student Notes */}
                        <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] space-y-1">
                          <span className="text-[11px] font-bold text-[#758392] uppercase tracking-wider block">
                            Personal Preparation Notes
                          </span>
                          <p className="text-xs text-[#203B53] leading-relaxed">
                            {app.notes || 'No custom preparation notes added for this opportunity.'}
                          </p>
                        </div>
                      </div>

                      {/* Right Sub-column: Official Status Timeline & Audit Trail */}
                      <div className="p-3.5 bg-white rounded-lg border border-[#E2E8F0] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#758392] uppercase tracking-wider block">
                            Placement Office Stage Timeline
                          </span>
                          <span className="text-[10px] text-[#398879] font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Official Record
                          </span>
                        </div>

                        {app.statusHistory && app.statusHistory.length > 0 ? (
                          <div className="space-y-2 relative pl-3 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E8F0]">
                            {app.statusHistory.map((sh, idx) => (
                              <div key={sh.id || idx} className="relative text-xs pl-2">
                                <span className="absolute -left-3 top-1.5 w-2 h-2 rounded-full bg-[#398879] border-2 border-white ring-1 ring-[#398879]" />
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[#203B53]">{sh.status}</span>
                                  <span className="text-[10px] text-[#758392]">
                                    {new Date(sh.changedAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#758392] mt-0.5">
                                  {sh.note}
                                </p>
                                <span className="text-[10px] text-gray-400 italic">
                                  By {sh.updatedBy}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-[#758392]">
                            Stage initialized as {app.status}. Official updates from Campus TPO will appear here.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer for Card */}
                    <div className="pt-2 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        {/* Official portal link with validation */}
                        {app.applicationUrl ? (
                          <a
                            href={app.applicationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary !py-1.5 !px-3 inline-flex items-center gap-1.5 hover:text-[#203B53]"
                          >
                            <span>Open Official Portal</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span
                            className="text-gray-400 italic px-2 py-1 bg-gray-100 rounded text-[11px] border border-gray-200"
                            title="No external application link was provided by recruiter."
                          >
                            Official Portal Link Unavailable
                          </span>
                        )}

                        {/* Authorized Admin/TPO Action Button (For College Demo) */}
                        <button
                          onClick={() => handleOpenAdminModal(app)}
                          className="px-3 py-1.5 rounded-lg bg-[#E7F0FA] text-[#203B53] border border-[#D0E2F5] hover:bg-[#D5E6F7] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Record verified recruiter decision or advancement"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#398879]" />
                          <span>Campus TPO Action</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          onClick={() => handleOpenEdit(app)}
                          className="p-1.5 text-[#758392] hover:text-[#203B53] transition-colors rounded-md hover:bg-gray-100 cursor-pointer flex items-center gap-1"
                          title="Edit Personal Notes & Dates"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeletingAppId(app.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors rounded-md hover:bg-rose-50 cursor-pointer flex items-center gap-1"
                          title="Remove from pipeline"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Student Add / Edit Application Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-[#172B3A]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#E7F0FA] rounded-lg text-[#203B53]">
                  <Briefcase className="w-5 h-5 text-[#398879]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#203B53]">
                    {editingApp ? 'Edit Application Details' : 'Track New Placement Opportunity'}
                  </h3>
                  <p className="text-xs text-[#758392]">
                    Record company, role, personal deadlines, and portal links
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentApplication} className="space-y-3.5 text-xs">
              {drives.length > 0 && !editingApp && (
                <div>
                  <label className="font-semibold text-[#203B53] block mb-1">
                    Link to College Drive (Optional):
                  </label>
                  <select
                    value={selectedDriveId}
                    onChange={(e) => handleDriveSelect(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-[#398879] bg-white"
                  >
                    <option value="">-- Manual Entry / External Opportunity --</option>
                    {drives.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.companyName} — {d.jobRole} ({d.driveDate})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#203B53] block mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Google, Microsoft, TCS"
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-[#398879]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#203B53] block mb-1">Job Role *</label>
                  <input
                    type="text"
                    required
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    placeholder="e.g. Associate Software Engineer"
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-[#398879]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#203B53] block mb-1">Location / Work Mode</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bengaluru / Hybrid"
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-[#398879]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#203B53] block mb-1">Initial Status</label>
                  <select
                    value={studentStatus}
                    onChange={(e) => setStudentStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-[#398879] bg-white font-medium"
                  >
                    <option value="Applied">Applied (Submitted)</option>
                    <option value="Saved">Saved (Bookmarked for later)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#203B53] block mb-1">Application Date *</label>
                  <input
                    type="date"
                    required
                    value={applicationDate}
                    onChange={(e) => setApplicationDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-[#398879]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#203B53] block mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-[#398879]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#203B53] block mb-1">Official Application URL</label>
                <input
                  type="url"
                  value={applicationUrl}
                  onChange={(e) => setApplicationUrl(e.target.value)}
                  placeholder="https://company.com/careers/job-id"
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-[#398879]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#203B53] block mb-1">Personal Notes / Rounds Details</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Completed online assessment. Next interview expected in 2 weeks."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-[#398879]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="btn-secondary !py-2 !px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary !py-2 !px-5 cursor-pointer shadow-xs"
                >
                  {editingApp ? 'Save Changes' : 'Track Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Authorized Administrator / TPO Action Modal */}
      {isAdminModalOpen && targetAppForAdmin && (
        <div className="fixed inset-0 z-50 bg-[#172B3A]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#E7F0FA] rounded-lg text-[#203B53]">
                  <ShieldCheck className="w-5 h-5 text-[#398879]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#203B53]">Campus TPO Authorized Action</h3>
                  <p className="text-xs text-[#758392]">Official placement verification panel</p>
                </div>
              </div>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminStatusUpdate} className="space-y-3.5 text-xs">
              <div className="p-3 bg-[#F5F7FA] rounded-lg border border-[#E2E8F0] space-y-1">
                <span className="font-bold text-[#203B53] block text-sm">
                  {targetAppForAdmin.companyName}
                </span>
                <span className="text-[#758392] block">
                  Role: {targetAppForAdmin.jobRole}
                </span>
                <span className="text-[11px] text-gray-500 block">
                  Current Status: <span className="font-semibold text-[#203B53]">{targetAppForAdmin.status}</span>
                </span>
              </div>

              <div>
                <label className="font-semibold text-[#203B53] block mb-1">
                  New Verified Status:
                </label>
                <select
                  value={adminSelectedStatus}
                  onChange={(e) => setAdminSelectedStatus(e.target.value as ApplicationStatus)}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-[#398879] bg-white font-bold text-[#203B53]"
                >
                  <option value="Applied">Applied</option>
                  <option value="Assessment">Assessment (Scheduled)</option>
                  <option value="Interview">Interview (Round Scheduled)</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Selected">Selected (Placement Confirmed)</option>
                  <option value="Offer Received">Offer Received</option>
                  <option value="Rejected">Rejected / Not Selected</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#203B53] block mb-1">
                  Official Placement Cell Note:
                </label>
                <textarea
                  rows={3}
                  value={adminNoteText}
                  onChange={(e) => setAdminNoteText(e.target.value)}
                  placeholder="e.g. Cleared round 1 technical interview with 85% score. HR round scheduled for Friday."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-[#398879]"
                />
                <span className="text-[11px] text-[#758392] block mt-1">
                  This note will be logged in the permanent audit trail and delivered as an instant student notification.
                </span>
              </div>

              <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[11px] flex items-start gap-2">
                <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  Authorized campus officer updates trigger a notification with an unread badge on the student's header bell icon.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="btn-secondary !py-2 !px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary !py-2 !px-5 cursor-pointer shadow-xs"
                >
                  Publish & Notify Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingAppId}
        title="Remove Application from Tracker?"
        message="Are you sure you want to remove this application from your pipeline? This action cannot be undone."
        confirmLabel="Yes, Remove Record"
        cancelLabel="Keep Application"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingAppId(null)}
      />
    </div>
  );
};
