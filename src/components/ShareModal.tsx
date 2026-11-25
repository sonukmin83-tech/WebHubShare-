import React, { useEffect, useState } from 'react';
import { Check, Link2, X } from 'lucide-react';
import { getDirCopy } from '../lib/i18n';
import type { LanguageCode, WebsiteListing } from '../types/directory';

interface ShareModalProps {
  site: WebsiteListing | null;
  language: LanguageCode;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ site, language, onClose, onToast }) => {
  const copy = getDirCopy(language);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
    if (!site) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [site, onClose]);

  if (!site) return null;

  const shareUrl = `${window.location.origin}/?site=${encodeURIComponent(site.id)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      onToast(copy.copied);
    } catch {
      onToast(shareUrl);
    }
  };

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

        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {copy.shareTitle} “{site.name}”
            </h2>
            <p className="mt-1 text-sm text-slate-500">{copy.shareSub}</p>
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

        <div
          className={`mt-4 rounded-xl border px-3.5 py-3 text-xs font-mono break-all leading-relaxed transition-colors ${
            copied
              ? 'border-blue-200 bg-blue-50 text-blue-700'
              : 'border-dashed border-slate-300 bg-slate-50 text-slate-700'
          }`}
        >
          {shareUrl}
        </div>

        <div className="mt-4 space-y-2.5">
          <button
            type="button"
            onClick={() => void handleCopy()}
            className={`w-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition-colors cursor-pointer ${
              copied ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            <span>{copied ? copy.copied : copy.copyLink}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {copy.close}
          </button>
        </div>
      </div>
    </div>
  );
};
