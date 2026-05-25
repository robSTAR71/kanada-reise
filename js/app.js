import { renderHome, renderTimeline, renderAccommodations, renderDocuments, renderInfo, renderWeather } from './ui.js?v=5';
import { renderMap } from './map.js?v=5';

const VIEWS = {
  home:          renderHome,
  reise:         renderTimeline,
  unterkuenfte:  renderAccommodations,
  dokumente:     renderDocuments,
  wetter:        renderWeather,
  karte:         renderMap,
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

// PWA Install — suppress browser prompt (install instructions in Info tab)
window.addEventListener('beforeinstallprompt', e => e.preventDefault());
