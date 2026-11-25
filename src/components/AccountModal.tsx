import React, { useEffect } from 'react';
import { Globe, List, LogOut, Shield, X } from 'lucide-react';
import type { User } from 'firebase/auth';
import { getDirCopy } from '../lib/i18n';
import type { LanguageCode } from '../types/directory';
import { PWAInstallButton } from './PWAInstallButton';

interface AccountModalProps {
  open: boolean;
  user: User | null;
  isAdmin: boolean;
  language: LanguageCode;
  authError: string | null;
  onClose: () => void;
  onSignIn: () => Promise<void>;
  onLogout: () => Promise<void>;
  onSetLanguage: (lang: LanguageCode) => Promise<void>;
  onGoMine: () => void;
  onGoAdmin: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  open,
  user,
  isAdmin,
  language,
  authError,
  onClose,
  onSignIn,
  onLogout,
  onSetLanguage,
  onGoMine,
  onGoAdmin,
}) => {
  const copy = getDirCopy(language);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const initial = (user?.displayName || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 md:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-t-3xl md:rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200 md:hidden" />

        {!user ? (
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{copy.loginRequiredTitle}</h2>
                <p className="mt-1 text-sm text-slate-500">{copy.loginRequiredDesc}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                aria-label={copy.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {authError && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                {authError}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                void onSignIn().then(() => onClose());
              }}
              className="mt-5 w-full min-h-[48px] rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {copy.signInGoogle}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white">
                  {initial}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-900 truncate">
                    {user.displayName || 'Community Member'}
                  </h2>
                  <p className="text-xs text-slate-500 truncate">
                    {user.email}
                    {isAdmin ? ' · Admin' : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                aria-label={copy.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoMine();
                }}
                className="flex w-full min-h-[48px] items-center gap-3 py-2 text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <List className="h-4 w-4 text-slate-500" />
                <span>{copy.myWebsitesMenu}</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoAdmin();
                  }}
                  className="flex w-full min-h-[48px] items-center gap-3 py-2 text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>{copy.adminPanelMenu}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  void onLogout().then(() => onClose());
                }}
                className="flex w-full min-h-[48px] items-center gap-3 py-2 text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>{copy.signOut}</span>
              </button>
            </div>
          </div>
        )}

        {/* Install App & Language Toggle */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Globe className="h-4 w-4 text-slate-400" />
              <span>{copy.languageLabel}</span>
            </div>
            <div className="inline-flex rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => void onSetLanguage('en')}
                className={`rounded-md px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                  language === 'en' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => void onSetLanguage('hi')}
                className={`rounded-md px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                  language === 'hi' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <PWAInstallButton installLabel={copy.installApp} iosLabel={copy.installOnIOS} />
          </div>
        </div>
      </div>
    </div>
  );
};
