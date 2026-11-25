# Security Specification — WebHubShare Firestore Rules

## 1. Data Invariants
1. **Moderation Gate**: Regular users can ONLY create website listings with `status == 'pending'`, `likesCount == 0`, `ratingSum == 0`, `ratingCount == 0`, and `visitsCount == 0`. Only the verified Admin (`sonukmin83@gmail.com`) can approve (`approved`), reject/hide (`rejected`), or delete any listing.
2. **Public Visibility Boundary**: Unauthenticated visitors and non-admin users can only `get` or `list` `/sites` where `status == 'approved'` (or their own submissions where `ownerId == request.auth.uid`).
3. **Atomic Likes & Ratings**: Creating or removing a like in `/sites/{siteId}/likes/{uid}` MUST occur in the same atomic `writeBatch` as incrementing/decrementing `likesCount` by 1 on `/sites/{siteId}` (`existsAfter`/`getAfter`). Creating or updating a rating in `/sites/{siteId}/ratings/{uid}` MUST atomically update `ratingSum` and `ratingCount`.
4. **PII Isolation**: User emails in `/users/{userId}` are readable only by the owner (`request.auth.uid == userId`) or the verified Admin. Non-admin users cannot `list` `/users`.
5. **Verified Writes & Strict Schemas**: All writes require `request.auth.token.email_verified == true`. Every string enforces `.size()` bounds, URLs require `^https?://.+`, and logos allow only `https?://` or `data:image/(jpeg|jpg|png|webp|gif);base64,`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Self-Approval Bypass (Site Create)**: Regular user submits a website with `status: "approved"` -> `PERMISSION_DENIED`
2. **Status Escalation (Site Update)**: Submitter updates their own pending site to `status: "approved"` -> `PERMISSION_DENIED`
3. **Shadow Field Injection (Site Create)**: Adding `featured: true` on `/sites/{siteId}` -> `PERMISSION_DENIED`
4. **Inflated Initial Counts (Site Create)**: Submitting with `likesCount: 5000` -> `PERMISSION_DENIED`
5. **Non-Admin Moderation**: Non-admin user updating another user's site `status` to `"approved"` -> `PERMISSION_DENIED`
6. **Orphaned Like Manipulation**: User updating `likesCount` on `/sites/{siteId}` by `+100` without atomic subcollection batch -> `PERMISSION_DENIED`
7. **Rating Out-of-Bounds**: Submitting a rating with `score: 99` or `score: 0` -> `PERMISSION_DENIED`
8. **XSS Logo/URL Injection**: Submitting `url: "javascript:alert(1)"` or `logo: "data:text/html;base64,..."` -> `PERMISSION_DENIED`
9. **Cross-User PII Scraping**: Non-admin user calling `list` on `/users` or `get` on `/users/otherUid` -> `PERMISSION_DENIED`
10. **Pending Site Leak**: Unauthenticated visitor querying `list` on `/sites` without `status == 'approved'` -> `PERMISSION_DENIED`
11. **Unverified Admin Spoof**: Token with `email: "sonukmin83@gmail.com"` and `email_verified: false` -> `PERMISSION_DENIED`
12. **Denial-of-Wallet Oversized Logo**: Submitting a `logo` string > 90,000 characters -> `PERMISSION_DENIED`
