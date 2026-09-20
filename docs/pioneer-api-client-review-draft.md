# Pioneer API — client review draft

**Prepared for:** Will Wollack / Pioneer Circuits
**Prepared by:** Ethan Davidson
**Status:** Discussion draft; not a contract, statement of work, or invoice

> Items marked **[FLAGGED]** are intentionally left open for Pioneer or Ethan to confirm. Items marked **[REDACTED]** are omitted from this review copy until the commercial and security decisions are settled.

## Purpose

This document summarizes a proposed, bounded engineering pilot for connecting Pioneer’s InSpec/IWP quality-program artifacts to a reviewable vision and matching workflow. The pilot is intended to determine whether an approved source `.iwp` file and its corresponding bubbled PDF/PNG can be used to produce reliable, auditable feature-to-bubble mappings and a safely relabeled IWP output.

The pilot is deliberately narrower than a production deployment. It does not promise production success, a throughput increase, machine control, or an accuracy guarantee before Pioneer approves a real evaluation pair and acceptance criteria.

## Proposed pilot

### Planned work

1. Confirm the machine, InSpec, Discus, file, network, and security boundaries.
2. Preserve the IWP format while parsing and writing the agreed feature subset.
3. Render canonical geometry for visual review.
4. Detect bubbled annotations through a structured vision interface.
5. Register the rendered geometry to the bubbled image and report assignments, residuals, confidence, and ambiguity.
6. Produce a relabeled IWP only after human review and an audit manifest.
7. Deliver an API contract, runbook, limitations, and recommendation for any production phase.

### Expected effort and pricing

- **Planning estimate:** 88 engineering hours.
- **Authorized ceiling:** **[REDACTED — commercial ceiling to be confirmed]**.
- **Billing rate:** **[REDACTED — rate to be confirmed before sending a formal quote]**.
- **Invoicing cadence:** **[FLAGGED — weekly or biweekly, subject to agreement]**.
- **Payment terms:** **[FLAGGED — Pioneer to confirm Net-15, Net-30, or another term]**.
- **Quote validity:** **[FLAGGED — Ethan to specify, e.g. 30 days]**.

The estimate is a planning boundary, not a promise that a production integration can be completed within that effort. Work beyond the agreed ceiling or outside the scope below would require written approval.

## Provider and security boundary

- The synthetic proof uses Google Gemini through the AI SDK.
- The contracted application is expected to use Pioneer-authorized Claude through Pioneer’s approved GovCloud boundary.
- No real Pioneer data should be sent to Google Gemini unless Pioneer separately authorizes that use in writing.
- Human review remains required before any generated IWP is used operationally.

**[FLAGGED — Pioneer to confirm]** the approved Claude endpoint/model, access process, network boundary, retention rules, logging requirements, and whether the evaluation environment may access any real or export-controlled data.

## Acceptance conditions to review

The pilot would be considered complete when Pioneer and Ethan agree that:

- the approved sample IWP is read and written without changing encoding, line endings, or non-target content;
- the agreed feature subset is rendered into a reviewable canonical image;
- the approved vision provider returns structured bubble observations;
- the matcher reports one-to-one assignments, transform residuals, confidence gates, and unresolved ambiguities;
- the rewritten IWP, audit manifest, and human-review report are produced; and
- Pioneer receives a recommendation for the next phase.

**[FLAGGED — Pioneer technical approver to confirm]** who accepts each milestone and whether Pioneer requires additional accuracy, latency, audit, or workflow tests.

## Pioneer confirmations requested

Please confirm or correct the following before a formal quote or contract is issued:

1. **Contracting entity and procurement contact:** **[REDACTED — Pioneer to provide the exact legal entity, billing address, procurement contact, and technical approver]**.
2. **NDA:** Pioneer indicated that an NDA is required. **[FLAGGED — confirm whether Pioneer will provide its form, whether it is mutual, and when it must be executed]**.
3. **Purchase order, vendor onboarding, and consulting agreement:** **[FLAGGED — confirm which documents and approvals are required before work begins]**.
4. **Billing terms:** **[FLAGGED — confirm Net-15, Net-30, or another payment term, plus invoice submission requirements]**.
5. **Access and security:** **[REDACTED — Pioneer to provide the approved access process and security requirements]**.
6. **Evaluation input:** **[REDACTED — Pioneer to provide one approved real or de-identified IWP/PDF-or-PNG pair]**.
7. **Start date and cadence:** **[FLAGGED — confirm target start date, meeting cadence, and escalation contact]**.
8. **Change control:** **[FLAGGED — confirm who may authorize additional hours or scope changes]**.

This document does not assume that government identification, citizenship verification, CMMC/NIST compliance work, ITAR authorization, or any other personnel or compliance requirement applies to Ethan. Those requirements should be listed only if Pioneer’s legal, procurement, security, or IT teams confirm them as applicable.

## Exclusions for this pilot

- Production deployment or 24/7 support.
- Machine-control commands or automated quality disposition.
- Full ERP, MES, QMS, or supply-chain implementation.
- Compliance certification or legal advice.
- Use of Pioneer or customer data outside the approved environment.
- Guaranteed production throughput or accuracy before real-data validation.
- Material work beyond the approved ceiling without written authorization.

## Review links

- **Technical feasibility report:** https://ethanthatonekid.github.io/pioneer-api/
  - **[FLAGGED — confirm after the GitHub Pages workflow is merged and live]**.
- **Source repository and review history:** https://github.com/EthanThatOneKid/pioneer-api

## Next approval gate

After Pioneer confirms the items above, Ethan can finalize the statement of work, commercial quote, acceptance criteria, and IP/data terms. Billable work should begin only after written authorization through the agreed contract, purchase order, or equivalent procurement approval.
