import { useCallback, useEffect, useState } from 'react';
import { Home, List, Plus, Search, Shield, User as UserIcon } from 'lucide-react';
import { AccountModal } from './components/AccountModal';
import { AdminView } from './components/AdminView';
import { DetailView } from './components/DetailView';
import { HomeView } from './components/HomeView';
import { MySitesView } from './components/MySitesView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { ShareModal } from './components/ShareModal';
import { SubmitView } from './components/SubmitView';
import { useFirebase } from './contexts/FirebaseContext';
import { useDirectoryData } from './hooks/useDirectoryData';
import { getDirCopy } from './lib/i18n';
import type { WebsiteCategory, WebsiteListing } from './types/directory';

type AppRoute = 'home' | 'detail' | 'submit' | 'mine' | 'admin';

export default function App() {
  const {
    user,
    authReady,
    isAdmin,
    language,
    authError,
    signInWithGoogle,
    logout,
    setLanguage,
  } = useFirebase();

  const copy = getDirCopy(language);

  const [route, setRoute] = useState<AppRoute>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('site') ? 'detail' : 'home';
  });
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('site');
  });
  const [selectedCategory, setSelectedCategory] = useState<'All' | WebsiteCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState<WebsiteListing | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Community Member';

  const {
    approvedSites,
    mySites,
    allSites,
    registeredUsers,
    loadingApproved,
    submitSite,
    deleteMySite,
    toggleLike,
    rateSite,
    recordVisit,
    approveSite,
    rejectSite,
    approveAllPending,
    adminDeleteSite,
    seedStarterSites,
  } = useDirectoryData(user?.uid, displayName, authReady, isAdmin);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
  }, []);

  useEffect(() => {
    if (!toastMsg) return;
    const timer = window.setTimeout(() => setToastMsg(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMsg]);

  const navigateHome = useCallback(() => {
    setRoute('home');
    setSelectedSiteId(null);
    window.history.replaceState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const navigateTo = useCallback((next: Exclude<AppRoute, 'detail'>) => {
    setRoute(next);
    setSelectedSiteId(null);
    window.history.replaceState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const openSiteDetail = useCallback((siteId: string) => {
    setSelectedSiteId(siteId);
    setRoute('detail');
    window.history.replaceState({}, '', `/?site=${encodeURIComponent(siteId)}`);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const activeSite =
    approvedSites.find((s) => s.id === selectedSiteId) ||
    allSites.find((s) => s.id === selectedSiteId && s.status === 'approved');

  const pendingCount = isAdmin ? allSites.filter((s) => s.status === 'pending').length : 0;

  const navItems: { id: Exclude<AppRoute, 'detail'>; label: string; icon: typeof Home; badge?: number }[] = [
    { id: 'home', label: copy.navHome, icon: Home },
    { id: 'submit', label: copy.navSubmit, icon: Plus },
    { id: 'mine', label: copy.navMine, icon: List },
    ...(isAdmin ? [{ id: 'admin' as const, label: copy.navAdmin, icon: Shield, badge: pendingCount }] : []),
  ];

  const avatarInitial = (user?.displayName || user?.email || '').trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2.5 sm:gap-4 px-3 sm:px-6">
          {/* Brand */}
          <button
            type="button"
            onClick={navigateHome}
            className="flex items-center gap-2.5 shrink-0 cursor-pointer"
          >
            <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-[11px] bg-blue-600 shadow-sm shrink-0">
              <img
                src="/assets/aistudio/WebHubShare_69d6dcc2.jpeg"
                alt="WebHubShare"
                className="h-full w-full object-cover"
              />
            </span>
            <span className="text-[17px] sm:text-[19px] font-bold tracking-tight text-slate-900 whitespace-nowrap">
              {copy.brandPrefix}
              <em className="not-italic text-blue-600">{copy.brandAccent}</em>
            </span>
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-md min-w-0">
            <label className="flex h-10 sm:h-11 items-center gap-2 rounded-full bg-slate-100 px-3.5 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:shadow-sm">
              <Search className="h-4 w-4 text-slate-500 shrink-0" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (val.trim() && route !== 'home') {
                    setRoute('home');
                    setSelectedSiteId(null);
                    window.history.replaceState({}, '', '/');
                  }
                }}
                placeholder={copy.searchPlaceholder}
                aria-label={copy.searchPlaceholder}
                className="w-full min-w-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-500 outline-none"
              />
            </label>
          </div>

          {/* Desktop Navigation & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <nav className="hidden md:flex items-center gap-1 mr-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = route === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.id)}
                    className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="ml-0.5 rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-bold text-white tabular-nums">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <PWAInstallButton installLabel={copy.installApp} iosLabel={copy.installOnIOS} />

            <button
              type="button"
              onClick={() => setAccountOpen(true)}
              aria-label="Account"
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold shadow-xs transition-transform hover:scale-105 cursor-pointer ${
                user
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {user ? avatarInitial || 'U' : <UserIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 pt-4 pb-24 md:pb-12">
        {!authReady ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          </div>
        ) : route === 'detail' ? (
          <DetailView
            site={activeSite}
            allApproved={approvedSites}
            language={language}
            uid={user?.uid}
            isVerifiedUser={Boolean(user?.emailVerified)}
            authReady={authReady}
            onBack={navigateHome}
            onSelectSite={openSiteDetail}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setSearchQuery('');
              navigateHome();
            }}
            onToggleLike={toggleLike}
            onRateSite={rateSite}
            onRecordVisit={recordVisit}
            onShareSite={(s) => setShareTarget(s)}
            onRequireAuth={() => setAccountOpen(true)}
            onToast={showToast}
          />
        ) : route === 'submit' ? (
          <SubmitView
            uid={user?.uid}
            language={language}
            onSignIn={signInWithGoogle}
            onSubmitSite={submitSite}
            onSubmitted={() => navigateTo('mine')}
            onToast={showToast}
          />
        ) : route === 'mine' ? (
          <MySitesView
            uid={user?.uid}
            mySites={mySites}
            language={language}
            onSignIn={signInWithGoogle}
            onSelectSite={openSiteDetail}
            onGoSubmit={() => navigateTo('submit')}
            onDeleteSite={deleteMySite}
            onToast={showToast}
          />
        ) : route === 'admin' ? (
          <AdminView
            uid={user?.uid}
            isAdmin={isAdmin}
            allSites={allSites}
            registeredUsers={registeredUsers}
            language={language}
            onSignIn={signInWithGoogle}
            onSelectSite={openSiteDetail}
            onApproveSite={approveSite}
            onRejectSite={rejectSite}
            onApproveAll={approveAllPending}
            onDeleteSite={adminDeleteSite}
            onSeedStarterSites={seedStarterSites}
            onToast={showToast}
          />
        ) : (
          <HomeView
            approvedSites={approvedSites}
            loading={loadingApproved}
            language={language}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setSearchQuery('');
            }}
            onSelectSite={openSiteDetail}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md pb-safe"
      >
        <div className={`grid h-14 ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = route === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTo(item.id)}
                className={`relative flex flex-col items-center justify-center min-h-[44px] px-1 transition-colors cursor-pointer ${
                  active ? 'text-blue-600' : 'text-slate-500'
                }`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="mt-0.5 text-[11px] font-semibold tracking-tight truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Modals & Notifications */}
      <AccountModal
        open={accountOpen}
        user={user}
        isAdmin={isAdmin}
        language={language}
        authError={authError}
        onClose={() => setAccountOpen(false)}
        onSignIn={signInWithGoogle}
        onLogout={logout}
        onSetLanguage={setLanguage}
        onGoMine={() => navigateTo('mine')}
        onGoAdmin={() => navigateTo('admin')}
      />

      <ShareModal
        site={shareTarget}
        language={language}
        onClose={() => setShareTarget(null)}
        onToast={showToast}
      />

      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-xl max-w-[calc(100vw-32px)] text-center"
        >
          {toastMsg}
        </div>
      )}

      <OfflineIndicator label={copy.offlineBanner} />
    </div>
  );
}
