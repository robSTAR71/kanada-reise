let dialog = null;

function ensureDialog() {
  if (dialog) return dialog;
  dialog = document.createElement('dialog');
  dialog.id = 'pdf-dialog';
  dialog.innerHTML = `
    <div class="pdf-dialog-header">
      <button id="pdf-close" class="pdf-back-btn" aria-label="Schließen">
        <span class="pdf-back-arrow">←</span> Zurück
      </button>
      <span id="pdf-dialog-title" class="pdf-dialog-name"></span>
      <a id="pdf-download" class="pdf-dl-btn" download title="Herunterladen">↓</a>
    </div>
    <iframe id="pdf-frame" title="Dokument"></iframe>`;
  document.body.appendChild(dialog);
  dialog.querySelector('#pdf-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  return dialog;
}

export function openPDF(filePath, label) {
  const dlg = ensureDialog();
  const frame = dlg.querySelector('#pdf-frame');
  const title = dlg.querySelector('#pdf-dialog-title');
  const dl    = dlg.querySelector('#pdf-download');

  title.textContent = label || filePath;
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filePath);

  // Switch between image and iframe display
  frame.style.display = isImage ? 'none' : 'block';
  let imgEl = dlg.querySelector('#pdf-img');
  if (!imgEl) {
    imgEl = document.createElement('img');
    imgEl.id = 'pdf-img';
    imgEl.alt = 'Reisepass';
    imgEl.style.cssText = 'flex:1;width:100%;object-fit:contain;background:#111;';
    frame.parentNode.insertBefore(imgEl, frame.nextSibling);
  }
  imgEl.style.display = isImage ? 'block' : 'none';

  function applyUrl(url) {
    if (isImage) { imgEl.src = url; }
    else { frame.src = url; }
    dl.href = url;
    dl.download = filePath.split('/').pop();
  }

  if ('caches' in window) {
    caches.match(filePath).then(response => {
      if (response) {
        response.blob().then(blob => applyUrl(URL.createObjectURL(blob)));
      } else {
        applyUrl(filePath);
      }
    }).catch(() => applyUrl(filePath));
  } else {
    applyUrl(filePath);
  }

  dlg.showModal();
}
