export type LanguageCode = 'en' | 'hi';

export type WebsiteCategory =
  | 'Social'
  | 'Entertainment'
  | 'Shopping'
  | 'Education'
  | 'Tools'
  | 'News'
  | 'Games'
  | 'Finance'
  | 'AI'
  | 'Other';

export type SiteStatus = 'pending' | 'approved' | 'rejected';

export interface UserAccount {
  uid: string;
  name: string;
  email: string;
  language: LanguageCode;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface WebsiteListing {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  url: string;
  description: string;
  category: WebsiteCategory;
  logo: string;
  status: SiteStatus;
  likesCount: number;
  ratingSum: number;
  ratingCount: number;
  visitsCount: number;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface SiteLike {
  ownerId: string;
  createdAt: unknown;
}

export interface SiteRating {
  ownerId: string;
  score: number;
  createdAt: unknown;
  updatedAt: unknown;
}
