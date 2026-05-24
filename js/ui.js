import { TRIP } from './data.js';
import { renderCountdown } from './countdown.js';
import { openPDF } from './pdfviewer.js';
import { fetchWeather, wmoInfo, currentAccommodation } from './weather.js';
import { renderCurrencyWidget } from './currency.js';

const DAY_ICONS = {
  flight:  '✈️',
  drive:   '🚗',
  ferry:   '⛴️',
  explore: '🗺️',
  arrive:  '🏠',
  train:   '🚆',
};

const MONTHS_DE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const DAYS_DE   = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];

function fmtDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return `${DAYS_DE[d.getDay()]}, ${d.getDate()}. ${MONTHS_DE[d.getMonth()]} ${d.getFullYear()}`;
}

function accommodationById(id) {
  return TRIP.accommodations.find(a => a.id === id);
}

// ── Home ──────────────────────────────────────────────────────────────────────

export function renderHome() {
  const el = document.createElement('div');
  el.className = 'view-home';
  el.innerHTML = `
    <div class="hero">
      <div class="hero-content">
        <div class="hero-flag">🍁</div>
        <h1 class="hero-title">Kanada 2026</h1>
        <p class="hero-sub">${TRIP.meta.travelers.join(' · ')}</p>
        <p class="hero-dates">1. – 18. August 2026</p>
      </div>
    </div>
    <div class="home-body">
      <div id="countdown" class="countdown-box card"></div>
      <div id="currency-widget" class="card"></div>
      <div class="route-card card">
        <h2 class="card-title">Unsere Route</h2>
        <ol class="route-list">
          <li>🏙️ Montréal <span class="route-nights">2 Nächte</span></li>
          <li>🏰 Québec City <span class="route-nights">2 Nächte</span></li>
          <li>🌲 Woodstock NB <span class="route-nights">1 Nacht</span></li>
          <li>🌊 Sussex NB <span class="route-nights">1 Nacht</span></li>
          <li>🏝️ Cornwall, PEI <span class="route-nights">2 Nächte</span></li>
          <li>⛵ Baddeck, Cape Breton <span class="route-nights">3 Nächte</span></li>
          <li>🎸 Halifax <span class="route-nights">5 Nächte</span></li>
        </ol>
      </div>
      <div class="info-chips">
        <div class="chip">✈️ Flug OS 55</div>
        <div class="chip">🚗 Mietwagen 12 Tage</div>
        <div class="chip">👨‍👩‍👧 3 Reisende</div>
        <div class="chip">🍁 18 Tage</div>
      </div>
    </div>`;
  renderCountdown(el.querySelector('#countdown'));
  renderCurrencyWidget(el.querySelector('#currency-widget'));
  return el;
}

// ── Timeline ──────────────────────────────────────────────────────────────────

export function renderTimeline() {
  const el = document.createElement('div');
  el.className = 'view-timeline';

  const header = document.createElement('div');
  header.className = 'view-header';
  header.innerHTML = '<h1>Reiseverlauf</h1>';
  el.appendChild(header);

  const timeline = document.createElement('ol');
  timeline.className = 'timeline';

  TRIP.days.forEach(day => {
    const acc = day.accommodation ? accommodationById(day.accommodation) : null;
    const li = document.createElement('li');
    li.className = `timeline-item timeline-${day.type}`;
    li.innerHTML = `
      <div class="timeline-dot">${DAY_ICONS[day.type] || '📍'}</div>
      <div class="timeline-content card">
        <div class="timeline-meta">
          <span class="timeline-day">Tag ${day.day}</span>
          <span class="timeline-date">${fmtDate(day.date)}</span>
        </div>
        <h3 class="timeline-title">${day.title}</h3>
        <p class="timeline-location">📍 ${day.location}</p>
        <p class="timeline-desc">${day.description}</p>
        ${day.highlights.length ? `<div class="timeline-highlights">${day.highlights.map(h => `<a href="${h.mapsUrl}" target="_blank" rel="noopener" class="highlight-chip">🗺️ ${h.name}</a>`).join('')}</div>` : ''}
        ${day.tickets?.length ? `<div class="timeline-tickets">${day.tickets.map(t => `<button class="highlight-chip ticket-chip" data-pdf="${t.file}" data-label="${t.label}">🎫 ${t.label}</button>`).join('')}</div>` : ''}
        ${acc ? `<div class="timeline-acc"><span class="acc-label">🏨 ${acc.name}</span> · Check-in: ${acc.checkIn.split(' ')[1]}</div>` : ''}
      </div>`;
    li.querySelectorAll('.ticket-chip').forEach(btn => {
      btn.addEventListener('click', e => openPDF(e.currentTarget.dataset.pdf, e.currentTarget.dataset.label));
    });
    timeline.appendChild(li);
  });

  el.appendChild(timeline);
  return el;
}

// ── Accommodations ────────────────────────────────────────────────────────────

export function renderAccommodations() {
  const el = document.createElement('div');
  el.className = 'view-accommodations';

  const header = document.createElement('div');
  header.className = 'view-header';
  header.innerHTML = '<h1>Unterkünfte</h1>';
  el.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'acc-grid';

  TRIP.accommodations.forEach(acc => {
    const card = document.createElement('div');
    card.className = 'acc-card card';
    card.innerHTML = `
      <div class="acc-card-header" style="background:${acc.color}">
        <h2 class="acc-name">${acc.name}</h2>
        <p class="acc-city">${acc.city}</p>
      </div>
      <div class="acc-card-body">
        <div class="acc-detail"><span class="acc-icon">📅</span><div>
          <div class="acc-detail-label">Check-in</div>
          <div class="acc-detail-val">${acc.checkIn}</div>
        </div></div>
        <div class="acc-detail"><span class="acc-icon">📅</span><div>
          <div class="acc-detail-label">Check-out</div>
          <div class="acc-detail-val">${acc.checkOut}</div>
        </div></div>
        <div class="acc-detail"><span class="acc-icon">🔑</span><div>
          <div class="acc-detail-label">Buchungsnummer</div>
          <div class="acc-detail-val mono">${acc.booking}</div>
        </div></div>
        ${acc.pin ? `<div class="acc-detail"><span class="acc-icon">🔢</span><div>
          <div class="acc-detail-label">PIN-Code</div>
          <div class="acc-detail-val mono">${acc.pin}</div>
        </div></div>` : ''}
        <div class="acc-detail"><span class="acc-icon">📍</span><div>
          <div class="acc-detail-label">Adresse</div>
          <div class="acc-detail-val">${acc.address}</div>
        </div></div>
        <div class="acc-detail"><span class="acc-icon">📞</span><div>
          <div class="acc-detail-label">Telefon</div>
          <div class="acc-detail-val"><a href="tel:${acc.phone}">${acc.phone}</a></div>
        </div></div>
        ${acc.note ? `<div class="acc-note">${acc.note}</div>` : ''}
        <div class="acc-actions">
          <a href="${acc.mapsUrl}" target="_blank" rel="noopener" class="btn btn-outline">🗺️ In Maps öffnen</a>
          <button class="btn btn-primary" data-pdf="${acc.document}" data-label="${acc.name}">📄 Buchung</button>
        </div>
      </div>`;
    card.querySelector('[data-pdf]').addEventListener('click', e => {
      openPDF(e.currentTarget.dataset.pdf, e.currentTarget.dataset.label);
    });
    grid.appendChild(card);
  });

  el.appendChild(grid);
  return el;
}

// ── Documents ─────────────────────────────────────────────────────────────────

export function renderDocuments() {
  const el = document.createElement('div');
  el.className = 'view-documents';

  const header = document.createElement('div');
  header.className = 'view-header';
  header.innerHTML = '<h1>Dokumente</h1><p class="view-sub">Alle Buchungsbestätigungen — auch offline verfügbar</p>';
  el.appendChild(header);

  const list = document.createElement('div');
  list.className = 'doc-list';

  TRIP.documents.forEach(doc => {
    const item = document.createElement('div');
    item.className = 'doc-item card';
    item.innerHTML = `
      <span class="doc-icon">${doc.icon}</span>
      <span class="doc-label">${doc.label}</span>
      <button class="btn btn-primary btn-sm" data-pdf="${doc.file}" data-label="${doc.label}">Öffnen</button>`;
    item.querySelector('button').addEventListener('click', e => {
      openPDF(e.currentTarget.dataset.pdf, e.currentTarget.dataset.label);
    });
    list.appendChild(item);
  });

  el.appendChild(list);
  return el;
}

// ── Weather ───────────────────────────────────────────────────────────────────

const DAYS_SHORT = ['So','Mo','Di','Mi','Do','Fr','Sa'];

export function renderWeather() {
  const el = document.createElement('div');
  el.className = 'view-weather';
  el.innerHTML = `
    <div class="view-header">
      <h1>Wetter</h1>
      <p class="view-sub">Live-Daten — benötigt Internetverbindung</p>
    </div>
    <div class="weather-body"></div>`;

  const body = el.querySelector('.weather-body');

  // Selector for all accommodations
  const selectorHtml = `
    <div class="weather-selector card">
      <label class="weather-selector-label" for="acc-select">Ort wählen</label>
      <select id="acc-select" class="weather-select">
        ${TRIP.accommodations.map(a => `<option value="${a.id}">${a.name} — ${a.city}</option>`).join('')}
      </select>
    </div>`;

  const currentCard = `<div id="weather-current" class="weather-current card"><div class="weather-loading">⏳ Lade Wetterdaten…</div></div>`;
  const forecastCard = `<div id="weather-forecast" class="weather-forecast card"></div>`;

  body.innerHTML = selectorHtml + currentCard + forecastCard;

  const select = body.querySelector('#acc-select');

  // Pre-select current/upcoming accommodation
  const current = currentAccommodation();
  if (current) select.value = current.id;

  function load(accId) {
    const acc = TRIP.accommodations.find(a => a.id === accId);
    if (!acc) return;
    const cur  = body.querySelector('#weather-current');
    const fore = body.querySelector('#weather-forecast');
    cur.innerHTML  = '<div class="weather-loading">⏳ Lade Wetterdaten…</div>';
    fore.innerHTML = '';

    fetchWeather(acc.lat, acc.lon).then(data => {
      const c = data.current;
      const d = data.daily;
      const wc = wmoInfo(c.weathercode);

      cur.innerHTML = `
        <div class="wc-location">📍 ${acc.name}</div>
        <div class="wc-main">
          <span class="wc-icon">${wc.icon}</span>
          <span class="wc-temp">${Math.round(c.temperature_2m)}°C</span>
        </div>
        <div class="wc-label">${wc.label}</div>
        <div class="wc-details">
          <div class="wc-detail"><span>🌡️</span> Gefühlt ${Math.round(c.apparent_temperature)}°C</div>
          <div class="wc-detail"><span>💧</span> Luftfeuchtigkeit ${c.relative_humidity_2m}%</div>
          <div class="wc-detail"><span>💨</span> Wind ${Math.round(c.wind_speed_10m)} km/h</div>
        </div>`;

      const days = d.time.map((date, i) => {
        const dt = new Date(date + 'T00:00:00');
        const wi = wmoInfo(d.weathercode[i]);
        return `
          <div class="forecast-day">
            <div class="fc-day">${DAYS_SHORT[dt.getDay()]}</div>
            <div class="fc-icon">${wi.icon}</div>
            <div class="fc-temps"><span class="fc-max">${Math.round(d.temperature_2m_max[i])}°</span><span class="fc-min">${Math.round(d.temperature_2m_min[i])}°</span></div>
            <div class="fc-rain">${d.precipitation_sum[i] > 0 ? `🌧 ${d.precipitation_sum[i]}mm` : ''}</div>
          </div>`;
      }).join('');

      fore.innerHTML = `<div class="forecast-title">7-Tage-Vorschau</div><div class="forecast-grid">${days}</div>`;

    }).catch(err => {
      cur.innerHTML = `<div class="weather-error">⚠️ ${err.message}<br><small>Bitte Internetverbindung prüfen.</small></div>`;
    });
  }

  select.addEventListener('change', e => load(e.target.value));
  load(select.value);

  return el;
}

// ── Info ──────────────────────────────────────────────────────────────────────

export function renderInfo() {
  const f = TRIP.flights;
  const c = TRIP.carRental;
  const el = document.createElement('div');
  el.className = 'view-info';
  el.innerHTML = `
    <div class="view-header"><h1>Reise-Info</h1></div>

    <section class="info-section card">
      <h2 class="info-section-title">✈️ Hinflug</h2>
      <div class="flight-details">
        <div class="flight-row">
          <div class="flight-cell"><div class="flight-time">${f[0].from.time}</div><div class="flight-city">${f[0].from.city}</div><div class="flight-iata">${f[0].from.airport}</div></div>
          <div class="flight-arrow">→<br><span class="flight-duration">${f[0].duration}</span><br><span class="flight-num">${f[0].flightNumbers.join(', ')}</span></div>
          <div class="flight-cell"><div class="flight-time">${f[0].to.time}</div><div class="flight-city">${f[0].to.city}</div><div class="flight-iata">${f[0].to.airport}</div></div>
        </div>
        <div class="info-chips" style="margin-top:12px">
          <div class="chip">${f[0].class}</div>
          <div class="chip">${f[0].aircraft}</div>
          <div class="chip">Buchung: ${f[0].confirmation}</div>
        </div>
        <button class="btn btn-primary mt-8" data-pdf="${f[0].document}" data-label="Flugbuchung">📄 Buchungsbestätigung</button>
      </div>
    </section>

    <section class="info-section card">
      <h2 class="info-section-title">✈️ Rückflug</h2>
      <div class="flight-details">
        <div class="flight-row">
          <div class="flight-cell"><div class="flight-time">${f[1].from.time}</div><div class="flight-city">${f[1].from.city}</div><div class="flight-iata">${f[1].from.airport}</div></div>
          <div class="flight-arrow">→<br><span class="flight-duration">${f[1].duration}</span><br><span class="flight-num">${f[1].flightNumbers.join(', ')}</span></div>
          <div class="flight-cell"><div class="flight-time">${f[1].to.time}</div><div class="flight-city">${f[1].to.city}</div><div class="flight-iata">${f[1].to.airport}</div></div>
        </div>
        <p class="info-note">Zwischenstopp: ${f[1].stopover.city} (${f[1].stopover.airport}, ${f[1].stopover.terminal})</p>
      </div>
    </section>

    <section class="info-section card">
      <h2 class="info-section-title">🚗 Mietwagen</h2>
      <table class="info-table">
        <tr><td>Anbieter</td><td>${c.company}</td></tr>
        <tr><td>Buchungsnr.</td><td class="mono">${c.confirmation}</td></tr>
        <tr><td>Fahrzeug</td><td>${c.vehicle}</td></tr>
        <tr><td>Abholung</td><td>${c.pickupDate.split('-').reverse().join('.')} ${c.pickupTime}<br>${c.pickupLocation}</td></tr>
        <tr><td>Rückgabe</td><td>${c.returnDate.split('-').reverse().join('.')} ${c.returnTime}<br>${c.returnLocation}</td></tr>
        <tr><td>Versicherung</td><td>${c.included[0]}</td></tr>
      </table>
      <div class="info-chips" style="margin-top:12px">
        ${c.included.slice(1).map(i => `<div class="chip">${i}</div>`).join('')}
      </div>
      <div class="acc-actions" style="margin-top:12px">
        <a href="tel:${c.pickupPhone}" class="btn btn-outline">📞 Abholung anrufen</a>
        <button class="btn btn-primary" data-pdf="${c.document}" data-label="Mietwagen">📄 Buchung</button>
      </div>
    </section>

    <section class="info-section card">
      <h2 class="info-section-title">📱 App installieren</h2>
      <p>Diese App funktioniert vollständig <strong>ohne Internet</strong> — auch in Kanada.</p>
      <ul class="install-list">
        <li><strong>iPhone:</strong> Safari → Teilen-Symbol → „Zum Home-Bildschirm"</li>
        <li><strong>Android:</strong> Chrome → Menü (⋮) → „App installieren"</li>
      </ul>
      <p class="info-note">Einmalig im WLAN öffnen — dann alle Dokumente offline verfügbar.</p>
    </section>

    <section class="info-section card">
      <h2 class="info-section-title">🆘 Notrufnummern Kanada</h2>
      <table class="info-table">
        <tr><td>Notruf</td><td><a href="tel:911">911</a></td></tr>
        <tr><td>Alamo (Mietwagen)</td><td><a href="tel:18002527898">1-800-252-7898</a></td></tr>
        <tr><td>Kreditkarte sperren</td><td>Rückseite der Karte</td></tr>
        <tr><td>Österr. Botschaft Ottawa</td><td><a href="tel:+16137986200">+1 613 798-6200</a></td></tr>
      </table>
    </section>`;

  el.querySelectorAll('[data-pdf]').forEach(btn => {
    btn.addEventListener('click', e => {
      openPDF(e.currentTarget.dataset.pdf, e.currentTarget.dataset.label);
    });
  });

  return el;
}
