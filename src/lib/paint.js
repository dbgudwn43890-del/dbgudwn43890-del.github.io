// Interior paint calculator. All areas in square feet, all volumes in gallons.

// Rougher and more porous surfaces drink more paint. Sq ft per gallon per coat.
export const SURFACES = {
  drywall: { label: 'Smooth drywall or plaster', coverage: 400 },
  textured: { label: 'Textured or previously unpainted drywall', coverage: 350 },
  wood: { label: 'Wood siding or panelling', coverage: 275 },
  brick: { label: 'Brick or block', coverage: 200 },
  stucco: { label: 'Stucco', coverage: 175 },
};

// Primer is thinner-bodied and covers less ground than finish paint.
export const PRIMER_COVERAGE = 250;

export const DOOR_SQFT = 21; // 3 ft x 7 ft
export const WINDOW_SQFT = 15; // 3 ft x 5 ft
export const TRIM_HEIGHT_FT = 0.5; // baseboard + casing, averaged over the perimeter

/**
 * @param room  {length, width, height} in feet
 * @param opts  {doors, windows, coats, ceiling, trim, surface, primer}
 */
export function paint(room, opts = {}) {
  const {
    doors = 0,
    windows = 0,
    coats = 2,
    // Ceilings are normally done in one coat over primer, not two like walls.
    ceilingCoats = 1,
    ceiling = false,
    trim = false,
    surface = 'drywall',
    primer = false,
    // Door and window sizes vary enough to be worth overriding.
    doorSqFt = DOOR_SQFT,
    windowSqFt = WINDOW_SQFT,
  } = opts;

  const perCoat = (SURFACES[surface] ?? SURFACES.drywall).coverage;
  const perimeter = 2 * (room.length + room.width);

  const openings = doors * doorSqFt + windows * windowSqFt;
  const wallArea = Math.max(0, perimeter * room.height - openings);
  const ceilingArea = ceiling ? room.length * room.width : 0;
  const trimArea = trim ? perimeter * TRIM_HEIGHT_FT : 0;

  const gal = (area, n = coats) => (area * n) / perCoat;
  const walls = gal(wallArea);
  const ceil = gal(ceilingArea, ceilingCoats);
  const trm = gal(trimArea);

  // Primer goes on once, over every surface being painted.
  const primerArea = primer ? wallArea + ceilingArea + trimArea : 0;
  const primerGallons = primerArea / PRIMER_COVERAGE;

  return {
    wallArea,
    ceilingArea,
    trimArea,
    openings,
    coverage: perCoat,
    walls,
    ceiling: ceil,
    trim: trm,
    primerGallons,
    buyPrimer: buySize(primerGallons),
    // Paint is sold in whole gallons and quarts; 4 quarts to the gallon.
    buyWalls: buySize(walls),
    buyCeiling: buySize(ceil),
    buyTrim: buySize(trm),
  };
}

/** Nearest sensible purchase: whole gallons, or quarts under a gallon. */
export function buySize(gallons) {
  if (gallons <= 0) return null;
  if (gallons < 1) {
    const quarts = Math.ceil(gallons * 4);
    return quarts === 4 ? '1 gallon' : `${quarts} quart${quarts > 1 ? 's' : ''}`;
  }
  const whole = Math.floor(gallons);
  const rest = gallons - whole;
  if (rest < 0.05) return `${whole} gallon${whole > 1 ? 's' : ''}`;
  const quarts = Math.ceil(rest * 4);
  if (quarts === 4) return `${whole + 1} gallons`;
  return `${whole} gallon${whole > 1 ? 's' : ''} + ${quarts} quart${quarts > 1 ? 's' : ''}`;
}
