import React, { useState, useEffect } from 'react';
import { ActiveTab, User, StudentProfile } from './types';
import { getCurrentUser, getProfile, logout } from './utils/storage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import { HomeView } from './views/HomeView';
import { AuthView } from './views/AuthView';
import { ProfileView } from './views/ProfileView';
import { DashboardView } from './views/DashboardView';
import { PreparationTrackerView } from './views/PreparationTrackerView';
import { MockTestView } from './views/MockTestView';
import { CompanyDrivesView } from './views/CompanyDrivesView';
import { JobDiscoveryView } from './views/JobDiscoveryView';
import { ResumeAnalysisView } from './views/ResumeAnalysisView';
import { ApplicationTrackerView } from './views/ApplicationTrackerView';
import { PlacementAnalysisView } from './views/PlacementAnalysisView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [currentTab, setCurrentTab] = useState<ActiveTab>('home');
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [isNewRegistration, setIsNewRegistration] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load current session
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      const prof = getProfile(user.id);
      setProfile(prof);
      setCurrentTab('dashboard');
    }
  }, []);

  const showToast = (title: string, message?: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAuthSuccess = (user: User, isNew: boolean) => {
    setCurrentUser(user);
    setAuthMode(null);
    const existingProf = getProfile(user.id);
    setProfile(existingProf);

    // If newly registered or profile missing, redirect immediately to profile setup (Prompt Section 5)
    if (isNew || !existingProf) {
      setIsNewRegistration(true);
      setCurrentTab('profile');
      showToast('Welcome to Telemetry', 'Please complete your student profile details.', 'success');
    } else {
      setIsNewRegistration(false);
      setCurrentTab('dashboard');
      showToast('Welcome back', `Signed in as ${user.fullName}`, 'success');
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setProfile(null);
    setCurrentTab('home');
    showToast('Signed Out', 'You have been logged out of Telemetry.', 'info');
  };

  const handleSelectTab = (tab: ActiveTab) => {
    // Protected routes check
    if (!currentUser && tab !== 'home') {
      setAuthMode('login');
      showToast('Sign In Required', 'Please sign in to access your placement dashboard.', 'info');
      return;
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProfileSaved = (updatedProfile: StudentProfile) => {
    setProfile(updatedProfile);
    setIsNewRegistration(false);
    showToast('Profile Saved', 'Student academic details updated.', 'success');
  };

  const triggerStatsRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // If user is logged in and not on public homepage or auth modal: Render Workspace Shell with Sidebar
  const isAppShell = !!currentUser && !authMode && currentTab !== 'home';

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#263746] flex">
      {/* Authenticated Desktop Sidebar Shell */}
      {isAppShell && (
        <div className="hidden md:block">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={handleSelectTab}
            currentUser={currentUser}
            profile={profile}
            onLogout={handleLogout}
          />
        </div>
      )}

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <Navbar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          currentUser={currentUser}
          profile={profile}
          onLogout={handleLogout}
          onOpenAuth={(mode) => setAuthMode(mode)}
          onRefreshStats={triggerStatsRefresh}
        />

        {/* Content View */}
        <main className={`flex-1 ${isAppShell ? 'p-4 sm:p-6 lg:p-8' : ''}`}>
          {authMode ? (
            <AuthView
              initialMode={authMode}
              onAuthSuccess={handleAuthSuccess}
              onCancel={() => setAuthMode(null)}
            />
          ) : (
            <>
              {currentTab === 'home' && (
                <HomeView
                  onStartPreparing={() => {
                    if (currentUser) {
                      setCurrentTab('dashboard');
                    } else {
                      setAuthMode('register');
                    }
                  }}
                  onExploreFeatures={() => {
                    const el = document.getElementById('features');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              )}

              {currentTab === 'dashboard' && currentUser && (
                <DashboardView
                  key={refreshTrigger}
                  user={currentUser}
                  profile={profile}
                  onNavigate={handleSelectTab}
                  onRefresh={triggerStatsRefresh}
                />
              )}

              {currentTab === 'tasks' && currentUser && (
                <PreparationTrackerView
                  key={refreshTrigger}
                  user={currentUser}
                  onRefreshStats={triggerStatsRefresh}
                  showToast={showToast}
                />
              )}

              {currentTab === 'mocktests' && currentUser && (
                <MockTestView
                  key={refreshTrigger}
                  user={currentUser}
                  onRefreshStats={triggerStatsRefresh}
                  showToast={showToast}
                  onNavigateToDashboard={() => setCurrentTab('dashboard')}
                />
              )}

              {(currentTab === 'jobs' || currentTab === 'drives') && currentUser && (
                <JobDiscoveryView
                  key={refreshTrigger}
                  user={currentUser}
                  profile={profile}
                  showToast={showToast}
                  onNavigateToApplications={() => setCurrentTab('applications')}
                  onNavigateToProfile={() => setCurrentTab('profile')}
                  onRefreshStats={triggerStatsRefresh}
                />
              )}

              {currentTab === 'resume' && currentUser && (
                <ResumeAnalysisView
                  key={refreshTrigger}
                  user={currentUser}
                  profile={profile}
                  showToast={showToast}
                  onExploreJobs={() => setCurrentTab('jobs')}
                  onRefreshStats={triggerStatsRefresh}
                />
              )}

              {currentTab === 'applications' && currentUser && (
                <ApplicationTrackerView
                  key={refreshTrigger}
                  user={currentUser}
                  onRefreshStats={triggerStatsRefresh}
                  showToast={showToast}
                />
              )}

              {currentTab === 'analysis' && currentUser && (
                <PlacementAnalysisView
                  key={refreshTrigger}
                  user={currentUser}
                  onNavigate={handleSelectTab}
                />
              )}

              {currentTab === 'profile' && currentUser && (
                <ProfileView
                  user={currentUser}
                  isInitialSetup={isNewRegistration}
                  onProfileSaved={handleProfileSaved}
                  onNavigateToDashboard={() => setCurrentTab('dashboard')}
                />
              )}
            </>
          )}
        </main>

        {/* Public Homepage Footer only when not in full app shell */}
        {!isAppShell && !authMode && (
          <Footer onNavigateHome={() => handleSelectTab('home')} />
        )}
      </div>

      {/* Global Toast Notifications */}
      <NotificationToast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
