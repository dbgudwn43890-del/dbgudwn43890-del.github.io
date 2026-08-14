// Concrete calculator. Volumes in cubic feet unless named otherwise.
import { areaSqFt } from './volume.js';

export const LB_PER_CUFT = 150; // wet concrete, ~4,050 lb per cubic yard

// Cubic feet yielded per bag. 27 cu ft to the yard, so these give 90 / 60 / 45 bags per cubic yard.
export const BAGS = { 40: 0.3, 60: 0.45, 80: 0.6 };

// Bagged concrete runs roughly twice the price of ready-mix per finished yard,
// but ready-mix carries a short-load fee on small orders. The crossover sits
// around 1.5-2 cubic yards.
const BAG_LIMIT_CUYD = 1.5;
const READYMIX_CLEAR_CUYD = 2;

export function slab(dims, thicknessFt, { waste = 0.07, bagSize = 80 } = {}) {
  const cubicFeet = areaSqFt(dims) * thicknessFt;
  return finish(cubicFeet, waste, bagSize);
}

/**
 * Post holes. The post itself displaces concrete, which most calculators forget.
 * @param opts {count, holeDiameterIn, holeDepthIn, postWidthIn}
 */
export function postHoles({ count = 1, holeDiameterIn, holeDepthIn, postWidthIn = 0 }, { waste = 0.1, bagSize = 60 } = {}) {
  const depthFt = holeDepthIn / 12;
  const holeVolume = Math.PI * (holeDiameterIn / 24) ** 2 * depthFt;
  const postVolume = (postWidthIn / 12) ** 2 * depthFt;
  const perHole = Math.max(0, holeVolume - postVolume);
  return {
    ...finish(perHole * count, waste, bagSize),
    perHoleCuFt: perHole,
    holeCuFt: holeVolume,
    postCuFt: postVolume,
  };
}

/** Hole sizing rules of thumb: 3x the post width, and a third of the fence height. */
export const postHoleGuide = (postWidthIn, fenceHeightFt) => ({
  diameterIn: postWidthIn * 3,
  depthIn: Math.round((fenceHeightFt * 12) / 3),
});

function finish(cubicFeet, waste, bagSize) {
  const order = cubicFeet * (1 + waste);
  const cuftPerBag = BAGS[bagSize] ?? BAGS[80];
  return {
    cubicFeet,
    cubicYards: cubicFeet / 27,
    orderCubicFeet: order,
    orderCubicYards: order / 27,
    lbs: order * LB_PER_CUFT,
    bags: Math.ceil(order / cuftPerBag),
  };
}

/** Which way to buy it — the decision the user is actually trying to make. */
export function buyAdvice(orderCubicYards) {
  if (orderCubicYards <= 0) return null;
  if (orderCubicYards < BAG_LIMIT_CUYD) {
    return {
      choice: 'bags',
      text: 'Bags. At this size a ready-mix truck would charge a short-load fee that wipes out the price advantage.',
    };
  }
  if (orderCubicYards < READYMIX_CLEAR_CUYD) {
    return {
      choice: 'either',
      text: 'This is the crossover point. Bags cost roughly twice as much per yard, but ready-mix adds a short-load fee under a full truck — get a quote both ways before deciding.',
    };
  }
  return {
    choice: 'readymix',
    text: 'Ready-mix. Bagged concrete runs roughly twice the price per finished yard at this volume, and mixing this much by hand is a full day of work against a truck that pours in under an hour.',
  };
}
