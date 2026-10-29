import React, { useState } from 'react';
import { ActiveTab, User, StudentProfile } from '../types';
import { TelemetryLogo, StatusPulse } from './DecorativeElements';
import { 
  Menu, 
  X,
  LayoutDashboard,
  User as UserIcon,
  CheckSquare,
  BookOpen,
  Building2,
  Briefcase,
  TrendingUp,
  LogOut,
  ArrowRight,
  FileText
} from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

interface NavbarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentUser: User | null;
  profile: StudentProfile | null;
  onLogout: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onRefreshStats?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  profile,
  onLogout,
  onOpenAuth,
  onRefreshStats,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPageTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard': return 'Student Dashboard';
      case 'jobs': return 'Find Jobs & Placements';
      case 'resume': return 'Resume Analysis & Eligibility';
      case 'mocktests': return 'Aptitude & Practice Tests';
      case 'tasks': return 'Syllabus Tracker';
      case 'drives': return 'Find Jobs & Placements';
      case 'applications': return 'Application Pipeline';
      case 'analysis': return 'Placement Analysis & Reports';
      case 'profile': return 'Student Profile';
      default: return 'Placement Preparation & Tracking';
    }
  };

  const handleMobileNav = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const handleBrandClick = () => {
    if (currentUser) {
      onSelectTab('dashboard');
    } else {
      onSelectTab('home');
    }
  };

  // Authenticated Top Bar
  if (currentUser) {
    return (
      <header className="h-16 bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Mobile menu toggle & brand */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#203B53] hover:bg-[#F5F7FA] rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <button
            onClick={handleBrandClick}
            className="flex items-center gap-2 cursor-pointer text-left group"
            title="Telemetry Dashboard"
          >
            <TelemetryLogo size="sm" className="transition-transform group-hover:scale-105" />
            <span className="font-bold text-sm text-[#203B53]">Telemetry</span>
          </button>
        </div>

        {/* Desktop breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          <button
            onClick={handleBrandClick}
            className="text-[#758392] hover:text-[#203B53] font-medium transition-colors cursor-pointer"
          >
            Workspace
          </button>
          <span className="text-[#DCE3EB]">/</span>
          <span className="font-bold text-[#203B53] text-sm">
            {getPageTitle(currentTab)}
          </span>
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-2.5">
          <NotificationDropdown
            userId={currentUser.id}
            onNavigateToApplication={() => onSelectTab('applications')}
            onRefresh={onRefreshStats}
          />

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E7F0FA] border border-[#D0E2F5] text-[11px] font-semibold text-[#203B53]">
            <StatusPulse color="#398879" />
            <span>Preparation Active</span>
          </div>

          <button
            onClick={() => onSelectTab('profile')}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F5F7FA] transition-colors cursor-pointer group"
            title="View or Edit Profile"
          >
            <div className="w-8 h-8 rounded-lg bg-[#203B53] text-[#FFFFFF] flex items-center justify-center font-bold text-xs shadow-xs">
              {(profile?.fullName || currentUser.fullName).charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline-block text-xs font-semibold text-[#203B53] group-hover:text-[#398879] transition-colors">
              {profile?.fullName || currentUser.fullName}
            </span>
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-16 bg-[#FFFFFF] border-b border-[#E2E8F0] shadow-xl p-4 space-y-1.5 z-40 animate-fade-in">
            <button
              onClick={() => handleMobileNav('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentTab === 'dashboard' ? 'bg-[#E7F0FA] text-[#203B53] font-semibold' : 'text-[#263746]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#398879]" />
              Dashboard
            </button>

            <button
              onClick={() => handleMobileNav('jobs')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentTab === 'jobs' || currentTab === 'drives' ? 'bg-[#E7F0FA] text-[#203B53] font-semibold' : 'text-[#263746]'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#398879]" />
              Find Jobs & Placements
            </button>

            <button
              onClick={() => handleMobileNav('resume')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentTab === 'resume' ? 'bg-[#E7F0FA] text-[#203B53] font-semibold' : 'text-[#263746]'
              }`}
            >
              <FileText className="w-4 h-4 text-[#398879]" />
              Resume & Eligibility
            </button>

            <button
              onClick={() => handleMobileNav('mocktests')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentTab === 'mocktests' ? 'bg-[#E7F0FA] text-[#203B53] font-semibold' : 'text-[#263746]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#398879]" />
              Practice Tests
            </button>

            <button
              onClick={() => handleMobileNav('applications')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentTab === 'applications' ? 'bg-[#E7F0FA] text-[#203B53] font-semibold' : 'text-[#263746]'
              }`}
            >
              <Briefcase className="w-4 h-4 text-[#398879]" />
              Applications
            </button>

            <button
              onClick={() => handleMobileNav('tasks')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentTab === 'tasks' ? 'bg-[#E7F0FA] text-[#203B53] font-semibold' : 'text-[#263746]'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-[#398879]" />
              Syllabus Tracker
            </button>

            <button
              onClick={() => handleMobileNav('analysis')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentTab === 'analysis' ? 'bg-[#E7F0FA] text-[#203B53] font-semibold' : 'text-[#263746]'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-[#398879]" />
              Placement Analysis
            </button>

            <button
              onClick={() => handleMobileNav('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentTab === 'profile' ? 'bg-[#E7F0FA] text-[#203B53] font-semibold' : 'text-[#263746]'
              }`}
            >
              <UserIcon className="w-4 h-4 text-[#398879]" />
              Student Profile
            </button>

            <div className="pt-3 border-t border-[#E2E8F0]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>
    );
  }

  // Public Homepage Navigation Bar
  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand Name - Clickable according to requirement 2 */}
          <button
            onClick={handleBrandClick}
            className="flex items-center gap-3 group text-left cursor-pointer focus-visible:outline-none"
            title="Telemetry Home"
          >
            <TelemetryLogo size="md" className="transition-transform group-hover:scale-105" />
            <div>
              <span className="font-bold text-xl sm:text-2xl tracking-tight text-[#203B53] block leading-tight">
                Telemetry
              </span>
              <p className="text-[11px] text-[#758392] font-medium tracking-wide">
                Placement Preparation & Tracking System
              </p>
            </div>
          </button>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => onSelectTab('home')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                currentTab === 'home'
                  ? 'text-[#203B53] font-bold bg-[#E7F0FA]'
                  : 'text-[#263746]/80 hover:text-[#203B53] hover:bg-[#F5F7FA]'
              }`}
            >
              Home
            </button>

            <a
              href="#features"
              onClick={(e) => {
                if (currentTab !== 'home') {
                  e.preventDefault();
                  onSelectTab('home');
                  setTimeout(() => {
                    const el = document.getElementById('features');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="px-3 py-2 text-sm font-medium rounded-lg text-[#263746]/80 hover:text-[#203B53] hover:bg-[#F5F7FA] transition-colors"
            >
              Features
            </a>

            <div className="h-5 w-px bg-[#E2E8F0] mx-2" />

            <button
              onClick={() => onOpenAuth('login')}
              className="btn-secondary text-sm !py-2 !px-4 cursor-pointer font-bold border-[#398879] text-[#203B53]"
            >
              ⚡ Try Demo
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              className="btn-secondary text-sm !py-2 !px-4 cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="btn-primary text-sm !py-2 !px-4 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </nav>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#203B53] hover:bg-[#F5F7FA] rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E2E8F0] bg-[#FFFFFF] px-4 pt-3 pb-5 space-y-2 shadow-lg animate-fade-in">
          <button
            onClick={() => {
              onSelectTab('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-[#263746] hover:bg-[#F5F7FA]"
          >
            Home
          </button>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-[#263746] hover:bg-[#F5F7FA]"
          >
            Features
          </a>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth('login');
              }}
              className="btn-secondary w-full justify-center text-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth('register');
              }}
              className="btn-primary w-full justify-center text-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
