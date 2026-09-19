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

The Gemini path requires `PIONEER_GEMINI_API_KEY`. The service never displays the key. A future production adapter should implement the same observation contract against Pioneer’s approved Claude/GovCloud boundary rather than sending Pioneer data to Gemini.

## Review fixture

Use `fixtures/six-feature/source.iwp` and `fixtures/six-feature/bubbled.png`. The UI contains the fixture transform defaults. The expected output is:

- six structured bubble observations;
- six one-to-one matches;
- six replacements;
- source names `A17`–`A22` replaced by `705`, `102`, `991`, `314`, `808`, and `127` respectively;
- a downloadable IWP that retains its UTF-16LE BOM and CRLF line endings.

## API

`POST /api/v1/relabellings` accepts multipart fields:

- `iwp`: UTF-16LE `.iwp` file;
- `image`: PNG, JPEG, or WebP raster image;
- `provider`: currently `gemini-proof` only;
- `unit`: source coordinate unit, currently `in` or `mm` in the UI;
- `tolerance`: matching tolerance in pixels;
- `a`, `b`, `c`, `d`, `e`, `f`: affine transform parameters.

The response contains a summary, match residuals, provider usage metadata, and a base64-encoded downloadable IWP. Uploads are bounded in memory and are not persisted by this service.

## Known boundary

Registration estimation is not automated in this slice. The transform is visible and manually supplied so a reviewer can distinguish model observation from deterministic geometry. Production acceptance still requires real Pioneer samples, real machine/software workflow confirmation, broader IWP geometry coverage, provider approval, retention rules, authentication, audit logging, and IT/security review.
