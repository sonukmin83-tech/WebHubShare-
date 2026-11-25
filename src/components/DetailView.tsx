import React from 'react';
import { ArrowLeft, ExternalLink, Globe, Heart, Share2 } from 'lucide-react';
import { useSiteUserInteraction } from '../hooks/useDirectoryData';
import { getDirCopy } from '../lib/i18n';
import { formatCompact, getDeterministicHue, safeUrl, timeAgo } from '../lib/validation';
import type { LanguageCode, WebsiteCategory, WebsiteListing } from '../types/directory';
import { SiteIcon } from './SiteIcon';

interface DetailViewProps {
  site: WebsiteListing | undefined;
  allApproved: WebsiteListing[];
  language: LanguageCode;
  uid: string | undefined;
  isVerifiedUser: boolean;
  authReady: boolean;
  onBack: () => void;
  onSelectSite: (siteId: string) => void;
  onSelectCategory: (cat: WebsiteCategory) => void;
  onToggleLike: (siteId: string, currentlyLiked: boolean) => Promise<void>;
  onRateSite: (siteId: string, score: number, prevScore: number | null) => Promise<void>;
  onRecordVisit: (siteId: string, isVerifiedUser: boolean) => Promise<void>;
  onShareSite: (site: WebsiteListing) => void;
  onRequireAuth: () => void;
  onToast: (msg: string) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({
  site,
  allApproved,
  language,
  uid,
  isVerifiedUser,
  authReady,
  onBack,
  onSelectSite,
  onSelectCategory,
  onToggleLike,
  onRateSite,
  onRecordVisit,
  onShareSite,
  onRequireAuth,
  onToast,
}) => {
  const copy = getDirCopy(language);
  const { liked, myRating } = useSiteUserInteraction(site?.id ?? null, uid, authReady);

  if (!site || site.status !== 'approved') {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center mt-6">
        <Globe className="mx-auto h-11 w-11 text-slate-300" />
        <h2 className="mt-3 text-lg font-bold text-slate-900">{copy.notFoundTitle}</h2>
        <p className="mt-1 text-sm text-slate-500">{copy.notFoundDesc}</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-5 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
        >
          {copy.backHome}
        </button>
      </div>
    );
  }

  const [pal1, pal2] = getDeterministicHue(site.name, site.id);
  const avg = site.ratingCount > 0 ? site.ratingSum / site.ratingCount : 0;
  const targetUrl = safeUrl(site.url);
  const cleanHost = site.url.replace(/^https?:\/\//i, '').replace(/\/$/, '');

  const sameCat = allApproved
    .filter((s) => s.id !== site.id && s.category === site.category)
    .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
    .slice(0, 12);
  const fallback = allApproved
    .filter((s) => s.id !== site.id && s.category !== site.category)
    .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
    .slice(0, 12);
  const similar = sameCat.length > 0 ? sameCat : fallback;

  const handleLikeClick = async () => {
    if (!uid) {
      onRequireAuth();
      return;
    }
    await onToggleLike(site.id, liked);
    onToast(liked ? 'Removed from likes' : `Liked ${site.name}`);
  };

  const handleStarClick = async (score: number) => {
    if (!uid) {
      onRequireAuth();
      return;
    }
    await onRateSite(site.id, score, myRating);
    onToast(`Rated ${score} ★`);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Banner Hero */}
      <div
        className="relative overflow-hidden text-white -mx-4 sm:mx-0 rounded-b-3xl sm:rounded-3xl px-5 pt-4 pb-6 md:px-7 md:pt-5 md:pb-7 shadow-lg"
        style={{ background: `linear-gradient(135deg, ${pal1}, ${pal2})` }}
      >
        <div
          className="pointer-events-none absolute -top-24 -right-12 h-48 w-48 rounded-full bg-white/15"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-8 h-32 w-32 rounded-full bg-white/10"
          aria-hidden="true"
        />

        <div className="relative z-10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label={copy.backHome}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="rounded-lg bg-white/20 px-3 py-1 text-xs font-bold tracking-wide uppercase backdrop-blur-sm">
            {site.category}
          </span>
        </div>

        <div className="relative z-10 mt-5 flex items-center gap-4 md:gap-5">
          <div className="shrink-0 rounded-[24px] p-0.5 bg-white/30 shadow-md">
            <SiteIcon name={site.name} logo={site.logo} size="lg" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight break-words">
              {site.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs md:text-sm text-white/85 font-medium">
              <span>{site.ownerName || 'Community'}</span>
              <span aria-hidden="true">·</span>
              <span>{timeAgo(site.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-5 flex flex-wrap sm:flex-nowrap gap-2.5 max-w-lg">
          <a
            href={targetUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!targetUrl) {
                e.preventDefault();
                onToast('Invalid website link');
                return;
              }
              void onRecordVisit(site.id, isVerifiedUser);
            }}
            className="flex-[1.35] min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-slate-900 shadow-sm hover:bg-slate-100 transition-colors whitespace-nowrap"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            <span>{copy.visit}</span>
          </a>

          <button
            type="button"
            onClick={() => void handleLikeClick()}
            className={`flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors whitespace-nowrap cursor-pointer border ${
              liked
                ? 'bg-white text-rose-600 border-transparent'
                : 'bg-white/20 text-white border-white/25 hover:bg-white/30'
            }`}
          >
            <Heart className={`h-4 w-4 shrink-0 ${liked ? 'fill-rose-600' : ''}`} />
            <span>{liked ? copy.liked : copy.like}</span>
          </button>

          <button
            type="button"
            onClick={() => onShareSite(site)}
            className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-white/20 border border-white/25 px-4 text-sm font-bold text-white hover:bg-white/30 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Share2 className="h-4 w-4 shrink-0" />
            <span>{copy.share}</span>
          </button>
        </div>
      </div>

      {/* Rating & Engagement Summary */}
      <div className="flex items-center gap-5 sm:gap-8 px-1 py-3 max-w-xl">
        <div className="min-w-[92px] text-center">
          <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 tabular-nums">
            {avg > 0 ? avg.toFixed(1) : '—'}
          </div>
          <div className="mt-1 flex items-center justify-center gap-0.5 text-sm">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={avg > 0 && n <= Math.round(avg) ? 'text-amber-500' : 'text-slate-300'}
              >
                ★
              </span>
            ))}
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-500 tabular-nums">
            {formatCompact(site.ratingCount)} {copy.ratings}
          </div>
        </div>

        <div className="h-12 w-px bg-slate-200 shrink-0" />

        <div className="flex flex-1 items-center justify-around sm:justify-start sm:gap-12">
          <div className="text-center">
            <div className="text-xl font-extrabold text-slate-900 tabular-nums">
              {formatCompact(site.likesCount)}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {copy.likes}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-extrabold text-slate-900 tabular-nums">
              {formatCompact(site.visitsCount)}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {copy.visits}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive User Rating Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
        <div>
          <div className="text-sm font-bold text-slate-900">
            {myRating ? `${copy.yourRating}: ${myRating} ★` : copy.rateThis}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {myRating ? copy.tapStarChange : copy.tapStarNew}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const active = myRating ? star <= myRating : star <= Math.round(avg);
            return (
              <button
                key={star}
                type="button"
                onClick={() => void handleStarClick(star)}
                aria-label={`Rate ${star} stars`}
                className={`min-h-[40px] min-w-[36px] text-2xl leading-none transition-transform hover:scale-110 cursor-pointer ${
                  active ? 'text-amber-500' : 'text-slate-300'
                }`}
              >
                ★
              </button>
            );
          })}
        </div>
      </div>

      {/* About Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-bold text-slate-900 mb-2.5">{copy.aboutWebsite}</h2>
        <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
          {site.description}
        </p>
      </section>

      {/* Details Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-bold text-slate-900 mb-2">{copy.details}</h2>
        <dl className="divide-y divide-slate-100 text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="font-medium text-slate-500">{copy.category}</dt>
            <dd className="font-semibold text-slate-900">{site.category}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="font-medium text-slate-500">{copy.website}</dt>
            <dd className="font-semibold text-blue-600 truncate max-w-[230px] sm:max-w-xs">
              <a
                href={targetUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!targetUrl) e.preventDefault();
                  else void onRecordVisit(site.id, isVerifiedUser);
                }}
                className="hover:underline"
              >
                {cleanHost}
              </a>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="font-medium text-slate-500">{copy.listedBy}</dt>
            <dd className="font-semibold text-slate-900">{site.ownerName || 'Community'}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="font-medium text-slate-500">{copy.added}</dt>
            <dd className="font-semibold text-slate-900">{timeAgo(site.createdAt)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="font-medium text-slate-500">{copy.likes}</dt>
            <dd className="font-semibold text-slate-900 tabular-nums">
              {formatCompact(site.likesCount)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="font-medium text-slate-500">{copy.visits}</dt>
            <dd className="font-semibold text-slate-900 tabular-nums">
              {formatCompact(site.visitsCount)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Similar Websites */}
      {similar.length > 0 && (
        <section className="pt-2">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-base font-bold text-slate-900">
              {copy.similarWebsites}{' '}
              <span className="ml-1.5 text-sm font-normal text-slate-500">{site.category}</span>
            </h2>
            <button
              type="button"
              onClick={() => onSelectCategory(site.category)}
              className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              {copy.seeAll}
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
            {similar.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSite(item.id)}
                className="w-[96px] shrink-0 snap-start text-left cursor-pointer group"
              >
                <div className="transition-transform group-hover:-translate-y-0.5">
                  <SiteIcon name={item.name} logo={item.logo} size="lg" />
                </div>
                <div className="mt-2 text-[13px] font-semibold text-slate-900 line-clamp-2 min-h-[34px]">
                  {item.name}
                </div>
                <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 tabular-nums">
                  <span className="text-rose-500 text-[10px]">♥</span>
                  <span>{formatCompact(item.likesCount)}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
