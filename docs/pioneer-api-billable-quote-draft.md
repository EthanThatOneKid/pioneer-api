# Pioneer API — Billable Quote Draft

- Prepared: September 18, 2026
- Revised: October 2, 2026 — reduced to a fixed-price milestone schedule
- Client: Pioneer Circuits, Inc.
- Project: IWP-to-bubbled-image quality-AI integration pilot
- Prepared by: Ethan Davidson
- Quote status: Draft pending currency, payment terms, and quote validity

## Proposed engagement

Design and implement a controlled, read-only proof-of-concept that connects Pioneer’s InSpec/IWP quality-program artifacts to a structured vision layer and produces auditable source-to-bubble mappings.

The engagement is intended to answer one practical question:

> Given an approved source `.iwp` file and its corresponding bubbled PDF/image, can the system reliably identify the bubble numbers, match them to the correct IWP features, and generate a reviewable relabeled IWP without changing measurement logic or corrupting the source format?

## Commercial positioning

This is a first engagement with credible follow-on potential. The problem is tied directly to Pioneer’s production bottleneck: manual cross-referencing between bubbled drawings, inspection priorities, and IWP feature labels. The pilot should therefore be priced as specialized engineering and validation work, not as a small OCR script, while remaining tightly bounded and reviewable.

The pilot is offered as a **fixed-price, milestone-billed engagement at $8,500**, down from the original time-and-materials position of 88 hours at $175/hour ($15,400, with a $17,500 ceiling). The reduced total is a first-engagement accommodation: it prices the pilot against a nominal plan of about 74 hours at $115/hour, and it holds the work to the five milestone deliverables below.

The reduction lowers the price, not the technical answer the pilot must produce. Contingency work above the milestone scope — approved in-scope uncertainty or written change work — is billed at **$115/hour**, capped at **$1,500 (about 13 hours)** with written approval, for a **$10,000 not-to-exceed total**. Production integration, broader feature coverage, and any further Pioneer-specific provider work should be quoted separately at the standard professional rate once the pilot verdict is in. The quote should not promise a production-ready system or guaranteed accuracy before an approved real pair is evaluated.

Recommended relationship treatment:

- Price the pilot as a fixed-fee milestone schedule, and reserve the normal professional hourly rate for contingency, change orders, and Phase 2 implementation work.
- If desired, offer a one-time credit against a separately authorized Phase 2 implementation after the pilot is accepted; do not make that credit part of the pilot’s technical scope.
- Do not use a success fee or production-throughput guarantee until Pioneer provides real data and the operational baseline is measurable.

## Deliverables

1. **Discovery and integration boundary**
   - machine/software interface inventory;
   - source-of-truth and data-ownership map;
   - security, network, retention, and approval constraints;
   - proposed API resource and event model.

2. **IWP parser and safe writer**
   - UTF-16LE/CRLF-safe parser and writer;
   - canonical millimetre geometry model;
   - agreed feature subset and coordinate-system handling.

3. **Rendering and registration**
   - deterministic SVG/PNG rendering for review;
   - rasterized PNG input for vision inference, with SVG retained as the inspectable vector artifact;
   - source-to-image registration for the agreed feature subset, reported with residuals.

4. **Vision and matching**
   - AI SDK provider abstraction with Google Gemini for the synthetic proof and Pioneer-provided Claude through GovCloud as the contracted application target;
   - structured bubble numbers, boxes, leader endpoints, and confidence;
   - affine/projective registration and one-to-one geometric matching;
   - residual, ambiguity, and confidence gates.

5. **Evaluation and handoff**
   - one approved real source-IWP/bubbled-image pair;
   - detected-bubble and proposed-mapping report;
   - rewritten IWP produced only after reviewable evidence;
   - audit manifest with input hashes, model metadata, transform, residuals, and decisions;
   - API contract draft, implementation notes and runbook, limitations, follow-up backlog, and production-readiness recommendation.

## Milestone payment schedule

The pilot is billed as five fixed payments, each released when its deliverable is accepted. Hours worked are not the billing basis for the milestones.

| Milestone | Deliverable that triggers payment | Payment |
| --- | --- | ---: |
| 1. Discovery | Interface inventory, data ownership map, security constraints and draft API model | **$1,155** |
| 2. IWP parser | Sample IWP round-trips with no change to encoding, line endings or non-target content | **$1,935** |
| 3. Rendering and registration | Feature subset rendered into a reviewable canonical image, registration working | **$2,320** |
| 4. Vision and matching | Structured bubble observations; one-to-one matches with residuals and confidence gates | **$1,935** |
| 5. Evaluation and handoff | Rewritten IWP, audit manifest, review report, API contract, runbook, Phase 2 recommendation | **$1,155** |
| **Pilot total** | | **$8,500** |
| Contingency | Up to $115/hour (about 13 hours), written approval required | Up to **$1,500** |
| **Not-to-exceed** | Pilot total plus contingency | **$10,000** |

**Commercial position:** quote the pilot at **$8,500 fixed**, payable per accepted milestone, with contingency up to **$1,500** and a **$10,000 not-to-exceed ceiling**. This schedule replaces the earlier 88-hour / $175-hour time-and-materials quote; the $8,500 corresponds to roughly 74 hours at the $115/hour rate used for contingency and approved additional work.

**Phase 2:** production integration, broader feature coverage, and deployment support are out of this quote and should be estimated at the standard professional rate after the pilot verdict.

- Billing currency: `USD`
- Pilot fee: `$8,500 fixed, invoiced per accepted milestone`
- Contingency and approved additional work: `$115/hour; up to 13 hours / $1,500 with written approval`
- Not-to-exceed: `$10,000`
- Invoicing cadence: `on acceptance of each milestone`
- Payment terms: `[net terms]`
- Quote validity: `[e.g. 30 days]`
- Expenses: No travel, third-party, or infrastructure expenses are included unless approved in writing.

The milestone payments are the contract basis. Any hours figure in this document is a planning note, not a basis for recomputing the fee.

## Assumptions

- Pioneer provides an approved, de-identified or otherwise authorized source-IWP/bubbled-image pair.
- Pioneer provides access to the relevant software and machine documentation needed for the agreed read-only evaluation.
- The synthetic proof uses Google Gemini through the AI SDK. The contracted application target is Pioneer-provided Claude access through GovCloud; real company data will use that approved environment rather than the free Gemini path.
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
- alternative-provider support or model fine-tuning outside the approved Pioneer GovCloud Claude integration;
- guaranteed accuracy on drawings or feature types not included in the approved evaluation plan.

## Acceptance criteria

The pilot is complete when:

1. the agreed sample IWP is read and written without changing its encoding, line endings, or non-target content;
2. the agreed feature subset is rendered into a reviewable canonical image;
3. the approved vision provider returns structured bubble observations for the approved image;
4. the matcher reports one-to-one assignments, transform residuals, and confidence gates;
5. the rewritten IWP, audit manifest, and human-review report are produced;
6. Pioneer receives a recommendation for the next production-integration phase.

Acceptance of each milestone deliverable releases that milestone’s payment. Corrections to a defect inside an accepted milestone’s scope are included in the fee; new features, new systems, new geometries, new environments, or production deployment require a written change order priced at $115/hour inside the contingency, and beyond it only with a signed change order.

## Authorization

- Client representative: ______________________________
- Signature: _________________________________________
- Date: ______________________________________________

- Service provider: Ethan Davidson
- Signature: _________________________________________
- Date: ______________________________________________
