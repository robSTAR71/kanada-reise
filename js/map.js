// Route stops in order with all metadata
const ROUTE = [
  {
    day: 1, label: "Montréal", dates: "1.–3. August",
    lat: 45.502, lon: -73.567, nights: 2,
    icon: "🏙️", color: "#1a3a5c",
    note: "Novotel Montréal Centre",
    type: "stop",
  },
  {
    day: 3, label: "Québec City", dates: "3.–5. August",
    lat: 46.814, lon: -71.208, nights: 2,
    icon: "🏰", color: "#1a5276",
    note: "Delta Hotels Québec · Zug VIA 24 ab Montréal 12:45",
    type: "stop",
  },
  {
    day: 5, label: "Woodstock, NB", dates: "5.–6. August",
    lat: 46.151, lon: -67.573, nights: 1,
    icon: "🌲", color: "#1e8449",
    note: "Best Western Plus Woodstock · Mietwagen ab Québec Airport",
    type: "stop",
  },
  {
    day: 6, label: "Sussex, NB", dates: "6.–7. August",
    lat: 45.723, lon: -65.510, nights: 1,
    icon: "🌊", color: "#6e2f1a",
    note: "Pinecone Motel",
    type: "stop",
  },
  // Ferry: Wood Islands PEI → Caribou NS (shown as dashed line)
  {
    day: 7, label: "Fähre: Wood Islands → Caribou", dates: "7. August, 11:45",
    lat: 45.952, lon: -62.748,
    icon: "⛴️", color: "#2471a3",
    note: "BAY Ferries · Buchung 2460692 · 3 Erw. + Auto",
    type: "ferry-start",
  },
  {
    day: 7, label: "Caribou, NS", dates: "7. August",
    lat: 45.747, lon: -62.681,
    icon: "⛴️", color: "#2471a3",
    note: "Fährankunft Festland",
    type: "ferry-end",
  },
  {
    day: 7, label: "Cornwall, PEI", dates: "7.–9. August",
    lat: 46.238, lon: -63.215, nights: 2,
    icon: "🏝️", color: "#7d6608",
    note: "Chez Nous · Über Confederation Bridge",
    type: "stop",
  },
  {
    day: 9, label: "Baddeck, NS", dates: "9.–12. August",
    lat: 46.100, lon: -60.743, nights: 3,
    icon: "⛵", color: "#1a3a5c",
    note: "Trailsman Lodge · Seeblick · Cape Breton",
    type: "stop",
  },
  {
    day: 12, label: "Halifax, NS", dates: "12.–17. August",
    lat: 44.649, lon: -63.575, nights: 5,
    icon: "🎸", color: "#512e5f",
    note: "Chateau Bedford · Rückflug 17.8. ab Halifax",
    type: "stop",
  },
];

let leafletLoaded = false;

function loadLeaflet() {
  if (leafletLoaded || window.L) { leafletLoaded = true; return Promise.resolve(); }
  return new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = './lib/leaflet.css';
    document.head.appendChild(css);

    const js = document.createElement('script');
    js.src = './lib/leaflet.js';
    js.onload = () => { leafletLoaded = true; resolve(); };
    js.onerror = reject;
    document.head.appendChild(js);
  });
}

export function renderMap() {
  const el = document.createElement('div');
  el.className = 'view-map';
  el.innerHTML = `
    <div class="view-header">
      <h1>Reiseroute</h1>
      <p class="view-sub">Interaktive Karte — benötigt Internetverbindung</p>
    </div>
    <div id="map-container">
      <div id="leaflet-map"></div>
      <div class="map-legend card">
        <div class="legend-row"><span class="legend-line solid"></span> Fahrt / Zug</div>
        <div class="legend-row"><span class="legend-line dashed"></span> Fähre</div>
        ${ROUTE.filter(s => s.type === 'stop').map(s => `
          <div class="legend-row">
            <span class="legend-dot" style="background:${s.color}">${s.icon}</span>
            <span>${s.label} <small>(${s.dates})</small></span>
          </div>`).join('')}
      </div>
    </div>`;

  // Load Leaflet after element is in DOM
  requestAnimationFrame(() => {
    loadLeaflet().then(() => initMap(el)).catch(() => {
      el.querySelector('#leaflet-map').innerHTML =
        '<div class="map-offline">🗺️ Karte benötigt Internetverbindung</div>';
    });
  });

  return el;
}

function initMap(el) {
  const L = window.L;
  const mapEl = el.querySelector('#leaflet-map');

  const map = L.map(mapEl, { zoomControl: true }).setView([45.8, -66], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map);

  // Draw route polyline (stops only, solid)
  const stops = ROUTE.filter(s => s.type === 'stop');
  const coords = stops.map(s => [s.lat, s.lon]);
  L.polyline(coords, { color: '#1a3a5c', weight: 3, opacity: 0.8 }).addTo(map);

  // Ferry dashed line
  const ferryStart = ROUTE.find(s => s.type === 'ferry-start');
  const ferryEnd   = ROUTE.find(s => s.type === 'ferry-end');
  if (ferryStart && ferryEnd) {
    L.polyline([[ferryStart.lat, ferryStart.lon], [ferryEnd.lat, ferryEnd.lon]], {
      color: '#2471a3', weight: 3, dashArray: '8 6', opacity: 0.9,
    }).addTo(map);
  }

  // Markers for all stops
  stops.forEach((stop, i) => {
    const html = `<div class="map-marker" style="background:${stop.color}">${stop.icon}</div>`;
    const icon = L.divIcon({ html, className: '', iconSize: [36, 36], iconAnchor: [18, 18] });
    const marker = L.marker([stop.lat, stop.lon], { icon }).addTo(map);
    marker.bindPopup(`
      <div class="map-popup">
        <div class="map-popup-title">${stop.icon} ${stop.label}</div>
        <div class="map-popup-dates">📅 ${stop.dates}${stop.nights ? ` · ${stop.nights} Nacht${stop.nights > 1 ? 'e' : ''}` : ''}</div>
        <div class="map-popup-note">${stop.note}</div>
      </div>`, { maxWidth: 220 });

    // Day label
    L.tooltip({ permanent: true, direction: i % 2 === 0 ? 'right' : 'left', className: 'map-label' })
      .setContent(`<b>Tag ${stop.day}</b> ${stop.label.split(',')[0]}`)
      .setLatLng([stop.lat, stop.lon])
      .addTo(map);
  });

  // Ferry markers (smaller)
  [ferryStart, ferryEnd].filter(Boolean).forEach(s => {
    const html = `<div class="map-marker map-marker-sm" style="background:${s.color}">${s.icon}</div>`;
    const icon = L.divIcon({ html, className: '', iconSize: [28, 28], iconAnchor: [14, 14] });
    L.marker([s.lat, s.lon], { icon }).addTo(map)
      .bindPopup(`<div class="map-popup"><div class="map-popup-title">${s.label}</div><div class="map-popup-note">${s.note}</div></div>`);
  });

  // Fit map to all markers
  const allCoords = ROUTE.map(s => [s.lat, s.lon]);
  map.fitBounds(L.latLngBounds(allCoords).pad(0.15));
}
