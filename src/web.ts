export function page(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pioneer API IWP Review</title>
  <style>
    :root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#172033;background:#f4f7fb}body{max-width:960px;margin:0 auto;padding:32px}h1{margin-bottom:8px}.notice{padding:16px;border:1px solid #f5c26b;background:#fff8e7;border-radius:12px;margin:20px 0;line-height:1.5}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}label{display:grid;gap:6px;font-size:14px;font-weight:600}input,select,button{font:inherit;padding:10px;border:1px solid #bdc7d8;border-radius:8px;background:white}fieldset{margin:20px 0;padding:16px;border:1px solid #d4dbe8;border-radius:12px}legend{font-weight:700}button{margin-right:10px;background:#1d4ed8;color:white;border-color:#1d4ed8;cursor:pointer}.secondary{background:white;color:#1d4ed8}.result{margin-top:24px;padding:18px;background:white;border:1px solid #d4dbe8;border-radius:12px}.hidden{display:none}.download{display:inline-block;margin-bottom:14px;color:#1d4ed8;font-weight:700}pre{white-space:pre-wrap;background:#f5f7fa;padding:12px;border-radius:8px}
  </style>
</head>
<body>
  <h1>IWP relabeling proof</h1>
  <p>Upload an IWP source and its rasterized bubbled image. The service asks Google Gemini for bubble observations, then applies a deterministic one-to-one geometric match before writing a UTF-16LE IWP output.</p>
  <div class="notice"><strong>BYOK review boundary:</strong> paste your own Google Gemini API key for this request. The demo sends it in a request header, does not store it, and does not log it. Use only synthetic fixture data over HTTPS; never upload Pioneer production data. The contracted provider boundary remains Pioneer-authorized Claude through GovCloud.</div>
  <form id="form">
    <div class="grid">
      <label>IWP source (.iwp)<input required type="file" name="iwp" accept=".iwp,application/octet-stream"></label>
      <label>Bubbled raster image<input required type="file" name="image" accept="image/png,image/jpeg,image/webp"></label>
      <label>Google Gemini API key<input required type="password" id="apiKey" autocomplete="off" placeholder="AIza…"></label>
      <label>Vision provider<select name="provider"><option value="gemini-proof">Gemini synthetic proof</option></select></label>
      <label>Source units<select name="unit"><option value="in">inches</option><option value="mm">millimetres</option></select></label>
      <label>Expected bubble count (optional)<input name="expectedCount" inputmode="numeric" placeholder="detect all visible"></label>
      <label>Match tolerance, pixels<input name="tolerance" value="90" inputmode="decimal"></label>
    </div>
    <fieldset><legend>Image registration transform</legend><p>For this proof fixture the transform is supplied by the generated fixture metadata. Production registration estimation is a separate acceptance step.</p><div class="grid">
      <label>a<input name="a" value="21.653543307086615"></label><label>b<input name="b" value="0"></label><label>c<input name="c" value="0"></label><label>d<input name="d" value="-21.653543307086615"></label><label>e<input name="e" value="-60"></label><label>f<input name="f" value="860"></label>
    </div></fieldset>
    <button type="submit">Generate relabeled IWP</button><button class="secondary" type="button" id="reset">Reset fixture transform</button>
  </form>
  <section class="result hidden" id="result"><h2>Result</h2><a class="download" id="download" download="relabeled.iwp">Download relabeled.iwp</a><pre id="details"></pre></section>
  <script>
    const form = document.querySelector('#form');
    const result = document.querySelector('#result');
    const details = document.querySelector('#details');
    const download = document.querySelector('#download');
    document.querySelector('#reset').addEventListener('click', () => { form.reset(); document.querySelector('#apiKey').value = ''; });
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      details.textContent = 'Running provider and deterministic verification…';
      result.classList.remove('hidden');
      const apiKey = document.querySelector('#apiKey').value.trim();
      try {
        const formData = new FormData(form);
        const response = await fetch('/api/v1/relabellings', { method: 'POST', body: formData, headers: { Accept: 'application/json', 'x-google-gemini-api-key': apiKey } });
        const body = await response.json();
        if (!response.ok) { details.textContent = JSON.stringify(body, null, 2); return; }
        details.textContent = JSON.stringify(body.summary, null, 2);
        download.href = 'data:application/octet-stream;base64,' + body.outputBase64;
      } catch (error) {
        details.textContent = error instanceof Error ? error.message : 'Request failed';
      } finally {
        document.querySelector('#apiKey').value = '';
      }
    });
  </script>
</body>
</html>`;
}
