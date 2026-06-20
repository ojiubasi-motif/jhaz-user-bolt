import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, clearError } from '../store/slices/authSlice';
import { useInView } from '../hooks/useInView';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const dispatch = useAppDispatch();
  const { isLoading, error, user } = useAppSelector((state) => state.auth);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  
  const { ref, isVisible } = useInView();

  // Clear errors on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      navigate(redirect);
    }
  }, [user, navigate, redirect]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Invalid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    dispatch(clearError());
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      navigate(redirect);
    }
  };

  return (
    <div className="min-h-screen bg-earth-50 pt-28 pb-16 flex items-center pattern-overlay">
      <div className="section-container max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full" ref={ref}>
        <div className={`bg-white rounded-2xl border border-earth-200/60 p-8 sm:p-10 shadow-xl transition-all duration-700 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-terra-600 font-body text-xs font-semibold tracking-widest uppercase">
              Welcome Back
            </span>
            <h1 className="font-display text-3xl font-bold text-night-950 mt-1">Sign In</h1>
            <p className="body-md text-xs mt-2">
              Access your personalized African fashion portal
            </p>
          </div>

          {/* API Error alert */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-terra-50 border border-terra-100 text-terra-800 rounded-xl text-sm mb-6 animate-fade-up">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-night-900 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-base font-body text-night-950 placeholder-earth-300 focus:outline-none transition-all ${
                    formErrors.email
                      ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-earth-200 focus:border-terra-500 focus:ring-1 focus:ring-terra-500'
                  }`}
                />
              </div>
              {formErrors.email && (
                <p className="text-xs text-red-500 font-medium mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-night-900" htmlFor="password">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-terra-600 font-semibold hover:text-terra-800 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-base font-body text-night-950 placeholder-earth-300 focus:outline-none transition-all ${
                    formErrors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-earth-200 focus:border-terra-500 focus:ring-1 focus:ring-terra-500'
                  }`}
                />
              </div>
              {formErrors.password && (
                <p className="text-xs text-red-500 font-medium mt-1">{formErrors.password}</p>
              )}
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 group transition-all text-xs"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
              {!isLoading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Footer links */}
          <div className="text-center mt-6 pt-6 border-t border-earth-100">
            <p className="text-xs text-earth-500">
              Don't have an account?{' '}
              <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-terra-600 font-semibold hover:text-terra-800 transition-colors">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
