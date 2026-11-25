import React from 'react';
import { Flame, Plus, Search, Star } from 'lucide-react';
import { getDirCopy } from '../lib/i18n';
import { CATEGORIES, formatCompact, getTimestampMillis } from '../lib/validation';
import type { LanguageCode, WebsiteCategory, WebsiteListing } from '../types/directory';
import { SiteIcon } from './SiteIcon';

interface HomeViewProps {
  approvedSites: WebsiteListing[];
  loading: boolean;
  language: LanguageCode;
  searchQuery: string;
  selectedCategory: 'All' | WebsiteCategory;
  onSelectCategory: (cat: 'All' | WebsiteCategory) => void;
  onSelectSite: (siteId: string) => void;
}

const SiteTile: React.FC<{
  site: WebsiteListing;
  onSelect: (id: string) => void;
  fluid?: boolean;
}> = ({ site, onSelect, fluid = false }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(site.id)}
      className={`group text-left cursor-pointer focus:outline-none ${
        fluid ? 'w-full' : 'w-[96px] md:w-[112px] shrink-0 snap-start'
      }`}
    >
      <div className="transition-transform duration-150 group-hover:-translate-y-0.5">
        <SiteIcon name={site.name} logo={site.logo} size={fluid ? 'full' : 'lg'} />
      </div>
      <div className="mt-2.5 text-[13px] font-semibold leading-[1.3] text-slate-900 line-clamp-2 min-h-[34px]">
        {site.name}
      </div>
      <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11.5px] font-semibold text-slate-600 tabular-nums">
        <span className="text-rose-500 text-[10px]" aria-hidden="true">♥</span>
        <span>{formatCompact(site.likesCount)}</span>
      </div>
    </button>
  );
};

export const HomeView: React.FC<HomeViewProps> = ({
  approvedSites,
  loading,
  language,
  searchQuery,
  selectedCategory,
  onSelectCategory,
  onSelectSite,
}) => {
  const copy = getDirCopy(language);
  const q = searchQuery.trim().toLowerCase();

  let filtered = approvedSites;
  if (selectedCategory !== 'All') {
    filtered = filtered.filter((s) => s.category === selectedCategory);
  }
  if (q) {
    filtered = filtered.filter((s) =>
      `${s.name} ${s.description} ${s.category} ${s.ownerName}`.toLowerCase().includes(q)
    );
  }

  const byLikes = [...approvedSites].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
  const newest = [...approvedSites].sort(
    (a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt)
  );
  const byRating = [...approvedSites].sort((a, b) => {
    const avgA = a.ratingCount > 0 ? a.ratingSum / a.ratingCount : 0;
    const avgB = b.ratingCount > 0 ? b.ratingSum / b.ratingCount : 0;
    return avgB - avgA || (b.likesCount || 0) - (a.likesCount || 0);
  });

  return (
    <div className="space-y-6">
      {/* Category filter bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`shrink-0 min-h-[38px] rounded-xl px-3.5 py-1.5 text-[13.5px] font-semibold transition-colors cursor-pointer border ${
                active
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200/80'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 gap-x-3.5 gap-y-6 py-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="aspect-square w-full rounded-[24%] bg-slate-200" />
              <div className="h-3.5 w-4/5 rounded bg-slate-200" />
              <div className="h-3 w-1/2 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : q ? (
        <section className="space-y-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {filtered.length > 0 ? `${copy.resultsFor} “${searchQuery.trim()}”` : copy.noResults}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5 tabular-nums">
              {filtered.length} {filtered.length === 1 ? copy.websiteFound : copy.websitesFound}
            </p>
          </div>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 gap-x-3.5 gap-y-6">
              {filtered.map((site) => (
                <SiteTile key={site.id} site={site} onSelect={onSelectSite} fluid />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
              <Search className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-3 text-base font-bold text-slate-900">{copy.nothingFound}</h3>
              <p className="mt-1 text-sm text-slate-500">{copy.tryDifferent}</p>
            </div>
          )}
        </section>
      ) : selectedCategory !== 'All' ? (
        <section className="space-y-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{selectedCategory}</h1>
            <p className="text-sm text-slate-500 mt-0.5 tabular-nums">
              {filtered.length} {filtered.length === 1 ? copy.websiteFound : copy.websitesFound} · {copy.inThisCategory}
            </p>
          </div>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 gap-x-3.5 gap-y-6">
              {filtered.map((site) => (
                <SiteTile key={site.id} site={site} onSelect={onSelectSite} fluid />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
              <Search className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-3 text-base font-bold text-slate-900">{copy.nothingFound}</h3>
              <p className="mt-1 text-sm text-slate-500">{copy.tryDifferent}</p>
            </div>
          )}
        </section>
      ) : approvedSites.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
          <h3 className="text-base font-bold text-slate-900">{copy.allWebsitesTitle}</h3>
          <p className="mt-1.5 text-sm text-slate-500">{copy.emptyDirectory}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Trending now */}
          <section>
            <div className="flex items-baseline justify-between gap-3 mb-3.5">
              <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
                <Flame className="h-5 w-5 text-orange-500 shrink-0" />
                <span>{copy.trendingTitle}</span>
                <span className="text-sm font-normal text-slate-500">{copy.trendingSub}</span>
              </h2>
            </div>
            <div className="flex gap-4 md:gap-5 overflow-x-auto pb-2 snap-x">
              {byLikes.slice(0, 12).map((site) => (
                <SiteTile key={site.id} site={site} onSelect={onSelectSite} />
              ))}
            </div>
          </section>

          {/* Just added */}
          <section>
            <div className="flex items-baseline justify-between gap-3 mb-3.5">
              <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
                <Plus className="h-5 w-5 text-blue-600 shrink-0" />
                <span>{copy.newestTitle}</span>
                <span className="text-sm font-normal text-slate-500">{copy.newestSub}</span>
              </h2>
            </div>
            <div className="flex gap-4 md:gap-5 overflow-x-auto pb-2 snap-x">
              {newest.slice(0, 12).map((site) => (
                <SiteTile key={site.id} site={site} onSelect={onSelectSite} />
              ))}
            </div>
          </section>

          {/* Top rated */}
          <section>
            <div className="flex items-baseline justify-between gap-3 mb-3.5">
              <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500 shrink-0" />
                <span>{copy.topRatedTitle}</span>
                <span className="text-sm font-normal text-slate-500">{copy.topRatedSub}</span>
              </h2>
            </div>
            <div className="flex gap-4 md:gap-5 overflow-x-auto pb-2 snap-x">
              {byRating.slice(0, 12).map((site) => (
                <SiteTile key={site.id} site={site} onSelect={onSelectSite} />
              ))}
            </div>
          </section>

          {/* All websites grid */}
          <section>
            <div className="flex items-baseline justify-between gap-3 mb-4">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                {copy.allWebsitesTitle}{' '}
                <span className="ml-1.5 text-sm font-semibold text-slate-500 tabular-nums">
                  {approvedSites.length}
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 gap-x-3.5 gap-y-6">
              {byLikes.map((site) => (
                <SiteTile key={site.id} site={site} onSelect={onSelectSite} fluid />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
