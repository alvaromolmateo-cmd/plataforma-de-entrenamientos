// Piezas de interfaz compartidas entre vistas.

import { esc, icon, fmtNum } from '../ui.js';
import { MUSCLE, MUSCLES, muscleName, typeLabel, myoPlan, profileOf, MYO_MINIS, MYO_REST_FIRST, MYO_REST } from '../catalog.js';
import { exerciseById } from '../store.js';
import { fmtSet, entryTotals } from '../sets.js';
import { sessionTotals, loadOf } from '../metrics.js';
import { mmss } from '../timer.js';

export const muscleChip = (id) => `<span class="chip chip-${esc(id)}">${MUSCLE[id]?.emoji || ''} ${esc(MUSCLE[id]?.short || 'Otro')}</span>`;

export const typeChip = (type) => (type === 'normal' ? '' : `<span class="chip chip-type chip-${esc(type)}">${esc(typeLabel(type))}</span>`);

export const FEELS = [
  { v: 1, emoji: '😵', label: 'Fatal' },
  { v: 2, emoji: '😕', label: 'Flojo' },
  { v: 3, emoji: '🙂', label: 'Normal' },
  { v: 4, emoji: '😃', label: 'Bien' },
  { v: 5, emoji: '🔥', label: 'Brutal' },
];

export const feelEmoji = (v) => FEELS.find((f) => f.v === v)?.emoji || '';

// ---------- Prescripción ----------
// Texto corto de lo que toca hacer en un ejercicio.
export function planText(plan) {
  if (!plan) return '';
  switch (plan.type) {
    case 'myo':
      return `Myo-reps · activación al fallo + ${MYO_MINIS} mini-series`;
    case 'restpause': {
      const chain = (plan.scheme || []).join('×');
      return `Rest-pause · ${chain} con ${plan.clusterRest || 15}" entre tandas`;
    }
    case 'dropset': {
      const chain = [...(plan.dropScheme || []), ...(plan.dropFail ? ['fallo'] : [])].join('×');
      return `Drop set · ${chain}${plan.dropSets > 1 ? ` · ${plan.dropSets} series` : ''}`;
    }
    default: {
      const reps = plan.repsText || (plan.repsMin === plan.repsMax ? plan.repsMin : `${plan.repsMin}-${plan.repsMax}`);
      const extra = plan.extra?.count ? ` (+${plan.extra.count})` : '';
      const rir = plan.rir ? ` · RIR ${esc(plan.rir)}` : '';
      return `${plan.sets}${extra} × ${reps}${rir}`;
    }
  }
}

// Detalles secundarios: tempo, nota del entrenador, descanso.
export function planDetails(plan) {
  const bits = [];
  if (plan.tempo) bits.push(`${icon('clock')} ${esc(plan.tempo)}`);
  if (plan.note) bits.push(`${icon('info')} ${esc(plan.note)}`);
  if (plan.extra?.note) bits.push(`${icon('plus')} serie extra: ${esc(plan.extra.note)}`);
  if (plan.rest) bits.push(`${icon('pause')} ${mmss(plan.rest)} de descanso`);
  return bits.length ? `<div class="plan-details">${bits.map((b) => `<span>${b}</span>`).join('')}</div>` : '';
}

// Guía de myo-reps para unas reps de activación dadas.
export function myoGuide(activation) {
  const p = myoPlan(activation);
  if (!activation) {
    return `<p class="muted">Haz la serie de activación al fallo y apunta las reps: la tabla dirá cuántas mini-series tocan.</p>`;
  }
  const verdict = p.verdict === 'heavy'
    ? '<span class="warn">Menos de 6 reps: el peso se te ha ido, baja para la próxima.</span>'
    : p.verdict === 'light'
      ? '<span class="warn">Más de 20 reps: demasiado ligero, sube en la próxima sesión.</span>'
      : '';
  return `
    <div class="myo-guide">
      <b>${activation} reps</b> → ${MYO_MINIS} mini-series de <b>${p.reps}</b> ·
      descansa <b>${MYO_REST_FIRST}"</b> y luego <b>${MYO_REST}"</b> entre cada una · la última, al fallo.
      ${verdict}
    </div>`;
}

// ---------- Resumen de una sesión ----------
export function sessionSummary(session, { compact = false } = {}) {
  const t = sessionTotals(session);
  const bits = [
    `<b>${fmtNum(Math.round(t.tonnage))}</b> kg`,
    `<b>${fmtNum(t.effective, 1)}</b> series`,
    `<b>${t.reps}</b> reps`,
  ];
  if (t.duration) bits.push(`<b>${t.duration}</b> min`);
  if (!compact && t.avgRir != null) bits.push(`RIR medio <b>${fmtNum(t.avgRir, 1)}</b>`);
  return `<div class="summary-row">${bits.map((b) => `<span>${b}</span>`).join('')}</div>`;
}

// Lista de lo registrado en una sesión, tal cual quedaría en la libreta.
export function entryLines(session) {
  return (session.entries || []).map((entry) => {
    const ex = exerciseById(entry.exerciseId);
    const t = entryTotals(entry, loadOf(ex));
    if (!t.sets) return '';
    const sets = entry.sets.filter((s) => fmtSet(s, entry.type, { bw: ex.bw }) !== '—');
    return `
      <div class="log-line">
        <div class="log-name">${esc(ex.name)} ${muscleChip(ex.muscle)} ${typeChip(entry.type)}</div>
        <div class="log-sets">${sets.map((s) => `<span class="log-set">${esc(fmtSet(s, entry.type, { bw: ex.bw }))}</span>`).join('')}</div>
        ${entry.note ? `<div class="log-note">${icon('edit')} ${esc(entry.note)}</div>` : ''}
      </div>`;
  }).join('');
}

// ---------- Volumen por grupo muscular ----------
// Barras con la banda de referencia (12-20 series semanales en los grupos grandes, Baz-Valle 2022).
export function volumeBars(byMuscle) {
  const rows = MUSCLES
    .map((m) => ({ m, v: byMuscle[m.id] || 0, range: profileOf(m.id).sets }))
    .filter((r) => r.v > 0)
    .sort((a, b) => b.v - a.v);
  if (!rows.length) return '<p class="muted">Sin series registradas.</p>';
  const max = Math.max(...rows.map((r) => Math.max(r.v, r.range[1])));
  return `<div class="vol-list">${rows.map(({ m, v, range }) => {
    const state = v < range[0] ? 'low' : v > range[1] ? 'high' : 'ok';
    return `
      <div class="vol-row" title="${esc(m.name)}: ${fmtNum(v, 1)} series · referencia ${range[0]}-${range[1]}">
        <span class="vol-name">${m.emoji} ${esc(m.short)}</span>
        <span class="vol-track">
          <span class="vol-band" style="left:${((range[0] / max) * 100).toFixed(1)}%;width:${(((range[1] - range[0]) / max) * 100).toFixed(1)}%"></span>
          <span class="vol-fill vol-${state}" style="width:${Math.min(100, (v / max) * 100).toFixed(1)}%"></span>
        </span>
        <span class="vol-val vol-${state}">${fmtNum(v, 1)}<small>/${range[0]}-${range[1]}</small></span>
      </div>`;
  }).join('')}</div>`;
}

// ---------- Selectores ----------
export const dayOptions = (days, selected) => days.map((d) => `<option value="${esc(d.id)}"${d.id === selected ? ' selected' : ''}>${esc(d.name)} · ${esc(d.focus)}</option>`).join('');

export const exerciseOptions = (exercises, selected) => exercises
  .filter((e) => !e.archived)
  .sort((a, b) => a.name.localeCompare(b.name, 'es'))
  .map((e) => `<option value="${esc(e.id)}"${e.id === selected ? ' selected' : ''}>${esc(e.name)} — ${esc(muscleName(e.muscle))}</option>`)
  .join('');

export const emptyState = (text, action = '') => `<div class="empty">${icon('feather')}<p>${esc(text)}</p>${action}</div>`;
