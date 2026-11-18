const fs = require('node:fs');
const zlib = require('node:zlib');

const W = 1024;
const H = 1024;
const pix = Buffer.alloc(W * H * 3);

function setPixel(x, y, r, g, b) {
  x = Math.floor(x);
  y = Math.floor(y);
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 3;
  pix[i] = r;
  pix[i + 1] = g;
  pix[i + 2] = b;
}

function fillRect(x, y, w, h, r, g, b) {
  x = Math.floor(x);
  y = Math.floor(y);
  w = Math.floor(w);
  h = Math.floor(h);
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      setPixel(xx, yy, r, g, b);
    }
  }
}

const FONT = {
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
  '.': ['.....', '.....', '.....', '.....', '.....', '....#', '.....'],
  ',' : ['.....', '.....', '.....', '.....', '.....', '..##.', '.#...'],
  '-': ['.....', '.....', '.....', '..#..', '.....', '.....', '.....'],
  "'": ['.....', '..#..', '..#..', '.....', '.....', '.....', '.....'],
  '%': ['#...#', '#...#', '..#..', '.#.#.', '#..#.', '#...#', '#...#'],
  '0': ['.###.', '#...#', '#.#.#', '#.#.#', '#...#', '#...#', '.###.'],
  '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '#####'],
  '2': ['.###.', '....#', '....#', '.###.', '#....', '#....', '#####'],
  '3': ['.###.', '....#', '....#', '.###.', '....#', '....#', '.###.'],
  '4': ['#...#', '#...#', '#...#', '#####', '....#', '....#', '....#'],
  '5': ['#####', '#....', '#....', '####.', '....#', '....#', '.###.'],
  '6': ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '..#..', '..#..', '..#..', '..#..'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  'A': ['.#.#.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  'B': ['####.', '#...#', '####.', '#...#', '#...#', '#...#', '####.'],
  'C': ['.###.', '#...#', '#....', '#....', '#...#', '#...#', '.###.'],
  'D': ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  'E': ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  'F': ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  'G': ['.###.', '#....', '#..##', '#.#.#', '#...#', '#...#', '.###.'],
  'H': ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  'I': ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  'J': ['#####', '..#..', '..#..', '..#..', '#...#', '#...#', '.###.'],
  'K': ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  'L': ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  'M': ['#...#', '##.##', '#.#.#', '#...#', '#...#', '#...#', '#...#'],
  'N': ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  'O': ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  'P': ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  'Q': ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..##', '.###.'],
  'R': ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  'S': ['.###.', '#....', '#....', '.###.', '....#', '....#', '.###.'],
  'T': ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  'U': ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  'V': ['#...#', '#...#', '#...#', '.#.#.', '.#.#.', '..#..', '..#..'],
  'W': ['#...#', '#...#', '#.#.#', '#.#.#', '#.#.#', '##.##', '#...#'],
  'X': ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  'Y': ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  'Z': ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
};

function textWidth(text, scale) {
  return text.length * 6 * scale;
}

function drawText(text, x, y, scale, r, g, b) {
  let cx = x;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const gl = FONT[ch];
    if (!gl) {
      cx += 6 * scale;
      continue;
    }
    for (let row = 0; row < 7; row++) {
      const line = gl[row];
      for (let col = 0; col < 5; col++) {
        if (line[col] === '#') {
          fillRect(cx + col * scale, y + row * scale, scale, scale, r, g, b);
        }
      }
    }
    cx += 6 * scale;
  }
}

function drawWrapped(text, x, y, maxW, scale, r, g, b, lineGap) {
  if (lineGap === undefined) lineGap = 4;
  const words = text.split(' ');
  let line = '';
  let cy = y;
  const lineHeight = 7 * scale;
  function flush() {
    if (line) drawText(line, x, cy, scale, r, g, b);
  }
  for (const w of words) {
    const trial = line ? line + ' ' + w : w;
    if (textWidth(trial, scale) <= maxW) {
      line = trial;
    } else {
      flush();
      cy += lineHeight + lineGap;
      line = w;
    }
  }
  flush();
  return cy + lineHeight;
}

// Cream paper
fillRect(0, 0, W, H, 255, 253, 208);

// Masthead bar 0-110 navy
fillRect(0, 0, W, 110, 18, 32, 64);

// Date scale 3 white centered y=22
const dateText = 'WEDNESDAY 18 NOVEMBER 2026';
drawText(dateText, (W - textWidth(dateText, 3)) / 2, 22, 3, 255, 255, 255);

// Title scale 2 white centered y=64
const mastTitle = 'THE DAY IN NEWS';
drawText(mastTitle, (W - textWidth(mastTitle, 2)) / 2, 64, 2, 255, 255, 255);

// Lead story pictogram: low island, blast burst, three drone dots

fillRect(0, 110, W, 380, 18, 32, 64);

// Lead tag
drawText('MIDDLE EAST', 330, 150, 2, 255, 255, 255);

// Lead headline scale 5, wrapped, starting y=190
const headEnd = drawWrapped('US STRIKES IRAN, GULF IN FLAMES', 330, 190, 670, 5, 255, 255, 255);

// Lead subhead scale 3, line height + 10 after headline block
const subY = headEnd + 7 * 5 + 10;
drawWrapped('QESHM HIT, DRONES AT BAHRAIN', 330, subY, 670, 3, 255, 255, 255);

// ---------- Grid panels ----------
const PANEL_W = 482;
const PANEL_H = 230;
const GAP = 10;
const cols = [25, 25 + PANEL_W + GAP];
const rows = [490, 490 + PANEL_H + GAP];

function drawPanel(x, y, tag, title, sub, pic) {
  fillRect(x, y, PANEL_W, PANEL_H, 18, 32, 64);          // border
  fillRect(x + 2, y + 2, PANEL_W - 4, PANEL_H - 4, 255, 253, 208); // cream inside
  drawText(tag, x + 14, y + 14, 2, 18, 32, 64);
  pic();
  const tx = x + 140;
  const tw = PANEL_W - 150;
  const titleEnd = drawWrapped(title, tx, y + 100, tw, 3, 18, 32, 64);
  const subY2 = titleEnd + 7 * 3 + 6;
  drawWrapped(sub, tx, subY2, tw, 2, 18, 32, 64);
}

function picBridge(x, y) {
  fillRect(x + 12, y + 80, 12, 60, 18, 32, 64);
  fillRect(x + 24, y + 108, 44, 6, 18, 32, 64);
  fillRect(x + 82, y + 108, 24, 6, 18, 32, 64);
}

function picFlags(x, y) {
  for (let k = 0; k < 3; k++) {
    const fx = x + 14 + k * 32;
    fillRect(fx + 6, y + 82, 3, 48, 18, 32, 64);
    fillRect(fx + 9, y + 82, 20, 12, 18, 32, 64);
  }
}

function picVirus(x, y) {
  fillRect(x + 24, y + 94, 36, 36, 18, 32, 64);
  const spikes = [[x + 16, y + 100], [x + 72, y + 100], [x + 38, y + 84], [x + 40, y + 130]];
  for (const s of spikes) fillRect(s[0], s[1], 6, 6, 18, 32, 64);
}

function picDish(x, y) {
  fillRect(x + 20, y + 104, 44, 22, 18, 32, 64);
  fillRect(x + 40, y + 126, 4, 30, 18, 32, 64);
  fillRect(x + 24, y + 122, 10, 4, 18, 32, 64);
  fillRect(x + 48, y + 122, 10, 4, 18, 32, 64);
}

drawPanel(cols[0], rows[0], 'EUROPE', 'KERCH BRIDGE PARTLY FALLS', 'SECOND DAY OF UKRAINE STRIKES', function () { picBridge(cols[0], rows[0]); });
drawPanel(cols[1], rows[0], 'SUMMIT', 'TRUMP LANDS IN SHENZHEN', 'THREE WAY TALKS THURSDAY', function () { picFlags(cols[1], rows[0]); });
drawPanel(cols[0], rows[1], 'AFRICA', 'EBOLA PASSES 11,000 CASES', 'CONGO OUTBREAK SECOND LARGEST', function () { picVirus(cols[0], rows[1]); });
drawPanel(cols[1], rows[1], 'SCIENCE', 'VOYAGER 1 CROSSES ONE LIGHT DAY', '16 BILLION MILES FROM EARTH', function () { picDish(cols[1], rows[1]); });

// Footer
fillRect(0, 985, W, 2, 0, 0, 0);
const foot = 'FIVE STORIES FROM WEDNESDAY 18 NOVEMBER 2026';
drawText(foot, (W - textWidth(foot, 2)) / 2, 1002, 2, 0, 0, 0);

// ---------- PNG encoder ----------
function crc32(buf, start, end, c) {
  let crc = c ^ 0xffffffff;
  for (let i = start; i < end; i++) {
    crc ^= buf[i];
    for (let b = 0; b < 8; b++) {
      crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body, 0, body.length, 0), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(w, h, pixels) {
  const rowBytes = w * 3;
  const raw = Buffer.alloc(h * (1 + rowBytes));
  for (let y = 0; y < h; y++) {
    const off = y * (1 + rowBytes);
    raw[off] = 0;
    pixels.copy(raw, off + 1, y * rowBytes, y * rowBytes + rowBytes);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const iend = chunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), iend]);
}

// ---------- Write ----------
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
fs.mkdirSync(outDir, { recursive: true });
const png = encodePNG(W, H, pix);
fs.writeFileSync(outDir + '/entry.png', png);
console.log('wrote', outDir + '/entry.png', png.length, 'bytes');
