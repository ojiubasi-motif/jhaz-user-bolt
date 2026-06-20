import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { fetchApi } from '../lib/apiClient';

/**
 * Reset Password Page — accepts the ?token= URL parameter and lets the user
 * set a new password.
 *
 * SECURITY (OWASP Forgot Password CS — User Resets Password):
 *  - Requires the user to type the password TWICE (confirm password).
 *  - Enforces the same 8-char minimum / 128-char maximum as registration.
 *  - Does NOT auto-login the user on success — redirects to /login instead.
 *    OWASP: "Don't automatically log the user in, as this introduces additional
 *    complexity to the authentication and session handling code, and increases
 *    the likelihood of introducing vulnerabilities."
 *  - referrer-policy no-referrer is set so the raw token in the URL cannot
 *    leak to third-party scripts via the Referer header.
 */
export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { ref, isVisible } = useInView();

  // SECURITY: Set referrer-policy to no-referrer.
  // The reset token is in the URL; without this, the token could leak to third-party
  // origins via the Referer header when the user follows any external link on this page.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'no-referrer';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  // Redirect if no token is present — the URL was tampered with or is incomplete.
  useEffect(() => {
    if (!token) {
      navigate('/forgot-password', { replace: true });
    }
  }, [token, navigate]);

  // Auto-redirect to login after successful reset
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => navigate('/login'), 4000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
    if (password.length > 128) {
      errors.password = 'Password must not exceed 128 characters.';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setError('');

    try {
      await fetchApi('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password, confirmPassword }),
        skipAuth: true,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Password reset failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth-50 pt-28 pb-16 flex items-center pattern-overlay">
      <div className="section-container max-w-md sm:max-w-lg w-full" ref={ref}>
        <div
          className={`bg-white rounded-2xl border border-earth-200/60 p-8 sm:p-10 shadow-xl transition-all duration-700 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {success ? (
            /* ── Success State ── */
            <div className="text-center animate-fade-up">
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={36} />
                </div>
              </div>
              <h1 className="font-display text-2xl font-bold text-night-950 mb-3">
                Password Changed!
              </h1>
              <p className="body-md text-sm text-earth-600 mb-2">
                Your password has been successfully reset. You have been signed out of all
                active sessions.
              </p>
              <p className="text-xs text-earth-400 mb-6">
                Redirecting you to sign in…
              </p>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-terra-600 hover:text-terra-800 transition-colors"
              >
                Sign In Now <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            /* ── Reset Form ── */
            <>
              <div className="text-center mb-8">
                <span className="text-terra-600 font-body text-xs font-semibold tracking-widest uppercase">
                  New Password
                </span>
                <h1 className="font-display text-3xl font-bold text-night-950 mt-1">
                  Reset Your Password
                </h1>
                <p className="body-md text-xs mt-2">
                  Choose a strong password with at least 8 characters
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-terra-50 border border-terra-100 text-terra-800 rounded-xl text-sm mb-6 animate-fade-up">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                  <label
                    className="block text-xs font-semibold text-night-900 mb-1.5"
                    htmlFor="new-password"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400"
                    />
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pl-11 pr-11 py-3 bg-white border rounded-xl text-base font-body text-night-950 placeholder-earth-300 focus:outline-none transition-all ${
                        formErrors.password
                          ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-earth-200 focus:border-terra-500 focus:ring-1 focus:ring-terra-500'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-xs text-red-500 font-medium mt-1">{formErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    className="block text-xs font-semibold text-night-900 mb-1.5"
                    htmlFor="confirm-password"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400"
                    />
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-11 pr-11 py-3 bg-white border rounded-xl text-base font-body text-night-950 placeholder-earth-300 focus:outline-none transition-all ${
                        formErrors.confirmPassword
                          ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-earth-200 focus:border-terra-500 focus:ring-1 focus:ring-terra-500'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600 transition-colors"
                      aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Live match indicator */}
                {confirmPassword && (
                  <p
                    className={`text-xs font-medium ${
                      password === confirmPassword ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}

                <button
                  id="reset-password-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 group transition-all text-xs"
                >
                  {isLoading ? 'Resetting Password…' : 'Set New Password'}
                  {!isLoading && (
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
