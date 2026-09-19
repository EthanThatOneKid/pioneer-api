# Pioneer API — Statement of Work draft

**Status:** Draft for negotiation; not legal advice.

## 1. Parties and purpose

This Statement of Work is between **Pioneer Circuits, Inc.** (Client) and **Ethan Davidson** (Contractor). It defines a time-bounded pilot to evaluate and implement a controlled API/integration boundary for the agreed machine and Discus software workflow.

## 2. Objectives

The pilot will determine whether an approved source IWP program and corresponding bubbled PDF/PNG can be rendered, registered, interpreted, reviewed, and safely transformed into a relabeled IWP while preserving the source program’s required structure and auditability. The pilot will also define the integration boundary, data contract, security requirements, and production-readiness gaps.

## 3. Scope and deliverables

1. **Discovery and integration boundary** — review the approved machine/software interfaces, Discus workflow, IWP samples, output artifacts, network constraints, and system-of-record boundaries.
2. **IWP parser and safe writer** — extend the UTF-16LE/CRLF-safe parser and writer for the agreed feature subset; preserve untouched content; produce a before/after audit manifest.
3. **Renderer and registration** — extend the deterministic canonical-unit renderer and estimate the source-to-image transform for the approved feature subset; emit inspectable SVG and rasterized PNG review artifacts.
4. **Vision detection and evaluation** — use the approved vision provider to detect bubble numbers, boxes, and leader endpoints; validate structured observations against deterministic geometry and ambiguity gates.
5. **Real-pair evaluation, audit, and handoff** — run the read-only evaluation on one approved real pair, document results and limitations, provide the proposed relabeled IWP, and hand off the implementation notes and runbook.

## 4. Deliverables

- Technical brief and architecture diagram.
- Agreed API/data-boundary draft.
- Supported-feature IWP parser/writer and deterministic renderer.
- Vision adapter for the approved provider and structured output schema.
- Reviewable SVG/PNG artifacts and comparison report.
- Audit manifest recording source hashes, model/provider, prompt/schema version, transform, residuals, mappings, and output hash.
- Real-pair evaluation result, subject to receiving the approved pair.
- Implementation notes, runbook, limitations, and production recommendation.

## 5. Assumptions and exclusions

- Pioneer supplies one authorized real pair and the necessary machine, Discus, and output documentation.
- The pilot is read-only against Pioneer production systems unless separately approved.
- Production deployment, machine write-back, broad geometry coverage, customer-facing API launch, ERP/MES/QMS integration, 24/7 support, and guaranteed throughput improvements are excluded unless added by change order.
- The quote is conditional on real-pair validation and does not promise production success.

## 6. Schedule and acceptance

The parties will use the milestone schedule in `pioneer-api-acceptance-and-commercial-terms.md`. A milestone is accepted when the named artifacts are delivered and the Client approver either signs acceptance or does not identify a material nonconformance within the agreed review period. Rejected work receives a documented correction cycle within the remaining authorized hours; new requirements use a change order.

## 7. Fees and changes

Fees, invoicing, the $175/hour rate, the 88-hour planned estimate, the 12-hour authorized contingency, and the $17,500 ceiling are defined in the billable quote and commercial-terms draft. No work above the ceiling or outside scope begins without written approval.

## 8. Ownership and confidentiality

The parties will execute the IP/data terms and redline before Pioneer supplies proprietary files. Pioneer will own the machine- and Discus-specific deliverables identified in the agreement. Contractor retains reusable background technology, general know-how, generic libraries, and independently developed tools, granting Pioneer the agreed license necessary to use the deliverables.

## 9. Independent contractor and termination

Contractor acts as an independent contractor, controls the means and manner of performing the work, supplies ordinary tools, and is responsible for applicable taxes and insurance. Either party may terminate on written notice; Pioneer pays for accepted work and authorized time incurred through termination, plus approved non-cancellable expenses.
