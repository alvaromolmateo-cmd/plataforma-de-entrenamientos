// Genera los iconos PNG de la PWA sin dependencias (codificador PNG mínimo con zlib de Node).
// Uso: node tools/make-icons.js

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'icons');
const RED = [0x8f, 0x24, 0x30];
const WHITE = [255, 255, 255];

const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePNG(size, rgba) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Distancia con signo a un rectángulo redondeado (semiejes hx, hy) centrado en (cx, cy)
function sdBox(px, py, cx, cy, hx, hy, r) {
  const qx = Math.abs(px - cx) - (hx - r);
  const qy = Math.abs(py - cy) - (hy - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

// Icono: cuadrado rojo oscuro redondeado con una mancuerna blanca.
// maskable = fondo a sangre y dibujo dentro de la zona segura.
function drawIcon(size, { maskable = false } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  const half = maskable ? size / 2 + 2 : size * 0.5;
  const radius = maskable ? 0 : size * 0.22;
  const k = (maskable ? 0.7 : 1) * size; // escala del dibujo
  const cx = size / 2;
  const cy = size / 2;
  const px = (u) => cx + (u - 0.5) * k;
  const py = (v) => cy + (v - 0.5) * k;

  // Piezas de la mancuerna, en coordenadas 0-1
  const parts = [
    { x: 0.5, y: 0.5, hx: 0.19, hy: 0.045, r: 0.02 }, // barra
    { x: 0.29, y: 0.5, hx: 0.055, hy: 0.17, r: 0.025 }, // disco izquierdo
    { x: 0.71, y: 0.5, hx: 0.055, hy: 0.17, r: 0.025 }, // disco derecho
    { x: 0.185, y: 0.5, hx: 0.045, hy: 0.105, r: 0.022 }, // tope izquierdo
    { x: 0.815, y: 0.5, hx: 0.045, hy: 0.105, r: 0.022 }, // tope derecho
  ];

  const SS = 4; // supermuestreo
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let bg = 0;
      let fg = 0;
      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          const sxp = x + (sx + 0.5) / SS;
          const syp = y + (sy + 0.5) / SS;
          if (sdBox(sxp, syp, cx, cy, half, half, radius) <= 0) bg += 1;
          for (const p of parts) {
            if (sdBox(sxp, syp, px(p.x), py(p.y), p.hx * k, p.hy * k, p.r * k) <= 0) {
              fg += 1;
              break;
            }
          }
        }
      }
      const a = bg / (SS * SS);
      const f = fg / (SS * SS);
      const i = (y * size + x) * 4;
      for (let c = 0; c < 3; c += 1) rgba[i + c] = Math.round(RED[c] * (1 - f) + WHITE[c] * f);
      rgba[i + 3] = Math.round(a * 255);
    }
  }
  return encodePNG(size, rgba);
}

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'icon-192.png'), drawIcon(192));
fs.writeFileSync(path.join(OUT, 'icon-512.png'), drawIcon(512));
fs.writeFileSync(path.join(OUT, 'icon-maskable-512.png'), drawIcon(512, { maskable: true }));
fs.writeFileSync(path.join(OUT, 'apple-touch-icon.png'), drawIcon(180, { maskable: true }));
fs.writeFileSync(path.join(OUT, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="#8f2430"/>
  <g fill="#fff">
    <rect x="31" y="45.5" width="38" height="9" rx="2"/>
    <rect x="23.5" y="33" width="11" height="34" rx="2.5"/>
    <rect x="65.5" y="33" width="11" height="34" rx="2.5"/>
    <rect x="14" y="39.5" width="9" height="21" rx="2.2"/>
    <rect x="77" y="39.5" width="9" height="21" rx="2.2"/>
  </g>
</svg>
`);
console.log('Iconos generados en', OUT);
