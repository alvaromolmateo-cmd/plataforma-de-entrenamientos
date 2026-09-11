// Vista «Ajustes»: preferencias, copia de seguridad y la letra pequeña de cómo calcula la app.

import { esc, icon, fmtNum, toast, confirmDialog } from '../ui.js';
import { getState, setSetting, exportJSON, importJSON, resetAll, storageInfo } from '../store.js';
import { MYO_TABLE, MYO_REST_FIRST, MYO_REST, MYO_MINIS } from '../catalog.js';

const THEMES = [['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Oscuro']];

export function render(ctx) {
  const s = getState().settings;
  const info = storageInfo();

  return `
    <div class="page-head">
      <h1>Ajustes</h1>
    </div>

    <div class="grid-2">
      <div class="card">
        <h2>${icon('settings')} Preferencias</h2>

        <label class="lbl">Tema</label>
        <div class="seg">${THEMES.map(([v, l]) => `<button class="seg-btn${s.theme === v ? ' on' : ''}" data-theme="${v}">${l}</button>`).join('')}</div>

        <div class="form-row" style="margin-top:14px">
          <label class="fld">Peso corporal (kg)
            <input class="input" type="number" step="0.1" min="0" placeholder="—" value="${s.bodyweight ?? ''}" data-bodyweight>
          </label>
          <label class="fld grow">Lema
            <input class="input" type="text" value="${esc(s.motto)}" data-motto>
          </label>
        </div>
        <p class="hint">El peso corporal se suma a la carga en los ejercicios que tiran de él (fondos), para que el tonelaje no se quede corto.</p>

        <p class="hint">La app no cronometra descansos: vas por sensaciones. Los únicos pautados son los de las myo-reps (${MYO_REST_FIRST}" y ${MYO_REST}"), y ahí solo te los recuerda.</p>
      </div>

      <div class="card">
        <h2>${icon('archive')} Copia de seguridad</h2>
        <p class="muted">Todo se guarda en este dispositivo. Exporta de vez en cuando para no perder el histórico.</p>
        <div class="btn-row">
          <button class="btn" data-export>${icon('download')} Exportar JSON</button>
          <button class="btn" data-import>${icon('upload')} Importar</button>
          <input type="file" accept="application/json,.json" hidden data-file>
        </div>
        <p class="hint">${info.sessions} entrenos · ${fmtNum(info.bytes / 1024, 1)} KB ocupados.</p>

        ${ctx.installPrompt && !ctx.standalone ? `
          <h3 class="sub-h">${icon('phone')} Instalar</h3>
          <p class="muted">Instálala en el móvil y la tendrás como una app más, también sin cobertura en el gimnasio.</p>
          <button class="btn btn-primary" data-install>${icon('download')} Instalar app</button>` : ''}

        <h3 class="sub-h">${icon('trash')} Zona peligrosa</h3>
        <button class="btn btn-danger-ghost" data-reset>${icon('trash')} Borrar todo y empezar de cero</button>
      </div>
    </div>

    <div class="card">
      <h2>${icon('info')} Cómo calcula la app</h2>
      <div class="about-grid">
        <div>
          <h3 class="sub-h">Sobrecarga progresiva</h3>
          <p class="muted">Doble progresión: primero subes reps dentro del rango y, cuando llegas al tope en todas las series, subes carga. El salto no es fijo: se calcula como porcentaje del peso actual dentro de la banda que la ACSM (2009) recomienda para cada grupo — del 2-4 % en músculos pequeños al 5-10 % en los grandes — y nunca baja del incremento mínimo que hay en tu gimnasio.</p>
          <p class="muted">Cuando el material obliga a un salto mayor que esa banda (de 12,5 a 15 kg en unas mancuernas son un 20 %), se aplica la regla 2×2 de la NSCA: hay que superar el objetivo en dos sesiones seguidas antes de subir.</p>
        </div>
        <div>
          <h3 class="sub-h">Myo-reps</h3>
          <p class="muted">La tabla es la de tu entrenador: serie de activación al fallo, ${MYO_REST_FIRST}" de descanso, ${MYO_MINIS} mini-series con las reps de la tabla y ${MYO_REST}" entre medias, y una última serie al fallo.</p>
          <div class="tbl-wrap">
            <table class="tbl">
              <thead><tr><th>Activación</th><th>Mini-series</th></tr></thead>
              <tbody>${MYO_TABLE.map((b) => `<tr><td>${b.min}-${b.max} reps</td><td>${MYO_MINIS} × ${b.reps}</td></tr>`).join('')}</tbody>
            </table>
          </div>
        </div>
        <div>
          <h3 class="sub-h">Series efectivas</h3>
          <p class="muted">Una serie normal cuenta 1. En myo-reps, rest-pause y drop sets la tanda inicial cuenta 1 y cada tramo extra 0,5: comparten fatiga con la primera, así que no equivalen a series completas. Los músculos secundarios de un ejercicio suman la mitad.</p>
          <h3 class="sub-h">1RM estimado</h3>
          <p class="muted">Fórmula de Epley sumando las reps en reserva (RIR), limitada a 12 reps efectivas. Es un indicador de tendencia, no una marca real.</p>
        </div>
      </div>
      <p class="hint">Referencias: ACSM (2009) <i>Progression models in resistance training for healthy adults</i>; Baechle &amp; Earle, <i>Essentials of Strength Training and Conditioning</i> (regla 2×2); Nunes et al. (2023, PLOS ONE) sobre progresión semanal por regiones; Baz-Valle et al. (2022) sobre volumen semanal por grupo.</p>
    </div>
  `;
}

export function mount(root, ctx) {
  root.querySelectorAll('[data-theme]').forEach((b) => b.addEventListener('click', () => {
    setSetting('theme', b.dataset.theme);
    ctx.applyTheme();
  }));

  root.querySelector('[data-bodyweight]')?.addEventListener('change', (e) => setSetting('bodyweight', e.target.value === '' ? null : Number(e.target.value)));
  root.querySelector('[data-motto]')?.addEventListener('input', (e) => setSetting('motto', e.target.value, { silent: true }));
  root.querySelector('[data-motto]')?.addEventListener('change', () => ctx.refreshShell());

  root.querySelector('[data-export]')?.addEventListener('click', () => {
    const blob = new Blob([exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `entrenamientos-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Copia descargada');
  });

  const file = root.querySelector('[data-file]');
  root.querySelector('[data-import]')?.addEventListener('click', () => file.click());
  file?.addEventListener('change', async () => {
    const f = file.files?.[0];
    if (!f) return;
    const ok = await confirmDialog({
      title: 'Importar datos',
      message: 'Se sustituye todo lo que tienes ahora por el contenido del archivo.',
      confirmText: 'Importar',
      danger: false,
    });
    if (!ok) {
      file.value = '';
      return;
    }
    try {
      importJSON(await f.text());
      toast('Datos importados');
    } catch (err) {
      toast(`No se pudo importar: ${err.message}`);
    }
    file.value = '';
  });

  root.querySelector('[data-install]')?.addEventListener('click', () => ctx.install());

  root.querySelector('[data-reset]')?.addEventListener('click', async () => {
    const ok = await confirmDialog({
      title: 'Borrar todo',
      message: 'Se borran los entrenos, la rutina y los ajustes, y vuelve la planificación de partida. No hay vuelta atrás.',
      confirmText: 'Borrar todo',
    });
    if (ok) {
      resetAll();
      toast('Todo a cero');
    }
  });
}
