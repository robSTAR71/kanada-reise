import { renderHome, renderTimeline, renderAccommodations, renderDocuments, renderInfo, renderWeather } from './ui.js';

const VIEWS = {
  home:          renderHome,
  reise:         renderTimeline,
  unterkuenfte:  renderAccommodations,
  dokumente:     renderDocuments,
  wetter:        renderWeather,
  info:          renderInfo,
};

const main = document.getElementById('main');
const navItems = document.querySelectorAll('.nav-item');

function getHash() {
  return location.hash.replace('#', '') || 'home';
}

function route() {
  const id = getHash();
  const render = VIEWS[id] || VIEWS.home;
  main.innerHTML = '';
  main.appendChild(render());

  navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.view === id);
  });

  main.scrollTop = 0;
}

navItems.forEach(item => {
  item.addEventListener('click', () => {
    location.hash = item.dataset.view;
  });
});

window.addEventListener('hashchange', route);
route();

// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(console.error);
}

// PWA Install prompt
let deferredPrompt = null;
const installBanner = document.getElementById('install-banner');
const installBtn    = document.getElementById('install-btn');
const installDismiss = document.getElementById('install-dismiss');

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBanner) installBanner.hidden = false;
});

if (installBtn) {
  installBtn.addEventListener('click', () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
      if (installBanner) installBanner.hidden = true;
    });
  });
}

if (installDismiss) {
  installDismiss.addEventListener('click', () => {
    if (installBanner) installBanner.hidden = true;
  });
}
