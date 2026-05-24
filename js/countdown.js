import { TRIP } from './data.js?v=4';

const departure = new Date(TRIP.meta.departureISO);
const returnDate = new Date(TRIP.meta.returnISO);

export function getCountdownState() {
  const now = new Date();
  if (now < departure) {
    const diff = departure - now;
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);
    const secs  = Math.floor((diff % 60000) / 1000);
    return { phase: 'before', days, hours, mins, secs };
  }
  if (now <= returnDate) {
    const elapsed = now - departure;
    const dayNum  = Math.floor(elapsed / 86400000) + 1;
    return { phase: 'during', dayNum, total: TRIP.meta.totalDays };
  }
  return { phase: 'after' };
}

export function renderCountdown(el) {
  function update() {
    const s = getCountdownState();
    if (s.phase === 'before') {
      el.innerHTML = `
        <div class="countdown-grid">
          <div class="countdown-unit"><span class="countdown-num">${s.days}</span><span class="countdown-label">Tage</span></div>
          <div class="countdown-unit"><span class="countdown-num">${String(s.hours).padStart(2,'0')}</span><span class="countdown-label">Stunden</span></div>
          <div class="countdown-unit"><span class="countdown-num">${String(s.mins).padStart(2,'0')}</span><span class="countdown-label">Minuten</span></div>
          <div class="countdown-unit"><span class="countdown-num">${String(s.secs).padStart(2,'0')}</span><span class="countdown-label">Sekunden</span></div>
        </div>
        <p class="countdown-sub">bis zum Abflug nach Kanada</p>`;
    } else if (s.phase === 'during') {
      el.innerHTML = `<p class="countdown-during">🍁 Gute Reise! Tag ${s.dayNum} von ${s.total}</p>`;
    } else {
      el.innerHTML = `<p class="countdown-after">Schöne Erinnerungen an Kanada 2026! 🍁</p>`;
    }
  }
  update();
  setInterval(update, 1000);
}
