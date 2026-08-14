// Volume-based material calculator. All internal math in feet / cubic feet.

const TO_FEET = { in: 1 / 12, ft: 1, yd: 3, cm: 1 / 30.48, m: 1 / 0.3048 };

export const UNITS = Object.keys(TO_FEET);

export const toFeet = (value, unit) => value * TO_FEET[unit];

export function areaSqFt({ shape, length, width, diameter, area }) {
  if (shape === 'area') return area;
  if (shape === 'circle') return Math.PI * (diameter / 2) ** 2;
  return length * width;
}

/**
 * @param dims  {shape, length, width, diameter, area} already in feet / sq ft
 * @param depthFt  depth in feet
 * @param material  {density_lb_ft3, waste, bag_cuft}
 * @param compaction  extra fraction for material that will be tamped down (0 = none)
 */
export function calculate(dims, depthFt, material, compaction = 0) {
  const area = areaSqFt(dims);
  const cubicFeet = area * depthFt;
  const order = cubicFeet * (1 + material.waste) * (1 + compaction);
  return {
    areaSqFt: area,
    cubicFeet,
    cubicYards: cubicFeet / 27,
    tons: (cubicFeet * material.density_lb_ft3) / 2000,
    orderCubicYards: order / 27,
    orderTons: (order * material.density_lb_ft3) / 2000,
    bags: material.bag_cuft ? Math.ceil(order / material.bag_cuft) : null,
  };
}

/** Reverse lookup: how much area does a known amount of material cover? */
export function coverage(amount, amountUnit, depthFt, material) {
  const cubicFeet =
    amountUnit === 'tons'
      ? (amount * 2000) / material.density_lb_ft3
      : amountUnit === 'bags'
        ? amount * material.bag_cuft
        : amount * 27; // cubic yards
  const sqFt = depthFt > 0 ? cubicFeet / depthFt : 0;
  return { cubicFeet, sqFt, squareOfSide: Math.sqrt(sqFt) };
}

export const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
