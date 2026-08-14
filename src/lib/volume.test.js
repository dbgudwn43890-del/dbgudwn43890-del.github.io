import assert from 'node:assert/strict';
import { calculate, coverage, toFeet, round } from './volume.js';
import materials from '../data/materials.json' with { type: 'json' };

const gravel = materials.gravel;

// 20ft x 20ft at 2in deep = 400 sq ft x 0.1667 ft = 66.67 cu ft = 2.47 cu yd
const r = calculate({ shape: 'rect', length: 20, width: 20 }, toFeet(2, 'in'), gravel);
assert.equal(round(r.areaSqFt), 400);
assert.equal(round(r.cubicFeet), 66.67);
assert.equal(round(r.cubicYards), 2.47);
assert.equal(round(r.tons), 3.5); // 66.67 * 105 / 2000
assert.equal(round(r.orderCubicYards), 2.72); // +10% waste
assert.equal(r.bags, 147); // ceil(73.33 / 0.5)

// Compaction stacks on top of waste: 66.67 * 1.1 * 1.2 / 27
assert.equal(
  round(calculate({ shape: 'rect', length: 20, width: 20 }, toFeet(2, 'in'), gravel, 0.2).orderCubicYards),
  3.26,
);

// Direct area input matches the equivalent rectangle
assert.equal(
  round(calculate({ shape: 'area', area: 400 }, toFeet(2, 'in'), gravel).cubicYards),
  round(r.cubicYards),
);

// Circle: 10ft diameter, 3in deep => 78.54 sq ft x 0.25 = 19.63 cu ft
const c = calculate({ shape: 'circle', diameter: 10 }, toFeet(3, 'in'), gravel);
assert.equal(round(c.areaSqFt), 78.54);
assert.equal(round(c.cubicYards), 0.73);

// Unit conversion round-trip
assert.equal(round(toFeet(1, 'yd')), 3);
assert.equal(round(toFeet(100, 'cm')), 3.28);

// Material with no bag size reports null instead of Infinity
assert.equal(calculate({ shape: 'rect', length: 10, width: 10 }, 1, materials.dirt).bags, null);

// Reverse: 1 ton of gravel at 2in deep. 2000/105 = 19.05 cu ft / 0.1667 ft = 114.3 sq ft
const cov = coverage(1, 'tons', toFeet(2, 'in'), gravel);
assert.equal(round(cov.cubicFeet), 19.05);
assert.equal(round(cov.sqFt), 114.29);
assert.equal(round(cov.squareOfSide), 10.69);

// Reverse round-trips against calculate()
const fwd = calculate({ shape: 'rect', length: 30, width: 12 }, toFeet(3, 'in'), gravel);
assert.equal(round(coverage(fwd.cubicYards, 'yards', toFeet(3, 'in'), gravel).sqFt), 360);

// Zero depth must not produce Infinity
assert.equal(coverage(5, 'tons', 0, gravel).sqFt, 0);

console.log('volume.test.js OK');
