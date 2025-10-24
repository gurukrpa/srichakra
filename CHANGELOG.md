# Changelog

## v0.3 (2025-10-24)

Highlights
- Hosting: Deploy the same build to both Firebase Hosting sites (`srichakraacademy-org` and `srichakraacademy-3f745`) so the custom domain updates without DNS edits.
- App: Added SCOPE intro page and routing (`/career-assessment-intro`); updated home link to route via the intro first.
- PDF: A4 print CSS cleanup; consistent margins; fixed header/footer; Executive Summary on page 1; moved “Domain Distribution Overview” to page 3; improved alignment and page breaks.
- Config/Docs: Added hosting target `legacy`; `NAMECHEAP_DOMAIN_SETUP.md` + `check-dns.sh` for DNS verification and guidance.

Commits
- HEAD: 8b3200d — feat(hosting): deploy same build to both sites; add SCOPE intro route and PDF layout fixes; docs
- Previous: f3fa060 — backup branch created `backup/login-page-2025-10-24-f3fa060`

How to revert this release
- Safe revert (keeps history, creates inverse commit):
  1. git checkout login-page
  2. git revert 8b3200d
  3. git push
- Hard rollback to previous state (discard local changes; force push):
  1. git checkout login-page
  2. git reset --hard f3fa060
  3. git push --force-with-lease
- Restore using the backup branch:
  1. git checkout login-page
  2. git reset --hard backup/login-page-2025-10-24-f3fa060
  3. git push --force-with-lease

Post-revert
- If you want the live site to reflect the revert, redeploy:
  - firebase deploy --only hosting
