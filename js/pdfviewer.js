let overlay = null;

function ensureOverlay() {
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = 'pdf-overlay';
  overlay.innerHTML = `
    <div class="pdf-dialog-header">
      <button id="pdf-close" class="pdf-back-btn" aria-label="Schließen">
        <span class="pdf-back-arrow">←</span> Zurück
      </button>
      <span id="pdf-dialog-title" class="pdf-dialog-name"></span>
      <a id="pdf-download" class="pdf-dl-btn" download title="Herunterladen">↓</a>
    </div>
    <div id="pdf-content"></div>`;

  document.body.appendChild(overlay);

  document.getElementById('pdf-close').addEventListener('click', closeOverlay);

  return overlay;
}

function closeOverlay() {
  if (overlay) overlay.hidden = true;
}

export function openPDF(filePath, label) {
  const ov    = ensureOverlay();
  const content = ov.querySelector('#pdf-content');
  const title   = ov.querySelector('#pdf-dialog-title');
  const dl      = ov.querySelector('#pdf-download');

  title.textContent = label || filePath;
  content.innerHTML = '';

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filePath);

  function applyUrl(url) {
    dl.href     = url;
    dl.download = filePath.split('/').pop();

    if (isImage) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = label || '';
      img.className = 'pdf-content-img';
      content.appendChild(img);
    } else {
      const frame = document.createElement('iframe');
      frame.src   = url;
      frame.title = label || 'Dokument';
      frame.className = 'pdf-content-frame';
      content.appendChild(frame);
    }
  }

  if ('caches' in window) {
    caches.match(filePath)
      .then(r => r ? r.blob() : fetch(filePath).then(r2 => r2.blob()))
      .then(blob => applyUrl(URL.createObjectURL(blob)))
      .catch(() => applyUrl(filePath));
  } else {
    applyUrl(filePath);
  }

  ov.hidden = false;
}
