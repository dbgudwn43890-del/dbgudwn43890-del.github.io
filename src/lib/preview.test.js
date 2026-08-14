import assert from 'node:assert/strict';
import { areaPreview, floorPreview, carpetPreview, paintPreview, postPreview } from './preview.js';
import { carpetRoll } from './floor.js';

const wellFormed = (s) => {
  assert.ok(s.startsWith('<svg') && s.endsWith('</svg>'), 'not an svg');
  // Every number that reaches the markup must be finite, or the browser drops the shape.
  assert.ok(!/NaN|Infinity|undefined/.test(s), `bad number in output:\n${s.slice(0, 400)}`);
  return s;
};

// Every drawing survives its own edge cases.
wellFormed(areaPreview({ shape: 'rect', length: 20, width: 20 }, 2, 'gravel'));
wellFormed(areaPreview({ shape: 'circle', diameter: 10 }, 4, 'mulch'));
wellFormed(areaPreview({ shape: 'area', area: 400 }, 3, 'topsoil'));
wellFormed(areaPreview({ shape: 'rect', length: 0, width: 0 }, 0, 'unknown-material'));
wellFormed(floorPreview(14, 12, 0.1));
wellFormed(floorPreview(0, 0, 0));
wellFormed(paintPreview({ length: 12, width: 14, height: 8 }, { doors: 1, windows: 2, ceiling: true, trim: true }));
wellFormed(paintPreview({ length: 0, width: 0, height: 0 }, {}));
wellFormed(postPreview(12, 24, 4, 6));
wellFormed(postPreview(0, 0, 0, 0));

// The carpet drawing has to agree with the carpet maths: one rect per strip,
// one seam line per seam. If they drift, the picture lies about the estimate.
for (const [len, wid, roll] of [
  [14, 12, 12],
  [24, 13, 12],
  [20, 16, 12],
  [30, 40, 15],
]) {
  const layout = carpetRoll(len, wid, roll);
  const out = wellFormed(carpetPreview(len, wid, roll, layout));
  const seamLines = (out.match(/stroke-width="2.5"/g) ?? []).length;
  assert.equal(seamLines, layout.seams, `${len}x${wid} on ${roll}ft: seam lines vs seams`);
}

// Orientation is reported so the drawing can lay the strips the right way.
assert.equal(carpetRoll(24, 13, 12).runsAlong, 'width');
assert.equal(carpetRoll(14, 10, 12).runsAlong, 'length');

console.log('preview.test.js OK');
