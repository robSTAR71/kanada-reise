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
    </div>`;

  const input  = container.querySelector('#cad-input');
  const result = container.querySelector('#eur-result');
  const rateEl = container.querySelector('#currency-rate');

  async function update() {
    const rate = await getRate();
    const cad  = parseFloat(input.value) || 0;
    result.textContent = (cad * rate).toFixed(2) + ' EUR';
    rateEl.textContent = `1 CAD = ${rate.toFixed(4)} EUR`;
  }

  input.addEventListener('input', update);
  update();
}
