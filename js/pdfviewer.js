let dialog = null;

function ensureDialog() {
  if (dialog) return dialog;
  dialog = document.createElement('dialog');
  dialog.id = 'pdf-dialog';
  dialog.innerHTML = `
    <div class="pdf-dialog-header">
      <span id="pdf-dialog-title" class="pdf-dialog-name"></span>
      <div class="pdf-dialog-actions">
        <a id="pdf-download" class="btn btn-ghost" download>↓ Herunterladen</a>
        <button id="pdf-close" class="btn btn-ghost" aria-label="Schließen">✕</button>
      </div>
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

  // Try cached version first
  if ('caches' in window) {
    caches.match(filePath).then(response => {
      if (response) {
        response.blob().then(blob => {
          const url = URL.createObjectURL(blob);
          frame.src = url;
          dl.href = url;
          dl.download = filePath.split('/').pop();
        });
      } else {
        frame.src = filePath;
        dl.href = filePath;
        dl.download = filePath.split('/').pop();
      }
    }).catch(() => {
      frame.src = filePath;
      dl.href = filePath;
    });
  } else {
    frame.src = filePath;
    dl.href = filePath;
    dl.download = filePath.split('/').pop();
  }

  dlg.showModal();
}
