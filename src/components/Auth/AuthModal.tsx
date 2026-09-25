import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, X, ArrowRight, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { authService } from '../../services/authService';
import { AuthUser } from '../../types';
import { playTapSound, playCorrectSound, playIncorrectSound } from '../../utils/audio';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [courseTrack, setCourseTrack] = useState('medicine');

  // Touched state for inline validation
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync mode with initialMode when opened
  React.useEffect(() => {
    setMode(initialMode);
    setAuthError(null);
  }, [initialMode, isOpen]);

  // Validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const isNameValid = mode === 'login' ? true : name.trim().length >= 2;

  const showEmailError = emailTouched && !isEmailValid && email.length > 0;
  const showPasswordError = passwordTouched && !isPasswordValid && password.length > 0;
  const showNameError = mode === 'signup' && nameTouched && !isNameValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound();

    setEmailTouched(true);
    setPasswordTouched(true);
    if (mode === 'signup') setNameTouched(true);

    if (!isEmailValid || !isPasswordValid || !isNameValid) {
      playIncorrectSound();
      setAuthError('Please fill all required fields correctly.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      let user: AuthUser;
      if (mode === 'signup') {
        user = await authService.signup(name.trim(), email.trim(), password);
      } else {
        user = await authService.login(email.trim(), password);
      }
      playCorrectSound();
      onSuccess(user);
    } catch (err: unknown) {
      playIncorrectSound();
      setAuthError(err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    playTapSound();
    setIsLoading(true);
    setAuthError(null);
    try {
      const user = await authService.loginWithGoogle();
      playCorrectSound();
      onSuccess(user);
    } catch (err: unknown) {
      playIncorrectSound();
      setAuthError(err instanceof Error ? err.message : 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoFill = (type: 'demo' | 'pro') => {
    playTapSound();
    if (type === 'demo') {
      setEmail('candidate@jamb.gov.ng');
      setPassword('password123');
      setName('Amina Adebayo');
    } else {
      setEmail('pro.scholar@gmail.com');
      setPassword('propass2025');
      setName('Chukwuebuka Obi');
    }
    setEmailTouched(true);
    setPasswordTouched(true);
    setAuthError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Frosted Glass Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Heavy, Weighted Modal with Restrained Spring Physics */}
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', damping: 32, stiffness: 350, mass: 0.95 }}
            className="relative z-10 w-full max-w-md rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow-lifted ring-1 ring-inset ring-black/5 dark:ring-white/10 overflow-hidden text-left"
          >
            {/* Top Header & Close */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 shadow-xs ring-1 ring-inset ring-black/5 dark:ring-white/10">
                  <span className="font-editorial text-sm font-semibold italic">S</span>
                </div>
                <div>
                  <h2 className="font-editorial text-lg font-semibold text-stone-900 dark:text-stone-100 leading-tight">
                    {mode === 'login' ? 'Scholar Sign In' : 'Create Scholar Account'}
                  </h2>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 font-ui">
                    {mode === 'login'
                      ? 'Access your syllabus diagnostics and goals'
                      : 'Start your journey to 300+ in UTME 2025'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playTapSound();
                  onClose();
                }}
                aria-label="Close authentication modal"
                className="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/60 active:scale-[0.98] duration-200 ease-out transition-all cursor-pointer"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Global Error Notice */}
            {authError && (
              <div className="mt-3 rounded-xl border border-red-200/80 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 p-3 text-xs text-red-700 dark:text-red-300 font-ui flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" strokeWidth={1.5} />
                <div className="flex-1">{authError}</div>
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              {/* Full Name (Sign Up only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 font-ui mb-1">
                    Full Candidate Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setNameTouched(true)}
                    placeholder="e.g. Amina Adebayo"
                    className={`w-full rounded-xl border py-2.5 px-3.5 text-xs font-ui transition-colors outline-hidden ${
                      showNameError
                        ? 'border-red-400 bg-red-50/20 text-red-900 dark:text-red-100'
                        : 'border-stone-200/70 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 text-stone-900 dark:text-stone-100 focus:border-stone-900 dark:focus:border-stone-100'
                    }`}
                  />
                  {showNameError && (
                    <span className="text-[10px] text-red-600 dark:text-red-400 font-ui mt-0.5 block">
                      Name must be at least 2 characters.
                    </span>
                  )}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 font-ui mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="candidate@scholar.edu"
                  className={`w-full rounded-xl border py-2.5 px-3.5 text-xs font-ui transition-colors outline-hidden ${
                    showEmailError
                      ? 'border-red-400 bg-red-50/20 text-red-900 dark:text-red-100'
                      : 'border-stone-200/70 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 text-stone-900 dark:text-stone-100 focus:border-stone-900 dark:focus:border-stone-100'
                  }`}
                />
                {showEmailError && (
                  <span className="text-[10px] text-red-600 dark:text-red-400 font-ui mt-0.5 block">
                    Please provide a valid email format.
                  </span>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 font-ui mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setPasswordTouched(true)}
                    placeholder="Min. 6 characters"
                    className={`w-full rounded-xl border py-2.5 pl-3.5 pr-10 text-xs font-ui transition-colors outline-hidden ${
                      showPasswordError
                        ? 'border-red-400 bg-red-50/20 text-red-900 dark:text-red-100'
                        : 'border-stone-200/70 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 text-stone-900 dark:text-stone-100 focus:border-stone-900 dark:focus:border-stone-100'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                    ) : (
                      <Eye className="h-4 w-4" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
                {showPasswordError && (
                  <span className="text-[10px] text-red-600 dark:text-red-400 font-ui mt-0.5 block">
                    Password must be at least 6 characters.
                  </span>
                )}
              </div>

              {/* Target Course (Sign up only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 font-ui mb-1">
                    Target Course Discipline
                  </label>
                  <select
                    value={courseTrack}
                    onChange={(e) => setCourseTrack(e.target.value)}
                    className="w-full rounded-xl border border-stone-200/70 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 py-2.5 px-3.5 text-xs text-stone-900 dark:text-stone-100 font-ui outline-hidden"
                  >
                    <option value="medicine">Medicine & Surgery (Target: 320)</option>
                    <option value="law">Law (Target: 305)</option>
                    <option value="engineering">Electrical Engineering (Target: 310)</option>
                    <option value="accounting">Accounting & Finance (Target: 290)</option>
                    <option value="cs">Computer Science (Target: 300)</option>
                  </select>
                </div>
              )}

              {/* Primary Submit Button with Matte Finish & Physics */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-matte w-full rounded-xl py-3 text-xs font-semibold shadow-xs flex items-center justify-center gap-2 font-ui cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                    <span>Validating Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In to Scholar' : 'Create Candidate Profile'}</span>
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-3.5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200/70 dark:border-stone-800" />
              </div>
              <span className="relative bg-white dark:bg-[#1a1c1e] px-2 text-[10px] uppercase font-mono text-stone-400">
                Or continue with
              </span>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full rounded-xl border border-stone-200/70 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 py-2.5 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:opacity-90 active:scale-[0.98] duration-200 ease-out transition-all flex items-center justify-center gap-2.5 font-ui shadow-2xs ring-1 ring-inset ring-black/5 dark:ring-white/10 cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            {/* Quick Demo Fill Helper */}
            <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 font-ui">
              <span>Fill Demo Credentials:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('demo')}
                  className="text-emerald-700 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
                >
                  Free Candidate
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('pro')}
                  className="text-amber-700 dark:text-amber-400 hover:underline font-medium cursor-pointer"
                >
                  Pro Candidate
                </button>
              </div>
            </div>

            {/* Mode Toggle Footer */}
            <div className="mt-3 text-center text-xs text-stone-500 dark:text-stone-400 font-ui">
              {mode === 'login' ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      playTapSound();
                      setMode('signup');
                      setAuthError(null);
                    }}
                    className="font-semibold text-stone-900 dark:text-stone-100 hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      playTapSound();
                      setMode('login');
                      setAuthError(null);
                    }}
                    className="font-semibold text-stone-900 dark:text-stone-100 hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </span>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
