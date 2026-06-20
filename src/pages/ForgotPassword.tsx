import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { fetchApi } from '../lib/apiClient';

/**
 * Forgot Password — Request Page
 *
 * SECURITY (OWASP Forgot Password CS):
 *  - Displays a CONSISTENT success message regardless of whether the email exists,
 *    preventing user enumeration from the frontend UX.
 *  - Does NOT indicate whether the email was found or not.
 *  - Uses referrer-policy="no-referrer" via a meta tag to prevent the reset token
 *    from leaking to third-party domains through the Referer header.
 *    (OWASP URL Tokens: "Ensure that the reset password page adds the Referrer Policy
 *    tag with the noreferrer value in order to avoid referrer leakage.")
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const { ref, isVisible } = useInView();

  // SECURITY: Set referrer-policy to no-referrer for this page.
  // Prevents the reset token (in the URL on the next page) from leaking
  // to third-party scripts via the Referer header if the user navigates away.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'no-referrer';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
        skipAuth: true,
      });
    } catch {
      // SECURITY: Swallow all errors — show the same success message regardless.
      // This prevents attackers from using error responses to enumerate accounts.
    } finally {
      setIsLoading(false);
      // SECURITY: Always show success state, even if the email does not exist.
      setSubmitted(true);
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
          {submitted ? (
            /* ── Success State ── */
            <div className="text-center animate-fade-up">
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 bg-terra-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-terra-600" size={36} />
                </div>
              </div>
              <h1 className="font-display text-2xl font-bold text-night-950 mb-3">
                Check Your Email
              </h1>
              {/* SECURITY: Consistent message — does NOT confirm email existence */}
              <p className="body-md text-sm text-earth-600 mb-6">
                If that email address is registered with us, you will receive a
                password reset link shortly. The link expires in{' '}
                <strong>15 minutes</strong>.
              </p>
              <p className="text-xs text-earth-400 mb-6">
                Didn&apos;t receive an email? Check your spam folder, or{' '}
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-terra-600 font-semibold hover:text-terra-800 transition-colors"
                >
                  try again
                </button>
                .
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-semibold text-terra-600 hover:text-terra-800 transition-colors"
              >
                Back to Sign In <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            /* ── Request Form ── */
            <>
              <div className="text-center mb-8">
                <span className="text-terra-600 font-body text-xs font-semibold tracking-widest uppercase">
                  Account Recovery
                </span>
                <h1 className="font-display text-3xl font-bold text-night-950 mt-1">
                  Forgot Password?
                </h1>
                <p className="body-md text-xs mt-2">
                  Enter your email and we&apos;ll send you a reset link
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-terra-50 border border-terra-100 text-terra-800 rounded-xl text-sm mb-6 animate-fade-up">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    className="block text-xs font-semibold text-night-900 mb-1.5"
                    htmlFor="forgot-email"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400"
                    />
                    <input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-earth-200 rounded-xl text-base font-body text-night-950 placeholder-earth-300 focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  id="forgot-password-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 group transition-all text-xs"
                >
                  {isLoading ? 'Sending Reset Link…' : 'Send Reset Link'}
                  {!isLoading && (
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  )}
                </button>
              </form>

              <div className="text-center mt-6 pt-6 border-t border-earth-100">
                <p className="text-xs text-earth-500">
                  Remembered your password?{' '}
                  <Link
                    to="/login"
                    className="text-terra-600 font-semibold hover:text-terra-800 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
