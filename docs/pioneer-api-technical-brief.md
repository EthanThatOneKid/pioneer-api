# Pioneer API — one-page technical brief

## Feasibility result

A deterministic six-feature fixture proves the core method: parse a UTF-16LE IWP file, convert supported point geometry into canonical units, render inspectable SVG and rasterized PNG, detect mismatched bubble numbers with Google Gemini through AI SDK, register observations into the renderer’s coordinate space, match features one-to-one, and rewrite only the selected IWP `(Name "...")` values.

The live synthetic run detected all six expected bubbles with zero missing and zero unexpected labels. The maximum leader-endpoint error was 2.56 pixels in the 1200×800 SVG canvas. The deterministic suite currently passes 9 tests with 28 assertions. This establishes feasibility, not production readiness.

## Proposed production boundary

- **Input:** authorized source IWP plus bubbled PDF/PNG, with machine/software metadata.
- **Parser/writer:** preserve UTF-16LE, BOM, CRLF, long lines, and untouched content; produce hashes and an audit manifest.
- **Renderer:** canonical-unit geometry rendered to SVG, then rasterized to PNG for vision input.
- **Registration:** estimate scale, translation, axis direction, rotation, crop/offset, and any required distortion; reject excessive residuals.
- **Vision:** structured bubble number, box, leader endpoint, and confidence output.
- **Deterministic gate:** global one-to-one assignment, ambiguity rejection, tolerance checks, human review, and only then a proposed relabeled IWP.
- **Provider:** Google Gemini only for synthetic proof. Real Pioneer data uses Pioneer-authorized Claude through GovCloud after approval.

## Required real-data validation

Before claiming production suitability, Pioneer must provide one approved real IWP/PDF-or-PNG pair and the expected mapping or a human-verifiable ground truth. The pilot must test feature coverage, registration residuals, false positives/negatives, leader endpoint accuracy, encoding preservation, output re-openability, auditability, security, and human acceptance. No production write-back should occur during this evaluation.
