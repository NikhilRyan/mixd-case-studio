# Engineering guide for coding agents

## Non-negotiable rules

- Never commit, push, merge, tag, publish, deploy, or open a pull request without explicit approval in the current session.
- Never edit existing tests merely to make a failing implementation pass. Add regression tests first for bug fixes.
- Never read, print, or commit secrets, `.env*`, credentials, private data, or local `.wrangler` state.
- Never claim a change works without running the relevant type-check, lint, tests, build, and behavior smoke test.
- Preserve existing users, stored design versions, and additive database evolution.

## Project workflow

1. Read `README.md` and the relevant document under `docs/`.
2. Inspect existing patterns and write a short plan for non-trivial changes.
3. Implement the smallest complete vertical slice.
4. Run focused tests, then `npm run check`.
5. Report files changed, compatibility impact, exact verification, assumptions, and remaining risks.

## Project invariants

- Local development runs on port 3000 only.
- D1 binding name is `DB`; R2 binding name is `CASE_ASSETS`.
- Print version 2 is a transparent sRGB PNG at 2400 × 4800 pixels with device physical dimensions in the stored specification.
- Share links are unlisted and unauthenticated; do not describe them as private or access-controlled.
- Phone input stays browser-only. Do not transmit or persist new phone numbers.
- New devices are data entries in `app/studio/catalog.ts`; new camera geometries require an explicit rendering implementation.
- API mutations require same-origin checks, bounded inputs, strict validation, sanitized logs, and actionable user-safe errors.
- Database migrations are additive. Never delete compatibility columns or version 1 support without a documented adoption and rollback plan.

## Verification

Use `npm run check` for the full gate. Visual or interaction changes also require a browser smoke test at desktop and mobile widths. Do not modify generated `dist/` directly.
