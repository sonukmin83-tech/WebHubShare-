import { useCallback, useEffect, useRef, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreError';
import { STARTER_SITES } from '../lib/seedSites';
import {
  generateSafeId,
  getTimestampMillis,
  LIMITS,
  PATTERNS,
  safeUrl,
  sanitizeText,
} from '../lib/validation';
import type { SiteLike, SiteRating, UserAccount, WebsiteCategory, WebsiteListing } from '../types/directory';

export function useDirectoryData(
  uid: string | undefined,
  displayName: string,
  authReady: boolean,
  isAdmin: boolean
) {
  const [approvedSites, setApprovedSites] = useState<WebsiteListing[]>([]);
  const [mySites, setMySites] = useState<WebsiteListing[]>([]);
  const [allSites, setAllSites] = useState<WebsiteListing[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>([]);
  const [loadingApproved, setLoadingApproved] = useState(true);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const seededOnceRef = useRef(false);

  // 1. Public approved sites stream
  useEffect(() => {
    if (!authReady) return;
    setLoadingApproved(true);
    const q = query(collection(db, 'sites'), where('status', '==', 'approved'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<WebsiteListing, 'id'>),
        }));
        items.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
        setApprovedSites(items);
        setLoadingApproved(false);
      },
      (err) => {
        setLoadingApproved(false);
        handleFirestoreError(err, OperationType.LIST, 'sites (approved)');
      }
    );
    return () => unsub();
  }, [authReady]);

  // 2. Current user's own submissions stream
  useEffect(() => {
    if (!authReady || !uid) {
      setMySites([]);
      return;
    }
    const q = query(collection(db, 'sites'), where('ownerId', '==', uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<WebsiteListing, 'id'>),
        }));
        items.sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));
        setMySites(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `sites (ownerId=${uid})`)
    );
    return () => unsub();
  }, [authReady, uid]);

  // 3. Admin streams (all sites + registered users)
  useEffect(() => {
    if (!authReady || !uid || !isAdmin) {
      setAllSites([]);
      setRegisteredUsers([]);
      setLoadingAdmin(false);
      return;
    }

    setLoadingAdmin(true);
    const unsubAllSites = onSnapshot(
      collection(db, 'sites'),
      (snap) => {
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<WebsiteListing, 'id'>),
        }));
        items.sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));
        setAllSites(items);
        setLoadingAdmin(false);
      },
      (err) => {
        setLoadingAdmin(false);
        handleFirestoreError(err, OperationType.LIST, 'sites (admin)');
      }
    );

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const users = snap.docs.map((d) => d.data() as UserAccount);
        users.sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));
        setRegisteredUsers(users);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'users (admin)')
    );

    return () => {
      unsubAllSites();
      unsubUsers();
    };
  }, [authReady, uid, isAdmin]);

  // Seed starter directory sites (Admin only)
  const seedStarterSites = useCallback(async () => {
    if (!uid || !isAdmin) return 0;
    try {
      const batch = writeBatch(db);
      for (const item of STARTER_SITES) {
        const ref = doc(db, 'sites', item.id);
        batch.set(ref, {
          ownerId: uid,
          ownerName: sanitizeText(displayName || 'WebHubShare Team', LIMITS.OWNER_NAME_MAX),
          name: sanitizeText(item.name, LIMITS.NAME_MAX),
          url: safeUrl(item.url),
          description: sanitizeText(item.description, LIMITS.DESC_MAX),
          category: item.category,
          logo: item.logo,
          status: 'approved',
          likesCount: 0,
          ratingSum: 0,
          ratingCount: 0,
          visitsCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
      return STARTER_SITES.length;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'sites (seed)');
    }
  }, [uid, isAdmin, displayName]);

  // Auto-seed starter catalog once when Admin opens an empty directory
  useEffect(() => {
    if (!authReady || !isAdmin || loadingAdmin || seededOnceRef.current) return;
    if (allSites.length === 0) {
      seededOnceRef.current = true;
      void seedStarterSites();
    }
  }, [authReady, isAdmin, loadingAdmin, allSites.length, seedStarterSites]);

  // Submit website for admin approval
  const submitSite = useCallback(
    async (input: {
      name: string;
      url: string;
      description: string;
      category: WebsiteCategory;
      logo: string;
    }) => {
      if (!uid) throw new Error('Authentication required');
      const cleanName = sanitizeText(input.name, LIMITS.NAME_MAX);
      const cleanUrl = safeUrl(input.url);
      const cleanDesc = sanitizeText(input.description, LIMITS.DESC_MAX);
      const cleanLogo = input.logo.trim();
      const cleanOwnerName = sanitizeText(displayName || 'Community Member', LIMITS.OWNER_NAME_MAX);

      if (cleanName.length < LIMITS.NAME_MIN) throw new Error('Website name is required.');
      if (!cleanUrl) throw new Error('Valid https:// URL is required.');
      if (cleanDesc.length < LIMITS.DESC_MIN) throw new Error('Description must be at least 15 characters.');
      if (cleanLogo.length < LIMITS.LOGO_MIN || cleanLogo.length > LIMITS.LOGO_MAX || !PATTERNS.LOGO.test(cleanLogo)) {
        throw new Error('Valid icon image (max 50 KB) or image URL is required.');
      }

      const siteId = generateSafeId();
      const path = `sites/${siteId}`;
      try {
        await setDoc(doc(db, 'sites', siteId), {
          ownerId: uid,
          ownerName: cleanOwnerName,
          name: cleanName,
          url: cleanUrl,
          description: cleanDesc,
          category: input.category,
          logo: cleanLogo,
          status: 'pending',
          likesCount: 0,
          ratingSum: 0,
          ratingCount: 0,
          visitsCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return siteId;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    },
    [uid, displayName]
  );

  // User deletes own pending/rejected site
  const deleteMySite = useCallback(
    async (siteId: string) => {
      if (!uid) return;
      const path = `sites/${siteId}`;
      try {
        await deleteDoc(doc(db, 'sites', siteId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    },
    [uid]
  );

  // Atomic like toggle
  const toggleLike = useCallback(
    async (siteId: string, currentlyLiked: boolean) => {
      if (!uid) return;
      const path = `sites/${siteId}/likes/${uid}`;
      const siteRef = doc(db, 'sites', siteId);
      const likeRef = doc(db, 'sites', siteId, 'likes', uid);
      try {
        const batch = writeBatch(db);
        if (currentlyLiked) {
          batch.delete(likeRef);
          batch.update(siteRef, {
            likesCount: increment(-1),
            updatedAt: serverTimestamp(),
          });
        } else {
          batch.set(likeRef, {
            ownerId: uid,
            createdAt: serverTimestamp(),
          });
          batch.update(siteRef, {
            likesCount: increment(1),
            updatedAt: serverTimestamp(),
          });
        }
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    },
    [uid]
  );

  // Atomic 1-5 star rating
  const rateSite = useCallback(
    async (siteId: string, score: number, previousScore: number | null) => {
      if (!uid) return;
      const clamped = Math.max(1, Math.min(5, Math.round(score)));
      const path = `sites/${siteId}/ratings/${uid}`;
      const siteRef = doc(db, 'sites', siteId);
      const ratingRef = doc(db, 'sites', siteId, 'ratings', uid);

      try {
        const batch = writeBatch(db);
        if (previousScore === null) {
          batch.set(ratingRef, {
            ownerId: uid,
            score: clamped,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          batch.update(siteRef, {
            ratingSum: increment(clamped),
            ratingCount: increment(1),
            updatedAt: serverTimestamp(),
          });
        } else {
          batch.update(ratingRef, {
            score: clamped,
            updatedAt: serverTimestamp(),
          });
          batch.update(siteRef, {
            ratingSum: increment(clamped - previousScore),
            updatedAt: serverTimestamp(),
          });
        }
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    },
    [uid]
  );

  // Record visit (+1 for verified signed-in users)
  const recordVisit = useCallback(
    async (siteId: string, isVerifiedUser: boolean) => {
      if (!uid || !isVerifiedUser) return;
      const path = `sites/${siteId}`;
      try {
        await updateDoc(doc(db, 'sites', siteId), {
          visitsCount: increment(1),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    },
    [uid]
  );

  // Admin moderation actions
  const approveSite = useCallback(
    async (siteId: string) => {
      if (!isAdmin) return;
      const path = `sites/${siteId}`;
      try {
        await updateDoc(doc(db, 'sites', siteId), {
          status: 'approved',
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    },
    [isAdmin]
  );

  const rejectSite = useCallback(
    async (siteId: string) => {
      if (!isAdmin) return;
      const path = `sites/${siteId}`;
      try {
        await updateDoc(doc(db, 'sites', siteId), {
          status: 'rejected',
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    },
    [isAdmin]
  );

  const approveAllPending = useCallback(async () => {
    if (!isAdmin) return 0;
    const pending = allSites.filter((s) => s.status === 'pending');
    if (pending.length === 0) return 0;
    try {
      const batch = writeBatch(db);
      for (const s of pending) {
        batch.update(doc(db, 'sites', s.id), {
          status: 'approved',
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
      return pending.length;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'sites (approveAll)');
    }
  }, [isAdmin, allSites]);

  const adminDeleteSite = useCallback(
    async (siteId: string) => {
      if (!isAdmin) return;
      const path = `sites/${siteId}`;
      try {
        await deleteDoc(doc(db, 'sites', siteId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    },
    [isAdmin]
  );

  return {
    approvedSites,
    mySites,
    allSites,
    registeredUsers,
    loadingApproved,
    loadingAdmin,
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
  };
}

export function useSiteUserInteraction(siteId: string | null, uid: string | undefined, authReady: boolean) {
  const [liked, setLiked] = useState(false);
  const [myRating, setMyRating] = useState<number | null>(null);

  useEffect(() => {
    if (!authReady || !uid || !siteId) {
      setLiked(false);
      setMyRating(null);
      return;
    }

    const likePath = `sites/${siteId}/likes/${uid}`;
    const ratingPath = `sites/${siteId}/ratings/${uid}`;

    const unsubLike = onSnapshot(
      doc(db, 'sites', siteId, 'likes', uid),
      (snap) => {
        setLiked(snap.exists() && Boolean((snap.data() as SiteLike | undefined)?.ownerId));
      },
      (err) => handleFirestoreError(err, OperationType.GET, likePath)
    );

    const unsubRating = onSnapshot(
      doc(db, 'sites', siteId, 'ratings', uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as SiteRating;
          setMyRating(typeof data.score === 'number' ? data.score : null);
        } else {
          setMyRating(null);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, ratingPath)
    );

    return () => {
      unsubLike();
      unsubRating();
    };
  }, [siteId, uid, authReady]);

  return { liked, myRating };
}
