# Pioneer API review service

## Purpose

This is an internal human-review slice for the IWP relabeling proof. It accepts an IWP source file and a rasterized bubbled image, asks the configured Gemini proof provider for structured bubble observations, applies an explicit affine registration transform, validates a one-to-one geometric assignment, and returns a relabeled UTF-16LE IWP.

This is not a production Pioneer integration. Do not upload Pioneer production data or export-controlled material. The hosted service uses Gemini only for the synthetic fixture review. The contracted provider boundary remains Pioneer-authorized Claude through GovCloud.

## Local run

```sh
bun install --frozen-lockfile
bun run service
```

The server listens on `PORT` or `8787`. The browser UI is at `/`; the OpenAPI document is at `/openapi.json`; health is at `/healthz`.

The service is strictly BYOK: enter a Google Gemini API key in the browser, where it is sent as the `x-google-gemini-api-key` request header and cleared from the form after the request. There is no server-side API-key fallback. The application does not persist or log the key, but the provider receives it for inference. Use a restricted, disposable key and synthetic fixture data only. A future production adapter should implement the same observation contract against Pioneer’s approved Claude/GovCloud boundary rather than sending Pioneer data to Gemini.

## Review fixture

Use `fixtures/six-feature/source.iwp` and `fixtures/six-feature/bubbled.png`. The UI contains the fixture transform defaults. The expected output is:

- six structured bubble observations;
- six one-to-one matches;
- six replacements;
- source names `A17`–`A22` replaced by `705`, `102`, `991`, `314`, `808`, and `127` respectively;
- a downloadable IWP that retains its UTF-16LE BOM and CRLF line endings.

## API

`POST /api/v1/relabellings` accepts multipart fields and a BYOK header:

- `x-google-gemini-api-key`: visitor-supplied Google Gemini key; required on every request and never included in the multipart body;
- `iwp`: UTF-16LE `.iwp` file;
- `image`: PNG, JPEG, or WebP raster image;
- `provider`: currently `gemini-proof` only;
- `expectedCount`: optional hint for how many bubbles the drawing carries; the observer treats it as a hint rather than a target and still reports only bubbles it can read;
- `unit`: source coordinate unit, currently `in` or `mm` in the UI;
- `tolerance`: matching tolerance in pixels;
- `a`, `b`, `c`, `d`, `e`, `f`: affine transform parameters.

The response contains a summary, match residuals, provider usage metadata, and a base64-encoded downloadable IWP. The summary carries `modelId`, `promptVersion`, `replacements`, `observations`, `matches`, and the provider `usage`, so a review record can name the exact prompt version that produced each observation; the detector prompt itself is a reviewable markdown file at [`src/prompts/iwp-bubble-detector.md`](../src/prompts/iwp-bubble-detector.md), and its frontmatter `version` is the value reported here. Uploads are bounded in memory and are not persisted by this service.

## Detector prompt

The observation prompt is drawing-agnostic. It states no bubble count, colour, or fixture layout, and it instructs the observer not to assume a fixed count or invent a bubble to reach a total. A caller may pass `expectedCount` as a hint, which is recorded in the prompt but never used as a target.

The deterministic layer, not the prompt, enforces the count contract: `matchBubblesToFeatures` still requires exactly one bubble per renderable feature and fails closed with a count diagnostic when the observer misses or invents one.

## Known boundary

Registration estimation is not automated in this slice. The transform is visible and manually supplied so a reviewer can distinguish model observation from deterministic geometry. Production acceptance still requires real Pioneer samples, real machine/software workflow confirmation, broader IWP geometry coverage, provider approval, retention rules, authentication, audit logging, and IT/security review.
