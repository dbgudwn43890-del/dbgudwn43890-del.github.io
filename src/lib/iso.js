// Isometric projection. Ground plane is x (width) by y (depth); z is height.
// Standard 30-degree isometric, so a square footprint reads as a diamond.

const COS30 = Math.cos(Math.PI / 6);
const SIN30 = 0.5;

/** Project a ground-plane point at height z into screen space. */
export const project = (x, y, z, scale, ox, oy, zScale = scale) => [
  ox + (x - y) * COS30 * scale,
  oy + (x + y) * SIN30 * scale - z * zScale,
];

/** Screen-space size of a footprint, used to fit it into the drawing box. */
export const footprint = (w, d, h, zScale = 1) => ({
  width: (w + d) * COS30,
  height: (w + d) * SIN30 + h * zScale,
});

/**
 * The three visible faces of an extruded footprint, nearest corner at (w, d).
 * Returns points strings ready for <polygon>.
 */
export function boxFaces(w, d, h, scale, ox, oy, zScale = scale) {
  const p = (x, y, z) => project(x, y, z, scale, ox, oy, zScale).join(',');
  return {
    top: [p(0, 0, h), p(w, 0, h), p(w, d, h), p(0, d, h)].join(' '),
    right: [p(w, 0, h), p(w, d, h), p(w, d, 0), p(w, 0, 0)].join(' '),
    front: [p(w, d, h), p(0, d, h), p(0, d, 0), p(w, d, 0)].join(' '),
  };
}
