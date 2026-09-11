// Cronómetro de sesión: el tiempo que llevas entrenando.
//
// No hay temporizador de descanso a propósito: los descansos van por sensaciones y los de las
// myo-reps se cuentan a ojo, así que la app solo los enuncia. Vive fuera del store porque el
// contador cambia cada pocos segundos y no debe repintar la app entera: escribe directamente
// en los elementos `[data-since]`.

export const hhmm = (mins) => {
  const m = Math.max(0, Math.round(mins));
  return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min` : `${m} min`;
};

// Cronómetros de sesión: elementos con data-since="ISO".
export function tickClocks() {
  document.querySelectorAll('[data-since]').forEach((el) => {
    const start = new Date(el.dataset.since).getTime();
    if (!start) return;
    const mins = (Date.now() - start) / 60000;
    el.textContent = mins < 60 ? `${Math.floor(mins)} min` : hhmm(mins);
  });
}

setInterval(tickClocks, 20000);

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') tickClocks();
});

tickClocks();
