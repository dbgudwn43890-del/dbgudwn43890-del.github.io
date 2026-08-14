// Scale drawings of what the user is actually building. Plain SVG, no deps.
//
// Bulk material, concrete and paint are drawn isometrically, because their
// numbers are volumes and depth is the thing people get wrong. Carpet and
// flooring stay flat: their numbers are about how shapes tile across a plane,
// and tilting that away from the viewer would hide the very thing being shown.
//
// Colour comes from CSS custom properties so the design pass can restyle these
// without touching any geometry.
import { boxFaces, footprint, project } from './iso.js';

const W = 400;
const H = 270;
const PAD = 30;

const line = 'var(--preview-line, #6b6459)';
const fill = 'var(--preview-material, #cdc5b7)';
const top = 'var(--preview-material-top, #ded7cb)';
const side = 'var(--preview-material-side, #b3aa9a)';
const accent = 'var(--preview-accent, #b4642a)';
const faint = 'var(--preview-faint, #e4dfd6)';
const ground = 'var(--preview-ground, #fff)';

const svg = (body, animate = false) =>
  `<svg viewBox="0 0 ${W} ${H}" role="img" width="100%" class="drawing">` +
  `<g class="${animate ? 'drawing-in' : ''}">${body}</g></svg>`;

const ft = (n) => `${Math.round(n * 10) / 10} ft`;

const label = (x, y, text, anchor = 'middle') =>
  text ? `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="11" fill="${line}">${text}</text>` : '';

const poly = (points, f, extra = '') =>
  `<polygon class="f" points="${points}" fill="${f}" stroke="${line}" stroke-width="1.2" stroke-linejoin="round" ${extra}/>`;

/** Fit an isometric footprint into the drawing box. */
function isoFit(w, d, h, zScale, boxH = H - PAD * 2 - 26) {
  const fpUnit = footprint(w || 1, d || 1, 0);
  const scale = Math.min((W - PAD * 2) / fpUnit.width, boxH / (fpUnit.height + h * zScale));
  const ox = W / 2;
  const oy = PAD + h * zScale * scale;
  return { scale, ox, oy };
}

/**
 * A slab of material: footprint extruded by its depth.
 * Thin layers are drawn thicker than scale so 2 in still reads as a layer.
 */
export function areaPreview({ shape, length, width, diameter, area }, depthIn, materialKey, animate) {
  const depthFt = depthIn / 12;
  // ponytail: depth is drawn on its own exaggerated scale — a true-scale 2 in
  // layer on a 20 ft slab is one pixel. Swap for true scale if that ever misleads.
  const zUnit = Math.max(0.35, Math.min(1.6, 3 / Math.max(1, Math.max(width || diameter || 1, length || 1))));
  const h = Math.max(0.25, depthFt) * 6 * zUnit;

  let w, d, footprintSvg;
  if (shape === 'circle') {
    w = d = diameter || 1;
  } else if (shape === 'area') {
    w = d = Math.sqrt(area || 1);
  } else {
    w = width || 1;
    d = length || 1;
  }

  const { scale, ox, oy } = isoFit(w, d, h, 1);
  const zScale = scale;
  const faces = boxFaces(w, d, h, scale, ox, oy, zScale);

  if (shape === 'circle') {
    // A circle projects to a rotated ellipse; let the browser do it with the
    // ground matrix rather than deriving the axes by hand.
    // ponytail: the extruded side is a straight band, not a true arc silhouette.
    const r = diameter / 2;
    const [cxTop, cyTop] = project(r, r, h, scale, ox, oy, zScale);
    const [cxBot, cyBot] = project(r, r, 0, scale, ox, oy, zScale);
    const rx = r * scale * Math.cos(Math.PI / 6) * 2;
    footprintSvg =
      `<path class="f" d="M${cxTop - rx / 2} ${cyTop} A${rx / 2} ${(rx / 2) * 0.577} 0 0 0 ${cxTop + rx / 2} ${cyTop}
         L${cxBot + rx / 2} ${cyBot} A${rx / 2} ${(rx / 2) * 0.577} 0 0 1 ${cxBot - rx / 2} ${cyBot} Z"
         fill="${side}" stroke="${line}" stroke-width="1.2"/>` +
      `<ellipse class="f" cx="${cxTop}" cy="${cyTop}" rx="${rx / 2}" ry="${(rx / 2) * 0.577}"
         fill="${top}" stroke="${line}" stroke-width="1.2"/>` +
      label(cxTop, cyTop + 4, ft(diameter));
  } else {
    footprintSvg =
      poly(faces.right, side) +
      poly(faces.front, fill) +
      poly(faces.top, top, `<title>${ft(w)} × ${ft(d)}</title>`) +
      label(...project(w / 2, 0, h, scale, ox, oy, zScale).map((n, i) => (i ? n - 8 : n)), ft(w)) +
      label(...project(0, d / 2, h, scale, ox, oy, zScale).map((n, i) => (i ? n - 8 : n - 14)), ft(d));
  }

  // Depth callout on the front-left edge.
  const [dxTop, dyTop] = project(0, d, h, scale, ox, oy, zScale);
  const [dxBot, dyBot] = project(0, d, 0, scale, ox, oy, zScale);
  const depthMark =
    `<line x1="${dxTop - 9}" y1="${dyTop}" x2="${dxBot - 9}" y2="${dyBot}" stroke="${accent}" stroke-width="1.6"/>` +
    label(dxTop - 13, (dyTop + dyBot) / 2 + 4, `${Math.round(depthIn * 10) / 10} in`, 'end');

  return svg(footprintSvg + depthMark, animate);
}

/** A room as an open box: floor, two walls, optional ceiling plane. */
export function paintPreview(room, { doors = 0, windows = 0, ceiling = false, trim = false } = {}, animate) {
  const w = room.width || 1;
  const d = room.length || 1;
  const hFt = room.height || 1;
  const { scale, ox, oy } = isoFit(w, d, hFt, 1);
  const p = (x, y, z) => project(x, y, z, scale, ox, oy, scale).join(',');

  // Back two walls stand up; the near two are left off so you can see inside.
  const backWall = [p(0, 0, 0), p(w, 0, 0), p(w, 0, hFt), p(0, 0, hFt)].join(' ');
  const leftWall = [p(0, 0, 0), p(0, d, 0), p(0, d, hFt), p(0, 0, hFt)].join(' ');
  const floor = [p(0, 0, 0), p(w, 0, 0), p(w, d, 0), p(0, d, 0)].join(' ');
  const ceil = [p(0, 0, hFt), p(w, 0, hFt), p(w, d, hFt), p(0, d, hFt)].join(' ');

  let body =
    poly(floor, faint, '<title>floor — not painted</title>') +
    poly(leftWall, side, '<title>wall</title>') +
    poly(backWall, fill, '<title>wall</title>');

  if (ceiling) {
    body += `<polygon class="f" points="${ceil}" fill="${top}" stroke="${line}"
      stroke-width="1.2" opacity=".55"><title>ceiling</title></polygon>`;
  }

  // Openings sit on the back wall, trim runs along the wall feet.
  for (let i = 0; i < doors; i++) {
    const x = (w * (i + 1)) / (doors + 1);
    body += `<polygon points="${[p(x - 1.5, 0, 0), p(x + 1.5, 0, 0), p(x + 1.5, 0, 6.7), p(x - 1.5, 0, 6.7)].join(' ')}"
      fill="${ground}" stroke="${line}" stroke-width="1"/>`;
  }
  for (let i = 0; i < windows; i++) {
    const y = (d * (i + 1)) / (windows + 1);
    body += `<polygon points="${[p(0, y - 1.5, hFt * 0.35), p(0, y + 1.5, hFt * 0.35), p(0, y + 1.5, hFt * 0.75), p(0, y - 1.5, hFt * 0.75)].join(' ')}"
      fill="${ground}" stroke="${line}" stroke-width="1" stroke-dasharray="3 2"/>`;
  }
  if (trim) {
    body +=
      `<polyline points="${[p(0, d, 0), p(0, 0, 0), p(w, 0, 0)].join(' ')}" fill="none"
        stroke="${accent}" stroke-width="2.5" stroke-linejoin="round"><title>trim</title></polyline>`;
  }

  body += label(W / 2, H - 8,
    `${ft(w)} × ${ft(d)} room, ${ft(hFt)} walls · ${doors} door${doors === 1 ? '' : 's'} · ${windows} window${windows === 1 ? '' : 's'}`);
  return svg(body, animate);
}

/** Fence post in section — a cutaway, so it stays flat on purpose. */
export function postPreview(holeDiameterIn, holeDepthIn, postWidthIn, fenceHeightFt, animate) {
  const aboveIn = Math.max(fenceHeightFt * 12, 1);
  const totalIn = aboveIn + holeDepthIn;
  const scale = Math.min((H - PAD * 2) / totalIn, (W - PAD * 2) / Math.max(holeDiameterIn * 3, 1));
  const cx = W / 2;
  const groundY = PAD + aboveIn * scale;
  const holeW = holeDiameterIn * scale;
  const holeH = holeDepthIn * scale;
  const postW = Math.max(3, postWidthIn * scale);

  const body =
    `<rect x="${PAD}" y="${groundY}" width="${W - PAD * 2}" height="${H - groundY - 22}" fill="${faint}" opacity=".5"/>` +
    `<line x1="${PAD}" y1="${groundY}" x2="${W - PAD}" y2="${groundY}" stroke="${line}" stroke-width="1.5"/>` +
    `<rect class="f" x="${cx - holeW / 2}" y="${groundY}" width="${holeW}" height="${holeH}"
       fill="${fill}" stroke="${line}" stroke-width="1.4"><title>concrete</title></rect>` +
    `<rect class="f" x="${cx - postW / 2}" y="${PAD}" width="${postW}" height="${aboveIn * scale + holeH}"
       fill="${ground}" stroke="${line}" stroke-width="1.4"><title>${postWidthIn} in post</title></rect>` +
    label(cx, groundY + holeH + 16, `${holeDiameterIn} in wide · ${holeDepthIn} in deep`) +
    label(W / 2, H - 6, 'shaded area is the concrete — the post displaces the rest');
  return svg(body, animate);
}

// --- Flat plan views ------------------------------------------------------
// Carpet and flooring are about how material tiles across a floor. Tilting
// these into isometric would foreshorten the strips and hide the seams, which
// are the whole point.

function planFit(realW, realH, boxW = W - PAD * 2, boxH = H - PAD * 2 - 20) {
  const scale = Math.min(boxW / (realW || 1), boxH / (realH || 1));
  const w = realW * scale;
  const h = realH * scale;
  return { scale, w, h, x: (W - w) / 2, y: PAD + (boxH - h) / 2 };
}

/** Flooring: the room, plus the offcut allowance drawn as a band around it. */
export function floorPreview(roomLengthFt, roomWidthFt, waste, animate) {
  const f = planFit(roomWidthFt, roomLengthFt);
  const band = Math.max(4, (Math.sqrt(1 + waste) - 1) * Math.min(f.w, f.h) * 1.6);
  const body =
    `<rect x="${f.x - band}" y="${f.y - band}" width="${f.w + band * 2}" height="${f.h + band * 2}"
       fill="${faint}" stroke="${accent}" stroke-width="1" stroke-dasharray="5 4"/>` +
    `<rect class="f" x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" fill="${fill}"
       stroke="${line}" stroke-width="1.5"><title>your floor</title></rect>` +
    label(f.x + f.w / 2, f.y + f.h / 2 + 4, `${ft(roomWidthFt)} × ${ft(roomLengthFt)}`) +
    label(W / 2, H - 8, `dashed band = ${Math.round(waste * 100)}% offcut allowance`);
  return svg(body, animate);
}

/** Carpet: strips laid off the roll, with seams drawn where they fall. */
export function carpetPreview(roomLengthFt, roomWidthFt, rollWidthFt, layout, animate) {
  const alongLength = layout.runsAlong === 'length';
  const f = planFit(roomWidthFt, roomLengthFt);
  const stripPx = (rollWidthFt / (alongLength ? roomWidthFt : roomLengthFt)) * (alongLength ? f.w : f.h);

  let strips = '';
  let seams = '';
  for (let i = 0; i < layout.strips; i++) {
    const offset = i * stripPx;
    if (alongLength) {
      const x = f.x + offset;
      const w = Math.min(stripPx, f.x + f.w - x);
      strips += `<rect class="f" x="${x}" y="${f.y}" width="${w}" height="${f.h}" fill="${i % 2 ? side : fill}"
        stroke="${line}" stroke-width="1"><title>strip ${i + 1}</title></rect>`;
      if (i > 0) seams += `<line x1="${x}" y1="${f.y}" x2="${x}" y2="${f.y + f.h}" stroke="${accent}" stroke-width="2.5"/>`;
    } else {
      const y = f.y + offset;
      const h = Math.min(stripPx, f.y + f.h - y);
      strips += `<rect class="f" x="${f.x}" y="${y}" width="${f.w}" height="${h}" fill="${i % 2 ? side : fill}"
        stroke="${line}" stroke-width="1"><title>strip ${i + 1}</title></rect>`;
      if (i > 0) seams += `<line x1="${f.x}" y1="${y}" x2="${f.x + f.w}" y2="${y}" stroke="${accent}" stroke-width="2.5"/>`;
    }
  }

  const caption = layout.seams
    ? `${layout.strips} strips off a ${rollWidthFt} ft roll · ${layout.seams} seam${layout.seams > 1 ? 's' : ''} marked`
    : `one ${rollWidthFt} ft strip covers it · no seams`;

  const body =
    strips +
    seams +
    `<rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" fill="none" stroke="${line}" stroke-width="1.5"/>` +
    label(f.x + f.w / 2, f.y - 8, ft(roomWidthFt)) +
    label(f.x - 8, f.y + f.h / 2, ft(roomLengthFt), 'end') +
    label(W / 2, H - 8, caption);
  return svg(body, animate);
}
