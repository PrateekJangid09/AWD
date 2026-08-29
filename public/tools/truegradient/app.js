import {
  normalizeHex,
  sampleGradient,
  sampleAt,
  midpoint,
  nativeGradientCss,
  fallbackGradientCss,
  formatOklch,
  perceptualDifference,
  chromaLift,
  parseGradientInput,
  deltaEOK
} from './engine.js';
import { NAMED_COLORS } from './color-library.js';

const $ = selector => document.querySelector(selector);
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const validModes = new Set(['oklch', 'compare', 'srgb']);
const savedMode = (() => {
  try {
    const mode = localStorage.getItem('truegradient.mode');
    return validModes.has(mode) ? mode : null;
  } catch {
    return null;
  }
})();

const state = {
  stops: [
    { color: '#0000FF', position: 0 },
    { color: '#FFFF00', position: 100 }
  ],
  angle: 90,
  samples: 33,
  hue: 'shorter',
  mode: savedMode || 'compare',
  readPosition: .5,
  comparePosition: .5
};

const nativeOklchSupported = Boolean(
  globalThis.CSS?.supports?.('background', 'linear-gradient(90deg in oklch shorter hue, #0000FF, #FFFF00)')
);

const LIBRARY_PRIORITY = {
  'Designer Curated': 0,
  'CSS Standard': 1,
  'Common Name': 2,
  'Community Survey': 2
};

const NAME_BY_HEX = new Map();
for (const color of NAMED_COLORS) {
  const hex = normalizeHex(color.hex);
  if (!hex) continue;
  const existing = NAME_BY_HEX.get(hex);
  if (!existing || (LIBRARY_PRIORITY[color.group] ?? 9) < (LIBRARY_PRIORITY[existing.group] ?? 9)) {
    NAME_BY_HEX.set(hex, color);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function getValidStops() {
  return state.stops
    .map(stop => ({ ...stop, color: normalizeHex(stop.color) }))
    .filter(stop => stop.color)
    .sort((a, b) => a.position - b.position);
}

function namedColorForHex(hex) {
  return NAME_BY_HEX.get(normalizeHex(hex)) || null;
}

function track(name, detail = {}) {
  const payload = { event: name, tool: 'truegradient', ...detail };
  if (Array.isArray(globalThis.dataLayer)) globalThis.dataLayer.push(payload);
  globalThis.dispatchEvent?.(new CustomEvent('truegradient:analytics', { detail: payload }));
}

function saveMode() {
  try { localStorage.setItem('truegradient.mode', state.mode); } catch {}
}

function announce(message) {
  $('#liveRegion').textContent = '';
  requestAnimationFrame(() => { $('#liveRegion').textContent = message; });
}

function showToast(message, kind = 'success') {
  const toast = $('#toast');
  toast.textContent = message;
  toast.dataset.kind = kind;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1600);
  announce(message);
}

async function copyText(text, kind) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(text);
    showToast('CSS copied');
    track(kind === 'fallback' ? 'fallback_css_copied' : 'native_css_copied');
    return;
  } catch {
    showToast('Copy unavailable. Select the code manually.', 'error');
    track('clipboard_failed', { kind });
  }
}

function setParseMessage(message = '', type = '') {
  const el = $('#parseMessage');
  el.textContent = message;
  el.className = `field-message${type ? ` ${type}` : ''}`;
}

function renderSupport() {
  const status = $('#supportStatus');
  status.classList.toggle('supported', nativeOklchSupported);
  status.classList.toggle('unsupported', !nativeOklchSupported);
  $('#supportText').textContent = nativeOklchSupported
    ? 'Native OKLCH supported'
    : 'Native OKLCH preview unavailable · fallback preview active';
}

function previewOklchCss(stops, angle = state.angle) {
  return nativeOklchSupported
    ? nativeGradientCss(stops, angle, 'oklch', state.hue)
    : fallbackGradientCss(stops, angle, 65, state.hue);
}

function renderStops() {
  const editor = $('#stopEditor');
  const cards = state.stops.map((stop, index) => {
    const hex = normalizeHex(stop.color) || '#000000';
    const named = namedColorForHex(hex);
    const resultsId = `name-results-${index}`;
    const popoverId = `name-popover-${index}`;

    return `<div class="stop-card" data-index="${index}">
      <div class="stop-card-head">
        <span>Stop ${index + 1}</span>
        <small class="stop-name">${escapeHtml(named?.name || 'Custom color')}</small>
      </div>
      <div class="stop-row" data-index="${index}">
        <input class="swatch-picker" type="color" value="${hex}" data-action="picker" aria-label="Stop ${index + 1} color picker" />
        <div class="hex-wrap">
          <input class="hex-field" type="text" value="${escapeHtml(hex)}" data-action="color" spellcheck="false" maxlength="7" aria-label="Stop ${index + 1} HEX color" />
          <button class="name-trigger" type="button" data-action="open-search" aria-expanded="false" aria-controls="${popoverId}">Search</button>
        </div>
        <div class="position-wrap">
          <input type="number" min="0" max="100" step="1" value="${stop.position}" data-action="position" aria-label="Stop ${index + 1} position" />
          <span>%</span>
        </div>
        <button class="remove-stop" type="button" data-action="remove" ${state.stops.length <= 2 ? 'disabled' : ''} aria-label="Remove stop ${index + 1}">×</button>
      </div>
      <div class="name-popover" id="${popoverId}" data-stop-index="${index}">
        <input
          type="text"
          class="name-input"
          data-action="name-search"
          value="${escapeHtml(named?.name || '')}"
          placeholder="Search Blue, Butter Yellow, #3389…"
          autocomplete="off"
          spellcheck="false"
          role="combobox"
          aria-label="Search named colors for stop ${index + 1}"
          aria-autocomplete="list"
          aria-controls="${resultsId}"
          aria-expanded="false"
          aria-activedescendant=""
        />
        <div class="name-results" id="${resultsId}" role="listbox" aria-label="Named color results"></div>
      </div>
    </div>`;
  }).join('');

  const handles = state.stops.map((stop, index) => {
    const hex = normalizeHex(stop.color) || '#000000';
    return `<button
      type="button"
      class="stop-handle"
      data-stop-index="${index}"
      role="slider"
      aria-label="Stop ${index + 1} position"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow="${Math.round(stop.position)}"
      aria-valuetext="${Math.round(stop.position)} percent"
      style="left:${stop.position}%;--stop-color:${hex}"
      title="Drag stop ${index + 1} · ${hex} · ${Math.round(stop.position)}%"
    ></button>`;
  }).join('');

  editor.innerHTML = `${cards}<div class="stop-track" id="stopTrack" title="Double-click to add a stop">${handles}</div>`;
  refreshTrack();
}

function refreshTrack() {
  const trackEl = $('#stopTrack');
  if (!trackEl) return;
  const valid = getValidStops();
  if (valid.length >= 2) trackEl.style.background = previewOklchCss(valid, 90);

  state.stops.forEach((stop, index) => {
    const card = $(`.stop-card[data-index="${index}"]`);
    if (card) {
      const named = namedColorForHex(stop.color);
      const label = card.querySelector('.stop-name');
      if (label) label.textContent = named?.name || 'Custom color';
    }

    const handle = trackEl.querySelector(`[data-stop-index="${index}"]`);
    if (!handle) return;
    const hex = normalizeHex(stop.color) || '#000000';
    const position = Math.round(stop.position);
    handle.style.left = `${stop.position}%`;
    handle.style.setProperty('--stop-color', hex);
    handle.setAttribute('aria-valuenow', String(position));
    handle.setAttribute('aria-valuetext', `${position} percent`);
    handle.title = `Drag stop ${index + 1} · ${hex} · ${position}%`;
  });
}

function syncStopVisuals(index, { syncNameInput = true } = {}) {
  const card = $(`.stop-card[data-index="${index}"]`);
  if (!card || !state.stops[index]) return;
  const stop = state.stops[index];
  const hex = normalizeHex(stop.color);
  if (!hex) return;

  const picker = card.querySelector('[data-action="picker"]');
  const hexInput = card.querySelector('[data-action="color"]');
  const positionInput = card.querySelector('[data-action="position"]');
  const nameInput = card.querySelector('[data-action="name-search"]');
  const nameLabel = card.querySelector('.stop-name');
  const named = namedColorForHex(hex);

  if (picker && picker.value.toUpperCase() !== hex) picker.value = hex;
  if (hexInput && document.activeElement !== hexInput) hexInput.value = hex;
  if (positionInput && document.activeElement !== positionInput) positionInput.value = Math.round(stop.position);
  if (nameLabel) nameLabel.textContent = named?.name || 'Custom color';
  if (syncNameInput && nameInput && document.activeElement !== nameInput) nameInput.value = named?.name || '';
  refreshTrack();
}

function addStop() {
  if (state.stops.length >= 6) {
    showToast('This editor supports up to 6 stops.', 'error');
    return;
  }

  const sorted = [...state.stops].sort((a, b) => a.position - b.position);
  let best = { gap: -1, a: sorted[0], b: sorted[1] };
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = sorted[i + 1].position - sorted[i].position;
    if (gap > best.gap) best = { gap, a: sorted[i], b: sorted[i + 1] };
  }

  const position = Math.round((best.a.position + best.b.position) / 2);
  const sampled = sampleAt(
    [{ color: best.a.color, position: 0 }, { color: best.b.color, position: 100 }],
    .5,
    'oklch',
    state.hue
  );

  state.stops.push({ color: sampled.hex, position });
  state.stops.sort((a, b) => a.position - b.position);
  renderAll();
  track('stop_added', { position });
}

function renderPreview() {
  const stops = getValidStops();
  if (stops.length < 2) return;

  $('#oklchLayer').style.background = previewOklchCss(stops);
  $('#srgbLayer').style.background = nativeGradientCss(stops, state.angle, 'srgb', state.hue);

  const preview = $('#heroPreview');
  preview.dataset.mode = state.mode;

  const compare = clamp(state.comparePosition, 0, 1);
  $('#oklchLayer').style.clipPath = state.mode === 'compare'
    ? `inset(0 ${(1 - compare) * 100}% 0 0)`
    : 'inset(0)';
  $('#compareDivider').style.left = `${compare * 100}%`;
  $('#compareHandle').setAttribute('aria-valuenow', String(Math.round(compare * 100)));
  $('#compareHandle').setAttribute('aria-valuetext', `${Math.round(compare * 100)} percent OKLCH revealed`);

  const read = clamp(state.readPosition, 0, 1);
  $('#scrubber').style.left = `${read * 100}%`;

  const oklchPoint = sampleAt(stops, read, 'oklch', state.hue);
  const srgbPoint = sampleAt(stops, read, 'srgb', state.hue);
  const difference = deltaEOK(oklchPoint.oklch, srgbPoint.oklch);

  $('#readPosition').textContent = `${Math.round(read * 100)}%`;
  $('#readHex').textContent = oklchPoint.hex;
  $('#readOklch').textContent = formatOklch(oklchPoint.oklch);
  $('#readSrgbHex').textContent = srgbPoint.hex;
  $('#readDelta').textContent = `ΔEOK ${difference.toFixed(3)}`;
  $('#readGamut').textContent = oklchPoint.gamutMapped ? 'Mapped for HEX' : 'In sRGB gamut';
  $('#readMapDelta').textContent = oklchPoint.gamutMapped
    ? `Mapping ΔEOK ${oklchPoint.mapDeltaE.toFixed(3)}`
    : 'No mapping needed';

  [...document.querySelectorAll('.mode-switch button')].forEach(button => {
    button.classList.toggle('active', button.dataset.mode === state.mode);
    button.setAttribute('aria-pressed', button.dataset.mode === state.mode ? 'true' : 'false');
  });
}

function renderAnalysis() {
  const stops = getValidStops();
  if (stops.length < 2) return;

  const srgb = midpoint(stops, 'srgb', state.hue);
  const oklch = midpoint(stops, 'oklch', state.hue);
  const difference = perceptualDifference(stops, state.hue);
  const chroma = chromaLift(stops, state.hue);

  $('#metricSentence').textContent = difference < .01
    ? 'These interpolation paths produce very similar midpoint colors.'
    : difference < .05
      ? 'These interpolation paths produce noticeably different midpoint colors.'
      : 'These interpolation paths produce substantially different midpoint colors.';

  $('#srgbMidSwatch').style.background = srgb.hex;
  $('#srgbMidHex').textContent = srgb.hex;
  $('#srgbMidOklch').textContent = formatOklch(srgb.oklch);
  $('#oklchMidSwatch').style.background = oklch.hex;
  $('#oklchMidHex').textContent = oklch.hex;
  $('#oklchMidOklch').textContent = formatOklch(oklch.oklch);
  $('#metricDelta').textContent = difference.toFixed(3);
  $('#srgbChroma').textContent = chroma.srgb.toFixed(4);
  $('#oklchChroma').textContent = chroma.oklch.toFixed(4);
}

function renderCompare() {
  const stops = getValidStops();
  if (stops.length < 2) return;
  $('#compareSrgb').style.background = nativeGradientCss(stops, state.angle, 'srgb', state.hue);
  $('#compareOklch').style.background = previewOklchCss(stops);
}

function renderExport() {
  const stops = getValidStops();
  if (stops.length < 2) return;

  const native = `background: ${nativeGradientCss(stops, state.angle, 'oklch', state.hue)};`;
  const fallback = `background: ${fallbackGradientCss(stops, state.angle, state.samples, state.hue)};`;
  $('#nativeCode').textContent = native;
  $('#fallbackCode').textContent = fallback;

  const samples = sampleGradient(stops, 'oklch', state.samples, state.hue);
  const mapped = samples.filter(point => point.gamutMapped).length;
  $('#sampleCount').textContent = `${state.samples} samples`;
  $('#mappedCount').textContent = `${mapped} gamut-mapped`;
}

function renderComputed() {
  renderPreview();
  renderAnalysis();
  renderCompare();
  renderExport();
}

function renderAll() {
  renderStops();
  renderComputed();
  $('#angle').value = state.angle;
  $('#samples').value = state.samples;
  [...$('#hueModes').children].forEach(button => {
    const active = button.dataset.hue === state.hue;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function scoreNamedColor(item, query) {
  const name = item.name.toLowerCase();
  const hex = item.hex.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return 99;
  if (name === q) return 0;
  if (name.startsWith(q)) return 1;
  if (name.split(/[\s/\-]+/).some(word => word.startsWith(q))) return 2;
  if (name.includes(q)) return 3;
  if (hex.startsWith(q.startsWith('#') ? q : `#${q}`)) return 4;
  return 99;
}

function findNamedColors(query, limit = 9) {
  const q = query.trim();
  if (!q) return [];
  return NAMED_COLORS
    .map((item, index) => ({ item, index, score: scoreNamedColor(item, q) }))
    .filter(result => result.score < 99)
    .sort((a, b) =>
      a.score - b.score ||
      (LIBRARY_PRIORITY[a.item.group] ?? 9) - (LIBRARY_PRIORITY[b.item.group] ?? 9) ||
      a.item.name.length - b.item.name.length ||
      a.index - b.index
    )
    .slice(0, limit)
    .map(result => result.item);
}

function closeNameSearch(card) {
  if (!card) return;
  card.classList.remove('search-open');
  const trigger = card.querySelector('[data-action="open-search"]');
  const input = card.querySelector('[data-action="name-search"]');
  trigger?.setAttribute('aria-expanded', 'false');
  input?.setAttribute('aria-expanded', 'false');
  input?.setAttribute('aria-activedescendant', '');
}

function closeAllNameSearch(except = null) {
  document.querySelectorAll('.stop-card.search-open').forEach(card => {
    if (card !== except) closeNameSearch(card);
  });
}

function renderNameResults(card, query) {
  const input = card.querySelector('[data-action="name-search"]');
  const list = card.querySelector('.name-results');
  const results = findNamedColors(query);
  card.dataset.activeIndex = '-1';
  input.setAttribute('aria-activedescendant', '');
  input.setAttribute('aria-expanded', 'true');

  if (!query.trim()) {
    list.innerHTML = '<div class="name-empty">Type a color name or HEX prefix. Search is local and works without an account.</div>';
    return;
  }

  if (!results.length) {
    list.innerHTML = '<div class="name-empty">No named color found. You can still enter any valid HEX value.</div>';
    return;
  }

  const cardIndex = Number(card.dataset.index);
  list.innerHTML = results.map((color, index) => `
    <button
      type="button"
      class="name-option"
      id="name-option-${cardIndex}-${index}"
      role="option"
      aria-selected="false"
      data-result-index="${index}"
      data-name="${escapeHtml(color.name)}"
      data-hex="${color.hex}"
      data-group="${escapeHtml(color.group)}"
    >
      <i style="background:${color.hex}" aria-hidden="true"></i>
      <span><b>${escapeHtml(color.name)}</b><small>${escapeHtml(color.group)}</small></span>
      <code>${color.hex}</code>
    </button>
  `).join('');
}

function openNameSearch(card) {
  closeAllNameSearch(card);
  card.classList.add('search-open');
  const trigger = card.querySelector('[data-action="open-search"]');
  const input = card.querySelector('[data-action="name-search"]');
  trigger.setAttribute('aria-expanded', 'true');
  input.setAttribute('aria-expanded', 'true');
  renderNameResults(card, input.value);
  requestAnimationFrame(() => {
    input.focus();
    input.select();
  });
  track('named_color_search_used');
}

function setActiveNameOption(card, index) {
  const input = card.querySelector('[data-action="name-search"]');
  const options = [...card.querySelectorAll('.name-option')];
  if (!options.length) return;
  const next = clamp(index, 0, options.length - 1);
  card.dataset.activeIndex = String(next);
  options.forEach((option, optionIndex) => {
    const active = optionIndex === next;
    option.classList.toggle('active', active);
    option.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  input.setAttribute('aria-activedescendant', options[next].id);
  options[next].scrollIntoView({ block: 'nearest' });
}

function chooseNamedColor(card, option) {
  const index = Number(card.dataset.index);
  const hex = normalizeHex(option.dataset.hex);
  if (!hex || !state.stops[index]) return;

  state.stops[index].color = hex;
  const input = card.querySelector('[data-action="name-search"]');
  input.value = option.dataset.name;
  closeNameSearch(card);
  syncStopVisuals(index, { syncNameInput: false });
  renderComputed();
  track('named_color_selected', { name: option.dataset.name, hex });
}

$('#stopEditor').addEventListener('input', event => {
  const card = event.target.closest('.stop-card');
  if (!card) return;
  const index = Number(card.dataset.index);
  const action = event.target.dataset.action;

  if (action === 'picker') {
    state.stops[index].color = event.target.value.toUpperCase();
    const hexInput = card.querySelector('[data-action="color"]');
    if (hexInput) hexInput.value = state.stops[index].color;
    syncStopVisuals(index);
    renderComputed();
    track('stop_color_changed', { source: 'picker' });
    return;
  }

  if (action === 'color') {
    const typed = event.target.value.toUpperCase();
    if (event.target.value !== typed) event.target.value = typed;
    const hex = normalizeHex(typed);
    if (!hex) return;
    state.stops[index].color = hex;
    const picker = card.querySelector('[data-action="picker"]');
    if (picker) picker.value = hex;
    syncStopVisuals(index);
    renderComputed();
    return;
  }

  if (action === 'position') {
    state.stops[index].position = clamp(Number(event.target.value) || 0, 0, 100);
    syncStopVisuals(index);
    renderComputed();
    return;
  }

  if (action === 'name-search') {
    renderNameResults(card, event.target.value);
  }
});

$('#stopEditor').addEventListener('change', event => {
  const card = event.target.closest('.stop-card');
  if (!card) return;
  const index = Number(card.dataset.index);
  const action = event.target.dataset.action;

  if (action === 'color') {
    if (!normalizeHex(event.target.value)) {
      event.target.value = state.stops[index].color;
    } else {
      track('stop_color_changed', { source: 'hex' });
    }
  }

  if (action === 'position') track('stop_position_changed');
});

$('#stopEditor').addEventListener('click', event => {
  const option = event.target.closest('.name-option');
  if (option) {
    chooseNamedColor(option.closest('.stop-card'), option);
    return;
  }

  const trigger = event.target.closest('[data-action="open-search"]');
  if (trigger) {
    const card = trigger.closest('.stop-card');
    if (card.classList.contains('search-open')) closeNameSearch(card);
    else openNameSearch(card);
    return;
  }

  const remove = event.target.closest('[data-action="remove"]');
  if (remove && state.stops.length > 2) {
    const card = remove.closest('.stop-card');
    const index = Number(card.dataset.index);
    state.stops.splice(index, 1);
    renderAll();
    track('stop_removed');
  }
});

$('#stopEditor').addEventListener('keydown', event => {
  const card = event.target.closest('.stop-card');
  if (!card) return;

  if (event.target.dataset.action === 'name-search') {
    const options = [...card.querySelectorAll('.name-option')];
    let active = Number(card.dataset.activeIndex ?? -1);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveNameOption(card, active + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveNameOption(card, active <= 0 ? 0 : active - 1);
    } else if (event.key === 'Enter' && options.length) {
      event.preventDefault();
      chooseNamedColor(card, options[active >= 0 ? active : 0]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeNameSearch(card);
      card.querySelector('[data-action="open-search"]')?.focus();
    }
    return;
  }

  const handle = event.target.closest('.stop-handle');
  if (!handle) return;
  const index = Number(handle.dataset.stopIndex);
  const stop = state.stops[index];
  if (!stop) return;

  let next = stop.position;
  if (event.key === 'ArrowLeft') next -= event.shiftKey ? 5 : 1;
  else if (event.key === 'ArrowRight') next += event.shiftKey ? 5 : 1;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = 100;
  else return;

  event.preventDefault();
  stop.position = clamp(Math.round(next), 0, 100);
  syncStopVisuals(index);
  renderComputed();
  announce(`Stop ${index + 1}: ${stop.position} percent`);
  track('stop_position_changed', { source: 'keyboard' });
});

document.addEventListener('pointerdown', event => {
  if (!event.target.closest('.stop-card')) closeAllNameSearch();
});

let stopDrag = null;
let stopMoveFrame = 0;
let pendingStopPoint = null;

function applyStopPointer(clientX) {
  if (!stopDrag) return;
  const trackEl = $('#stopTrack');
  if (!trackEl) return;
  const rect = trackEl.getBoundingClientRect();
  const position = Math.round(clamp((clientX - rect.left) / rect.width, 0, 1) * 100);
  const stop = state.stops[stopDrag.index];
  if (!stop) return;
  stop.position = position;
  syncStopVisuals(stopDrag.index);
  renderComputed();
}

function queueStopPointer(clientX) {
  pendingStopPoint = clientX;
  if (stopMoveFrame) return;
  stopMoveFrame = requestAnimationFrame(() => {
    stopMoveFrame = 0;
    if (pendingStopPoint != null) applyStopPointer(pendingStopPoint);
    pendingStopPoint = null;
  });
}

$('#stopEditor').addEventListener('pointerdown', event => {
  const handle = event.target.closest('.stop-handle');
  if (!handle) return;
  event.preventDefault();
  const index = Number(handle.dataset.stopIndex);
  stopDrag = { index, pointerId: event.pointerId, moved: false };
  handle.classList.add('is-dragging');
  handle.setPointerCapture?.(event.pointerId);
});

window.addEventListener('pointermove', event => {
  if (!stopDrag || event.pointerId !== stopDrag.pointerId) return;
  stopDrag.moved = true;
  queueStopPointer(event.clientX);
}, { passive: true });

function finishStopDrag(event) {
  if (!stopDrag || event.pointerId !== stopDrag.pointerId) return;
  const moved = stopDrag.moved;
  state.stops.sort((a, b) => a.position - b.position);
  stopDrag = null;
  renderAll();
  if (moved) track('stop_dragged');
}
window.addEventListener('pointerup', finishStopDrag);
window.addEventListener('pointercancel', finishStopDrag);

$('#stopEditor').addEventListener('dblclick', event => {
  const trackEl = event.target.closest('#stopTrack');
  if (!trackEl || event.target.closest('.stop-handle') || state.stops.length >= 6) return;
  const rect = trackEl.getBoundingClientRect();
  const position = Math.round(clamp((event.clientX - rect.left) / rect.width, 0, 1) * 100);
  const sampled = sampleAt(getValidStops(), position / 100, 'oklch', state.hue);
  state.stops.push({ color: sampled.hex, position });
  state.stops.sort((a, b) => a.position - b.position);
  renderAll();
  track('stop_added', { source: 'double_click', position });
});

$('#addStop').addEventListener('click', addStop);

$('#angle').addEventListener('input', event => {
  state.angle = clamp(Number(event.target.value) || 0, 0, 360);
  renderComputed();
});
$('#angle').addEventListener('change', () => track('angle_changed', { angle: state.angle }));

$('#samples').addEventListener('input', event => {
  state.samples = clamp(Number(event.target.value) || 33, 9, 129);
  renderExport();
});
$('#samples').addEventListener('change', () => track('fallback_samples_changed', { samples: state.samples }));

$('#hueModes').addEventListener('click', event => {
  const button = event.target.closest('button[data-hue]');
  if (!button) return;
  state.hue = button.dataset.hue;
  refreshTrack();
  renderComputed();
  [...$('#hueModes').children].forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  track('hue_route_changed', { hue: state.hue });
});

function setMode(mode, { persist = true, analytics = true } = {}) {
  if (!validModes.has(mode)) return;
  state.mode = mode;
  if (persist) saveMode();
  renderPreview();
  if (analytics) {
    track('mode_changed', { mode });
    if (mode === 'compare') track('compare_started');
  }
}

document.querySelector('.mode-switch').addEventListener('click', event => {
  const button = event.target.closest('button[data-mode]');
  if (button) setMode(button.dataset.mode);
});

const hero = $('#heroPreview');
let heroDrag = null;
let heroMoveFrame = 0;
let pendingHeroPoint = null;

function applyHeroPointer(clientX, type) {
  const rect = hero.getBoundingClientRect();
  const t = clamp((clientX - rect.left) / rect.width, 0, 1);
  if (type === 'compare') state.comparePosition = t;
  else state.readPosition = t;
  renderPreview();
}

function queueHeroPointer(clientX, type) {
  pendingHeroPoint = { clientX, type };
  if (heroMoveFrame) return;
  heroMoveFrame = requestAnimationFrame(() => {
    heroMoveFrame = 0;
    if (pendingHeroPoint) applyHeroPointer(pendingHeroPoint.clientX, pendingHeroPoint.type);
    pendingHeroPoint = null;
  });
}

hero.addEventListener('pointerdown', event => {
  if (event.button !== undefined && event.button !== 0) return;
  const type = event.target.closest('#compareHandle') ? 'compare' : 'inspect';
  if (type === 'compare') event.preventDefault();
  heroDrag = { pointerId: event.pointerId, type, moved: false };
  hero.setPointerCapture?.(event.pointerId);
  applyHeroPointer(event.clientX, type);
});

hero.addEventListener('pointermove', event => {
  if (!heroDrag || heroDrag.pointerId !== event.pointerId) return;
  heroDrag.moved = true;
  queueHeroPointer(event.clientX, heroDrag.type);
});

function endHeroDrag(event) {
  if (!heroDrag || heroDrag.pointerId !== event.pointerId) return;
  const finished = heroDrag;
  heroDrag = null;
  try { hero.releasePointerCapture?.(event.pointerId); } catch {}
  if (finished.type === 'compare') track('compare_dragged');
  else track('gradient_inspected', { position: Math.round(state.readPosition * 100) });
}
hero.addEventListener('pointerup', endHeroDrag);
hero.addEventListener('pointercancel', endHeroDrag);

$('#compareHandle').addEventListener('keydown', event => {
  let next = state.comparePosition;
  if (event.key === 'ArrowLeft') next -= event.shiftKey ? .05 : .01;
  else if (event.key === 'ArrowRight') next += event.shiftKey ? .05 : .01;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = 1;
  else return;
  event.preventDefault();
  state.comparePosition = clamp(next, 0, 1);
  renderPreview();
  announce(`${Math.round(state.comparePosition * 100)} percent OKLCH revealed`);
});

$('#convertInput').addEventListener('click', () => {
  track('gradient_pasted');
  const parsed = parseGradientInput($('#gradientInput').value);
  if (parsed.error) {
    setParseMessage(parsed.message, 'error');
    $('#gradientInput').focus();
    track('gradient_parse_failed', { reason: parsed.error });
    return;
  }

  state.stops = parsed.stops.map(stop => ({
    ...stop,
    position: clamp(Number(stop.position), 0, 100)
  }));
  state.angle = parsed.angle;
  setParseMessage(parsed.warning || 'Gradient loaded.', parsed.warning ? 'warning' : 'success');
  renderAll();
  setMode('compare', { persist: true, analytics: false });
  track('gradient_parsed', { stops: state.stops.length });
});

$('#gradientInput').addEventListener('keydown', event => {
  if (event.key === 'Enter') $('#convertInput').click();
});

$('#pasteCta').addEventListener('click', () => {
  $('#gradientInput').scrollIntoView({ behavior: 'smooth', block: 'center' });
  requestAnimationFrame(() => $('#gradientInput').focus());
});

$('#compareCta').addEventListener('click', () => {
  setMode('compare');
  $('#workspace').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

$('#reset').addEventListener('click', () => {
  Object.assign(state, {
    stops: [
      { color: '#0000FF', position: 0 },
      { color: '#FFFF00', position: 100 }
    ],
    angle: 90,
    samples: 33,
    hue: 'shorter',
    mode: 'compare',
    readPosition: .5,
    comparePosition: .5
  });
  saveMode();
  $('#gradientInput').value = '';
  setParseMessage();
  renderAll();
  track('reset_clicked');
});

document.body.addEventListener('click', event => {
  const button = event.target.closest('[data-copy-target]');
  if (!button) return;
  const target = $(`#${button.dataset.copyTarget}`);
  if (target) copyText(target.textContent, button.dataset.copyKind);
});

renderSupport();
renderAll();
track('truegradient_viewed', { native_oklch_supported: nativeOklchSupported });
