import assert from 'node:assert/strict';
import { slab, postHoles, postHoleGuide, buyAdvice, BAGS } from './concrete.js';
import { round } from './volume.js';

// 10 x 10 slab at 4 in = 33.33 cu ft = 1.23 cu yd. The rule of thumb is
// sq ft / 81 = cu yd, and 100/81 = 1.23. It matches.
const s = slab({ shape: 'rect', length: 10, width: 10 }, 4 / 12, { waste: 0 });
assert.equal(round(s.cubicYards), 1.23);
assert.equal(s.bags, Math.ceil(33.333333333333336 / BAGS[80]));

// Bags per cubic yard must match the published yields: 90 / 60 / 45.
const perYard = { 40: 90, 60: 60, 80: 45 };
for (const size of Object.keys(BAGS)) {
  const yard = slab({ shape: 'rect', length: 27, width: 1 }, 1, { waste: 0, bagSize: Number(size) });
  assert.equal(yard.bags, perYard[size], `${size} lb bags per yard`);
}

// A post displaces concrete. Ignoring it over-orders — that is the bug in most tools.
const withPost = postHoles({ count: 1, holeDiameterIn: 12, holeDepthIn: 36, postWidthIn: 4 }, { waste: 0 });
const noPost = postHoles({ count: 1, holeDiameterIn: 12, holeDepthIn: 36, postWidthIn: 0 }, { waste: 0 });
assert.ok(withPost.cubicFeet < noPost.cubicFeet);
assert.equal(round(noPost.holeCuFt), 2.36); // pi * 0.5^2 * 3
assert.equal(round(withPost.postCuFt), 0.33); // (4/12)^2 * 3
assert.equal(round(withPost.perHoleCuFt), 2.02); // 2.356 - 0.333

// Count multiplies.
assert.equal(
  round(postHoles({ count: 5, holeDiameterIn: 12, holeDepthIn: 36, postWidthIn: 4 }, { waste: 0 }).cubicFeet),
  round(withPost.cubicFeet * 5),
);

// An oversized post can never produce negative concrete.
assert.equal(postHoles({ count: 1, holeDiameterIn: 6, holeDepthIn: 24, postWidthIn: 12 }).cubicFeet, 0);

// Hole sizing: 3x post width, a third of the fence height.
assert.deepEqual(postHoleGuide(4, 6), { diameterIn: 12, depthIn: 24 });

// Buying advice switches at the crossover.
assert.equal(buyAdvice(0.5).choice, 'bags');
assert.equal(buyAdvice(1.7).choice, 'either');
assert.equal(buyAdvice(4).choice, 'readymix');
assert.equal(buyAdvice(0), null);

console.log('concrete.test.js OK');
