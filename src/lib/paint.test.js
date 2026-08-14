import assert from 'node:assert/strict';
import { paint, buySize, SURFACES, PRIMER_COVERAGE } from './paint.js';
import { round } from './volume.js';

const room = { length: 12, width: 14, height: 8 };

// 12x14 room, 8 ft ceilings, 1 door, 2 windows, 2 coats on smooth drywall.
// perimeter 52 ft x 8 ft = 416 sq ft - (21 + 30) = 365 sq ft of wall.
const r = paint(room, { doors: 1, windows: 2 });
assert.equal(r.openings, 51);
assert.equal(r.wallArea, 365);
assert.equal(r.coverage, 400);
assert.equal(round(r.walls), 1.83); // 365 * 2 / 400
assert.equal(r.buyWalls, '2 gallons'); // 4 quarts costs more than the extra gallon

// Ceiling and trim only get counted when asked for.
assert.equal(r.ceilingArea, 0);
assert.equal(r.trimArea, 0);
const full = paint(room, { doors: 1, windows: 2, ceiling: true, trim: true });
assert.equal(full.ceilingArea, 168);
assert.equal(full.trimArea, 26);
assert.ok(full.ceiling + full.trim > 0);

// A ceiling takes one coat by default while the walls take two.
assert.equal(round(full.ceiling), round(168 / 400));
assert.equal(round(paint(room, { ceiling: true, ceilingCoats: 2 }).ceiling), round((168 * 2) / 400));

// Door and window sizes can be overridden — real windows vary from 10 to 24 sq ft.
assert.equal(paint(room, { windows: 2, windowSqFt: 10 }).openings, 20);
assert.equal(paint(room, { doors: 1, doorSqFt: 20 }).openings, 20);

// Rougher surfaces cover less ground, so they must need more paint.
const surfaces = Object.keys(SURFACES).map((s) => paint(room, { surface: s }).walls);
assert.deepEqual([...surfaces].sort((a, b) => a - b), surfaces.slice().sort((a, b) => a - b));
assert.ok(paint(room, { surface: 'stucco' }).walls > paint(room, { surface: 'drywall' }).walls);
assert.equal(paint(room, { surface: 'nonsense' }).coverage, SURFACES.drywall.coverage);

// Primer is one coat over every surface being painted, at its own coverage rate.
const primed = paint(room, { doors: 1, windows: 2, ceiling: true, primer: true });
assert.equal(round(primed.primerGallons), round((365 + 168) / PRIMER_COVERAGE));
assert.equal(paint(room, {}).primerGallons, 0);

// Openings can never push wall area negative.
assert.equal(paint({ length: 2, width: 2, height: 8 }, { doors: 10 }).wallArea, 0);

// Purchase sizes round the way a paint store sells.
assert.equal(buySize(0.2), '1 quart');
assert.equal(buySize(0.9), '1 gallon'); // 4 quarts costs more than a gallon
assert.equal(buySize(1), '1 gallon');
assert.equal(buySize(1.01), '1 gallon'); // 1% over is not worth a second can
assert.equal(buySize(3.6), '3 gallons + 3 quarts');
assert.equal(buySize(0), null);

console.log('paint.test.js OK');
