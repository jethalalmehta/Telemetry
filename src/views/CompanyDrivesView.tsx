import React, { useState } from 'react';
import { User, CompanyDrive } from '../types';
import { getCompanyDrives, addCompanyDrive, updateCompanyDrive, deleteCompanyDrive } from '../utils/storage';
import { ConfirmModal } from '../components/ConfirmModal';
import { 
  Building2, 
  Plus, 
  Calendar, 
  Edit3, 
  Trash2, 
  Briefcase,
  X,
  Search
} from 'lucide-react';

interface CompanyDrivesViewProps {
  user: User;
  onRefreshStats: () => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  onApplyFromDrive?: (drive: CompanyDrive) => void;
}

export const CompanyDrivesView: React.FC<CompanyDrivesViewProps> = ({
  user,
  onRefreshStats,
  showToast,
  onApplyFromDrive,
}) => {
  const [drives, setDrives] = useState<CompanyDrive[]>(() => getCompanyDrives(user.id));
  const [searchQuery, setSearchQuery] = useState('');

  // Modal form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState<CompanyDrive | null>(null);

  // Form fields
  const [companyName, setCompanyName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [eligibilityCriteria, setEligibilityCriteria] = useState('');
  const [driveDate, setDriveDate] = useState('');
  const [linkOrNotes, setLinkOrNotes] = useState('');

  // Delete modal
  const [deletingDriveId, setDeletingDriveId] = useState<string | null>(null);

  const refreshList = () => {
    setDrives(getCompanyDrives(user.id));
    onRefreshStats();
  };

  const handleOpenAdd = () => {
    setEditingDrive(null);
    setCompanyName('');
    setJobRole('');
    setEligibilityCriteria('');
    setDriveDate(new Date().toISOString().split('T')[0]);
    setLinkOrNotes('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (drive: CompanyDrive) => {
    setEditingDrive(drive);
    setCompanyName(drive.companyName);
    setJobRole(drive.jobRole);
    setEligibilityCriteria(drive.eligibilityCriteria);
    setDriveDate(drive.driveDate);
    setLinkOrNotes(drive.linkOrNotes || '');
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !jobRole.trim() || !driveDate) return;

    if (editingDrive) {
      updateCompanyDrive(user.id, {
        ...editingDrive,
        companyName: companyName.trim(),
        jobRole: jobRole.trim(),
        eligibilityCriteria: eligibilityCriteria.trim(),
        driveDate,
        linkOrNotes: linkOrNotes.trim() || undefined,
      });
      showToast('Drive updated', 'Placement drive details updated.', 'success');
    } else {
      addCompanyDrive(user.id, {
        companyName: companyName.trim(),
        jobRole: jobRole.trim(),
        eligibilityCriteria: eligibilityCriteria.trim(),
        driveDate,
        linkOrNotes: linkOrNotes.trim() || undefined,
      });
      showToast('Drive recorded', 'New placement drive added.', 'success');
    }

    setIsFormOpen(false);
    refreshList();
  };

  const confirmDelete = () => {
    if (deletingDriveId) {
      deleteCompanyDrive(user.id, deletingDriveId);
      showToast('Drive deleted', 'Placement drive removed.', 'info');
      setDeletingDriveId(null);
      refreshList();
    }
  };

  const filteredDrives = drives.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.companyName.toLowerCase().includes(q) ||
      d.jobRole.toLowerCase().includes(q) ||
      d.eligibilityCriteria.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172B3A] tracking-tight">
            Placement Drives
          </h1>
          <p className="text-xs sm:text-sm text-[#758392] mt-0.5">
            Record upcoming on-campus drives, eligibility cutoffs, and selection dates.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary text-xs sm:text-sm !py-2.5 !px-5 shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Placement Drive</span>
        </button>
      </div>

      {/* Search & Notice */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#758392] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company or role..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs sm:text-sm text-[#263746] focus:outline-none focus:border-[#398879]"
          />
        </div>
        <span className="text-[11px] text-[#758392] bg-[#E7F0FA] px-3 py-1.5 rounded-lg border border-[#D0E2F5]">
          Manual register — update details from college TPO announcements.
        </span>
      </div>

      {/* Drives Grid / List */}
      {filteredDrives.length === 0 ? (
        <div className="card-panel py-16 px-4 text-center bg-white">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#E7F0FA] flex items-center justify-center text-[#758392] mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#172B3A]">
            No placement drives logged yet
          </h3>
          <p className="text-xs text-[#758392] mt-1 max-w-sm mx-auto mb-4">
            Record details about companies visiting your campus, eligible branches, and scheduled exam dates.
          </p>
          <button onClick={handleOpenAdd} className="btn-primary text-xs !py-2 !px-4">
            <Plus className="w-4 h-4" />
            Add First Drive
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDrives.map((drive) => (
            <div
              key={drive.id}
              className="card-panel p-5 sm:p-6 bg-white flex flex-col justify-between gap-4 card-panel-interactive"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-[#172B3A]">
                      {drive.companyName}
                    </h3>
                    <p className="text-xs font-semibold text-[#398879] mt-0.5">
                      {drive.jobRole}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(drive)}
                      className="p-1.5 text-[#758392] hover:text-[#172B3A] hover:bg-[#F5F7FA] rounded-lg transition-colors cursor-pointer"
                      title="Edit Drive"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingDriveId(drive.id)}
                      className="p-1.5 text-[#758392] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Drive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Eligibility */}
                <div className="mt-3 p-3 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] text-xs">
                  <span className="font-semibold text-[#172B3A] block mb-0.5">
                    Eligibility Criteria:
                  </span>
                  <p className="text-[#758392] leading-relaxed">
                    {drive.eligibilityCriteria || 'Not specified'}
                  </p>
                </div>

                {/* Notes or link */}
                {drive.linkOrNotes && (
                  <p className="text-xs text-[#758392] mt-3 italic leading-relaxed">
                    "{drive.linkOrNotes}"
                  </p>
                )}
              </div>

              {/* Bottom footer: date and action */}
              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#172B3A] font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-[#398879]" />
                  <span>Drive Date: {drive.driveDate}</span>
                </div>

                {onApplyFromDrive && (
                  <button
                    onClick={() => onApplyFromDrive(drive)}
                    className="text-xs font-semibold text-[#398879] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Log Application</span>
                    <Briefcase className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drive Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 border border-[#E2E8F0] shadow-2xl relative">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-[#758392] hover:text-[#172B3A] p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#172B3A] mb-1">
              {editingDrive ? 'Edit Placement Drive' : 'Add Placement Drive'}
            </h3>
            <p className="text-xs text-[#758392] mb-5">
              Enter company details, eligibility criteria, and scheduled drive date.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Infosys, TCS, Oracle, Wipro"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                  Job Role / Position *
                </label>
                <input
                  type="text"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g. Systems Engineer, Graduate Analyst, SDE-1"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                  Drive Date *
                </label>
                <input
                  type="date"
                  value={driveDate}
                  onChange={(e) => setDriveDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-xs sm:text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                  Eligibility Criteria *
                </label>
                <textarea
                  value={eligibilityCriteria}
                  onChange={(e) => setEligibilityCriteria(e.target.value)}
                  rows={2}
                  placeholder="e.g. B.Tech CSE/IT with 60%+ in 10th/12th/Graduation, max 1 backlog"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-xs sm:text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                  Portal Link or TPO Notes (Optional)
                </label>
                <textarea
                  value={linkOrNotes}
                  onChange={(e) => setLinkOrNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Mandatory registration on college TPO portal by Friday 5 PM."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-xs sm:text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879]"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="btn-secondary text-xs sm:text-sm !py-2 !px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs sm:text-sm !py-2 !px-5 shadow-xs"
                >
                  {editingDrive ? 'Save Changes' : 'Record Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingDriveId}
        title="Delete Placement Drive"
        message="Are you sure you want to remove this company drive from your records?"
        confirmLabel="Delete Drive"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingDriveId(null)}
      />
    </div>
  );
};
