# GymTracker

Plataforma personal de entrenamientos: la libreta del gimnasio, pero que hace las cuentas sola.
Registra la sesión en vivo, calcula la sobrecarga progresiva que toca en cada ejercicio y saca las
estadísticas que de verdad dicen si estás progresando.

**En marcha:** https://alvaromolmateo-cmd.github.io/plataforma-de-entrenamientos/

Aplicación web instalable (PWA), sin build ni dependencias: HTML, CSS y módulos ES. Todo se guarda
en el dispositivo (`localStorage`), funciona sin cobertura y se puede exportar a JSON.

---

## Qué hace

### Entrenar
La vista principal. Propone el día que toca, y dentro de cada ejercicio muestra:

- **La prescripción** tal cual la puso el entrenador: series, reps, RIR, tempo y notas.
- **Qué hacer hoy**: peso y reps sugeridos por el motor de progresión, con el motivo explicado.
- **La última vez**: lo que levantaste, con tus anotaciones, y un botón para copiar los pesos.
- **Las casillas para apuntar**, adaptadas al tipo de serie (normales, myo-reps, rest-pause, drop set).
- **Temporizador de descanso** que arranca solo al marcar una serie, con aviso sonoro y vibración.
- **Anotaciones** por ejercicio y nota del día al cerrar, como las que escribes en rojo en la libreta.

### Historial
Una semana por pantalla, con sus cuatro días, todo lo levantado, los récords del día y tus notas.
Se puede retomar, editar la fecha o borrar cualquier entreno.

### Rutina
La planificación actual, editable. Cambias series, reps, RIR, tempo, esquemas o el tipo de serie y
sale reflejado en el siguiente entreno. Muestra el volumen semanal planificado por grupo muscular.

### Progreso
Tonelaje por semana, volumen por grupo muscular contra el rango de referencia, progresión real
frente al objetivo teórico de cada grupo, 1RM estimado por ejercicio, récords y adherencia.

### Ejercicios
La biblioteca, con el grupo muscular, el material, el **incremento mínimo real** que hay en tu
gimnasio para ese ejercicio, el perfil de progresión que le corresponde y su histórico.

---

## Sobrecarga progresiva

El motor no aplica «+2,5 kg a todo». Usa **doble progresión** (primero reps dentro del rango, luego
carga) con el salto calculado como porcentaje del peso actual, y ese porcentaje **depende del grupo
muscular**.

### De dónde salen los números

- **ACSM (2009), _Progression models in resistance training for healthy adults_.** Recomienda subir
  la carga entre un **2 % y un 10 %**, con el extremo bajo para ejercicios de poca masa muscular y
  el alto para los de mucha, cuando se logran 1-2 repeticiones por encima del objetivo.
  <https://pubmed.ncbi.nlm.nih.gov/19204579/>
- **Regla 2×2 (NSCA, _Essentials of Strength Training and Conditioning_).** Esa condición debe
  cumplirse en **dos sesiones seguidas** antes de subir carga.
- **Nunes et al. (2023), PLOS ONE.** En personas ya entrenadas el **tren inferior progresa más
  rápido por semana** que el superior. Por eso el objetivo semanal no es el mismo en una prensa que
  en unos laterales. <https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0284216>
- **Baz-Valle et al. (2022), _Journal of Human Kinetics_.** **12-20 series semanales** por grupo
  muscular como zona de referencia en gente entrenada, con relación dosis-respuesta en forma de U
  invertida. <https://pubmed.ncbi.nlm.nih.gov/35291645/>
- **Sødal et al. (2023) y trabajos posteriores sobre cluster sets.** Rest-pause, drop sets y series
  agrupadas producen adaptaciones **comparables a las series tradicionales** cuando se igualan
  volumen y esfuerzo; su ventaja es la eficiencia de tiempo. Por eso aquí cuentan como volumen
  efectivo, pero no como series completas.

### Perfil por grupo muscular

| Grupo | Salto (banda ACSM) | Incremento típico | Objetivo semanal | Series/semana |
|---|---|---|---|---|
| Cuádriceps | 5-10 % | 5 kg | ≈2,0 % | 12-20 |
| Glúteo | 5-10 % | 5-10 kg | ≈2,0 % | 10-18 |
| Gemelo | 5-10 % | 5 kg | ≈1,5 % | 8-16 |
| Isquiosurales | 4-8 % | 2,5-5 kg | ≈1,5 % | 10-18 |
| Aductor / Abductor | 4-8 % | 5 kg | ≈1,5 % | 6-12 |
| Espalda | 3-6 % | 2,5-5 kg | ≈1,2 % | 12-20 |
| Abdomen | 3-6 % | 2,5 kg | ≈1,0 % | 8-16 |
| Pecho | 2,5-5 % | 2,5 kg | ≈1,0 % | 10-18 |
| Hombro (anterior) | 2-4 % | 2,5 kg | ≈0,8 % | 8-16 |
| Tríceps | 2-4 % | 2,5 kg | ≈0,8 % | 10-18 |
| Bíceps | 2-4 % | 1,25-2,5 kg | ≈0,7 % | 10-18 |
| Deltoides lateral / posterior | 1-3 % | 1-2,5 kg | ≈0,6 % | 10-20 |

### El caso interesante: cuando el material no te deja

En unos laterales de 12,5 kg el siguiente par de mancuernas son 15 kg: un salto del **20 %**, muy por
encima del 1-3 % que le toca a un deltoides lateral. Ahí la app **no sube el peso**: te dice que
repitas carga y sumes repeticiones, y solo propone el salto cuando encadenas dos sesiones cumpliendo
el objetivo (regla 2×2) o sacas dos repeticiones de más. Lo mismo pasa con el press inclinado con
mancuernas o el press de pecho en máquina.

### Criterio de «listo para subir» según el tipo de serie

| Tipo | Cuándo sube |
|---|---|
| Normales | Todas las series llegan al tope del rango **y** con el RIR dentro del objetivo |
| Myo-reps | La serie de activación pasa de 12 repeticiones (fuera de la banda 9-12) |
| Rest-pause | Se completa el total de repeticiones del esquema |
| Drop set | Se cumplen las repeticiones del primer escalón |

Si te quedas por debajo del rango en la mayoría de las series, propone bajar carga y reconstruir.
Si sacas las reps pero con demasiado margen de RIR, mantiene el peso: lo que falta es intensidad,
no carga.

---

## Myo-reps

Se aplica la tabla del entrenador. Serie de activación al fallo, 40" de descanso y 3 mini-series con
20" entre ellas; la última, al fallo:

| Si en la activación llegas a | Mini-series |
|---|---|
| 6-8 reps | 3 × 2 |
| 9-12 reps | 3 × 3 |
| 13-16 reps | 3 × 4 |
| 17-20 reps | 3 × 5 |

En cuanto apuntas las repeticiones de la activación, la app te dice cuántas tocan en cada mini-serie
y el temporizador va con los descansos correctos. Por debajo de 6 avisa de que el peso se ha ido;
por encima de 20, de que es demasiado ligero.

---

## Cómo se cuentan las cosas

- **Tonelaje**: peso × repeticiones de cada serie. En ejercicios que tiran del peso corporal
  (fondos) se le suma tu peso, que se configura en Ajustes.
- **Series efectivas**: una serie normal cuenta 1. En myo-reps, rest-pause y drop sets la tanda
  inicial cuenta 1 y **cada tramo extra 0,5**, porque comparten la fatiga de la primera y no
  equivalen a series completas. Los músculos secundarios de un ejercicio suman la mitad.
- **1RM estimado**: fórmula de Epley sumando las repeticiones en reserva
  (`peso × (1 + (reps + RIR) / 30)`), limitada a 12 repeticiones efectivas porque más allá pierde
  fiabilidad. En myo-reps y rest-pause se toma la serie de activación, que va al fallo. Es un
  indicador de tendencia, no una marca real.
- **Progresión real**: cambio semanal medio del 1RM estimado, comparado con el objetivo del grupo.
- **Densidad**: tonelaje entre minutos de sesión.
- **Racha**: semanas seguidas completando todos los días de la rutina.

---

## Datos de partida

La app viene con la **planificación actual** (los 4 días del Excel del entrenador y de la libreta) y
con la **semana 2 (24-30/8/2026) ya registrada**, para que el motor de progresión tenga referencias
desde el primer entreno.

Los días de la semana de esos cuatro entrenos (lunes, martes, jueves y viernes) y su duración
(90 min) son una suposición: se pueden corregir desde Historial → detalle. La semana 1 se toma como
la del 17/8/2026, que es lo que hace que el 24/8 sea la semana 2.

---

## Estructura

```
index.html            capa de la app, iconos SVG en línea
css/styles.css        tokens de diseño, componentes y responsive
js/
  app.js              enrutado por hash, tema, service worker, instalación
  catalog.js          grupos musculares, perfiles de progresión, tabla de myo-reps, ejercicios
  seed.js             planificación actual y registro de la semana 2
  store.js            estado y persistencia (única capa que toca localStorage)
  sets.js             matemática de las series: reps, tonelaje, series efectivas, 1RM
  progression.js      motor de sobrecarga progresiva
  metrics.js          agregados: semanas, volumen por grupo, récords, adherencia
  timer.js            temporizador de descanso y cronómetro de sesión
  charts.js           gráficas SVG a mano
  ui.js               escape, iconos, formato, modal y avisos
  views/              entrenar, historial, rutina, progreso, ejercicios, ajustes
tools/make-icons.js   genera los iconos PNG de la PWA sin dependencias
sw.js                 service worker (red primero, caché si falla)
```

---

## Desarrollo

```bash
# servir en local (hace falta un servidor: son módulos ES)
python -m http.server 5177

# regenerar los iconos tras tocar la paleta
node tools/make-icons.js
```

Al cambiar cualquier archivo de la lista `ASSETS`, sube `VERSION` en `sw.js` para que el service
worker sirva la versión nueva.

---

## Pendiente

- Sincronización entre dispositivos (de momento, exportar/importar JSON desde Ajustes).
- Aviso de descarga (deload) cuando el rendimiento cae varias sesiones seguidas.
- Fotos o vídeos de técnica asociados al ejercicio.
