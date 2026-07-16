# Privacy and data handling

## Data collected when a design is saved

- Device, case color, and finish identifiers
- Versioned layer and print specification
- Uploaded source images and generated print PNG
- Production reference and timestamps
- Customer name when an unlisted share link is requested

## Phone numbers

The studio asks for an Indian mobile number only to build the user-initiated WhatsApp share target. The current client keeps that value in React state, does not include it in the API request, and does not write it to browser storage. The server retains a nullable legacy schema column for backward compatibility but always writes `NULL` for new designs.

## Share-link visibility

A share link is unlisted, not private. It has a high-entropy identifier and is marked `noindex`, but anyone who obtains the URL can view the design and its source artwork. Do not use share links for confidential or regulated content.

## Retention and deletion

This repository does not impose a universal retention period because operators have different legal and manufacturing requirements. Before launch, the operator must document a retention window, configure R2/D1 cleanup, and provide a deletion contact or workflow. Deletion must remove the design row, print asset, and any source asset not referenced by another retained design.

## Operator responsibilities

Publish an operator-specific privacy notice before collecting public submissions. Configure regional, access, backup, deletion, and incident-response policies for D1/R2. Do not add analytics, tracking, or customer messaging without updating this document and obtaining any required consent.
