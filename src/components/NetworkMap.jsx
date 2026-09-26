import React, { useMemo } from 'react';
import { netProject, noCR, noLeg, noHexRgba } from '../utils/networkProjection';

const COLOR_BY_CORRIDOR = {
  C1: '#0284c7',
  C2: '#059669',
  C3: '#d97706',
  C4: '#7c3aed',
};

const CHAIN = {
  C1: ['S1-A', 'S1-B', 'S1-C'],
  C2: ['S2-A', 'S2-B', 'S2-C'],
  C3: ['S3-A', 'S3-B', 'S3-C'],
  C4: ['S2-C', 'S4-A', 'S4-B'],
};

const DEPOT = {
  'S1-B': true,
  'S2-B': true,
  'S3-B': true,
  'S4-B': true,
};

// Block placement on tracks (leg and lane)
const PLACE = {
  'B-041': { c: 'C2', leg: 0, lane: 0 },
  'B-042': { c: 'C1', leg: 0, lane: 0 },
  'B-043': { c: 'C3', leg: 0, lane: 0 },
  'B-045': { c: 'C2', leg: 1, lane: 0 },
  'B-046': { c: 'C3', leg: 1, lane: 0 },
  'B-047': { c: 'C4', leg: 0, lane: 0 },
  'B-048': { c: 'C1', leg: 1, lane: 0 },
  'B-049': { c: 'C2', leg: 1, lane: 1 },
  'B-050': { c: 'C4', leg: 1, lane: 0 },
};

// Approx text width (screen px) for declutter boxes
const textW = (t, f) => String(t).length * (f || 6.3) + 8;

// Station label slots in SCREEN px relative to the marker.
const ST_SLOTS = [
  { dx: 0, dy: 20, anchor: 'middle' },
  { dx: -44, dy: 20, anchor: 'end' },
  { dx: 44, dy: 20, anchor: 'start' },
  { dx: -40, dy: -18, anchor: 'end' },
  { dx: 40, dy: -18, anchor: 'start' },
];

const boxAt = (ax, ay, w, h, anchor) => {
  const dx = anchor === 'start' ? w / 2 : anchor === 'end' ? -w / 2 : 0;
  return { x: ax + dx, y: ay, w, h };
};

const boxesHit = (a, b) => (
  Math.abs(a.x - b.x) < (a.w + b.w) / 2 + 4 &&
  Math.abs(a.y - b.y) < (a.h + b.h) / 2 + 4
);

// Pick a collision-free slot (screen space); returns slot or null
const pickSlot = (px, py, w, slots, placed) => {
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    const box = boxAt(px + s.dx, py + s.dy, w, 13, s.anchor);
    if (!placed.some(p => boxesHit(p, box))) {
      placed.push(box);
      return { ...s, box };
    }
  }
  return null;
};

export function NetworkMap({
  networkDemo,
  blocks,
  trains,
  filter,
  view,
  onSelect,
  onHover,
  analyzeConflicts,
  reducedMotion,
  selection,
  hover,
}) {
  const k = view.k || 1;
  const tx = view.tx || 0;
  const ty = view.ty || 0;

  // Cast hover string "kind:id" to parsed object for emphasis
  const hoverRef = useMemo(() => {
    if (!hover) return null;
    const i = hover.indexOf(':');
    if (i <= 0) return null;
    return { kind: hover.slice(0, i), id: hover.slice(i + 1) };
  }, [hover]);

  const { stations: projectedStations, wired } = useMemo(() => {
    return netProject(networkDemo, networkDemo.sat);
  }, [networkDemo]);

  const corridorPaths = useMemo(() => {
    const order = ['C1', 'C2', 'C3', 'C4'];
    return order.map(cid => {
      const ch = CHAIN[cid];
      const pts = wired[cid] && wired[cid].length
        ? wired[cid]
        : ch.map(s => projectedStations[s]).filter(Boolean);
      const d = noCR(pts);
      // midpoint of polyline for corridor label anchor
      const mid = pts[Math.floor(pts.length / 2)] || [600, 370];
      const nxt = pts[Math.min(Math.floor(pts.length / 2) + 1, pts.length - 1)] || mid;
      let nx = 0, ny = -1;
      const dx = nxt[0] - mid[0], dy = nxt[1] - mid[1];
      const L = Math.sqrt(dx * dx + dy * dy) || 1;
      nx = -dy / L; ny = dx / L;
      return {
        id: cid,
        path: d,
        color: COLOR_BY_CORRIDOR[cid],
        chain: ch,
        anchor: [mid[0] + nx * -34, mid[1] + ny * -34],
      };
    });
  }, [wired, projectedStations]);

  const blockBands = useMemo(() => {
    const bands = {};
    blocks.forEach(b => {
      if (!b || !b.id) return;
      const pl = PLACE[b.id] || { c: b.corridor || 'C1', leg: 0, lane: 0 };
      const ch = CHAIN[pl.c];
      if (!ch || !ch[pl.leg] || !ch[pl.leg + 1]) return;
      const p1 = projectedStations[ch[pl.leg]];
      const p2 = projectedStations[ch[pl.leg + 1]];
      if (!p1 || !p2) return;
      const leg = noLeg(p1, p2);
      const off = pl.lane === 1 ? -30 : 30;
      const cx = (leg.p1[0] + leg.p2[0]) / 2 + leg.ux * off;
      const cy = (leg.p1[1] + leg.p2[1]) / 2 + leg.uy * off;
      bands[b.id] = { x: cx, y: cy, corr: pl.c, leg };
    });
    return bands;
  }, [blocks, projectedStations]);

  // Conflict analysis — memoized once per render batch to avoid duplicate work
  const conflictByBlock = useMemo(() => {
    const m = {};
    blocks.forEach(b => {
      if (!b || !b.id) return;
      const res = analyzeConflicts ? analyzeConflicts(b) : { hasConflict: false, hasCritical: false, hasResource: false };
      const statusConflict = /conflict|warning/i.test(b.status || '');
      m[b.id] = {
        ...res,
        hasConflict: !!(res.hasConflict || statusConflict),
        hasCritical: !!(res.hasCritical || /conflict/i.test(b.status || '')),
      };
    });
    return m;
  }, [blocks, analyzeConflicts]);

  // ---- Label layout (screen-space declutter + zoom LOD) ----
  const labelLayout = useMemo(() => {
    const kk = view.k || 1;
    const txx = view.tx || 0;
    const tyy = view.ty || 0;
    const sxm = (x) => txx + kk * x;
    const sym = (y) => tyy + kk * y;

    // Level of detail tiers (based on map zoom k):
    const showCorrLabels = kk < 1.6;             // corridor chips only when zoomed out
    const showStationLabels = kk >= 1.25;         // station names from medium zoom
    const showBlockLabels = kk >= 2.0;            // block IDs from higher zoom
    const showSuper = kk >= 4.5;                  // super-zoom: block timings

    const placed = [];
    const stationLbl = {};
    const blockLbl = {};
    const corrLbl = {};

    const tryBox = (b) => {
      if (!placed.some(p => boxesHit(p, b))) {
        placed.push(b);
        return true;
      }
      return false;
    };

    // 1. Selected/conflicted block labels first (always visible)
    blocks.forEach(b => {
      if (!b || !b.id) return;
      if (filter === 'stations') return; // stations view: station labels only
      const band = blockBands[b.id];
      if (!band) return;
      const cf = conflictByBlock[b.id];
      const isSel = selection && selection.kind === 'block' && selection.id === b.id;
      const isHov = hoverRef && hoverRef.kind === 'block' && hoverRef.id === b.id;
      if (!isSel && !isHov && !cf.hasConflict) return; // normal blocks handled by LOD below
      if (filter === 'trains' && !isSel && !isHov) return;
      const px = sxm(band.x);
      const py = sym(band.y);
      const w = textW(b.id, 7);
      const yOff = 7 * kk + 12; // screen px below the (growing) block rect
      const ok = tryBox(boxAt(px, py + yOff, w, 13, 'middle'));
      if (ok || isSel) {
        blockLbl[b.id] = {
          dy: yOff,
          cls: `${isSel ? 'no-blklabel-sel' : ''} ${cf.hasConflict ? 'no-blklabel-conf' : ''}`,
          sub: showSuper && (b.startTime || b.endTime)
            ? `${b.startTime || ''}–${b.endTime || ''}${b.type ? ' · ' + String(b.type).toUpperCase() : ''}`
            : (cf.hasConflict ? 'CONFLICT' : ''),
        };
        if (!ok) placed.push(boxAt(px, py + yOff, w, 16, 'middle'));
      }
    });

    // 2. Stations — decluttered into slots (screen px)
    if (showStationLabels || filter === 'stations') {
      Object.keys(projectedStations).forEach(sid => {
        const p = projectedStations[sid];
        const dep = DEPOT[sid];
        const isSel = selection && selection.kind === 'station' && selection.id === sid;
        const isHov = hoverRef && hoverRef.kind === 'station' && hoverRef.id === sid;
        if (!isSel && !isHov && filter !== 'stations' && !showStationLabels) return;

        const w = textW(sid, 6.8) + (dep ? 4 : 0);
        const slots = (isSel || isInterOrDep(sid)) ? ST_SLOTS : [{ dx: 0, dy: 16, anchor: 'middle' }];
        let slot = pickSlot(sxm(p[0]), sym(p[1]), w, slots, placed);
        if (isSel && !slot) {
          const primary = ST_SLOTS[0];
          slot = { ...primary, box: boxAt(sxm(p[0]) + primary.dx, sym(p[1]) + primary.dy, w, 13, primary.anchor) };
          placed.push(slot.box);
        }
        if (!slot) return;
        stationLbl[sid] = {
          dx: slot.dx,
          dy: slot.dy,
          anchor: slot.anchor,
          isSel: !!isSel,
          isHov: !!isHov,
          dep,
        };
      });
    }

    function isInterOrDep(sid) {
      const corrs = Object.keys(CHAIN).filter(c => CHAIN[c].includes(sid));
      return corrs.length > 1 || !!DEPOT[sid];
    }

    // 3. Normal (non-conflict) block labels — LOD gated
    if (showBlockLabels && (filter === 'all' || filter === 'blocks' || filter === 'maintenance')) {
      blocks.forEach(b => {
        if (!b || !b.id) return;
        const band = blockBands[b.id];
        if (!band) return;
        const cf = conflictByBlock[b.id];
        if (cf.hasConflict) return;
        if (selection && selection.kind === 'block' && selection.id === b.id) return;
        if (hoverRef && hoverRef.kind === 'block' && hoverRef.id === b.id) return;
        const px = sxm(band.x);
        const py = sym(band.y);
        const w = textW(b.id, 6.6);
        const yOff = 7 * kk + 12;
        if (tryBox(boxAt(px, py + yOff, w, 13, 'middle'))) {
          blockLbl[b.id] = {
            dy: yOff,
            cls: '',
            sub: showSuper && (b.startTime || b.endTime)
              ? `${b.startTime || ''}–${b.endTime || ''}${b.type ? ' · ' + String(b.type).toUpperCase() : ''}`
              : '',
          };
        }
      });
    }

    // 4. Corridor chips — only when zoomed out
    corridorPaths.forEach(cp => {
      if (!showCorrLabels) return;
      const w = textW(cp.id, 7.2);
      if (tryBox(boxAt(sxm(cp.anchor[0]), sym(cp.anchor[1]), w, 14, 'middle'))) {
        corrLbl[cp.id] = cp.anchor;
      }
    });

    return { stationLbl, blockLbl, corrLbl };
  }, [view, blocks, blockBands, projectedStations, conflictByBlock, corridorPaths, selection, hoverRef, filter]);

  const handleClick = (e) => {
    const el = e.target.closest('[data-no]');
    if (!el) return;
    const v = el.getAttribute('data-no');
    const idx = v.indexOf(':');
    const kind = v.slice(0, idx);
    const id = v.slice(idx + 1);
    if (onSelect) onSelect(kind, id);
  };

  const handleMouseMove = (e) => {
    const el = e.target.closest('[data-no]');
    if (onHover) {
      if (!el) {
        onHover(null);
      } else {
        const v = el.getAttribute('data-no');
        const rect = el.getBoundingClientRect();
        onHover({ value: v, x: e.clientX, y: e.clientY, rect });
      }
    }
  };

  // Corridor focusing: dim non-selected corridor when one is selected
  const selCorr = selection && selection.kind === 'corridor' ? selection.id : null;
  const invK = 1 / k;

  return (
    <svg
      id="noSvg"
      viewBox="0 0 1200 740"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Synthetic railway network over light vector basemap"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => onHover && onHover(null)}
    >
      <defs id="noDefs">
        {corridorPaths.map(cp => (
          <path key={cp.id} id={`noPath${cp.id}`} d={cp.path} />
        ))}
      </defs>
      <g id="noView" style={{ transform: `translate(${tx}px, ${ty}px) scale(${k})` }}>
        <g id="noSatP0">
          <circle cx="0" cy="0" r="1" fill="none" stroke="none" pointerEvents="none" />
        </g>
        <g id="noSatP1">
          <circle cx="100" cy="0" r="1" fill="none" stroke="none" pointerEvents="none" />
        </g>
        {/* Geographic layers — scale naturally with zoom, strokes stay crisp */}
        <g id="noLayer">
          {corridorPaths.map(cp => {
            const col = cp.color;
            const dim = selCorr && selCorr !== cp.id;
            return (
              <g key={cp.id} className={`no-corgrp${dim ? ' no-cor-dim' : ''}`}>
                <path className="no-railbed" d={cp.path} stroke="rgba(255,255,255,.95)" strokeWidth="7" fill="none" strokeLinecap="round" />
                <path className="no-corline" d={cp.path} stroke={col} strokeWidth="3.4" opacity="0.95" fill="none" strokeLinecap="round" />
                <path className="no-rail" d={cp.path} stroke="rgba(255,255,255,.9)" strokeWidth="0.9" fill="none" strokeLinecap="round" strokeDasharray="10 12" />
                <path className="no-corhit" data-no={`corridor:${cp.id}`} d={cp.path} />
                {cp.chain.slice(0, -1).map((st, i) => {
                  const p1 = projectedStations[cp.chain[i]];
                  const p2 = projectedStations[cp.chain[i + 1]];
                  if (!p1 || !p2) return null;
                  const leg = noLeg(p1, p2);
                  const mx = (leg.p1[0] + leg.p2[0]) / 2;
                  const my = (leg.p1[1] + leg.p2[1]) / 2;
                  return (
                    <g key={`${cp.id}-arrow-${i}`} transform={`translate(${mx} ${my}) rotate(${leg.deg})`}>
                      <path className="no-corarrow" data-no={`corridor:${cp.id}`} transform={`scale(${invK})`} d="M0 -4.5 L7 0 L0 4.5 Z" />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>

        {/* Block geometry — geographic, rotates/scales with the track, stroke crisp */}
        <g id="noBlockGeo">
          {blocks.map(b => {
            const band = blockBands[b.id];
            if (!band) return null;
            const col = COLOR_BY_CORRIDOR[band.corr] || '#64748b';
            const cf = conflictByBlock[b.id];
            const hasConf = cf.hasConflict;
            const isSel = selection && selection.kind === 'block' && selection.id === b.id;
            const isHov = hoverRef && hoverRef.kind === 'block' && hoverRef.id === b.id;
            const fill = hasConf ? noHexRgba('#dc2626', 0.85) : noHexRgba(col, isSel ? 0.75 : 0.45);
            const stroke = hasConf ? '#b91c1c' : isSel ? '#0f172a' : col;
            return (
              <g
                key={b.id}
                className={`no-blockgrp${hasConf ? ' no-blk-conf no-confb' : ''}${isSel ? ' no-blk-sel' : ''}${isHov ? ' no-blk-hov' : ''}`}
                data-no={`block:${b.id}`}
                transform={`translate(${band.x} ${band.y}) rotate(${band.leg.deg})`}
              >
                <rect
                  x={-band.leg.len / 2}
                  y="-7"
                  width={band.leg.len}
                  height="14"
                  rx="7"
                  className="no-blockb"
                  data-no={`block:${b.id}`}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </g>

        {/* Overlay widgets — constant screen size (counter-scaled) */}
        <g id="noWidgets">
          {/* Block labels */}
          {Object.keys(labelLayout.blockLbl).map(bid => {
            const lbl = labelLayout.blockLbl[bid];
            const band = blockBands[bid];
            if (!band) return null;
            return (
              <g
                key={`bl-${bid}`}
                className="no-lblw"
                transform={`translate(${band.x} ${band.y}) scale(${invK})`}
              >
                <line x1="0" y1="-8" x2="0" y2={lbl.dy - 4} className="no-lead" />
                <text x="0" y={lbl.dy} className={`no-blklabel ${lbl.cls}`}>
                  {bid}
                </text>
                {lbl.sub && (
                  <text x="0" y={lbl.dy + 11} className="no-blksub">
                    {lbl.sub}
                  </text>
                )}
              </g>
            );
          })}

          {/* Station markers + labels */}
          {Object.keys(projectedStations).map(sid => {
            const p = projectedStations[sid];
            const corrs = Object.keys(CHAIN).filter(c => CHAIN[c].includes(sid));
            const mainCol = COLOR_BY_CORRIDOR[corrs[0]] || '#475569';
            const isInter = corrs.length > 1;
            const R = isInter ? 12 : 9;
            const isSel = selection && selection.kind === 'station' && selection.id === sid;
            const isHov = hoverRef && hoverRef.kind === 'station' && hoverRef.id === sid;
            const lbl = labelLayout.stationLbl[sid];
            return (
              <g key={sid} className={`no-station${isSel ? ' no-stn-sel' : ''}${isHov ? ' no-stn-hov' : ''}`} data-no={`station:${sid}`} transform={`translate(${p[0]} ${p[1]}) scale(${invK})`}>
                <circle cx="0" cy="0" r={R + 5} fill="none" stroke={isSel ? '#0f172a' : 'rgba(15,23,42,.28)'} strokeWidth="1.2" data-no={`station:${sid}`} />
                <circle cx="0" cy="0" r={R} fill={isSel ? '#0f172a' : '#ffffff'} stroke={mainCol} strokeWidth="2.2" data-no={`station:${sid}`} />
                {isInter && <circle cx="0" cy="0" r={R - 5} fill="none" stroke={mainCol} strokeWidth="1.4" opacity="0.9" />}
                <circle cx="0" cy="0" r="2.6" fill={mainCol} />
                {lbl && (
                  <g className="no-stlbl" data-no={`station:${sid}`}>
                    <line
                      x1="0"
                      y1="0"
                      x2={lbl.dx}
                      y2={lbl.dy > 0 ? Math.min(lbl.dy - 3, 12) : Math.max(lbl.dy + 3, -12)}
                      className="no-lead no-lead-st"
                    />
                    <text
                      x={lbl.dx}
                      y={lbl.dy}
                      textAnchor={lbl.anchor}
                      className={`no-stname${lbl.isSel ? ' no-stname-sel' : ''}`}
                      data-no={`station:${sid}`}
                    >
                      {sid}
                    </text>
                    {lbl.dep && (
                      <text x={lbl.dx} y={lbl.dy + 11} textAnchor={lbl.anchor} className="no-stsub">
                        DEPOT
                      </text>
                    )}
                  </g>
                )}
              </g>
            );
          })}

          {/* Conflict markers */}
          {Object.keys(conflictByBlock).map(bid => {
            const cf = conflictByBlock[bid];
            if (!cf.hasConflict) return null;
            const band = blockBands[bid];
            if (!band) return null;
            const mx = band.x + band.leg.ux * (26 / k);
            const my = band.y + band.leg.uy * (26 / k);
            return (
              <g key={`conf-${bid}`} className="no-confmark" data-no={`conflict:${bid}`}>
                <line x1={band.x} y1={band.y} x2={mx} y2={my} className="no-lead no-lead-conf" />
                <g transform={`translate(${mx} ${my}) scale(${invK})`}>
                  <circle cx="0" cy="0" r="12" className="no-halo" fill="rgba(220,38,38,.18)" stroke="rgba(220,38,38,.55)" strokeWidth="1.2" />
                  <circle cx="0" cy="0" r="6.5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.6" />
                  <path d="M0 -3.5 v5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="0" cy="3.2" r="1.2" fill="#ffffff" />
                  <circle cx="0" cy="0" r="18" fill="transparent" stroke="none" data-no={`conflict:${bid}`} style={{ cursor: 'pointer' }} />
                </g>
              </g>
            );
          })}

          {/* Trains (animated with SMIL, sprite constant size) */}
          {!reducedMotion && trains.map((t, idx) => {
            const col = COLOR_BY_CORRIDOR[t.corridor] || '#475569';
            const dur = (8 + (idx % 4) * 1.5).toFixed(1);
            const begin = (-(1 + idx * 1.6)).toFixed(1);
            return (
              <g key={t.id} className="no-train" data-no={`train:${t.id}`}>
                <g transform={`scale(${invK})`}>
                  <g fill={col} opacity=".95">
                    <rect x="-13" y="-4.5" width="24" height="9" rx="3" />
                    <rect x="10" y="-3.5" width="8" height="7" rx="2" fill="#f8fafc" />
                    <circle cx="-8.5" cy="4" r="2.4" fill="#0b1220" />
                    <circle cx="-2.5" cy="4" r="2.4" fill="#0b1220" />
                    <circle cx="3.5" cy="4" r="2.4" fill="#0b1220" />
                  </g>
                  {k >= 2.6 && (
                    <text x="14" y="2" fontSize="9" fontWeight="700" fill="#0f172a">
                      {t.id}
                    </text>
                  )}
                </g>
                <animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" rotate="auto">
                  <mpath xlinkHref={`#noPath${t.corridor}`} />
                </animateMotion>
              </g>
            );
          })}

          {/* Corridor chips */}
          {corridorPaths.map(cp => {
            const lbl = labelLayout.corrLbl[cp.id];
            if (!lbl) return null;
            const col = cp.color;
            return (
              <g key={`cor-${cp.id}`} className="no-corlabel" data-no={`corridor:${cp.id}`} transform={`translate(${cp.anchor[0]} ${cp.anchor[1]}) scale(${invK})`}>
                <rect
                  x={-textW(cp.id, 7.2) / 2 - 6}
                  y={-11}
                  width={textW(cp.id, 7.2) + 12}
                  height="22"
                  rx="11"
                  fill="rgba(255,255,255,.96)"
                  stroke={col}
                  strokeWidth="1.6"
                  data-no={`corridor:${cp.id}`}
                  pointerEvents="all"
                />
                <text x="0" y="3.5" data-no={`corridor:${cp.id}`}>
                  {cp.id}
                </text>
              </g>
            );
          })}
        </g>
      </g>
    </svg>
  );
}