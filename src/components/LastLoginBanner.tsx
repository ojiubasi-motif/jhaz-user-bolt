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
    <div className="bg-night-950 text-white py-3 px-4 sm:px-6 md:px-8 border-b border-earth-800/20 text-xs sm:text-sm font-body animate-fade-up relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-terra-500 shrink-0" />
          <span>
            Security Notice: Last login was on <strong className="text-terra-200">{formattedDate}</strong> from IP <strong className="text-terra-200">{user.lastLoginIp || 'unknown'}</strong>.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-earth-300 hover:text-white p-1 hover:bg-earth-800/40 rounded transition-colors"
          aria-label="Dismiss security notice"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
