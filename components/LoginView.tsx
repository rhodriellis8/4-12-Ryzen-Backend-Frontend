import React, { useEffect, useRef, useState } from 'react';
import { LogIn, Shield, Activity, UserPlus, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

declare global {
  interface Window {
    VANTA: any;
  }
}

interface LoginProps {
  accentColor?: string;
}

type AuthMode = 'signin' | 'signup' | 'forgot-password';

const REMEMBER_KEY = 'ryzen_remember_until';

// Google "G" SVG logo
const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" className="mr-2">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const LoginView: React.FC<LoginProps> = ({ accentColor = 'white' }) => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  // Form state
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetCooldown, setResetCooldown] = useState(0);

  // Map theme name to hex for Vanta
  const getColorHex = (theme: string) => {
    switch (theme) {
      case 'blue':
        return 0x3b82f6;
      case 'purple':
        return 0xa855f7;
      case 'orange':
        return 0xf97316;
      case 'white':
        return 0xffffff;
      case 'monochrome':
        return 0xd4d4d8;
      default:
        return 0xffffff;
    }
  };

  useEffect(() => {
    if (window.VANTA && vantaRef.current) {
      if (vantaEffect) vantaEffect.destroy();

      const isDark = document.documentElement.classList.contains('dark');
      try {
        setVantaEffect(
          window.VANTA.NET({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 150.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: getColorHex(accentColor),
            backgroundColor: isDark ? 0x09090b : 0xf4f4f5,
            points: 8.0,        // Reduced for better performance
            maxDistance: 20.0,  // Slightly reduced
            spacing: 20.0,      // Increased spacing for fewer lines
            showDots: true,
          })
        );
      } catch (e) {
        console.error('Vanta JS failed to load', e);
      }
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [accentColor]);

  // Reset cooldown timer
  useEffect(() => {
    if (resetCooldown <= 0) return;
    const timer = setInterval(() => {
      setResetCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resetCooldown]);

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleRememberSession = () => {
    if (rememberMe) {
      // Store expiry 30 days from now
      const expiryDate = Date.now() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem(REMEMBER_KEY, expiryDate.toString());
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    clearMessages();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setErrorMessage(error.message || 'Unable to sign in. Please try again.');
      } else {
        handleRememberSession();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // Validation
    if (!email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName || undefined },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          setErrorMessage('This email is already registered. Try signing in instead.');
        } else {
          setErrorMessage(error.message || 'Unable to create account. Please try again.');
        }
      } else {
        setSuccessMessage('Check your email for a confirmation link to complete sign-up.');
        handleRememberSession();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setErrorMessage(error.message || 'Unable to send reset email. Please try again.');
      } else {
        setSuccessMessage("If an account exists with this email, you'll receive a reset link shortly.");
        setResetCooldown(60);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearMessages();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        setErrorMessage(error.message || 'Unable to start Google sign-in.');
        setLoading(false);
      } else {
        handleRememberSession();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unexpected error starting Google sign-in.');
      setLoading(false);
    }
  };

  const switchMode = (mode: AuthMode) => {
    clearMessages();
    setAuthMode(mode);
  };

  const renderForm = () => {
    if (authMode === 'forgot-password') {
      return (
        <form onSubmit={handlePasswordReset} className="space-y-5 mb-6">
          <div className="space-y-1.5">
            <label
              htmlFor="reset-email"
              className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-500 block"
            >
              Email Address
            </label>
            <input
              type="email"
              id="reset-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-sm px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 text-sm transition-all disabled:opacity-60"
              placeholder="trade@ryzen.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading || resetCooldown > 0}
            className="w-full px-4 py-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-black rounded-sm transition-all flex items-center justify-center font-medium text-sm tracking-wide shadow-lg hover:shadow-xl disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : resetCooldown > 0 ? (
              `Resend in ${resetCooldown}s`
            ) : (
              'Send Reset Link'
            )}
          </button>

          <button
            type="button"
            onClick={() => switchMode('signin')}
            className="w-full flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft size={12} />
            Back to Sign In
          </button>
        </form>
      );
    }

    if (authMode === 'signup') {
      return (
        <form onSubmit={handleSignUp} className="space-y-4 mb-6">
          <div className="space-y-1.5">
            <label
              htmlFor="full-name"
              className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-500 block"
            >
              Full Name <span className="text-zinc-400">(Optional)</span>
            </label>
            <input
              type="text"
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-sm px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 text-sm transition-all disabled:opacity-60"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="signup-email"
              className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-500 block"
            >
              Email Address
            </label>
            <input
              type="email"
              id="signup-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-sm px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 text-sm transition-all disabled:opacity-60"
              placeholder="trade@ryzen.com"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="signup-password"
              className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-500 block"
            >
              Password
            </label>
            <input
              type="password"
              id="signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-sm px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 text-sm transition-all disabled:opacity-60"
              placeholder="••••••••"
            />
            <p className="text-[10px] text-zinc-400">Minimum 6 characters</p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirm-password"
              className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-500 block"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-sm px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 text-sm transition-all disabled:opacity-60"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember-signup"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-zinc-600 border-zinc-300 dark:border-zinc-700 rounded bg-zinc-100 dark:bg-zinc-800 focus:ring-zinc-500 focus:ring-2"
              disabled={loading}
            />
            <label htmlFor="remember-signup" className="ml-2 text-xs text-zinc-600 dark:text-zinc-400">
              Remember session for 30 days
            </label>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-black rounded-sm transition-all flex items-center justify-center font-medium text-sm tracking-wide shadow-lg hover:shadow-xl disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4 mr-2" />Create Account</>}
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-sm transition-all flex items-center justify-center font-medium text-sm disabled:opacity-60"
            >
              <GoogleLogo />
              Continue with Google
            </button>
          </div>

          <p className="text-center text-xs text-zinc-500 pt-2">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="text-zinc-700 dark:text-zinc-300 hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </form>
      );
    }

    // Default: Sign In
    return (
      <form onSubmit={handleEmailPasswordLogin} className="space-y-5 mb-6">
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-500 block"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-sm px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 text-sm transition-all disabled:opacity-60"
            placeholder="trade@ryzen.com"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label
              htmlFor="password"
              className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-500"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => switchMode('forgot-password')}
              className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 hover:underline"
            >
              Forgot Key?
            </button>
          </div>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-sm px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 text-sm transition-all disabled:opacity-60"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-zinc-600 border-zinc-300 dark:border-zinc-700 rounded bg-zinc-100 dark:bg-zinc-800 focus:ring-zinc-500 focus:ring-2"
            disabled={loading}
          />
          <label htmlFor="remember" className="ml-2 text-xs text-zinc-600 dark:text-zinc-400">
            Remember session for 30 days
          </label>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-black rounded-sm transition-all flex items-center justify-center font-medium text-sm tracking-wide shadow-lg hover:shadow-xl disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><LogIn className="w-4 h-4 mr-2" />Access Dashboard</>}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full px-4 py-3 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-sm transition-all flex items-center justify-center font-medium text-sm disabled:opacity-60"
          >
            <GoogleLogo />
            Continue with Google
          </button>
        </div>

        <p className="text-center text-xs text-zinc-500 pt-2">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className="text-zinc-700 dark:text-zinc-300 hover:underline font-medium"
          >
            Create one
          </button>
        </p>
      </form>
    );
  };

  const getTitle = () => {
    switch (authMode) {
      case 'signup':
        return 'Create Account';
      case 'forgot-password':
        return 'Reset Password';
      default:
        return 'Authentication';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-[#08090A]">
      <div className="max-w-md w-full relative group">
        {/* Card Border Gradient */}
        <div className="absolute -inset-0.5 bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-300 dark:from-zinc-700 dark:via-zinc-800 dark:to-zinc-900 rounded-xl opacity-100 blur-[1px] group-hover:blur-[2px] transition duration-200"></div>

        <div className="relative rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-2xl">
          {/* Header / Vanta Canvas */}
          <div className="h-[180px] relative w-full" ref={vantaRef}>
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent opacity-90"></div>
            <div className="absolute top-6 left-6 z-10">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-full text-[10px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 mb-3 w-fit border border-zinc-200 dark:border-white/10 uppercase shadow-sm">
                <Shield className="w-3 h-3" />
                Secure Portal
              </span>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                Ryzen
              </h2>
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                <Activity className="w-3 h-3 text-zinc-500" />
                <span>System Operational</span>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="p-8 pt-2 flex flex-col relative z-20">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-200">
                  {getTitle()}
                </h3>
              </div>

              {errorMessage && (
                <div className="mb-4 px-3 py-2 rounded border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-900/20 text-[11px] text-rose-600 dark:text-rose-300">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 px-3 py-2 rounded border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-900/20 text-[11px] text-emerald-600 dark:text-emerald-300">
                  {successMessage}
                </div>
              )}

              {renderForm()}
            </div>

            <div className="mt-auto pt-4 text-center border-t border-zinc-100 dark:border-white/5">
              <p className="text-zinc-400 dark:text-zinc-600 text-[10px] uppercase tracking-widest">
                Authorized Personnel Only
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
