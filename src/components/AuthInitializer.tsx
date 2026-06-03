import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadProfile, clearAuth } from '../store/slices/authSlice';
import { tokenStore } from '../lib/tokenStore';

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { expiresAt } = useAppSelector((state) => state.auth);
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

  return <>{children}</>;
}
