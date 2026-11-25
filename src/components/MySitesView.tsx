import React from 'react';
import { List, Plus, Trash2, User } from 'lucide-react';
import { getDirCopy } from '../lib/i18n';
import { formatCompact, safeUrl, timeAgo } from '../lib/validation';
import type { LanguageCode, WebsiteListing } from '../types/directory';
import { SiteIcon } from './SiteIcon';

interface MySitesViewProps {
  uid: string | undefined;
  mySites: WebsiteListing[];
  language: LanguageCode;
  onSignIn: () => Promise<void>;
  onSelectSite: (siteId: string) => void;
  onGoSubmit: () => void;
  onDeleteSite: (siteId: string) => Promise<void>;
  onToast: (msg: string) => void;
}

const STATUS_STYLE: Record<WebsiteListing['status'], string> = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const MySitesView: React.FC<MySitesViewProps> = ({
  uid,
  mySites,
  language,
  onSignIn,
  onSelectSite,
  onGoSubmit,
  onDeleteSite,
  onToast,
}) => {
  const copy = getDirCopy(language);

  if (!uid) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center mt-4">
        <User className="mx-auto h-11 w-11 text-slate-300" />
        <h2 className="mt-3 text-lg font-bold text-slate-900">{copy.loginRequiredTitle}</h2>
        <p className="mt-1.5 text-sm text-slate-500">{copy.loginRequiredDesc}</p>
        <button
          type="button"
          onClick={() => void onSignIn()}
          className="mt-5 inline-flex min-h-[46px] items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {copy.signInGoogle}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{copy.myWebsitesTitle}</h1>
        <p className="mt-0.5 text-sm text-slate-500 tabular-nums">
          {mySites.length} {copy.submittedCount}
        </p>
      </div>

      {mySites.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
          <List className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-3 text-base font-bold text-slate-900">{copy.noMineTitle}</h3>
          <p className="mt-1 text-sm text-slate-500">{copy.noMineDesc}</p>
          <button
            type="button"
            onClick={onGoSubmit}
            className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{copy.listWebsiteBtn}</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {mySites.map((site) => {
            const targetUrl = safeUrl(site.url);
            return (
              <div
                key={site.id}
                className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-slate-50/70 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (site.status === 'approved') onSelectSite(site.id);
                  }}
                  className={`flex flex-1 items-center gap-3.5 min-w-0 text-left ${
                    site.status === 'approved' ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <SiteIcon name={site.name} logo={site.logo} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 truncate">{site.name}</span>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          STATUS_STYLE[site.status]
                        }`}
                      >
                        {site.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 truncate tabular-nums">
                      {site.category} · {formatCompact(site.likesCount)} {copy.likes} ·{' '}
                      {timeAgo(site.createdAt)}
                    </p>
                  </div>
                </button>

                <div className="shrink-0">
                  {site.status === 'approved' ? (
                    <a
                      href={targetUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (!targetUrl) e.preventDefault();
                      }}
                      className="inline-flex min-h-[38px] items-center rounded-lg bg-slate-100 px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      {copy.visit}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        void onDeleteSite(site.id).then(() => onToast('Removed website'));
                      }}
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-rose-50 px-3 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{copy.remove}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
