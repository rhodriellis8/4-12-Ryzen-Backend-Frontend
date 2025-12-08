import React, { useEffect, useState } from 'react';
import { Shield, Activity, Lock, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface ResetPasswordViewProps {
  onComplete: () => void;
}

const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ onComplete }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is in PASSWORD_RECOVERY state
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      // Supabase sets the session during password recovery flow
      if (data.session) {
        setIsValidSession(true);
      } else {
        setIsValidSession(false);
      }
    };

    // Also listen for auth state changes (Supabase may fire PASSWORD_RECOVERY event)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
      }
    });

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Please fill in both password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        if (error.message.toLowerCase().includes('expired') || error.message.toLowerCase().includes('invalid')) {
          setErrorMessage('This reset link has expired or is invalid. Please request a new one.');
        } else {
          setErrorMessage(error.message || 'Failed to update password. Please try again.');
        }
      } else {
        setSuccess(true);
        // Redirect to main app after a short delay
        setTimeout(() => {
          // Sign out to clear the recovery session and redirect to login
          supabase.auth.signOut().then(() => {
            onComplete();
          });
        }, 2000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    supabase.auth.signOut().then(() => {
      onComplete();
    });
  };

  // Show loading while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-[#08090A]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
          <span className="text-sm text-zinc-500">Verifying reset link...</span>
        </div>
      </div>
    );
  }

  // Show error if no valid session
  if (isValidSession === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-[#08090A]">
        <div className="max-w-md w-full relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-300 dark:from-zinc-700 dark:via-zinc-800 dark:to-zinc-900 rounded-xl opacity-100 blur-[1px]"></div>
          <div className="relative rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Invalid or Expired Link</h2>
            <p className="text-sm text-zinc-500 mb-6">
              This password reset link has expired or is invalid. Please request a new reset link.
            </p>
            <button
              onClick={handleBackToLogin}
              className="flex items-center justify-center gap-2 mx-auto px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show success message
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-[#08090A]">
        <div className="max-w-md w-full relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-300 dark:from-zinc-700 dark:via-zinc-800 dark:to-zinc-900 rounded-xl opacity-100 blur-[1px]"></div>
          <div className="relative rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Password Updated!</h2>
            <p className="text-sm text-zinc-500">
              Your password has been successfully changed. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-[#08090A] transition-colors duration-300">
      <div className="max-w-md w-full relative group">
        {/* Card Border Gradient */}
        <div className="absolute -inset-0.5 bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-300 dark:from-zinc-700 dark:via-zinc-800 dark:to-zinc-900 rounded-xl opacity-100 blur-[1px] group-hover:blur-[2px] transition duration-200"></div>

        <div className="relative rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-2xl">
          {/* Header */}
          <div className="h-[140px] relative w-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent opacity-90"></div>
            <div className="absolute top-6 left-6 z-10">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/80 dark:bg-zinc-800/80 rounded-full text-[10px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 mb-3 w-fit border border-zinc-200 dark:border-white/10 uppercase shadow-sm">
                <Shield className="w-3 h-3" />
                Secure Portal
              </span>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                Ryzen
              </h2>
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                <Activity className="w-3 h-3 text-zinc-500" />
                <span>Password Reset</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 pt-4 flex flex-col relative z-20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-200">
                Set New Password
              </h3>
            </div>

            {errorMessage && (
              <div className="mb-4 px-3 py-2 rounded border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-900/20 text-[11px] text-rose-600 dark:text-rose-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="new-password"
                  className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-500 block"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-sm px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 text-sm transition-all disabled:opacity-60"
                  placeholder="••••••••"
                />
                <p className="text-[10px] text-zinc-400">Minimum 6 characters</p>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="confirm-new-password"
                  className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-500 block"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm-new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-sm px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 text-sm transition-all disabled:opacity-60"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-black rounded-sm transition-all flex items-center justify-center font-medium text-sm tracking-wide shadow-lg hover:shadow-xl disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                <ArrowLeft size={12} />
                Back to Login
              </button>
            </form>

            <div className="mt-6 pt-4 text-center border-t border-zinc-100 dark:border-white/5">
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

export default ResetPasswordView;

