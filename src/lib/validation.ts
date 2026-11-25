import type { WebsiteCategory } from '../types/directory';

export const CATEGORIES: readonly ('All' | WebsiteCategory)[] = [
  'All',
  'Social',
  'Entertainment',
  'Shopping',
  'Education',
  'Tools',
  'News',
  'Games',
  'Finance',
  'AI',
  'Other',
] as const;

export const WEBSITE_CATEGORIES: readonly WebsiteCategory[] = [
  'Social',
  'Entertainment',
  'Shopping',
  'Education',
  'Tools',
  'News',
  'Games',
  'Finance',
  'AI',
  'Other',
] as const;

export const LIMITS = {
  UID_MAX: 128,
  NAME_MIN: 1,
  NAME_MAX: 60,
  OWNER_NAME_MAX: 80,
  EMAIL_MIN: 3,
  EMAIL_MAX: 254,
  URL_MIN: 8,
  URL_MAX: 300,
  DESC_MIN: 15,
  DESC_MAX: 400,
  LOGO_MIN: 8,
  LOGO_MAX: 90000,
  MAX_ICON_KB: 50,
} as const;

export const PATTERNS = {
  ID: /^[a-zA-Z0-9_\-]+$/,
  URL: /^https?:\/\/.+/,
  LOGO: /^(https?:\/\/.+|data:image\/(jpeg|jpg|png|webp|gif);base64,.+)/,
} as const;

export const ADMIN_EMAIL = 'sonukmin83@gmail.com';

export const HUES: readonly [string, string][] = [
  ['#4f46e5', '#7c3aed'],
  ['#e11d48', '#f97316'],
  ['#0d9488', '#10b981'],
  ['#d97706', '#f59e0b'],
  ['#9333ea', '#e11d48'],
  ['#0284c7', '#0369a1'],
  ['#ea580c', '#9333ea'],
  ['#1e3a8a', '#4338ca'],
  ['#db2777', '#ea580c'],
  ['#0f766e', '#ca8a04'],
  ['#7e22ce', '#c026d3'],
  ['#0369a1', '#0f766e'],
  ['#dc2626', '#ea580c'],
  ['#2563eb', '#1d4ed8'],
  ['#6d28d9', '#be123c'],
  ['#059669', '#0284c7'],
];

export const GRADS: readonly [string, string][] = [
  ['#ef4444', '#dc2626'],
  ['#3b82f6', '#1d4ed8'],
  ['#14b8a6', '#0d9488'],
  ['#f59e0b', '#d97706'],
  ['#a855f7', '#7e22ce'],
  ['#ec4899', '#be185d'],
  ['#06b6d4', '#0e7490'],
  ['#22c55e', '#15803d'],
  ['#6366f1', '#4338ca'],
  ['#f97316', '#c2410c'],
  ['#78716c', '#44403c'],
  ['#64748b', '#334155'],
];

export function generateSafeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `site_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function sanitizeText(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

export function safeUrl(raw: string): string {
  let v = String(raw || '').trim().replace(/\s+/g, '');
  if (!v) return '';
  v = v.replace(/^(https?):\/*/i, '$1://');
  if (!/^https?:\/\//i.test(v)) {
    v = v.replace(/^\/+/, '');
    v = 'https://' + v;
  }
  try {
    const parsed = new URL(v);
    if (!parsed.hostname || !parsed.hostname.includes('.')) return '';
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return parsed.href.slice(0, LIMITS.URL_MAX);
  } catch {
    return '';
  }
}

export function getDeterministicHue(name: string, id: string): [string, string] {
  const str = `${name}#${id}`;
  let n = 2166136261;
  for (let i = 0; i < str.length; i++) {
    n ^= str.charCodeAt(i);
    n = Math.imul(n, 16777619) >>> 0;
  }
  return HUES[n % HUES.length];
}

export function getGrad(seed: string): [string, string] {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADS[n % GRADS.length];
}

export function getInitials(name: string): string {
  const parts = String(name || '?').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return String(name || '?').trim().slice(0, 2).toUpperCase();
}

export function formatCompact(n: number): string {
  const num = Number(n) || 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(num);
}

export function getTimestampMillis(ts: unknown): number {
  if (ts && typeof ts === 'object' && 'toMillis' in ts && typeof (ts as { toMillis: () => number }).toMillis === 'function') {
    return (ts as { toMillis: () => number }).toMillis();
  }
  return 0;
}

export function timeAgo(ts: unknown): string {
  const ms = getTimestampMillis(ts);
  if (!ms) return 'just now';
  const s = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const hr = Math.floor(m / 60);
  if (hr < 24) return `${hr} hr ago`;
  const dd = Math.floor(hr / 24);
  if (dd < 30) return `${dd} day${dd > 1 ? 's' : ''} ago`;
  const mo = Math.floor(dd / 30);
  if (mo < 12) return `${mo} month${mo > 1 ? 's' : ''} ago`;
  return `${Math.floor(mo / 12)} yr ago`;
}

export function dataUrlBytes(dataUrl: string): number {
  const idx = dataUrl.indexOf(',');
  if (idx === -1) return dataUrl.length;
  const b64 = dataUrl.slice(idx + 1);
  const pad = (b64.match(/=+$/) || [''])[0].length;
  return Math.floor((b64.length * 3) / 4) - pad;
}

export function compressImageToLimit(
  img: HTMLImageElement,
  maxKB: number = LIMITS.MAX_ICON_KB
): { dataUrl: string; bytes: number } {
  const limit = maxKB * 1024;
  let size = 256;
  let out = '';
  for (let pass = 0; pass < 6; pass++) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) break;
    ctx.imageSmoothingQuality = 'high';
    const side = Math.min(img.width, img.height);
    const sx = Math.round((img.width - side) / 2);
    const sy = Math.round((img.height - side) / 2);
    ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
    let q = 0.92;
    for (let i = 0; i < 12; i++) {
      out = canvas.toDataURL('image/jpeg', q);
      const bytes = dataUrlBytes(out);
      if (bytes <= limit) {
        return { dataUrl: out, bytes };
      }
      q -= 0.08;
      if (q < 0.3) break;
    }
    size = Math.round(size * 0.78);
    if (size < 48) break;
  }
  return { dataUrl: out, bytes: dataUrlBytes(out) };
}
