// WMO weather code → emoji + label
const WMO = {
  0:  { icon: '☀️',  label: 'Klar' },
  1:  { icon: '🌤️', label: 'Überwiegend klar' },
  2:  { icon: '⛅',  label: 'Teilweise bewölkt' },
  3:  { icon: '☁️',  label: 'Bedeckt' },
  45: { icon: '🌫️', label: 'Nebel' },
  48: { icon: '🌫️', label: 'Raureif-Nebel' },
  51: { icon: '🌦️', label: 'Leichter Nieselregen' },
  53: { icon: '🌦️', label: 'Nieselregen' },
  55: { icon: '🌧️', label: 'Starker Nieselregen' },
  61: { icon: '🌧️', label: 'Leichter Regen' },
  63: { icon: '🌧️', label: 'Regen' },
  65: { icon: '🌧️', label: 'Starker Regen' },
  71: { icon: '🌨️', label: 'Leichter Schnee' },
  73: { icon: '🌨️', label: 'Schnee' },
  75: { icon: '❄️',  label: 'Starker Schneefall' },
  80: { icon: '🌦️', label: 'Leichte Regenschauer' },
  81: { icon: '🌧️', label: 'Regenschauer' },
  82: { icon: '⛈️', label: 'Starke Schauer' },
  95: { icon: '⛈️', label: 'Gewitter' },
  96: { icon: '⛈️', label: 'Gewitter mit Hagel' },
  99: { icon: '⛈️', label: 'Schweres Gewitter' },
};

export function wmoInfo(code) {
  return WMO[code] ?? { icon: '🌡️', label: `Code ${code}` };
}

// Fetch current + 7-day forecast from Open-Meteo (no API key needed)
export async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weathercode` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max` +
    `&timezone=America%2FHalifax&forecast_days=7`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Wetterdaten nicht verfügbar');
  return res.json();
}

// Which accommodation is "current" based on today's date (or next upcoming)
import { TRIP } from './data.js?v=4';

export function currentAccommodation() {
  const today = new Date().toISOString().slice(0, 10);
  // find the stay that covers today
  for (let i = 0; i < TRIP.days.length; i++) {
    const day = TRIP.days[i];
    if (day.date === today && day.accommodation) {
      return TRIP.accommodations.find(a => a.id === day.accommodation);
    }
  }
  // before trip: return first; after trip: return last
  if (today < TRIP.days[0].date) return TRIP.accommodations[0];
  return TRIP.accommodations[TRIP.accommodations.length - 1];
}
