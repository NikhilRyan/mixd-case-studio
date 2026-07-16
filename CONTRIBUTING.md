# Contributing to MIXD.

Thank you for improving MIXD. Keep changes small, backward-compatible, and easy to verify.

## Local workflow

1. Run `nvm install && nvm use` to select the tested Node.js 22 LTS release.
2. Install exactly the locked dependencies with `npm ci`.
3. Create a focused branch in your own Git workflow.
4. Run the site with `npm run dev` and use only `http://localhost:3000`.
5. Add tests for changed behavior. Do not weaken an existing assertion to accommodate a regression.
6. Run `npm run check` and `npm run audit:prod` before requesting review.

## Change guidelines

- Reuse existing types, catalogue data, validation helpers, and CSS sections before adding a parallel abstraction.
- Validate all external input at the API boundary. Never trust design JSON, MIME headers, object keys, names, or identifiers from the browser.
- Preserve version 1 stored designs and additive schema evolution. Breaking API, schema, or print-format changes need a written migration and rollback plan.
- Do not add runtime dependencies when the platform or existing code can solve the problem clearly.
- Never commit credentials, private data, local `.wrangler` state, generated `dist/`, or environment files.
- Keep phone numbers browser-only. Changes to this rule require an explicit privacy and retention design review.

## Database changes

Edit `db/schema.ts`, then run:

```bash
npm run db:generate
```

Inspect the generated SQL. Migrations must be additive and safe for an existing deployment. Keep `db/runtime-schema.ts` compatible with both fresh and previously initialized local databases.

## Pull requests

Describe the user-visible change, compatibility impact, verification commands, and any risk or deferred work. Include screenshots for visual changes. Keep refactors separate from behavior changes where practical.

By contributing, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md) and license your contribution under the [MIT License](LICENSE).
