import { useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { X, Shield } from 'lucide-react';

export default function LastLoginBanner() {
  const { user } = useAppSelector((state) => state.auth);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !user || !user.lastLoginAt) {
    return null;
  }

  const formattedDate = new Date(user.lastLoginAt).toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });

  return (
    <div className="bg-earth-100/95 backdrop-blur-sm text-earth-800 py-1.5 px-4 sm:px-6 md:px-8 border-b border-earth-200/50 text-[11px] sm:text-xs font-body animate-fade-in relative z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-terra-600 shrink-0 animate-pulse" />
          <span className="leading-none">
            Security Notice: Last login was on <strong className="text-night-950 font-semibold">{formattedDate}</strong> from IP <strong className="text-night-950 font-semibold">{user.lastLoginIp || 'unknown'}</strong>.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-earth-500 hover:text-terra-600 p-1 hover:bg-earth-200/60 rounded transition-all duration-200 cursor-pointer flex items-center justify-center"
          aria-label="Dismiss security notice"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

