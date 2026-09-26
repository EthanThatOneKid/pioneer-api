# pioneer-api

Synthetic-proof slice for the Pioneer Circuits IWP bubble-relabeling engagement: decode a `.iwp`, observe numbered bubble annotations in a rasterized image with Gemini, match them to feature anchors with a deterministic affine matcher, and re-encode the IWP with bubble numbers as names.

## Layout

- `src/vision.ts` — Gemini observer. Schema, budgets, denormalization, and the API key resolver. Re-exports the prompt module so callers import everything from here.
- `src/prompt.ts` — loads the detector prompt from a markdown file, derives `DETECTOR_PROMPT_VERSION` from its frontmatter, and builds the runtime text.
- `src/prompts/iwp-bubble-detector.md` — the tracked prompt. Canonical: `src/prompt.ts` resolves it relative to `import.meta.url`, so it works under `bun run`, `bun test`, and the compiled `bun build --compile` binary.
- `src/pipeline.ts` — `rewriteIwpFromBubbles`, the geometry → IWP bridging step.
- `src/server.ts`, `src/web.ts` — the BYOK review service (`POST /api/v1/relabellings`) and its single-page UI.
- `scripts/` — fixture renderer, `fixture:visualize`, `fixture:gemini`, `fixture:gemini:evaluate`.
- `fixtures/six-feature/` — checked-in fixture (source IWP, bubbled PNG, transform, expected names).

## Prompt editing rules

- The prompt text and its `version:` live in `src/prompts/iwp-bubble-detector.md`, never inline in TypeScript. Edit the markdown, not `prompt.ts`.
- Bump `version:` on any wording change that can alter model output. `promptVersion` (`iwp-bubble-detector/<version>`) is returned on every detection and in the OpenAPI `RelabelSummary`, so a review record can name the exact prompt that produced an observation.
- Keep it drawing-agnostic: no fixture literals (colour, size, expected count, "orange", "six"), and no instruction to read labels from the source file. `tests/vision.test.ts` asserts this.
- Frontmatter is `name` / `version` / `description`; the body below the closing `---` is the guidance, one instruction per paragraph, joined into one line at runtime.
- The optional expected bubble count is a caller hint (`expectedCount`), inserted at runtime — never written into the file as a fixed number.
- There is exactly one prompt file: `src/prompts/iwp-bubble-detector.md`. A duplicate `prompts/iwp-bubble-detector.md` sat at the repository root for part of 2026-09-25 and was removed the same day; do not recreate it. Nothing loads it, and a second copy of the wording is how the file and the reported `promptVersion` drift apart.

## Verification

- `bun test` — 18 tests, including the prompt guardrails (drawing-agnostic, no fixture literals, markdown-sourced).
- `bun run fixture:visualize`, then `bun run fixture:gemini`, then `bun run fixture:gemini:evaluate` — live Gemini run against the fixture; the evaluator exits non-zero when the mapping is not exactly `A17`–`A22` → `705`, `102`, `991`, `314`, `808`, `127`.
- The fixture:gemini call needs `PIONEER_GEMINI_API_KEY` and Gemini capacity; a transient provider error is not a code failure, so retry before diagnosing.
- `fixture:gemini` writes `artifacts/six-feature-fixture/`, which is gitignored.

## Deploy

GitHub Pages (`docs/review/`) is the only CI deploy and is `workflow_dispatch` or `docs/review/**`; the review service itself runs locally with `bun run service` and is not deployed from this repo.
