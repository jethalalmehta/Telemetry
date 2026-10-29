import React from 'react';
import { ActiveTab, User, StudentProfile } from '../types';
import { TelemetryLogo } from './DecorativeElements';
import {
  LayoutDashboard,
  User as UserIcon,
  CheckSquare,
  BookOpen,
  Building2,
  Briefcase,
  TrendingUp,
  LogOut,
  FileText,
} from 'lucide-react';

interface SidebarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentUser: User;
  profile: StudentProfile | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  profile,
  onLogout,
}) => {
  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Find Jobs & Placements', icon: Building2 },
    { id: 'resume', label: 'Resume & Eligibility', icon: FileText },
    { id: 'mocktests', label: 'Practice Tests', icon: BookOpen },
    { id: 'applications', label: 'Application Pipeline', icon: Briefcase },
    { id: 'tasks', label: 'Syllabus Tracker', icon: CheckSquare },
    { id: 'analysis', label: 'Placement Analysis', icon: TrendingUp },
    { id: 'profile', label: 'Student Profile', icon: UserIcon },
  ];

  return (
    <aside className="w-64 bg-[#FFFFFF] border-r border-[#E2E8F0] flex flex-col shrink-0 h-screen sticky top-0">
      {/* Clickable Brand Header */}
      <button
        onClick={() => onSelectTab('dashboard')}
        className="h-16 px-5 border-b border-[#E2E8F0] flex items-center gap-3 text-left w-full hover:bg-[#F5F7FA]/70 transition-colors cursor-pointer group focus-visible:outline-none"
        title="Telemetry Dashboard"
      >
        <TelemetryLogo size="sm" className="transition-transform group-hover:scale-105" />
        <div className="min-w-0">
          <span className="font-bold text-base tracking-tight text-[#203B53] block leading-tight">
            Telemetry
          </span>
          <span className="text-[10px] text-[#758392] font-medium block truncate">
            Placement Preparation & Tracking
          </span>
        </div>
      </button>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-[#758392] uppercase">
          Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#E7F0FA] text-[#203B53] font-semibold border border-[#D0E2F5] shadow-xs'
                  : 'text-[#263746]/80 hover:bg-[#F5F7FA] hover:text-[#203B53]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`p-1 rounded-md transition-colors ${
                    isActive ? 'text-[#398879] bg-[#E7F0FA]' : 'text-[#758392]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span>{item.label}</span>
              </div>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#398879]" />
              )}
            </button>
          );
        })}
      </div>

      {/* User Footer Profile & Sign Out */}
      <div className="p-3 border-t border-[#E2E8F0] bg-[#FAFCFE]">
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-[#E2E8F0] shadow-2xs">
          <button
            onClick={() => onSelectTab('profile')}
            className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-80 transition-opacity cursor-pointer"
            title="Edit Profile"
          >
            <div className="w-8 h-8 rounded-lg bg-[#203B53] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {(profile?.fullName || currentUser.fullName).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#203B53] truncate leading-tight">
                {profile?.fullName || currentUser.fullName}
              </p>
              <p className="text-[11px] text-[#758392] truncate mt-0.5">
                {currentUser.email}
              </p>
            </div>
          </button>

          <button
            onClick={onLogout}
            className="p-1.5 text-[#758392] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer shrink-0"
            title="Sign out of Telemetry"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
