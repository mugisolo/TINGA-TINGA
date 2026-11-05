import React from 'react';
import { LogOut, User as UserIcon, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface GoogleAuthButtonProps {
  className?: string;
  compact?: boolean;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ className = '', compact = false }) => {
  const { user, loading, signInWithGoogle, signOut, error } = useAuth();

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 text-xs text-stone-400 ${className}`}>
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
        {!compact && <span>Verifying Google Auth...</span>}
      </div>
    );
  }

  if (user) {
    return (
      <div className={`flex items-center space-x-2.5 bg-stone-900/90 border border-stone-700/70 rounded-lg px-2.5 py-1.5 ${className}`}>
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'Google User'}
            className="w-6 h-6 rounded-full border border-amber-500/40 object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <UserIcon className="w-3.5 h-3.5" />
          </div>
        )}

        <div className="flex flex-col text-left">
          <div className="flex items-center space-x-1">
            <span className="text-xs font-semibold text-stone-200 truncate max-w-[110px]">
              {user.displayName || user.email?.split('@')[0]}
            </span>
            <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" title="Signed In" />
          </div>
          {!compact && (
            <span className="text-[10px] text-amber-400/90 font-mono">
              Authenticated
            </span>
          )}
        </div>

        <button
          onClick={() => signOut()}
          className="p-1 rounded text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition-colors"
          title="Sign out of Google"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-start ${className}`}>
      <button
        onClick={() => signInWithGoogle()}
        className="gsi-material-button group inline-flex items-center justify-center space-x-2 px-3.5 py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold shadow-sm border border-stone-200 transition-all duration-150 active:scale-95"
      >
        <div className="gsi-material-button-icon flex-shrink-0">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 block">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            <path fill="none" d="M0 0h48v48H0z" />
          </svg>
        </div>
        <span className="gsi-material-button-contents font-medium tracking-tight">
          {compact ? 'Sign In' : 'Sign in with Google'}
        </span>
      </button>
      {error && <span className="text-[10px] text-rose-400 mt-1 max-w-[200px] truncate">{error}</span>}
    </div>
  );
};
