// Live CAD→EUR via open.er-api.com (kostenlos, kein Key nötig)
// Fallback: fest hinterlegter Kurs wenn offline

const FALLBACK_RATE = 0.68; // 1 CAD ≈ 0.68 EUR (Richtwert)

let cachedRate = null;
let cacheTime  = 0;
const TTL = 3600_000; // 1 Stunde

export async function getRate() {
  if (cachedRate && Date.now() - cacheTime < TTL) return cachedRate;
  try {
    const res  = await fetch('https://open.er-api.com/v6/latest/CAD');
    const data = await res.json();
    cachedRate = data.rates.EUR;
    cacheTime  = Date.now();
    return cachedRate;
  } catch {
    return FALLBACK_RATE;
  }
}

export function renderCurrencyWidget(container) {
  container.innerHTML = `
    <div class="currency-widget">
      <span class="currency-flag">🇨🇦</span>
      <input id="cad-input" class="currency-input" type="number" inputmode="decimal"
             placeholder="CAD" min="0" step="0.01" value="100">
      <span class="currency-eq">=</span>
      <span id="eur-result" class="currency-result">…</span>
      <span class="currency-flag">🇪🇺</span>
      <span id="currency-rate" class="currency-rate-label"></span>
    </div>
    <div class="currency-divider"></div>
    <div class="currency-widget">
      <span class="currency-flag">🌡️</span>
      <input id="fahr-input" class="currency-input" type="number" inputmode="decimal"
             placeholder="°F" step="1" value="72">
      <span class="currency-eq">=</span>
      <span id="celsius-result" class="currency-result">…</span>
      <span class="currency-unit">°C</span>
    </div>`;

  // CAD → EUR
  const cadInput  = container.querySelector('#cad-input');
  const eurResult = container.querySelector('#eur-result');
  const rateEl    = container.querySelector('#currency-rate');

  async function updateCurrency() {
    const rate = await getRate();
    const cad  = parseFloat(cadInput.value) || 0;
    eurResult.textContent = (cad * rate).toFixed(2) + ' EUR';
    rateEl.textContent = `1 CAD = ${rate.toFixed(4)} EUR`;
  }
  cadInput.addEventListener('input', updateCurrency);
  updateCurrency();

  // °F → °C
  const fahrInput    = container.querySelector('#fahr-input');
  const celsiusResult = container.querySelector('#celsius-result');

  function updateTemp() {
    const f = parseFloat(fahrInput.value);
    if (isNaN(f)) { celsiusResult.textContent = '–'; return; }
    celsiusResult.textContent = ((f - 32) * 5 / 9).toFixed(1);
  }
  fahrInput.addEventListener('input', updateTemp);
  updateTemp();
}
