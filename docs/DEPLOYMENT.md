# Deployment

## Pre-deployment gate

Use Node.js 22.13 or newer, install with `npm ci`, and run:

```bash
npm run check
```

A valid build contains `dist/server/index.js`, static client assets, `dist/.openai/hosting.json`, and the generated migrations under `dist/.openai/drizzle/`.

## Sites deployment

The repository is configured for Sites through `.openai/hosting.json`. Sites supplies the real D1 and R2 resources for the logical `DB` and `CASE_ASSETS` bindings; production IDs and credentials must remain outside source control. Use the Sites publishing workflow from a successfully verified source revision.

This repository intentionally contains no project ID or committed deployment. Creating or publishing a site is a separate, authorized release action.

## Independent Cloudflare deployment

If deploying outside Sites, reproduce the worker bindings declared by the build:

- `DB`: D1 database
- `CASE_ASSETS`: private R2 bucket
- `ASSETS`: generated static-asset binding
- `IMAGES`: Cloudflare Images binding used by vinext optimization

Apply every SQL file in `drizzle/` in journal order before routing traffic. Use additive migration rollout and retain a database backup appropriate to the environment.

## Production checklist

- Set a custom HTTPS domain and verify CSP/HSTS/security response headers.
- Configure edge request and upload rate limits.
- Define D1 backup and R2 lifecycle policies.
- Document retention and deletion ownership.
- Run a real printer proof for every supported case geometry.
- Verify one complete save/share/reopen flow from a production-like environment.
- Monitor structured server error events by request ID without logging design contents or customer data.

## Rollback

Application rollback is safe while schema changes remain additive: route traffic to the prior verified Worker version and leave new nullable columns in place. Do not reverse or delete D1 columns during an incident. R2 objects are immutable by generated key and can remain while the application is rolled back.
