# Pioneer API — IWP-to-Bubbled-Image Feasibility Report

**Prepared:** September 18, 2026  
**Prepared for:** Pioneer Circuits, Inc.  
**Prepared by:** Ethan Davidson  
**Status:** Feasibility demonstrated; controlled pilot recommended

## Executive summary

Pioneer API is technically feasible as a secure, read-only integration layer between Pioneer’s customer, engineering, manufacturing, quality, and supply-chain systems.

The most immediate proof target is the quality workflow: take an InSpec Classic `.iwp` inspection program and a corresponding bubbled PDF/image, identify the numbered bubbles, match those numbers to the source features by geometry, and produce a byte-preserving IWP copy in which the original feature names are replaced with the bubble numbers.

The proof completed so far supports that methodology. It does not yet claim production readiness or validation against Pioneer’s real files.

## Why this appears relevant to Pioneer

Pioneer Circuits publicly describes itself as a U.S. PCBA manufacturer founded in 1981, serving defense, aviation, near-Earth orbit, and space-exploration programs. Its public capabilities span engineering, manufacturing, assembly, inspection, and quality assurance.[^1]

Pioneer’s public purchasing terms also emphasize long-lived quality records, certificates of conformance, test records, supplier quality controls, software configuration control, nonconformance reporting, and AS9102/FAI retention.[^2] That makes an auditable, provenance-preserving integration more appropriate than an opaque model-only endpoint.

The broader API opportunity includes:

- design-package intake and quote automation;
- production and quality-status visibility;
- material, lot, certificate, and supplier-change traceability;
- controlled integration of quality-AI observations into inspection records.

## Feasibility evidence

### Official IWP references

Micro-Vu’s public validation package includes `Validation 1.iwp`, `Validation 2.iwp`, and IQ/OQ validation PDFs. The OQ report describes running the programs and comparing exported measurement results against expected feature values.[^3]

Micro-Vu’s official IWP editing guidance confirms that the files are UTF-16LE text with CRLF line endings and very long lines, and documents editing command forms such as `AutoRptPrn`.[^4]

### Deterministic six-feature proof

The fixture contains six source point features with arbitrary names:

| Source name | Source coordinate | Bubble number |
| --- | ---: | ---: |
| `A17` | `(0.4, 0.4)` in | `705` |
| `A18` | `(1.2, 0.4)` in | `102` |
| `A19` | `(2.0, 0.4)` in | `991` |
| `A20` | `(0.4, 1.2)` in | `314` |
| `A21` | `(1.2, 1.2)` in | `808` |
| `A22` | `(2.0, 1.2)` in | `127` |

The bubble numbers deliberately do not match the IWP names. The fixture converts inches to millimetres, renders source geometry, applies image-space scaling and offsets, offsets the bubble circles from their leader endpoints, shuffles the observation order, and derives the mapping geometrically.

The current suite passes **7 tests with 26 assertions**. The deterministic proof verifies:

- UTF-16LE/BOM/CRLF preservation;
- source-name extraction and replacement;
- unit normalization;
- affine image transforms;
- bubble leader endpoints;
- shuffled observations;
- one-to-one matching;
- malformed structured-output rejection;
- SVG source, bubble, match, and final-label layers.

### Live Gemini observation evaluation

Google Gemini 3.6 Flash was called through the AI SDK against the generated six-feature bubbled PNG. The structured detector returned:

| Measure | Result |
| --- | ---: |
| Expected bubbles | 6 |
| Returned bubbles | 6 |
| Missing numbers | 0 |
| Unexpected numbers | 0 |
| Maximum leader-endpoint error | 3.84 px |
| Total tokens | 3,206 |
| Result | Passed |

This demonstrates that the model-backed observation layer can feed the deterministic matcher on a controlled image. It is not yet evidence of real-world accuracy: the fixture is clean, synthetic, known in advance, and contains only point features.

## Proposed pilot scope

The recommended initial engagement is a controlled, read-only feasibility and integration pilot:

1. Inventory Pioneer’s current machine, InSpec, quality, ERP/MES/QMS, and customer-interface boundaries.
2. Extend the IWP parser for the agreed feature subset, including `Sys`, `PCS`, and `Nom` transforms.
3. Extend the deterministic renderer to lines, circles, arcs, rectangles, slots, ellipses, splines, and selected projected 3D features.
4. Add Gemini structured bubble detection through the AI SDK.
5. Estimate affine or projective registration from rendered geometry and bubbled-image evidence.
6. Evaluate against one controlled, approved real pair of source IWP and bubbled PDF/image.
7. Produce a rewritten IWP, match manifest, residual report, and human-review result.
8. Document the proposed API contract for later quote, production-status, supply-chain, and quality-system integrations.

## Safety and acceptance boundaries

The pilot should:

- preserve the original IWP unchanged;
- operate read-only against machine and quality systems;
- fail closed on missing, duplicate, ambiguous, or high-residual matches;
- retain source/image hashes and model metadata;
- require human approval before any rewritten IWP is used operationally;
- avoid customer-sensitive or export-controlled data until Pioneer authorizes the handling boundary.

The pilot should not:

- make autonomous quality dispositions;
- write to production equipment;
- replace Pioneer’s ERP, MES, QMS, or inspection system of record;
- claim AS9102 compliance certification;
- use free-tier model inference for restricted customer data without an approved data-handling decision.

## Confidence statement

**Current confidence:** high that the core IWP-to-bubble relabeling mechanism is mechanically feasible; medium that the proposed registration and vision approach will generalize to real Pioneer drawings; low until one approved real pair is evaluated for production-grade accuracy.

The next decisive evidence is one controlled real source-IWP/bubbled-image pair. The pilot should produce quantitative precision, recall, residual, and rewrite-fidelity results before any automatic workflow is enabled.

## References

[^1]: https://www.pioneercircuits.com/who-we-are
[^2]: https://www.pioneercircuits.com/pcba-manufacturing-terms-conditions
[^3]: https://microvu.atlassian.net/wiki/spaces/SRV/pages/2155282433/InSpec+Classic+Software+Validation+Guidelines
[^4]: https://microvu.atlassian.net/wiki/spaces/SRV/pages/3807510531/Changing+Printer+Name+in+Multiple+IWP+Files
