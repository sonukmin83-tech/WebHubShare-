import React, { useState } from 'react';
import { Clock, Image as ImageIcon, Link2, Upload, User } from 'lucide-react';
import { getDirCopy } from '../lib/i18n';
import {
  compressImageToLimit,
  LIMITS,
  safeUrl,
  WEBSITE_CATEGORIES,
} from '../lib/validation';
import type { LanguageCode, WebsiteCategory } from '../types/directory';

interface SubmitViewProps {
  uid: string | undefined;
  language: LanguageCode;
  onSignIn: () => Promise<void>;
  onSubmitSite: (input: {
    name: string;
    url: string;
    description: string;
    category: WebsiteCategory;
    logo: string;
  }) => Promise<string | undefined>;
  onSubmitted: () => void;
  onToast: (msg: string) => void;
}

export const SubmitView: React.FC<SubmitViewProps> = ({
  uid,
  language,
  onSignIn,
  onSubmitSite,
  onSubmitted,
  onToast,
}) => {
  const copy = getDirCopy(language);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<WebsiteCategory>('Tools');
  const [logoTab, setLogoTab] = useState<'upload' | 'url'>('upload');
  const [uploadedLogo, setUploadedLogo] = useState('');
  const [logoFileName, setLogoFileName] = useState('');
  const [logoBytes, setLogoBytes] = useState(0);
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const maxBytes = LIMITS.MAX_ICON_KB * 1024;
  const activeLogo = logoTab === 'upload' ? uploadedLogo : safeUrl(logoUrlInput);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result !== 'string') return;
      const img = new Image();
      img.onload = () => {
        const compressed = compressImageToLimit(img, LIMITS.MAX_ICON_KB);
        setLogoFileName(file.name);
        setLogoBytes(compressed.bytes);
        if (compressed.bytes <= maxBytes && compressed.dataUrl) {
          setUploadedLogo(compressed.dataUrl);
          onToast(`Icon ready (${(compressed.bytes / 1024).toFixed(1)} KB)`);
        } else {
          setUploadedLogo('');
          setErrorMsg(`Icon exceeds ${LIMITS.MAX_ICON_KB} KB limit. Try a smaller image.`);
        }
      };
      img.onerror = () => {
        setErrorMsg('Unable to read image file. Please choose another PNG, JPG, or WEBP file.');
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = name.trim();
    const cleanUrl = safeUrl(url);
    const cleanDesc = description.trim();

    if (cleanName.length < LIMITS.NAME_MIN) {
      setErrorMsg('Please enter a website name.');
      return;
    }
    if (!cleanUrl) {
      setErrorMsg('Please enter a valid URL starting with https://');
      return;
    }
    if (cleanDesc.length < LIMITS.DESC_MIN) {
      setErrorMsg(`Description must be at least ${LIMITS.DESC_MIN} characters.`);
      return;
    }
    if (!activeLogo) {
      setErrorMsg('Please upload an icon or enter a valid image URL.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitSite({
        name: cleanName,
        url: cleanUrl,
        description: cleanDesc,
        category,
        logo: activeLogo,
      });
      setName('');
      setUrl('');
      setDescription('');
      setUploadedLogo('');
      setLogoUrlInput('');
      setLogoFileName('');
      setLogoBytes(0);
      onToast('Submitted for admin approval!');
      onSubmitted();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit website.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="mx-auto max-w-xl pb-8">
      <div className="pt-2 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{copy.submitTitle}</h1>
        <p className="mt-1 text-sm text-slate-500">{copy.submitSub}</p>
      </div>

      <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-sm text-emerald-900">
        <Clock className="h-4 w-4 mt-0.5 shrink-0 text-emerald-700" />
        <p className="leading-relaxed">{copy.submitBanner}</p>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {errorMsg}
        </div>
      )}

      {/* Step 1 */}
      <div className="mt-5 mb-2 flex items-start gap-2.5">
        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-extrabold text-blue-600">
          1
        </span>
        <div>
          <label htmlFor="site-name" className="block text-sm font-bold text-slate-900">
            {copy.step1Title}
          </label>
          <p className="text-xs text-slate-500">{copy.step1Sub}</p>
        </div>
      </div>
      <input
        id="site-name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. DesignCraft Studio"
        maxLength={LIMITS.NAME_MAX}
        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
      />

      {/* Step 2 */}
      <div className="mt-5 mb-2 flex items-start gap-2.5">
        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-extrabold text-blue-600">
          2
        </span>
        <div>
          <label htmlFor="site-url" className="block text-sm font-bold text-slate-900">
            {copy.step2Title}
          </label>
          <p className="text-xs text-slate-500">{copy.step2Sub}</p>
        </div>
      </div>
      <input
        id="site-url"
        type="text"
        inputMode="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
        maxLength={LIMITS.URL_MAX}
        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
      />

      {/* Step 3 */}
      <div className="mt-5 mb-2 flex items-start gap-2.5">
        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-extrabold text-blue-600">
          3
        </span>
        <div>
          <label htmlFor="site-desc" className="block text-sm font-bold text-slate-900">
            {copy.step3Title}
          </label>
          <p className="text-xs text-slate-500">{copy.step3Sub}</p>
        </div>
      </div>
      <textarea
        id="site-desc"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={LIMITS.DESC_MAX}
        placeholder="Describe what visitors can do on your website..."
        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 resize-y"
      />
      <div className="mt-1 text-xs text-slate-500 tabular-nums">
        {description.length}/{LIMITS.DESC_MAX}
      </div>

      {/* Step 4 */}
      <div className="mt-5 mb-2 flex items-start gap-2.5">
        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-extrabold text-blue-600">
          4
        </span>
        <div>
          <label htmlFor="site-cat" className="block text-sm font-bold text-slate-900">
            {copy.step4Title}
          </label>
          <p className="text-xs text-slate-500">{copy.step4Sub}</p>
        </div>
      </div>
      <select
        id="site-cat"
        value={category}
        onChange={(e) => setCategory(e.target.value as WebsiteCategory)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
      >
        {WEBSITE_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Step 5 */}
      <div className="mt-5 mb-2 flex items-start gap-2.5">
        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-extrabold text-blue-600">
          5
        </span>
        <div>
          <span className="block text-sm font-bold text-slate-900">{copy.step5Title}</span>
          <p className="text-xs text-slate-500">{copy.step5Sub}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1 mb-3">
        <button
          type="button"
          onClick={() => setLogoTab('upload')}
          className={`inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            logoTab === 'upload' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          <span>{copy.uploadTab}</span>
        </button>
        <button
          type="button"
          onClick={() => setLogoTab('url')}
          className={`inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            logoTab === 'url' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
          }`}
        >
          <Link2 className="h-3.5 w-3.5" />
          <span>{copy.urlTab}</span>
        </button>
      </div>

      {logoTab === 'upload' ? (
        <div>
          <label
            htmlFor="icon-upload"
            className={`flex items-center gap-3.5 rounded-2xl border-2 border-dashed p-3.5 cursor-pointer transition-colors ${
              uploadedLogo
                ? 'border-emerald-300 bg-emerald-50/40'
                : 'border-slate-300 bg-slate-50 hover:border-blue-500 hover:bg-blue-50/40'
            }`}
          >
            <div className="grid h-[70px] w-[70px] shrink-0 place-items-center overflow-hidden rounded-[18px] border border-slate-200 bg-white text-slate-400">
              {uploadedLogo ? (
                <img src={uploadedLogo} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-6 w-6" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-slate-900">{copy.chooseIcon}</div>
              <div className="text-xs text-slate-500 mt-0.5">{copy.iconHint}</div>
            </div>
            <Upload className="h-5 w-5 text-blue-600 shrink-0 mr-1" />
          </label>
          <input
            id="icon-upload"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            className="sr-only"
          />

          {logoFileName && (
            <div className="mt-2.5 rounded-xl bg-slate-100 p-3 text-xs">
              <div className="flex items-center justify-between gap-2 text-slate-600 mb-1.5">
                <span className="truncate font-medium">{logoFileName}</span>
                <span
                  className={`font-bold tabular-nums ${
                    logoBytes <= maxBytes ? 'text-blue-700' : 'text-rose-600'
                  }`}
                >
                  {(logoBytes / 1024).toFixed(1)} KB
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full transition-all ${
                    logoBytes <= maxBytes ? 'bg-blue-600' : 'bg-rose-600'
                  }`}
                  style={{ width: `${Math.min(100, (logoBytes / maxBytes) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="grid h-[70px] w-[70px] shrink-0 place-items-center overflow-hidden rounded-[18px] border border-slate-200 bg-slate-100 text-slate-400">
            {safeUrl(logoUrlInput) ? (
              <img
                src={safeUrl(logoUrlInput)}
                alt="URL preview"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-6 w-6" />
            )}
          </div>
          <input
            type="url"
            value={logoUrlInput}
            onChange={(e) => setLogoUrlInput(e.target.value)}
            placeholder="https://example.com/icon.png"
            className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full min-h-[48px] rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 transition-colors cursor-pointer"
      >
        {submitting ? 'Submitting...' : copy.submitBtn}
      </button>

      <p className="mt-3 text-center text-xs text-slate-500">{copy.submitFoot}</p>
    </form>
  );
};
