# Pioneer API — Billable Quote Draft

**Prepared:** September 18, 2026  
**Client:** Pioneer Circuits, Inc.  
**Project:** IWP-to-bubbled-image quality-AI integration pilot  
**Prepared by:** Ethan Davidson  
**Quote status:** Draft pending billing rate, currency, and commercial terms

## Proposed engagement

Design and implement a controlled, read-only proof-of-concept that connects Pioneer’s InSpec/IWP quality-program artifacts to a structured vision layer and produces auditable source-to-bubble mappings.

The engagement is intended to answer one practical question:

> Given an approved source `.iwp` file and its corresponding bubbled PDF/image, can the system reliably identify the bubble numbers, match them to the correct IWP features, and generate a reviewable relabeled IWP without changing measurement logic or corrupting the source format?

## Commercial positioning

This is a first engagement with credible follow-on potential. The problem is tied directly to Pioneer’s production bottleneck: manual cross-referencing between bubbled drawings, inspection priorities, and IWP feature labels. The pilot should therefore be priced as specialized engineering and validation work, not as a small OCR script, while remaining tightly bounded and reviewable.

The 88-hour estimate and authorization up to 100 hours are a fair pilot boundary because they cover discovery, proprietary-format handling, geometry/rendering work, model evaluation, registration risk, audit output, and handoff. The quote should not promise a production-ready system or guaranteed accuracy before an approved real pair is evaluated.

Recommended relationship treatment:

- Keep the normal professional billing rate rather than discounting the technical work because this is a first contract.
- If desired, offer a one-time credit against a separately authorized Phase 2 implementation after the pilot is accepted; do not make that credit part of the pilot’s technical scope.
- Do not use a success fee or production-throughput guarantee until Pioneer provides real data and the operational baseline is measurable.

## Deliverables

1. **Discovery and integration boundary**
   - machine/software interface inventory;
   - source-of-truth and data-ownership map;
   - security, network, retention, and approval constraints;
   - proposed API resource and event model.

2. **IWP processing layer**
   - UTF-16LE/CRLF-safe parser and writer;
   - canonical millimetre geometry model;
   - agreed feature subset and coordinate-system handling;
   - deterministic SVG/PNG rendering for review.

3. **Vision and matching layer**
   - AI SDK adapter using the approved Google Gemini model;
   - structured bubble numbers, boxes, leader endpoints, and confidence;
   - affine/projective registration and one-to-one geometric matching;
   - residual, ambiguity, and confidence gates.

4. **Controlled evaluation**
   - one approved real source-IWP/bubbled-image pair;
   - detected-bubble and proposed-mapping report;
   - rewritten IWP produced only after reviewable evidence;
   - audit manifest with input hashes, model metadata, transform, residuals, and decisions.

5. **Handoff**
   - API contract draft;
   - implementation notes and runbook;
   - limitations, follow-up backlog, and production-readiness recommendation.

## Estimated effort

| Work package | Estimated hours |
| --- | ---: |
| Discovery, interface inventory, and data contract | 12 |
| IWP parser, canonical geometry, and safe writer | 20 |
| Renderer and registration foundation | 24 |
| Gemini structured detection and evaluation harness | 20 |
| Approved-pair evaluation, audit output, and handoff | 12 |
| **Estimated total** | **88** |

**Commercial recommendation:** authorize up to **100 hours** for this pilot. Work beyond 100 hours, production integration, or material scope changes requires written approval before proceeding.

## Pricing

| Item | Formula | Amount |
| --- | --- | ---: |
| Pilot services | `88 hours × [BILLING RATE]` | `[TO BE COMPLETED]` |
| Contingency authorization | Up to `12 additional hours × [BILLING RATE]` | `[TO BE COMPLETED]` |
| **Estimated pilot fee** | `88–100 hours × [BILLING RATE]` | `[TO BE COMPLETED]` |

- **Billing currency:** `[USD or other currency]`
- **Billing rate:** `[hourly rate]`
- **Invoicing cadence:** `[weekly / biweekly / milestone]`
- **Payment terms:** `[net terms]`
- **Quote validity:** `[e.g. 30 days]`
- **Expenses:** No travel, third-party, or infrastructure expenses are included unless approved in writing.

## Assumptions

- Pioneer provides an approved, de-identified or otherwise authorized source-IWP/bubbled-image pair.
- Pioneer provides access to the relevant software and machine documentation needed for the agreed read-only evaluation.
- The first pilot uses Google Gemini through the AI SDK; model, quota, retention, and data-processing terms must be approved before real company data is submitted.
- The pilot does not control production equipment or write to Pioneer’s systems of record.
- Human review remains mandatory before a rewritten IWP is used operationally.
- Pioneer identifies the authoritative owners of quote, production, inventory, inspection, and quality records.

## Exclusions

This quote does not include:

- production deployment or 24/7 support;
- machine-control commands or automated quality disposition;
- full ERP/MES/QMS implementation;
- customer-facing portal development beyond the API contract;
- AS9102, AS9100, ITAR, or other compliance certification work;
- unrestricted handling of customer, export-controlled, or proprietary data;
- model fine-tuning or provider migration;
- guaranteed accuracy on drawings or feature types not included in the approved evaluation plan.

## Acceptance criteria

The pilot is complete when:

1. the agreed sample IWP is read and written without changing its encoding, line endings, or non-target content;
2. the agreed feature subset is rendered into a reviewable canonical image;
3. Gemini returns structured bubble observations for the approved image;
4. the matcher reports one-to-one assignments, transform residuals, and confidence gates;
5. the rewritten IWP, audit manifest, and human-review report are produced;
6. Pioneer receives a recommendation for the next production-integration phase.

## Authorization

**Client representative:** ______________________________  
**Signature:** _________________________________________  
**Date:** ______________________________________________

**Service provider:** Ethan Davidson  
**Signature:** _________________________________________  
**Date:** ______________________________________________
