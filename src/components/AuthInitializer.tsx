import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadProfile, clearAuth } from '../store/slices/authSlice';
import { tokenStore } from '../lib/tokenStore';

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { expiresAt, initialized } = useAppSelector((state) => state.auth);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Schedule a proactive refresh 60 seconds before token expiry.
   * This ensures the user never experiences a mid-session 401.
   */
  const scheduleRefresh = () => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    if (!expiresAt) return;

    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;
    const refreshAtTime = timeUntilExpiry - 60 * 1000; // Refresh 60s before expiry

    if (refreshAtTime <= 0) {
      // Token expires very soon; refresh immediately
      tokenStore.setToken(null);
      return;
    }

    refreshTimerRef.current = setTimeout(() => {
      console.log('Proactively refreshing token...');
      // Force the token to expire so ensureToken() triggers a refresh
      tokenStore.setToken(null);
      // Re-fetch user profile — this will silently refresh the access token
      dispatch(loadProfile());
    }, refreshAtTime);
  };

  /**
   * On app mount:
   * 1. Try a silent restore using the refresh token from the cookie.
   * 2. If successful, schedule proactive refresh.
   * 3. Listen for auth-expired events (token rejected by API).
   */
  useEffect(() => {
    console.log('AuthInitializer mounted — attempting silent restore');

    // Attempt silent restore
    dispatch(loadProfile());

    /**
     * auth-expired: dispatched by apiClient when receiving 401.
     * Clear auth state.
     */
    const handleAuthExpired = () => {
      console.log('Auth expired event received — clearing session');
      dispatch(clearAuth());
    };

    window.addEventListener('auth-expired', handleAuthExpired);

    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [dispatch]);

  /**
   * Schedule refresh whenever the token expiry time changes.
   */
  useEffect(() => {
    scheduleRefresh();
  }, [expiresAt]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-earth-50 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Soft decorative background gradients */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-terra-100/30 blur-3xl -top-48 -left-48" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-kente-100/20 blur-3xl -bottom-48 -right-48" />

        <div className="relative flex flex-col items-center space-y-6 max-w-sm text-center animate-fade-in">
          {/* Circular Loader with brand accents */}
          <div className="relative w-20 h-20">
            {/* Outer static ring */}
            <div className="absolute inset-0 rounded-full border-4 border-earth-200/60" />
            {/* Spinning active ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-terra-600 border-r-kente-500 animate-spin" />
            {/* Inner aesthetic accents */}
            <div className="absolute inset-2 rounded-full border border-dashed border-earth-300 animate-[spin_10s_linear_infinite]" />
          </div>

          {/* Brand & Loading Info */}
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-extrabold tracking-wider text-night-950 uppercase">
              Jhaz Imprints
            </h2>
            <div className="h-[1px] w-12 bg-gradient-to-r from-terra-600 to-kente-500 mx-auto" />
            <p className="text-sm text-earth-500 font-medium animate-pulse tracking-wide mt-2">
              Verifying secure session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
