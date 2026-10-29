import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { TelemetryLogo } from '../components/DecorativeElements';
import { registerUser, loginUser, seedDemoDataForUser } from '../utils/storage';
import { User } from '../types';

interface AuthViewProps {
  initialMode?: 'login' | 'register';
  onAuthSuccess: (user: User, isNewRegistration: boolean) => void;
  onCancel: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  onAuthSuccess,
  onCancel,
}) => {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isRegister) {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify your entries.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegister) {
        const result = await registerUser(fullName, email, password);
        if (!result.success || !result.user) {
          setError(result.message);
          setLoading(false);
          return;
        }
        onAuthSuccess(result.user, true);
      } else {
        const result = await loginUser(email, password);
        if (!result.success || !result.user) {
          setError(result.message);
          setLoading(false);
          return;
        }
        onAuthSuccess(result.user, false);
      }
    } catch (err) {
      setError('An unexpected error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const demoEmail = 'student.demo@telemetry.edu';
      let user = (await loginUser(demoEmail, 'Telemetry@123')).user;
      if (!user) {
        const reg = await registerUser('Aarav Sharma', demoEmail, 'Telemetry@123');
        if (reg.user) {
          user = reg.user;
          await seedDemoDataForUser(user);
        }
      }
      if (user) {
        onAuthSuccess(user, false);
      }
    } catch (err) {
      setError('Could not load demo student profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 bg-[#F5F7FA]">
      <div className="max-w-md w-full bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-xl p-6 sm:p-8 relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <TelemetryLogo size="lg" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#203B53] tracking-tight">
            {isRegister ? 'Create student account' : 'Welcome to Telemetry'}
          </h2>
          <p className="text-xs sm:text-sm text-[#758392] mt-1.5">
            {isRegister
              ? 'Register to begin tracking your placement preparation'
              : 'Sign in to access your placement preparation workspace'}
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm leading-relaxed flex items-start gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name (Registration only) */}
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-[#203B53] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#758392]">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  required={isRegister}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-[#203B53] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#758392]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879] transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-[#203B53] mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#758392]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#758392] hover:text-[#203B53] cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Registration only) */}
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-[#203B53] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#758392]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required={isRegister}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#758392] hover:text-[#203B53] cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-3 text-sm mt-3 shadow-sm justify-center cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{isRegister ? 'Register Student Account' : 'Sign In to Telemetry'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle between register and login */}
        <div className="mt-6 pt-5 border-t border-[#E2E8F0] text-center text-xs text-[#758392]">
          {isRegister ? (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError(null);
                }}
                className="font-bold text-[#398879] hover:underline cursor-pointer ml-1"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              New student to Telemetry?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError(null);
                }}
                className="font-bold text-[#398879] hover:underline cursor-pointer ml-1"
              >
                Create Account
              </button>
            </p>
          )}
        </div>

        {/* Quick Demo Student Account */}
        <div className="mt-6 p-3.5 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] text-center space-y-2">
          <p className="text-[11px] font-semibold text-[#203B53] flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#398879]" />
            Quick Demo Access
          </p>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-[#FFFFFF] border border-[#D0E2F5] text-[#203B53] hover:bg-[#E7F0FA] transition-all cursor-pointer shadow-2xs"
          >
            Load Sample Student Profile & Tasks
          </button>
        </div>
      </div>
    </div>
  );
};
