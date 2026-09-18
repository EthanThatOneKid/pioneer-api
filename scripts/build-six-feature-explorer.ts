import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { decodeIwp } from "../src/iwp.ts";

const root = join(process.cwd(), "artifacts/six-feature-fixture");
const layers = Object.fromEntries(await Promise.all([
  "01-source-canonical.svg",
  "02-rendered-source.svg",
  "03-bubbled-input.svg",
  "04-registration-matches.svg",
  "05-final-relabeled-iwp.svg",
].map(async (name) => [name, await readFile(join(root, name), "utf8")])));
const sourceText = decodeIwp(await readFile(join(root, "fixture.iwp")));
const mappings = JSON.parse(await readFile(join(root, "mapping.json"), "utf8")) as Array<{ recordType: string; from: string; to: string }>;
const transform = JSON.parse(await readFile(join(root, "transform.json"), "utf8"));
const data = JSON.stringify({ layers, sourceText, mappings, transform }).replaceAll("<", "\\u003c");
const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const sourceLines = sourceText.split(/\r?\n/).map((line, index) => {
  const mapping = mappings.find(({ from }) => line.includes(`(Name \"${from}\")`));
  return `<span class="source-line${mapping ? " mapped" : ""}" data-source-name="${mapping?.from ?? ""}"><span class="line-number">${String(index + 1).padStart(3, " ")}</span>${escapeHtml(line)}</span>`;
}).join("");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>IWP Fixture Explorer</title>
<style>
:root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background:#e2e8f0; color:#0f172a; }
* { box-sizing:border-box; }
body { margin:0; min-height:100vh; }
header { padding:22px 28px 18px; background:#0f172a; color:#f8fafc; }
h1 { margin:0 0 6px; font-size:24px; } header p { margin:0; color:#cbd5e1; }
main { padding:18px; display:grid; gap:14px; }
.metrics { display:flex; flex-wrap:wrap; gap:10px; }
.metric { background:#fff; border:1px solid #cbd5e1; border-radius:10px; padding:10px 14px; box-shadow:0 1px 2px #0f172a12; }
.metric b { display:block; font-size:18px; } .metric span { color:#64748b; font-size:12px; }
.toolbar { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
button { border:1px solid #94a3b8; background:#fff; border-radius:8px; padding:8px 11px; cursor:pointer; font:inherit; }
button.active { background:#2563eb; color:#fff; border-color:#2563eb; }
.workspace { display:grid; grid-template-columns:minmax(360px, 0.9fr) minmax(520px, 1.5fr); gap:14px; min-height:650px; }
.panel { background:#fff; border:1px solid #cbd5e1; border-radius:12px; overflow:hidden; box-shadow:0 2px 5px #0f172a10; min-width:0; }
.panel h2 { font-size:15px; margin:0; padding:12px 14px; border-bottom:1px solid #e2e8f0; }
.source { overflow:auto; height:650px; background:#0b1220; color:#dbeafe; padding:12px 0; font:12px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace; }
.source-line { display:block; padding:0 14px; white-space:pre; } .source-line.mapped { background:#172554; } .source-line.selected { background:#7c2d12; color:#fff7ed; }
.line-number { display:inline-block; width:34px; color:#64748b; user-select:none; margin-right:10px; }
.render { height:650px; overflow:auto; padding:10px; background:#f8fafc; } .render svg { width:100%; height:auto; display:block; }
.mapping { width:100%; border-collapse:collapse; font-size:13px; } .mapping th,.mapping td { text-align:left; padding:9px 10px; border-bottom:1px solid #e2e8f0; } .mapping tr { cursor:pointer; } .mapping tr:hover { background:#eff6ff; }
.note { padding:11px 14px; color:#475569; font-size:13px; border-top:1px solid #e2e8f0; background:#f8fafc; }
@media (max-width: 980px) { .workspace { grid-template-columns:1fr; } .source,.render { height:520px; } }
</style>
</head>
<body>
<header><h1>Six-feature IWP render explorer</h1><p>Inspect the source program, deterministic render, mismatched bubbles, geometric matches, and final labels side by side.</p></header>
<main>
<section class="metrics">
  <div class="metric"><b>6</b><span>source features</span></div>
  <div class="metric"><b>6</b><span>bubble observations</span></div>
  <div class="metric"><b>6 / 6</b><span>geometry matches</span></div>
  <div class="metric"><b>inch → mm</b><span>unit normalization</span></div>
  <div class="metric"><b>affine</b><span>image registration</span></div>
</section>
<section class="toolbar" id="layers"></section>
<section class="workspace">
  <section class="panel"><h2>Source IWP — UTF-16LE decoded for review</h2><div class="source" id="source">${sourceLines}</div></section>
  <section class="panel"><h2 id="render-title">Layer 4 — geometric matching</h2><div class="render" id="render"></div><div class="note" id="status">Purple lines show the source-anchor to bubble correspondence. Click a mapping below to highlight its source record.</div></section>
</section>
<section class="panel"><h2>Derived source-to-bubble mapping</h2><table class="mapping"><thead><tr><th>Source IWP name</th><th>Bubble number</th><th>Feature</th><th>Evidence</th></tr></thead><tbody id="mapping"></tbody></table></section>
</main>
<script>
const data = ${data};
const layerNames = [
  ["01-source-canonical.svg", "1 · canonical geometry"],
  ["02-rendered-source.svg", "2 · rendered source"],
  ["03-bubbled-input.svg", "3 · bubbled input"],
  ["04-registration-matches.svg", "4 · geometric matches"],
  ["05-final-relabeled-iwp.svg", "5 · final labels"],
];
const layers = document.querySelector('#layers');
const render = document.querySelector('#render');
const renderTitle = document.querySelector('#render-title');
const source = document.querySelector('#source');
const status = document.querySelector('#status');
const buttons = new Map();
function showLayer(name, title) {
  render.innerHTML = data.layers[name];
  renderTitle.textContent = title;
  for (const [key, button] of buttons) button.classList.toggle('active', key === name);
}
for (const [name, title] of layerNames) {
  const button = document.createElement('button');
  button.textContent = title;
  button.onclick = () => showLayer(name, title);
  layers.append(button); buttons.set(name, button);
}
const mappingBody = document.querySelector('#mapping');
for (const mapping of data.mappings) {
  const row = document.createElement('tr');
  row.innerHTML = '<td><code>' + mapping.from + '</code></td><td><strong>' + mapping.to + '</strong></td><td>' + mapping.recordType + '</td><td>leader endpoint + affine residual</td>';
  row.onclick = () => {
    document.querySelectorAll('.source-line.selected').forEach((line) => line.classList.remove('selected'));
    const line = document.querySelector('[data-source-name="' + mapping.from + '"]');
    if (line) { line.classList.add('selected'); line.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    status.textContent = 'Selected ' + mapping.from + ' → ' + mapping.to + '. The match is derived from geometry; the bubble number is not present in the source IWP.';
    showLayer('04-registration-matches.svg', 'Layer 4 — geometric matching');
  };
  mappingBody.append(row);
}
showLayer('04-registration-matches.svg', 'Layer 4 — geometric matching');
</script>
</body>
</html>`;

await Bun.write(join(root, "explorer.html"), html);
console.log(join(root, "explorer.html"));
