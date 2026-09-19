# pioneer-api

API integration exploration for a quality AI automation machine and its supporting software.

## Discovery visit

- **Time:** Thursday at 10:30 AM
- **Purpose:** Evaluate the existing machine and software systems, then determine how to build the API connection.
- **Program:** Quality AI program (meeting notes say “ES 9102”)
- **Team:** Alberto, Clay, and Travis
- **Need:** Technical support designing and building the API because the team does not have the required software background.

## Pioneer Circuits context

The Pioneer relevant to this project appears to be **Pioneer Circuits, Inc.**, a privately held U.S. printed circuit board assembly manufacturer founded in 1981. Its public materials describe work across defense, aviation, near-Earth orbit, and space exploration, with products and services spanning flex, rigid-flex, extended-length flex, and rigid PCBs/PCBAs.

### Quality and traceability

- Pioneer publicly lists AS9100D, ISO 9001:2015, NADCAP Electronics AC7119, IPC-A-610, NASA 8739.1–.4, and DDTC/ITAR registration among its certifications, standards, and registrations.
- Its published purchasing terms require suppliers to maintain an acceptable quality system, with ISO 9001 or MIL-I-45208 as a minimum supplier inspection-system baseline.
- The same terms call for certificates of conformance and applicable test records with shipments. They state that general records should be retained for at least 10 years and AS9102 or First Article Inspection reports for 99 years; nonconforming products must be reported to Pioneer’s Purchasing and Quality Assurance departments.
- The discussion refers to “ES 9102.” Pioneer’s public materials use **AS9102** for First Article Inspection Reports, so the exact internal program name, scope, and workflow should be confirmed during discovery.

### API discovery implications

The public context suggests that any integration may need to preserve traceability across design, manufacturing, inspection, quality records, and nonconformance workflows. This is a discovery hypothesis, not a confirmed system design. Before implementation, document the machine protocol, source-of-truth systems, data model, authentication and network boundaries, event timing, audit requirements, and record-retention rules.

No public source reviewed here confirms the internal quality-AI program or the machine/software interfaces. Those details should be gathered on site before choosing an API contract.

## Likely subject, goal, and responsibility of pioneer-api

> **Working definition:** pioneer-api should be a secure, auditable integration API that moves validated design/quote, production/quality, and material/traceability data between Pioneer and authorized customer or internal systems. It should not independently disposition quality results or replace the ERP, MES, QMS, or other system of record.

### Subject

The most likely subject is a secure integration boundary around Pioneer’s customer, engineering, manufacturing, quality, and supply-chain systems—not the quality-AI model by itself.

### Goal

The likely goal is to turn controlled manufacturing data and workflows into usable, auditable APIs for three audiences:

1. **Customers and design software:** submit design and manufacturing inputs, request quotes, and receive quote progress or results.
2. **Production and quality teams:** expose board, order, traveler, inspection, test, and nonconformance status in near real time.
3. **Purchasing and supply chain:** track material availability, receipts, lots, certifications, shortages, and supplier-related changes.

This is supported by Pioneer’s public RFQ flow, its engineering focus on concurrent design reviews and manufacturing-readiness reviews, its assembly traveler and pre-assembly material-verification workflows, and its quality and supplier record requirements.

### Responsibility

The first responsibility of pioneer-api should be **reliable orchestration and translation** between external software and Pioneer’s internal systems. That means validating inputs, mapping identifiers and statuses, routing work to the correct system, exposing asynchronous job state, preserving provenance and audit history, and enforcing customer, export-control, and quality-data boundaries.

Pioneer’s published supplier terms also require positive control over the configuration, validation, and program integrity of models, NC programs, test programs, inspection software, and software delivered in product. Any quality-AI machine integration therefore needs versioned artifacts, explicit validation state, and human-auditable records rather than an opaque prediction endpoint.

A reasonable initial resource model to validate on site would include `customers`, `quote-requests`, `design-packages`, `orders`, `boards`, `production-runs`, `materials`, `lots`, `inspections`, `test-results`, and `nonconformances`. The API should read from or coordinate existing systems rather than become a second system of record until those boundaries are understood.

### Priority hypothesis

1. **Design intake and quote automation** is the strongest first use case: Pioneer already exposes an RFQ upload flow and emphasizes early design review and manufacturability review.
2. **Production and quality status** is the strongest operational use case: Pioneer publicly describes traveler-based workflow, material verification, electrical testing, and end-to-end quality assurance.
3. **Supply-chain and raw-material traceability** is a strong adjacent use case: the published terms cover material authenticity, certificates, shelf life, supplier changes, flow-down requirements, and long-lived quality records.
4. **Quality-AI integration** is likely the enabling machine interface: its outputs should become traceable inspection or decision records, not unreviewed autonomous dispositions.

This prioritization is an informed hypothesis. The site visit should confirm which system owns quotes, production status, inventory, inspection results, and AS9102/FAI records, plus whether the API is intended for customer-facing integrations, internal automation, or both.

## IWP bubbled-label proof

The first proof-of-concept reads a UTF-16LE `.iwp` program and a corresponding bubbled image. It extracts numeric bubble labels with Tesseract TSV output, validates a proposed source-to-bubble mapping, and writes a new `.iwp` with only the selected `(Name "...")` values replaced. The output preserves the UTF-16LE BOM, long lines, and CRLF line endings.

The IWP program name is treated as the grouping boundary. Use `--group` when a file contains more than one named program. Mapping entries can constrain the group and feature type:

```json
[
  {"group":"Hole group","recordType":"Pnt","from":"17","to":"101"}
]
```

Run it with an image:

```sh
bun run src/cli.ts --iwp input.iwp --image bubbled.png --mapping mapping.json --output relabeled.iwp
```

For deterministic tests without an OCR installation, replace `--image` with `--bubble-tsv` using Tesseract TSV output. The mapping is explicit in this first proof rather than guessed: an image tells us which numbers are visible, but not by itself which arbitrary IWP feature each number denotes. The pipeline rejects missing, ambiguous, duplicate, or image-invisible mappings instead of silently rewriting a measurement program.

Current limitations are intentional: the proof does not yet infer geometric correspondence between a drawing and IWP feature coordinates, interpret every InSpec command, or verify that a rewritten program runs on a machine. Those are the next validation layers after the label-rewrite invariant is established.

## Deterministic six-feature fixture

The next layer is now implemented in `src/geometry.ts`, `src/render.ts`, and `src/pipeline.ts`. The renderer converts the supported IWP point geometry into a deterministic SVG coordinate space. The matcher then applies an explicit affine transform—translation, scale, axis direction, and rotation are all represented—and performs a one-to-one nearest-feature match within a hard tolerance. Source coordinates are normalized to millimetres before the image transform, so unit conversion is separate from drawing registration.

`tests/fixture.e2e.test.ts` is the first end-to-end proof. It creates six UTF-16LE IWP point features with arbitrary names, converts inch coordinates to millimetres, renders source and bubbled SVGs, applies offsets and scaling, assigns six different bubble numbers, shuffles the OCR observations, matches all six bubbles by geometry rather than array order, and rewrites all six names while preserving the IWP envelope. It passes deterministically with no model call and no OCR dependency:

```sh
bun test
```

The image number intentionally does not match the IWP name. The fixture's known transform is only test setup; the matcher receives feature coordinates and bubble boxes, then derives the source-name-to-bubble-number mapping from their positions. The production image path still needs a registration stage to estimate that transform and an AI SDK observation adapter to return structured bubble boxes, numbers, leader endpoints, and confidence. The model must not directly decide the rewrite: the deterministic layer verifies one-to-one assignments, residuals, tolerances, and ambiguity before replacing `(Name "...")` values.

The current renderer intentionally supports only point anchors. Extending it to lines, circles, arcs, slots, and other InSpec geometry should reuse the same canonical-units and affine-registration contract rather than allowing each feature type to invent its own coordinate rules.

## Technical direction

- TypeScript
- Bun-first, Node-compatible runtime
- Hono
- `@hono/zod-openapi` for request validation and OpenAPI generation
- Google AIP-aligned resource naming, methods, pagination, and error conventions

## Sources

- [Pioneer Circuits — Who We Are](https://www.pioneercircuits.com/who-we-are)
- [Pioneer Circuits — Certifications and Recognition](https://www.pioneercircuits.com/company/certifications-and-recognition)
- [Pioneer Circuits — PCBA Manufacturing](https://www.pioneercircuits.com/capabilities/pcba-manufacturing)
- [Pioneer Circuits — Purchase Order Terms and Conditions](https://www.pioneercircuits.com/pcba-manufacturing-terms-conditions)
- [Pioneer Circuits — Request for Quote](https://www.pioneercircuits.com/capabilities/rfq)
- [Pioneer Circuits — PCB Engineering](https://www.pioneercircuits.com/capabilities/pcb-engineering)
- [Pioneer Circuits — Printed Circuit Board Assembly](https://www.pioneercircuits.com/capabilities/printed-circuit-board-assembly)
