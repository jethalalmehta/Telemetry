import React, { useState } from 'react';
import { User, StudentProfile, BTECH_SEMESTERS, normalizeSemester } from '../types';
import { getProfile, saveProfile } from '../utils/storage';
import { 
  Building, 
  GraduationCap, 
  Code, 
  Briefcase, 
  Mail, 
  User as UserIcon, 
  Save, 
  CheckCircle,
  ArrowRight,
  Plus,
  X
} from 'lucide-react';

interface ProfileViewProps {
  user: User;
  isInitialSetup?: boolean;
  onProfileSaved: (profile: StudentProfile) => void;
  onNavigateToDashboard: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  isInitialSetup = false,
  onProfileSaved,
  onNavigateToDashboard,
}) => {
  const existingProfile = getProfile(user.id);

  const [fullName, setFullName] = useState(existingProfile?.fullName || user.fullName);
  const [collegeName, setCollegeName] = useState(existingProfile?.collegeName || '');
  const [branch, setBranch] = useState(existingProfile?.branch || 'Computer Science and Engineering');
  const [semester, setSemester] = useState(normalizeSemester(existingProfile?.semester));
  const [skillInput, setSkillInput] = useState('');
  const [technicalSkills, setTechnicalSkills] = useState<string[]>(
    existingProfile?.technicalSkills || ['Java', 'Data Structures & Algorithms', 'SQL', 'HTML/CSS']
  );
  const [preferredRole, setPreferredRole] = useState(
    existingProfile?.preferredRole || 'Graduate Software Engineer'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !technicalSkills.includes(trimmed)) {
      setTechnicalSkills([...technicalSkills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setTechnicalSkills(technicalSkills.filter(s => s !== skillToRemove));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StudentProfile = {
      userId: user.id,
      fullName: fullName.trim() || user.fullName,
      email: user.email,
      collegeName: collegeName.trim() || 'Engineering College',
      branch,
      semester,
      technicalSkills,
      preferredRole: preferredRole.trim() || 'Software Engineer',
      updatedAt: new Date().toISOString(),
    };
    saveProfile(updated);
    onProfileSaved(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (isInitialSetup) {
        onNavigateToDashboard();
      }
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="card-panel p-6 sm:p-7 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#203B53] text-[#FFFFFF] flex items-center justify-center font-extrabold text-xl shrink-0 shadow-xs">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E7F0FA] text-[#203B53] text-xs font-semibold mb-1 border border-[#D0E2F5]">
              <span>{isInitialSetup ? 'Initial Profile Onboarding' : 'Student Academic Profile'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#203B53]">
              {fullName}
            </h1>
            <p className="text-xs text-[#758392]">
              {branch} • {semester}
            </p>
          </div>
        </div>

        {isInitialSetup && (
          <div className="text-xs font-semibold text-[#398879] bg-[rgba(57,136,121,0.12)] px-3 py-1.5 rounded-lg border border-[rgba(57,136,121,0.3)]">
            Complete profile to open your placement dashboard
          </div>
        )}
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-[rgba(57,136,121,0.12)] border border-[rgba(57,136,121,0.3)] text-[#276559] flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#398879]" />
            <span className="text-sm font-semibold">Student profile saved successfully!</span>
          </div>
          {isInitialSetup && (
            <span className="text-xs font-medium text-[#398879] flex items-center gap-1">
              Opening Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      )}

      {/* Structured Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Academic & College Information */}
        <div className="card-panel p-6 bg-white space-y-5">
          <div className="border-b border-[#E2E8F0] pb-3">
            <h2 className="text-base font-bold text-[#203B53]">Academic Information</h2>
            <p className="text-xs text-[#758392] mt-0.5">Your official college enrollment and graduation details.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#203B53] mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#203B53] mb-1.5">
                Registered Email (Read-only)
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-gray-100 text-[#758392] text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#203B53] mb-1.5">
              College / University Name *
            </label>
            <input
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="e.g. National Institute of Technology / Government Engineering College"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#203B53] mb-1.5">
                Branch / Specialization
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879] cursor-pointer"
              >
                <option value="Computer Science and Engineering">Computer Science & Engineering (CSE)</option>
                <option value="Information Technology">Information Technology (IT)</option>
                <option value="Electronics and Communication">Electronics & Communication (ECE)</option>
                <option value="Data Science / AI & ML">Data Science / AI & ML</option>
                <option value="Electrical Engineering">Electrical Engineering (EE)</option>
                <option value="Mechanical Engineering">Mechanical Engineering (ME)</option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#203B53] mb-1.5">
                Current Semester / Year
              </label>
              <select
                id="semester"
                name="semester"
                value={semester}
                onChange={(e) => setSemester(normalizeSemester(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879] cursor-pointer"
              >
                {BTECH_SEMESTERS.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Career Goals & Technical Skills */}
        <div className="card-panel p-6 bg-white space-y-5">
          <div className="border-b border-[#E2E8F0] pb-3">
            <h2 className="text-base font-bold text-[#203B53]">Career & Technical Skills</h2>
            <p className="text-xs text-[#758392] mt-0.5">Define target placements roles and your programming competencies.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#203B53] mb-1.5">
              Target Job Role *
            </label>
            <input
              type="text"
              value={preferredRole}
              onChange={(e) => setPreferredRole(e.target.value)}
              placeholder="e.g. Graduate Software Engineer, Full Stack Trainee, Systems Engineer"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#203B53] mb-1.5">
              Technical Skills & Proficiencies
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="Type a skill (e.g., Python, C++, DBMS, Git) and press Enter"
                className="flex-1 px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879]"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="btn-secondary text-xs !py-2 !px-3 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 p-3.5 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0]">
              {technicalSkills.length === 0 ? (
                <span className="text-xs text-[#758392] italic">No skills added yet. Type above and add.</span>
              ) : (
                technicalSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#DCE3EB] text-xs font-semibold text-[#203B53] shadow-2xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-[#758392] hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onNavigateToDashboard}
            className="btn-secondary text-xs sm:text-sm !py-2.5 !px-5 cursor-pointer"
          >
            Back to Dashboard
          </button>
          <button
            type="submit"
            className="btn-primary text-xs sm:text-sm !py-2.5 !px-6 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isInitialSetup ? 'Save & Open Dashboard' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
