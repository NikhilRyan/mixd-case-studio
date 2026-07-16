# Security policy

## Supported versions

Security fixes are applied to the latest code on the default branch. Pre-release forks and older snapshots are not maintained by the project.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use the repository’s private vulnerability-reporting form under **Security**. Include reproduction steps, affected routes, impact, and a minimal proof of concept without real user data.

Wait for acknowledgement before disclosure, and do not test against systems or data you do not own.

## Security model

- Share URLs are unlisted capability links, not authenticated resources. Possession of a link grants read access to that design.
- State-changing browser requests are same-origin only.
- Uploaded files are limited to PNG, JPEG, and WebP, validated by size and magic bytes, and stored under server-generated keys.
- API identifiers and asset keys use strict allowlists.
- Phone numbers entered by the current client remain in the browser and are not persisted.
- Production Worker responses set CSP, HSTS, framing, MIME-sniffing, referrer, and browser-permission restrictions.

Before a public launch, configure platform-level rate limiting and retention rules appropriate to the expected traffic. Application request limits reduce abuse impact but do not replace edge-level controls.
