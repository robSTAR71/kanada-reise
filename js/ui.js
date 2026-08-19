import { TRIP } from './data.js?v=7';
import { renderCountdown } from './countdown.js?v=7';
import { openPDF } from './pdfviewer.js?v=7';
import { fetchWeather, wmoInfo, currentAccommodation } from './weather.js?v=7';
import { renderCurrencyWidget } from './currency.js?v=7';

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
          ${acc.stadtplan ? `<button class="btn btn-map" data-pdf="${acc.stadtplan}" data-label="Stadtplan ${acc.city.split(',')[0]}">🗺️ Stadtplan</button>` : ''}
        </div>
      </div>`;
    card.querySelectorAll('[data-pdf]').forEach(btn => {
      btn.addEventListener('click', e => {
        openPDF(e.currentTarget.dataset.pdf, e.currentTarget.dataset.label);
      });
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
      <h2 class="info-section-title">💶 Reisekosten-Übersicht</h2>
      <p class="info-note" style="margin-bottom:12px">Kreditkarte 31.07.–18.08.2026 · nur Reiseausgaben (ohne Vorausbuchungen)</p>
      <table class="info-table cost-table">
        <tr class="cost-cat-header"><td colspan="3">🏨 Unterkunft</td></tr>
        <tr><td>Trailsman Lodge, Baddeck</td><td class="cost-loc">Cape Breton</td><td class="cost-eur">380,84 €</td></tr>
        <tr><td>Chateau Bedford, Halifax</td><td class="cost-loc">Halifax</td><td class="cost-eur">439,31 €</td></tr>
        <tr><td>Unterkunft via Booking.com</td><td class="cost-loc">12. Aug.</td><td class="cost-eur">450,11 €</td></tr>
        <tr><td>Unterkunft via Booking.com</td><td class="cost-loc">3. Aug.</td><td class="cost-eur">107,34 €</td></tr>
        <tr><td>614319 NB Ltd.</td><td class="cost-loc">Woodstock NB</td><td class="cost-eur">206,11 €</td></tr>
        <tr><td>Edelweiss Online</td><td class="cost-loc">Middleton NS</td><td class="cost-eur">217,52 €</td></tr>
        <tr><td>Delta Québec City (Extras)</td><td class="cost-loc">Québec</td><td class="cost-eur">35,32 €</td></tr>
        <tr class="cost-subtotal"><td colspan="2">Unterkunft gesamt</td><td class="cost-eur">1.836,55 €</td></tr>

        <tr class="cost-cat-header"><td colspan="3">🚗 Mietwagen</td></tr>
        <tr><td>Alamo Canada (Abrechnung)</td><td class="cost-loc">Québec</td><td class="cost-eur">254,91 €</td></tr>
        <tr class="cost-subtotal"><td colspan="2">Mietwagen gesamt</td><td class="cost-eur">254,91 €</td></tr>

        <tr class="cost-cat-header"><td colspan="3">⛽ Tanken</td></tr>
        <tr><td>Petro-Canada Saint John</td><td class="cost-loc">6. Aug.</td><td class="cost-eur">60,70 €</td></tr>
        <tr><td>Shell North River</td><td class="cost-loc">9. Aug.</td><td class="cost-eur">55,69 €</td></tr>
        <tr><td>Esso Bridgetown</td><td class="cost-loc">13. Aug.</td><td class="cost-eur">53,45 €</td></tr>
        <tr><td>Petro-Canada Halifax</td><td class="cost-loc">16. Aug.</td><td class="cost-eur">41,81 €</td></tr>
        <tr><td>Ultramar Wagmatcook</td><td class="cost-loc">9. Aug.</td><td class="cost-eur">22,97 €</td></tr>
        <tr><td>Ultramar Valley</td><td class="cost-loc">12. Aug.</td><td class="cost-eur">16,82 €</td></tr>
        <tr><td>Petro-Canada St-Léonard</td><td class="cost-loc">5. Aug.</td><td class="cost-eur">7,79 €</td></tr>
        <tr class="cost-subtotal"><td colspan="2">Tanken gesamt</td><td class="cost-eur">259,23 €</td></tr>

        <tr class="cost-cat-header"><td colspan="3">🍽️ Restaurants & Essen</td></tr>
        <tr><td>Brewskey</td><td class="cost-loc">Montréal</td><td class="cost-eur">55,44 €</td></tr>
        <tr><td>Cirque du Soleil (Abend)</td><td class="cost-loc">Montréal</td><td class="cost-eur">—</td></tr>
        <tr><td>Piazzetta St-Jean</td><td class="cost-loc">Québec</td><td class="cost-eur">88,95 €</td></tr>
        <tr><td>Au Petit Chalet</td><td class="cost-loc">Québec</td><td class="cost-eur">64,07 €</td></tr>
        <tr><td>Côte-Est</td><td class="cost-loc">Kamouraska</td><td class="cost-eur">51,92 €</td></tr>
        <tr><td>The Cork & Cast</td><td class="cost-loc">Charlottetown</td><td class="cost-eur">75,89 €</td></tr>
        <tr><td>Sam's Restaurant</td><td class="cost-loc">Cornwall PEI</td><td class="cost-eur">49,55 €</td></tr>
        <tr><td>Nook & Cranny</td><td class="cost-loc">Pictou NS</td><td class="cost-eur">58,86 €</td></tr>
        <tr><td>Main Street Restaurant</td><td class="cost-loc">Ingonish</td><td class="cost-eur">85,55 €</td></tr>
        <tr><td>Rose's Smash Burger</td><td class="cost-loc">Baddeck</td><td class="cost-eur">49,78 €</td></tr>
        <tr><td>Big Spruce Brewing</td><td class="cost-loc">Baddeck</td><td class="cost-eur">15,89 €</td></tr>
        <tr><td>Mira Ferry Market</td><td class="cost-loc">Albert Bridge</td><td class="cost-eur">63,14 €</td></tr>
        <tr><td>Edelweiss Restaurant</td><td class="cost-loc">Middleton NS</td><td class="cost-eur">140,87 €</td></tr>
        <tr><td>Luckett Vineyards</td><td class="cost-loc">Wallbrook NS</td><td class="cost-eur">38,69 €</td></tr>
        <tr><td>German Bakery Sachsen</td><td class="cost-loc">Annapolis Royal</td><td class="cost-eur">38,25 €</td></tr>
        <tr><td>Shaw's Landing</td><td class="cost-loc">Westdover NS</td><td class="cost-eur">95,84 €</td></tr>
        <tr><td>Black Sheep Restaurant</td><td class="cost-loc">Halifax</td><td class="cost-eur">98,92 €</td></tr>
        <tr><td>Supermärkte (Sobeys etc.)</td><td class="cost-loc">versch.</td><td class="cost-eur">133,96 €</td></tr>
        <tr><td>Sonstiges Essen</td><td class="cost-loc">versch.</td><td class="cost-eur">57,54 €</td></tr>
        <tr class="cost-subtotal"><td colspan="2">Essen & Trinken gesamt</td><td class="cost-eur">1.163,11 €</td></tr>

        <tr class="cost-cat-header"><td colspan="3">🎭 Erlebnisse & Ausflüge</td></tr>
        <tr><td>Cirque du Soleil</td><td class="cost-loc">Montréal</td><td class="cost-eur">166,15 €</td></tr>
        <tr><td>Pointe-à-Callière Museum</td><td class="cost-loc">Montréal</td><td class="cost-eur">37,34 €</td></tr>
        <tr><td>Musée Royal 22e Régiment</td><td class="cost-loc">Québec</td><td class="cost-eur">32,20 €</td></tr>
        <tr><td>Funiculaire Vieux-Québec</td><td class="cost-loc">Québec</td><td class="cost-eur">13,01 €</td></tr>
        <tr><td>Kings Landing Historical Village</td><td class="cost-loc">NB</td><td class="cost-eur">24,17 €</td></tr>
        <tr><td>Ambassatours Gray Line</td><td class="cost-loc">Halifax</td><td class="cost-eur">136,44 €</td></tr>
        <tr><td>Maritime Museum of the Atlantic</td><td class="cost-loc">Halifax</td><td class="cost-eur">13,72 €</td></tr>
        <tr class="cost-subtotal"><td colspan="2">Erlebnisse gesamt</td><td class="cost-eur">423,03 €</td></tr>

        <tr class="cost-cat-header"><td colspan="3">🚖 Uber & Transport</td></tr>
        <tr><td>Uber Montréal</td><td class="cost-loc">1.–2. Aug.</td><td class="cost-eur">98,56 €</td></tr>
        <tr><td>Uber Québec City</td><td class="cost-loc">3.–4. Aug.</td><td class="cost-eur">69,64 €</td></tr>
        <tr class="cost-subtotal"><td colspan="2">Transport gesamt</td><td class="cost-eur">168,20 €</td></tr>


        <tr class="cost-cat-header"><td colspan="3">💱 Wechselkursgebühren</td></tr>
        <tr><td>Umrechnungsentgelte (CAD/USD)</td><td class="cost-loc">gesamt</td><td class="cost-eur">≈ 35,00 €</td></tr>
        <tr class="cost-subtotal"><td colspan="2">Gebühren gesamt</td><td class="cost-eur">≈ 35,00 €</td></tr>

        <tr class="cost-cat-header"><td colspan="3">↩️ Erstattungen</td></tr>
        <tr><td>Fetta Panini Bar (Storno)</td><td class="cost-loc">Mississauga</td><td class="cost-eur credit">− 21,64 €</td></tr>
        <tr class="cost-subtotal"><td colspan="2">Erstattungen gesamt</td><td class="cost-eur credit">− 21,64 €</td></tr>
      </table>
      <div class="cost-total-row">
        <span>Gesamtausgaben (Kreditkarte)</span>
        <span class="cost-total-amount">3.918,39 €</span>
      </div>
    </section>

    <section class="info-section card">
      <h2 class="info-section-title">💳 Vorausbuchungen</h2>
      <p class="info-note" style="margin-bottom:12px">Vor Reisebeginn bezahlte Buchungen (nicht in der Kreditkartenabrechnung enthalten)</p>
      <table class="info-table cost-table">
        <tr class="cost-cat-header"><td colspan="3">✈️ Flüge</td></tr>
        <tr><td>Hin- &amp; Rückflug OS 055 / LH 6557</td><td class="cost-loc">3 Personen · Buchung 9RB932</td><td class="cost-eur">4.208,73 €</td></tr>
        <tr class="cost-subtotal"><td colspan="2">Summe Flüge</td><td class="cost-eur">4.208,73 €</td></tr>

        <tr class="cost-cat-header"><td colspan="3">🚗 Mietwagen</td></tr>
        <tr><td>Alamo / ADAC Ford Escape AWD</td><td class="cost-loc">Québec → Halifax · Buchung 20237222/01</td><td class="cost-eur">1.255,11 €</td></tr>
        <tr><td class="cost-note" colspan="2"><em>Einweggebühr vor Ort: EUR 185,15 + Steuern</em></td><td></td></tr>
        <tr class="cost-subtotal"><td colspan="2">Summe Mietwagen (Vorauszahlung)</td><td class="cost-eur">1.255,11 €</td></tr>

        <tr class="cost-cat-header"><td colspan="3">🏨 Hotel (vorausbezahlt)</td></tr>
        <tr><td>Novotel Montréal Centre</td><td class="cost-loc">1.–3. August · 2 Nächte · Buchung QFHSHLXW</td><td class="cost-eur">691,69 €</td></tr>
        <tr class="cost-subtotal"><td colspan="2">Summe Hotels (Vorauszahlung)</td><td class="cost-eur">691,69 €</td></tr>

        <tr class="cost-cat-header"><td colspan="3">🚆 Bahn</td></tr>
        <tr><td>VIA Rail Montréal → Québec, Zug #24</td><td class="cost-loc">3 Personen · Buchung JW4PCM · 3. August</td><td class="cost-eur">CA$ 288,06</td></tr>
        <tr class="cost-subtotal"><td colspan="2">Summe Bahn</td><td class="cost-eur">CA$ 288,06</td></tr>
      </table>
      <div class="cost-total-row">
        <span>Gesamt Vorausbuchungen (EUR-Positionen)</span>
        <span class="cost-total-amount">6.155,53 €</span>
      </div>
      <p class="info-note" style="margin-top:10px">+ VIA Rail CA$ 288,06 (≈ EUR 190) · Noch offen: Einweggebühr Mietwagen EUR 185,15 + Steuern (vor Ort bei Alamo)</p>
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
