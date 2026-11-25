import React from 'react';
import { Check, Clock, Globe, Shield, Sparkles, Trash2, User, Users, X } from 'lucide-react';
import { getDirCopy } from '../lib/i18n';
import { ADMIN_EMAIL, formatCompact, getTimestampMillis, safeUrl } from '../lib/validation';
import type { LanguageCode, UserAccount, WebsiteListing } from '../types/directory';
import { SiteIcon } from './SiteIcon';

interface AdminViewProps {
  uid: string | undefined;
  isAdmin: boolean;
  allSites: WebsiteListing[];
  registeredUsers: UserAccount[];
  language: LanguageCode;
  onSignIn: () => Promise<void>;
  onSelectSite: (siteId: string) => void;
  onApproveSite: (siteId: string) => Promise<void>;
  onRejectSite: (siteId: string) => Promise<void>;
  onApproveAll: () => Promise<number | undefined>;
  onDeleteSite: (siteId: string) => Promise<void>;
  onSeedStarterSites: () => Promise<number | undefined>;
  onToast: (msg: string) => void;
}

const STATUS_STYLE: Record<WebsiteListing['status'], string> = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const AdminView: React.FC<AdminViewProps> = ({
  uid,
  isAdmin,
  allSites,
  registeredUsers,
  language,
  onSignIn,
  onSelectSite,
  onApproveSite,
  onRejectSite,
  onApproveAll,
  onDeleteSite,
  onSeedStarterSites,
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

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center mt-4">
        <Shield className="mx-auto h-11 w-11 text-slate-300" />
        <h2 className="mt-3 text-lg font-bold text-slate-900">Admins only</h2>
        <p className="mt-1 text-sm text-slate-500">
          This moderation panel is restricted to the site owner ({ADMIN_EMAIL}).
        </p>
      </div>
    );
  }

  const pending = [...allSites]
    .filter((s) => s.status === 'pending')
    .sort((a, b) => getTimestampMillis(a.createdAt) - getTimestampMillis(b.createdAt));
  const liveCount = allSites.filter((s) => s.status === 'approved').length;
  const totalLikes = allSites.reduce((sum, s) => sum + (s.likesCount || 0), 0);

  return (
    <div className="space-y-7 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{copy.adminTitle}</h1>
          <p className="mt-0.5 text-sm text-slate-500">{copy.adminSub}</p>
        </div>
        {allSites.length === 0 && (
          <button
            type="button"
            onClick={() => {
              void onSeedStarterSites().then((n) => onToast(`Loaded ${n || 18} starter sites`));
            }}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>{copy.loadStarterBtn}</span>
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-2xl bg-slate-100 p-4">
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">{allSites.length}</div>
          <div className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {copy.statTotal}
          </div>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-4">
          <div className="text-2xl font-extrabold text-emerald-800 tabular-nums">{liveCount}</div>
          <div className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            {copy.statLive}
          </div>
        </div>
        <div className="rounded-2xl bg-amber-50 p-4">
          <div className="text-2xl font-extrabold text-amber-800 tabular-nums">{pending.length}</div>
          <div className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-700">
            {copy.statPending}
          </div>
        </div>
        <div className="rounded-2xl bg-slate-100 p-4">
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {registeredUsers.length}
          </div>
          <div className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {copy.statUsers}
          </div>
        </div>
        <div className="rounded-2xl bg-rose-50 p-4 col-span-2 sm:col-span-1">
          <div className="text-2xl font-extrabold text-rose-700 tabular-nums">
            {formatCompact(totalLikes)}
          </div>
          <div className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-rose-600">
            {copy.statLikes}
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Clock className="h-5 w-5 text-amber-600" />
            <span>{copy.pendingRequests}</span>
            <span className="text-sm font-semibold text-slate-500 tabular-nums">
              {pending.length}
            </span>
          </h2>
          {pending.length > 1 && (
            <button
              type="button"
              onClick={() => {
                void onApproveAll().then((count) => onToast(`Approved ${count || 0} websites`));
              }}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-emerald-100 px-3 text-xs font-bold text-emerald-800 hover:bg-emerald-200 transition-colors cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>
                {copy.approveAll} ({pending.length})
              </span>
            </button>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm font-medium text-emerald-900">
            <Check className="h-4 w-4 text-emerald-700 shrink-0" />
            <span>{copy.noPending}</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {pending.map((site) => {
              const targetUrl = safeUrl(site.url);
              return (
                <div
                  key={site.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <SiteIcon name={site.name} logo={site.logo} size="md" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{site.name}</h3>
                      <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">{site.description}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                        <span>by {site.ownerName}</span>
                        <span>·</span>
                        <span className="font-medium text-slate-700">{site.category}</span>
                        <span>·</span>
                        <a
                          href={targetUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate max-w-[220px]"
                        >
                          {site.url}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        void onApproveSite(site.id).then(() => onToast(`Approved ${site.name}`));
                      }}
                      className="inline-flex min-h-[38px] items-center gap-1 rounded-lg bg-emerald-100 px-3.5 text-xs font-bold text-emerald-800 hover:bg-emerald-200 transition-colors cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{copy.approve}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void onRejectSite(site.id).then(() => onToast(`Rejected ${site.name}`));
                      }}
                      className="inline-flex min-h-[38px] items-center gap-1 rounded-lg bg-rose-50 px-3.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>{copy.reject}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Registered Users */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Users className="h-5 w-5 text-blue-600" />
          <span>{copy.registeredUsers}</span>
          <span className="text-sm font-semibold text-slate-500 tabular-nums">
            {registeredUsers.length}
          </span>
        </h2>

        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white px-4">
          {registeredUsers.length === 0 ? (
            <div className="py-5 text-sm text-slate-500">No registered users yet.</div>
          ) : (
            registeredUsers.map((u) => {
              const userSites = allSites.filter((s) => s.ownerId === u.uid);
              const userLive = userSites.filter((s) => s.status === 'approved').length;
              return (
                <div key={u.uid} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-extrabold text-blue-700">
                      {(u.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {u.name}
                        </span>
                        {u.email.toLowerCase() === ADMIN_EMAIL && (
                          <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{u.email}</div>
                    </div>
                  </div>
                  <div className="shrink-0 text-xs font-semibold text-slate-500 tabular-nums">
                    {userSites.length} listed{userLive > 0 ? ` · ${userLive} live` : ''}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* All Websites */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Globe className="h-5 w-5 text-slate-700" />
          <span>{copy.allWebsitesAdmin}</span>
          <span className="text-sm font-semibold text-slate-500 tabular-nums">
            {allSites.length}
          </span>
        </h2>

        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {allSites.map((site) => (
            <div
              key={site.id}
              className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50/70 transition-colors"
            >
              <button
                type="button"
                onClick={() => {
                  if (site.status === 'approved') onSelectSite(site.id);
                }}
                className={`flex flex-1 items-center gap-3 min-w-0 text-left ${
                  site.status === 'approved' ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <SiteIcon name={site.name} logo={site.logo} size="sm" />
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
                    {formatCompact(site.visitsCount)} {copy.visits}
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-1.5 shrink-0">
                {site.status !== 'approved' ? (
                  <button
                    type="button"
                    onClick={() => {
                      void onApproveSite(site.id).then(() => onToast(`Approved ${site.name}`));
                    }}
                    className="min-h-[36px] rounded-lg bg-emerald-100 px-3 text-xs font-bold text-emerald-800 hover:bg-emerald-200 transition-colors cursor-pointer"
                  >
                    {copy.approve}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      void onRejectSite(site.id).then(() => onToast(`Hidden ${site.name}`));
                    }}
                    className="min-h-[36px] rounded-lg bg-slate-100 px-3 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    {copy.hide}
                  </button>
                )}
                <button
                  type="button"
                  aria-label={`Delete ${site.name}`}
                  onClick={() => {
                    void onDeleteSite(site.id).then(() => onToast(`Deleted ${site.name}`));
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
