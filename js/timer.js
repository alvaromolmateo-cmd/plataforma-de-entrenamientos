// Temporizador de descanso y cronómetro de sesión.
//
// Vive fuera del store a propósito: el contador cambia cada segundo y no debe repintar la app
// entera. Escribe directamente en la barra fija `#rest` y en los elementos `[data-since]`.

import { getState } from './store.js';

let rest = null; // { endsAt, total, label, paused, remaining }
let raf = null;

export const mmss = (secs) => {
  const s = Math.max(0, Math.round(secs));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export const hhmm = (mins) => {
  const m = Math.max(0, Math.round(mins));
  return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min` : `${m} min`;
};

// ---------- Aviso sonoro ----------
let audioCtx = null;
function beep(times = 2) {
  const s = getState().settings;
  if (s.vibrate && navigator.vibrate) navigator.vibrate([120, 80, 120]);
  if (!s.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    for (let i = 0; i < times; i += 1) {
      const t = audioCtx.currentTime + i * 0.28;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.24);
    }
  } catch { /* sin audio disponible */ }
}

// ---------- API ----------
export function startRest(seconds, label = 'Descanso') {
  const total = Math.max(1, Math.round(Number(seconds) || 0));
  rest = { total, endsAt: Date.now() + total * 1000, label, paused: false, remaining: total, done: false };
  loop();
}

export function addRest(seconds) {
  if (!rest) return;
  if (rest.paused) rest.remaining = Math.max(0, rest.remaining + seconds);
  else rest.endsAt += seconds * 1000;
  rest.total = Math.max(rest.total, remainingOf(rest));
  draw();
}

export function togglePause() {
  if (!rest) return;
  if (rest.paused) {
    rest.endsAt = Date.now() + rest.remaining * 1000;
    rest.paused = false;
    loop();
  } else {
    rest.remaining = remainingOf(rest);
    rest.paused = true;
  }
  draw();
}

export function stopRest() {
  rest = null;
  cancelAnimationFrame(raf);
  raf = null;
  draw();
}

export const restRunning = () => !!rest;

const remainingOf = (r) => (r.paused ? r.remaining : Math.max(0, (r.endsAt - Date.now()) / 1000));

// ---------- Bucle ----------
let lastPaint = 0;
function loop() {
  cancelAnimationFrame(raf);
  const step = (ts) => {
    if (ts - lastPaint > 200) {
      lastPaint = ts;
      draw();
      tickClocks();
    }
    if (rest && !rest.done) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
}

function draw() {
  const host = document.getElementById('rest');
  if (!host) return;
  if (!rest) {
    host.innerHTML = '';
    host.hidden = true;
    return;
  }
  const left = remainingOf(rest);
  if (left <= 0 && !rest.done) {
    rest.done = true;
    beep(2);
  }
  const pct = Math.max(0, Math.min(100, (left / rest.total) * 100));
  host.hidden = false;
  host.innerHTML = `
    <div class="rest-bar${rest.done ? ' is-done' : ''}">
      <div class="rest-fill" style="width:${pct.toFixed(1)}%"></div>
      <div class="rest-body">
        <div class="rest-info">
          <span class="rest-label">${rest.done ? '¡A por la siguiente!' : rest.label}</span>
          <span class="rest-time">${mmss(left)}</span>
        </div>
        <div class="rest-actions">
          <button class="btn sm" data-rest="-15">−15"</button>
          <button class="btn sm" data-rest="15">+15"</button>
          <button class="btn sm" data-rest="pause">${rest.paused ? 'Seguir' : 'Pausa'}</button>
          <button class="btn sm btn-primary" data-rest="stop">Listo</button>
        </div>
      </div>
    </div>`;
}

// Cronómetros de sesión: elementos con data-since="ISO".
function tickClocks() {
  document.querySelectorAll('[data-since]').forEach((el) => {
    const start = new Date(el.dataset.since).getTime();
    if (!start) return;
    const mins = (Date.now() - start) / 60000;
    el.textContent = mins < 60 ? `${Math.floor(mins)} min` : hhmm(mins);
  });
}

// Un latido lento mantiene los cronómetros vivos aunque no haya descanso en marcha.
setInterval(tickClocks, 20000);

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-rest]');
  if (!btn) return;
  const v = btn.dataset.rest;
  if (v === 'stop') stopRest();
  else if (v === 'pause') togglePause();
  else addRest(Number(v));
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    draw();
    tickClocks();
  }
});
