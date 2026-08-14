import assert from 'node:assert/strict';
import { flooring, carpetRoll } from './floor.js';
import { round } from './volume.js';

// 12 x 14 room = 168 sq ft, 10% waste = 184.8, at 22 sq ft per box = 9 boxes.
const f = flooring(168, { boxSqFt: 22 });
assert.equal(round(f.withWaste), 184.8);
assert.equal(f.boxes, 9);
assert.equal(f.boxedArea, 198);
assert.equal(round(f.sqYards), 20.53);
assert.equal(flooring(168).boxes, null);

// Room narrower than the roll: one strip, no seam, waste is the offcut strip.
// 12 ft roll x 14 ft run = 168 sq ft for a 10 x 14 room (140 sq ft).
const c = carpetRoll(14, 10, 12);
assert.equal(c.strips, 1);
assert.equal(c.seams, 0);
assert.equal(c.rollLengthFt, 14);
assert.equal(c.area, 168);
assert.equal(c.wasteSqFt, 28);

// Room wider than the roll in both directions: two strips and a seam.
// Running strips along the 16 ft side (2 x 16 x 12 = 384) beats the 20 ft side (480).
const wide = carpetRoll(20, 16, 12);
assert.equal(wide.strips, 2);
assert.equal(wide.seams, 1);
assert.equal(wide.area, 384);

// Orientation matters: turning the room picks the cheaper layout.
// 13 x 24 room — running strips along the 24 ft side needs 2 strips (576 sq ft),
// running along the 13 ft side needs 2 strips of 13 ft (312 sq ft).
const turned = carpetRoll(24, 13, 12);
assert.equal(turned.area, 312);
assert.equal(round(turned.wastePct * 100), 0);

// The 13 x 12 case quoted in the page copy: 156 sq ft seamless one way,
// 288 sq ft with a seam the other. If this changes, the copy is wrong.
const thirteen = carpetRoll(13, 12, 12);
assert.equal(thirteen.area, 156);
assert.equal(thirteen.seams, 0);

// Zero room does not divide by zero.
assert.equal(carpetRoll(0, 0, 12).wastePct, 0);

console.log('floor.test.js OK');
