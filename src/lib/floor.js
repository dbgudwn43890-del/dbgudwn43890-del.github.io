// Floor covering calculators. Areas in square feet.

export const SQFT_PER_SQYD = 9;

/** Box-sold flooring: laminate, vinyl, hardwood, tile. */
export function flooring(areaSqFt, { waste = 0.1, boxSqFt = null } = {}) {
  const withWaste = areaSqFt * (1 + waste);
  const boxes = boxSqFt ? Math.ceil(withWaste / boxSqFt) : null;
  return {
    area: areaSqFt,
    withWaste,
    sqYards: withWaste / SQFT_PER_SQYD,
    boxes,
    boxedArea: boxes && boxes * boxSqFt,
  };
}

/**
 * Carpet comes off a fixed-width roll, so the real order is a length of roll —
 * not the room's area. Strips run the length of the room; a room wider than the
 * roll needs several strips and a seam.
 */
export function carpetRoll(roomLengthFt, roomWidthFt, rollWidthFt) {
  const layout = (runLength, across, runsAlong) => {
    const strips = Math.ceil(across / rollWidthFt);
    const rollLengthFt = strips * runLength;
    return {
      strips,
      rollLengthFt,
      area: rollLengthFt * rollWidthFt,
      seams: strips - 1,
      runsAlong, // which room dimension the strips run parallel to
    };
  };

  // An installer tries the carpet both ways round and takes whichever wastes less.
  const options = [
    layout(roomLengthFt, roomWidthFt, 'length'),
    layout(roomWidthFt, roomLengthFt, 'width'),
  ];
  const best = options[0].area <= options[1].area ? options[0] : options[1];
  const roomArea = roomLengthFt * roomWidthFt;

  return {
    ...best,
    rollWidthFt,
    roomArea,
    wasteSqFt: best.area - roomArea,
    wastePct: roomArea ? (best.area - roomArea) / roomArea : 0,
    sqYards: best.area / SQFT_PER_SQYD,
  };
}
