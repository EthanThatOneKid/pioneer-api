# Pioneer API — information request checklist

**Status:** Bring to discovery and booking; mark only what Pioneer approves.

## Contract and contacts

- Legal entity, address, signer, procurement contact, billing contact.
- Technical owner, quality owner, Discus owner, machine operator, security/export-control contact.
- Approved NDA, data-processing terms, vendor-security questionnaire, insurance requirements.

## Machine and software

- Machine make/model, controller/software versions, installed InSpec/Discus versions, supported interfaces and licensing.
- Current workflow from source IWP to inspection, bubbled report, result storage, and operator approval.
- Existing APIs, file shares, databases, queues, webhooks, command-line tools, or vendor SDKs.
- Read-only test environment, sample logs, error codes, retry behavior, and rollback procedure.

## Files and geometry

- One approved source IWP plus corresponding bubbled PDF/PNG and expected mapping/ground truth.
- Additional redacted samples covering each required feature type, coordinate system, unit system, rotation, crop, scale, and leader style.
- IWP encoding, record conventions, program/group naming, versioning, and machine re-openability test procedure.
- Rules for preserving comments, formatting, unknown commands, signatures, and timestamps.

## Data and security

- Data classification, export-control/ITAR restrictions, customer restrictions, retention, deletion, and audit requirements.
- Approved GovCloud Claude endpoint/model, credential flow, logging/retention terms, network egress, and prompt/image handling policy.
- Whether any data may leave the facility; approved storage, VPN, secrets manager, and deployment environment.

## Acceptance and operations

- Required accuracy thresholds, confidence/ambiguity rules, human-review role, and acceptance approver.
- Required latency/throughput and concurrency targets.
- Required audit fields, monitoring, support window, deployment/rollback process, and handoff expectations.
- Definition of pilot success and explicit out-of-scope production requirements.
