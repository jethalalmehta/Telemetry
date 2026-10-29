import React from 'react';
import { 
  CheckSquare, 
  UserCheck, 
  LayoutDashboard, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Layers,
  BookOpen, 
  Building2, 
  Briefcase, 
  Database, 
  ShieldCheck, 
  GraduationCap
} from 'lucide-react';
import { StatusPulse } from '../components/DecorativeElements';

interface HomeViewProps {
  onStartPreparing: () => void;
  onExploreFeatures: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onStartPreparing, onExploreFeatures }) => {
  return (
    <div className="bg-[#F5F7FA]">
      {/* Modern Split-Layout Hero */}
      <section className="pt-10 pb-16 md:pt-16 md:pb-24 border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Side: Copy and Actions */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E7F0FA] border border-[#D0E2F5] text-xs font-bold text-[#203B53] tracking-wide">
                <StatusPulse color="#398879" />
                <span>Placement Preparation System</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#203B53] tracking-tight leading-[1.18]">
                Structure your placement preparation with focus.
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-[#758392] leading-relaxed max-w-xl">
                Telemetry is a placement preparation tracker designed for engineering students. Organise your syllabus topics across aptitude and core computer science subjects, set target completion dates, and monitor your genuine preparation progress in one clean workspace.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={onStartPreparing}
                  className="btn-primary text-sm sm:text-base !py-3 !px-6 justify-center shadow-md cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onExploreFeatures}
                  className="btn-secondary text-sm sm:text-base !py-3 !px-6 justify-center cursor-pointer"
                >
                  <span>Explore Features</span>
                </button>
              </div>

              {/* Highlights below buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-5 text-xs text-[#758392]">
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#398879]" />
                  <span>Student Auth & Profile</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#398879]" />
                  <span>7-Category Syllabus Tracker</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#398879]" />
                  <span>Persistent SQLite Database</span>
                </div>
              </div>
            </div>

            {/* Right Side: Realistic Dashboard & Tracker Preview */}
            <div className="lg:col-span-6">
              <div className="relative">
                {/* Subtle back decorative glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-[#398879]/20 to-[#E7F0FA]/80 rounded-2xl blur-xl opacity-70 -z-10" />

                {/* Dashboard Mock Window */}
                <div className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden p-5 sm:p-6 space-y-4">
                  {/* Window Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0]" />
                      </div>
                      <span className="font-bold text-[#203B53] ml-2 text-xs">
                        Telemetry Student Workspace
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#E7F0FA] text-[#203B53] text-[10px] font-bold border border-[#D0E2F5]">
                      Live Workspace
                    </span>
                  </div>

                  {/* 3 Real Statistics Chips */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="p-3 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0]">
                      <p className="text-[11px] text-[#758392] font-semibold">Total Tasks</p>
                      <p className="text-xl font-bold text-[#203B53] mt-0.5">8</p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0]">
                      <p className="text-[11px] text-[#758392] font-semibold">Completed</p>
                      <p className="text-xl font-bold text-[#398879] mt-0.5">5</p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0]">
                      <p className="text-[11px] text-[#758392] font-semibold">Pending</p>
                      <p className="text-xl font-bold text-[#DCA65A] mt-0.5">3</p>
                    </div>
                  </div>

                  {/* Sample Tasks Checklist */}
                  <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#203B53]">
                      <span>Today's Preparation Tasks</span>
                      <span className="text-[#398879] text-[11px]">62% Completed</span>
                    </div>

                    <div className="space-y-2 pt-1 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-4 h-4 rounded bg-[#398879] text-white flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[#263746] font-medium">Time and Work Formula Revision</span>
                        </div>
                        <span className="badge-teal px-2 py-0.5 rounded text-[10px]">Completed</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-4 h-4 rounded bg-[#E7F0FA] text-[#203B53] flex items-center justify-center">
                            <Clock className="w-3.5 h-3.5 text-[#398879]" />
                          </div>
                          <span className="text-[#263746] font-medium">Binary Search Tree Traversals</span>
                        </div>
                        <span className="badge-sky px-2 py-0.5 rounded text-[10px]">In Progress</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-4 h-4 rounded border-2 border-[#DCE3EB] bg-white" />
                          <span className="text-[#263746] font-medium">DBMS Normalization (3NF & BCNF)</span>
                        </div>
                        <span className="badge-amber px-2 py-0.5 rounded text-[10px]">Pending</span>
                      </div>
                    </div>
                  </div>

                  {/* Clean formula info */}
                  <div className="p-3 rounded-xl bg-[#E7F0FA]/60 border border-[#D0E2F5] text-xs text-[#203B53] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[11px]">Progress Calculation</p>
                      <p className="text-[10px] text-[#758392] mt-0.5">(Completed Tasks ÷ Total Tasks) × 100%</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-[#D0E2F5] font-bold text-xs text-[#398879]">
                      Real Data
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-16 md:py-20 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#398879] uppercase tracking-wider">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#203B53] tracking-tight mt-1 mb-3">
              Built for Engineering Placement Success
            </h2>
            <p className="text-[#758392] text-sm sm:text-base leading-relaxed">
              Everything you need to organize your preparation, track syllabus completion, and prepare confidently for campus placements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Student Auth */}
            <div className="card-panel card-panel-interactive p-6 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#E7F0FA] flex items-center justify-center text-[#203B53] mb-4">
                  <ShieldCheck className="w-5 h-5 text-[#398879]" />
                </div>
                <h3 className="text-base font-bold text-[#203B53] mb-2">1. Registration & Auth</h3>
                <p className="text-xs text-[#758392] leading-relaxed">
                  Full student account creation with email validation, duplicate protection, password confirmation, and secure cryptographic hashing.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#E2E8F0] text-[11px] font-semibold text-[#398879]">
                ✓ Secure Session Storage
              </div>
            </div>

            {/* 2. Student Profile */}
            <div className="card-panel card-panel-interactive p-6 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#E7F0FA] flex items-center justify-center text-[#203B53] mb-4">
                  <UserCheck className="w-5 h-5 text-[#398879]" />
                </div>
                <h3 className="text-base font-bold text-[#203B53] mb-2">2. Student Profile</h3>
                <p className="text-xs text-[#758392] leading-relaxed">
                  Record your college information, engineering branch, current semester, technical competencies, and target placement job roles.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#E2E8F0] text-[11px] font-semibold text-[#398879]">
                ✓ Editable & Persistent
              </div>
            </div>

            {/* 3. Preparation Tracker */}
            <div className="card-panel card-panel-interactive p-6 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#E7F0FA] flex items-center justify-center text-[#203B53] mb-4">
                  <CheckSquare className="w-5 h-5 text-[#398879]" />
                </div>
                <h3 className="text-base font-bold text-[#203B53] mb-2">3. Preparation Tracker</h3>
                <p className="text-xs text-[#758392] leading-relaxed">
                  Add, edit, delete, and filter syllabus topics across 7 categories including Aptitude, Reasoning, Coding, and Technical Subjects.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#E2E8F0] text-[11px] font-semibold text-[#398879]">
                ✓ Real-Time Filtering
              </div>
            </div>

            {/* 4. Student Dashboard */}
            <div className="card-panel card-panel-interactive p-6 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#E7F0FA] flex items-center justify-center text-[#203B53] mb-4">
                  <LayoutDashboard className="w-5 h-5 text-[#398879]" />
                </div>
                <h3 className="text-base font-bold text-[#203B53] mb-2">4. Live Dashboard</h3>
                <p className="text-xs text-[#758392] leading-relaxed">
                  Personalized welcome greeting, 3 real summary counters (Total, Completed, Pending), interactive checklist, and automatic progress tracking.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#E2E8F0] text-[11px] font-semibold text-[#398879]">
                ✓ Live Dynamic Metrics
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Syllabus & Preparation Architecture Section */}
      <section className="py-16 md:py-20 bg-[#F5F7FA] border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="badge-sky px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
              Comprehensive Syllabus
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#203B53] tracking-tight mt-1.5">
              Structured Across Key Placement Domains
            </h2>
            <p className="text-xs sm:text-sm text-[#758392] mt-1.5">
              Organise every topic required for campus screening tests and technical interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Domain 1 */}
            <div className="card-panel p-6 bg-white space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E7F0FA] text-[#203B53] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#398879]" />
              </div>
              <h3 className="text-base font-bold text-[#203B53]">
                Aptitude & Logical Reasoning
              </h3>
              <p className="text-xs text-[#758392] leading-relaxed">
                Quantitative aptitude (Time & Work, Percentages, Profit & Loss), Logical Reasoning (Syllogisms, Series, Blood Relations), and Verbal Ability.
              </p>
            </div>

            {/* Domain 2 */}
            <div className="card-panel p-6 bg-white space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E7F0FA] text-[#203B53] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#398879]" />
              </div>
              <h3 className="text-base font-bold text-[#203B53]">
                Core Computer Science
              </h3>
              <p className="text-xs text-[#758392] leading-relaxed">
                Data Structures, Algorithms, Object-Oriented Programming (OOPs), Database Management Systems (DBMS), and Operating Systems fundamentals.
              </p>
            </div>

            {/* Domain 3 */}
            <div className="card-panel p-6 bg-white space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E7F0FA] text-[#203B53] flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-[#398879]" />
              </div>
              <h3 className="text-base font-bold text-[#203B53]">
                Coding & Interview Preparation
              </h3>
              <p className="text-xs text-[#758392] leading-relaxed">
                Hands-on coding practice, algorithmic problem solving, HR interview questions, self-introduction, and technical project explanations.
              </p>
            </div>
          </div>

          {/* Callout Banner */}
          <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-[#203B53] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white text-xs font-semibold mb-2">
                <Database className="w-3.5 h-3.5 text-[#DCA65A]" />
                <span>Reliable • Clean Architecture • Privacy-Respecting</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold">
                Ready to organize your placement preparation?
              </h3>
              <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-xl">
                Create your student account, set up your syllabus goals, and track your genuine preparation progress today.
              </p>
            </div>

            <button
              onClick={onStartPreparing}
              className="btn-teal text-xs sm:text-sm !py-3 !px-6 shrink-0 shadow-sm cursor-pointer"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
