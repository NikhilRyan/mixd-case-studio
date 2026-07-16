# Architecture

## Runtime

MIXD. is a single Cloudflare Worker application compiled by vinext. React renders the homepage, studio, and share pages. The application deliberately keeps the domain small: device catalogue and design validation are framework-independent modules, while route handlers adapt validated values to D1 and R2.

## Components

| Area | Responsibility |
| --- | --- |
| `app/home/` | Product homepage |
| `app/studio/` | Catalogue, editor state, 3D preview, validation, and print generation |
| `app/api/assets/` | Validated source/print upload and immutable source delivery |
| `app/api/designs/` | Idempotent design persistence and production references |
| `app/d/[shareId]/` | Exact unlisted design replay |
| `db/` and `drizzle/` | D1 schema, compatibility initialization, and migrations |
| `lib/` | Small framework-independent HTTP, image, and concurrency helpers |
| `worker/` | Cloudflare entry point, image optimization, and production security headers |

## Save and share flow

1. The browser validates and uploads each unique source file to R2 through `/api/assets`.
2. The browser renders a transparent production PNG from the same layer specification and uploads it as a print asset.
3. `/api/designs` validates the complete specification, confirms every referenced key exists with the expected purpose, and inserts the design.
4. A browser-generated submission UUID makes retries idempotent. A unique D1 index prevents duplicate designs during concurrent retries.
5. If sharing was requested, the response includes `/d/<share-id>`. The shared page validates stored JSON again before rendering it.

## Consistency boundaries

R2 and D1 do not provide a shared transaction. Asset upload compensates for a failed D1 insert by deleting the newly written R2 object. A completed asset can remain orphaned when the user abandons a design; production operations should apply an age-based cleanup policy only after confirming that the key is unreferenced.

Design rows are written only after all asset records exist. The final print PNG is therefore a stable manufacturing artifact, while the versioned JSON plus source files preserves editability and exact shared replay.

## Compatibility

Stored design version 1 remains readable. Version 2 adds the universal pixel size, transparent sRGB contract, safe-area fractions, and camera style. New schema fields are nullable and additive so older databases and clients continue to work during rollout.

## Trust boundaries

The browser is untrusted. Route handlers revalidate identifiers, design geometry, catalogue values, object-key shapes, upload size, MIME type, and file signature. Client-side checks exist for feedback and performance, not authorization or integrity.
