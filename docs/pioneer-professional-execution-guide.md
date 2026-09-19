# Pioneer Circuits — Professional Execution Guide

**Status:** Working draft for internal review; not approved for external circulation or production use

| Field | Value |
| --- | --- |
| Document owner | Ethan Davidson |
| Version | 0.2 |
| Review date | 2026-09-19 |
| Approval owner | Pioneer-appointed technical approver, with Pioneer legal, procurement, security, and IT review |
| Related issue | [#5 — correct execution guide before first Pioneer use](https://github.com/EthanThatOneKid/pioneer-api/issues/5) |

## Purpose and use

This guide is an execution checklist for the proposed Pioneer API pilot. It separates what the current proof demonstrates from what Pioneer must confirm, approve, or provide. It is not a contract, compliance attestation, security authorization, production-readiness statement, or legal advice.

Before this guide is shared externally or used to authorize work, Pioneer must review the scope, acceptance criteria, data handling, AI-provider boundary, ownership terms, and commercial terms through its legal, procurement, security, and IT processes.

## Executive proof-of-concept summary

### Current conclusion

**POC feasibility demonstrated; real Pioneer workflow and acceptance criteria pending confirmation.**

The current proof establishes a narrow technical path:

- A deterministic six-feature synthetic IWP fixture preserves UTF-16LE encoding, BOM, CRLF line endings, and non-target content while replacing selected feature names.
- The renderer produces an inspectable SVG and rasterized PNG from the supported point-feature subset.
- Registration and one-to-one matching use canonical units, an explicit transform, residuals, tolerances, and ambiguity checks.
- A live Google Gemini run through the AI SDK returned structured observations for all six synthetic bubbles. The run used the synthetic PNG only; it is not evidence from Pioneer data or a production machine.

The proof does **not** establish a measured production-time reduction, compatibility with Pioneer hardware or Discus software, a production tracking integration, a security authorization, or a throughput guarantee. No percentage result is claimed until Pioneer approves a real baseline and measurement method.

### Evidence and non-evidence

| Statement | Status |
| --- | --- |
| Supported IWP parsing, safe rewriting, deterministic rendering, and geometry matching work on the six-feature synthetic fixture. | Demonstrated in the repository test suite |
| Gemini can return structured bubble observations for the synthetic raster image. | Demonstrated in a live evaluation run |
| The real Pioneer machine/software workflow is understood. | Pending Pioneer discovery |
| The solution is compatible with Pioneer hardware, Discus, or production tracking. | Not evaluated |
| CMMC, NIST, ITAR, or other Pioneer security/compliance controls are satisfied. | Not assessed; requires Pioneer review |
| The solution reduces production processing time by a known percentage. | Not measured |

## Security and compliance readiness

The following distinction applies throughout the engagement:

| Category | Current position |
| --- | --- |
| Completed controls | Repository work avoids committing secrets; the proof uses deterministic validation and human review before rewriting an IWP. These are project practices, not a Pioneer security authorization. |
| Proposed controls | Least-privilege access, encrypted approved storage and transport, audit logging, retention/deletion rules, read-only system access, and use of Pioneer-authorized Claude through its GovCloud boundary for real data. |
| Pioneer decisions required | CMMC/NIST applicability, ITAR/export-control handling, approved network path, identity and access requirements, logging destination, retention period, incident process, and security approval owner. |

Gemini is limited to the synthetic proof. The contracted application is expected to use Pioneer-authorized Claude through the approved GovCloud boundary. No real Pioneer or customer data should be sent to the Gemini proof path.

Personnel identification and citizenship verification belong in a **Pioneer-approved onboarding checklist only if Pioneer’s procurement, security, or export-control process requires them**. They are not universal prerequisites asserted by this guide.

## Scope and execution phases

```text
Phase 1: POC feasibility demonstration
    |
    v
Phase 2: Core development and approved integration
    |
    v
Phase 3: Security and performance review
    |
    v
Phase 4: Deployment and handoff
```

### Phase 1 — POC feasibility demonstration

**Status: Demonstrated only for the synthetic fixture; not complete for Pioneer’s real workflow.**

- Establish the approved source-IWP and bubbled-image pair.
- Confirm the supported IWP command and geometry subset.
- Demonstrate safe parsing, rendering, structured detection, registration, matching, and reviewable relabeling.
- Record evidence, model/provider metadata, transform, residuals, mappings, and output hashes.

### Phase 2 — Core development and approved integration

**Status: Proposed; requires an approved SOW, real sample, system owner, and interface documentation.**

- Extend the parser and renderer only for agreed features.
- Define the API contract and source-of-truth boundaries.
- Add robust error handling, audit records, and approved interfaces.
- Keep the pilot read-only unless Pioneer approves a separate write-back scope.

### Phase 3 — Security and performance review

**Status: Proposed; requires Pioneer security and IT participation.**

- Review the approved provider, GovCloud boundary, network path, identity model, data retention, and deletion process.
- Stress-test only against an approved representative workload.
- Establish a production baseline before claiming latency or throughput improvement.

### Phase 4 — Deployment and handoff

**Status: Proposed; requires Pioneer approval.**

- Deploy only into an approved local or hosted environment.
- Deliver developer documentation, operator guidance, runbook, audit schema, and rollback procedure.
- Obtain technical, security, IT, procurement, and legal approvals required for the chosen deployment.

## Explicit technical acceptance tests

The final acceptance matrix must be agreed with Pioneer before real-data evaluation. The proposed tests are:

1. Read and write the approved IWP without changing encoding, BOM, line endings, or non-target content.
2. Render the agreed feature subset into inspectable SVG and rasterized PNG artifacts.
3. Obtain structured bubble observations from the Pioneer-approved vision provider.
4. Estimate and record the source-to-image transform, units, residuals, tolerance, and registration method.
5. Produce one-to-one feature assignments with no unexplained duplicate, missing, or ambiguous matches.
6. Require human review before producing an operationally usable relabeled IWP.
7. Produce an audit manifest containing input/output hashes, provider/model metadata, schema or prompt version, transform, residuals, mappings, and reviewer decisions.
8. Evaluate one approved real pair and report failures or unsupported geometry instead of silently rewriting it.
9. Confirm the approved machine/software workflow can consume the output, if machine execution is included in the signed scope. This is currently unverified.

Pioneer must approve the numeric tolerances, confidence gates, supported feature types, reviewer, and pass/fail authority before these tests become contractual acceptance criteria.

## Assumptions and exclusions

### Assumptions

- Pioneer supplies one authorized real `.iwp` and corresponding bubbled PDF/PNG pair.
- Pioneer identifies the machine, InSpec/IWP, Discus, production, and quality-system owners.
- Pioneer provides the documentation and access necessary for a read-only evaluation.
- Pioneer identifies the approved Claude/GovCloud endpoint, model, network path, and data-handling rules.
- Human review remains mandatory before operational use.

### Exclusions unless added by written change control

- Production deployment or 24/7 support.
- Machine-control commands, automatic quality disposition, or unattended write-back.
- Full ERP/MES/QMS implementation.
- Customer-facing portal development beyond the agreed API contract.
- Compliance certification, CMMC assessment, NIST assessment, or ITAR/export-control legal advice.
- Guaranteed throughput improvement or processing-time reduction.
- Unsupported IWP commands, geometry types, drawing conventions, or environments.

## Change control and escalation

Any change to inputs, supported feature types, provider, network boundary, deliverables, schedule, acceptance tests, data handling, ownership, or authorized hours must be recorded in a written change order before work begins. The change order must state the reason, additional hours and ceiling, schedule impact, acceptance criteria, IP/data impact, and required approvals.

Technical, security, legal, procurement, or scope blockers should be raised immediately to the named Pioneer technical owner and approval owner. Lower-priority work may be parked to stay within the authorized ceiling.

## Communication and approvals

The reporting cadence, recipients, and technical approver are open decisions. Before kickoff, Pioneer should name:

- one technical owner;
- one acceptance approver;
- legal/procurement contact;
- security/IT contact;
- invoice and purchase-order contact; and
- the agreed status-update day and channel.

No external circulation or production use is authorized by this draft. Final approval requires review by Pioneer legal, procurement, security, and IT, plus acceptance of the technical scope by the designated Pioneer approver.

## Related working documents

- [Booking packet](pioneer-api-booking-packet.md)
- [Statement of Work draft](pioneer-api-statement-of-work-draft.md)
- [Billable quote draft](pioneer-api-billable-quote-draft.md)
- [Acceptance and commercial terms](pioneer-api-acceptance-and-commercial-terms.md)
- [IP and data terms draft](pioneer-api-ip-and-data-terms-draft.md)
- [IP ownership redline](pioneer-api-ip-ownership-redline.md)
- [Vendor onboarding checklist](pioneer-api-vendor-onboarding-checklist.md)
- [Information request checklist](pioneer-api-information-request-checklist.md)
- [Technical brief](pioneer-api-technical-brief.md)
- [Feasibility report](pioneer-api-feasibility-report.md)