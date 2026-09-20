import React, { useMemo } from 'react';
import { netProject, noCR, noLeg, noHexRgba } from '../utils/networkProjection';

const COLOR_BY_CORRIDOR = {
  C1: '#38bdf8',
  C2: '#34d399',
  C3: '#fbbf24',
  C4: '#a78bfa',
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

export function NetworkMap({
  networkDemo,
  blocks,
  trains,
  filter,
  layers,
  view,
  onSelect,
  onHover,
  analyzeConflicts,
  reducedMotion,
}) {
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
      return { id: cid, path: d, color: COLOR_BY_CORRIDOR[cid], chain: ch };
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
      const off = pl.lane === 1 ? -38 : 34;
      const cx = (leg.p1[0] + leg.p2[0]) / 2 + leg.ux * off;
      const cy = (leg.p1[1] + leg.p2[1]) / 2 + leg.uy * off;
      bands[b.id] = { x: cx, y: cy, corr: pl.c, leg };
    });
    return bands;
  }, [blocks, projectedStations]);

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

  return (
    <svg
      id="noSvg"
      viewBox="0 0 1200 740"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Synthetic railway network over satellite imagery"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => onHover && onHover(null)}
    >
      <defs id="noDefs">
        {corridorPaths.map(cp => (
          <path key={cp.id} id={`noPath${cp.id}`} d={cp.path} />
        ))}
      </defs>
      <g id="noView" style={{ transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.k})` }}>
        <g id="noSatP0">
          <circle cx="0" cy="0" r="1" fill="none" stroke="none" pointerEvents="none" />
        </g>
        <g id="noSatP1">
          <circle cx="100" cy="0" r="1" fill="none" stroke="none" pointerEvents="none" />
        </g>
        <g id="noLayer">
          {/* Corridors */}
          {corridorPaths.map(cp => {
            const col = cp.color;
            return (
              <g key={cp.id}>
                <path className="no-railbed" d={cp.path} stroke="rgba(8,12,16,.92)" strokeWidth="9" fill="none" strokeLinecap="round" />
                <path className="no-corline" d={cp.path} stroke={col} strokeWidth="2.6" opacity="0.96" fill="none" strokeLinecap="round" />
                <path className="no-rail" d={cp.path} stroke="rgba(255,255,255,.28)" strokeWidth="1" fill="none" strokeLinecap="round" strokeDasharray="11 13" />
                <path className="no-corhit" data-no={`corridor:${cp.id}`} d={cp.path} />
                {cp.chain.slice(0, -1).map((st, i) => {
                  const p1 = projectedStations[cp.chain[i]];
                  const p2 = projectedStations[cp.chain[i + 1]];
                  if (!p1 || !p2) return null;
                  const leg = noLeg(p1, p2);
                  const mx = (leg.p1[0] + leg.p2[0]) / 2;
                  const my = (leg.p1[1] + leg.p2[1]) / 2;
                  return (
                    <path
                      key={`${cp.id}-arrow-${i}`}
                      className="no-corarrow"
                      data-no={`corridor:${cp.id}`}
                      transform={`translate(${mx} ${my}) rotate(${leg.deg})`}
                      d="M0 -4.5 L7 0 L0 4.5 Z"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Blocks */}
          {blocks.map(b => {
            const band = blockBands[b.id];
            if (!band) return null;
            const col = COLOR_BY_CORRIDOR[band.corr] || '#94a3b8';
            const cf = analyzeConflicts ? analyzeConflicts(b) : { hasConflict: false, hasCritical: false };
            const hasConf = cf.hasConflict;
            const fill = noHexRgba(col, hasConf ? 0.32 : 0.2);
            const stroke = hasConf || cf.hasCritical ? '#f87171' : col;
            return (
              <g key={b.id} className="no-blockgrp" data-no={`block:${b.id}`} transform={`translate(${Math.round(band.x)} ${Math.round(band.y)}) rotate(${band.leg.deg})`}>
                <rect
                  x={Math.round(-band.leg.len / 2)}
                  y="-10"
                  width={Math.round(band.leg.len)}
                  height="20"
                  rx="10"
                  className={`no-blockb${hasConf ? ' no-confb' : ''}`}
                  data-no={`block:${b.id}`}
                  fill={fill}
                  stroke={stroke}
                />
                <text
                  x="0"
                  y="-18"
                  transform={`rotate(${Math.round(-band.leg.deg)})`}
                  className="no-blklabel"
                  data-no={`block:${b.id}`}
                >
                  {b.id}
                </text>
              </g>
            );
          })}

          {/* Conflict Markers */}
          {blocks.map(b => {
            const band = blockBands[b.id];
            if (!band) return null;
            const cf = analyzeConflicts ? analyzeConflicts(b) : { hasConflict: false };
            if (!cf.hasConflict) return null;
            const mx = band.x + band.leg.ux * 32;
            const my = band.y + band.leg.uy * 32;
            return (
              <g key={`conf-${b.id}`} className="no-confmark" data-no={`conflict:${b.id}`}>
                <circle cx={mx} cy={my} r="12" className="no-halo" fill="rgba(248,113,113,.25)" stroke="rgba(248,113,113,.55)" strokeWidth="1" />
                <circle cx={mx} cy={my} r="7" fill="#f87171" stroke="#ffffff" strokeWidth="1.5" />
                <path d={`M${mx} ${my - 3.5} v5`} stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                <circle cx={mx} cy={my + 3} r="1.3" fill="#ffffff" />
              </g>
            );
          })}

          {/* Stations */}
          {Object.keys(projectedStations).map(sid => {
            const p = projectedStations[sid];
            const corrs = Object.keys(CHAIN).filter(c => CHAIN[c].includes(sid));
            const mainCol = COLOR_BY_CORRIDOR[corrs[0]] || '#64748b';
            const isInter = corrs.length > 1;
            const dep = DEPOT[sid];
            const R = isInter ? 13 : 10;
            return (
              <g key={sid} className="no-station" data-no={`station:${sid}`}>
                <circle cx={p[0]} cy={p[1]} r={R + 4} fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="1.5" data-no={`station:${sid}`} />
                <circle cx={p[0]} cy={p[1]} r={R} fill="rgba(11,18,32,.97)" stroke={mainCol} strokeWidth="2" data-no={`station:${sid}`} />
                {isInter && <circle cx={p[0]} cy={p[1]} r={R - 6} fill="none" stroke={mainCol} strokeWidth="1.5" opacity="0.7" />}
                <circle cx={p[0]} cy={p[1]} r="3" fill={mainCol} />
                <g className="no-stlbl">
                  <text x={p[0]} y={p[1] + (isInter ? 32 : 26)} className="no-stname" data-no={`station:${sid}`}>
                    {sid}
                  </text>
                  {dep && (
                    <text x={p[0]} y={p[1] + (isInter ? 46 : 40)} className="no-stsub">
                      DEPOT
                    </text>
                  )}
                </g>
              </g>
            );
          })}

          {/* Trains (animated with SMIL) */}
          {!reducedMotion && trains.map((t, idx) => {
            const col = COLOR_BY_CORRIDOR[t.corridor] || '#94a3b8';
            const dur = (8 + (idx % 4) * 1.5).toFixed(1);
            const begin = (-(1 + idx * 1.6)).toFixed(1);
            return (
              <g key={t.id} className="no-train" data-no={`train:${t.id}`}>
                <g fill={col} opacity=".95">
                  <rect x="-15" y="-5" width="26" height="10" rx="3" />
                  <rect x="11" y="-4" width="9" height="8" rx="2" fill="#e2e8f0" />
                  <circle cx="-10" cy="4.5" r="2.6" fill="#0b1220" />
                  <circle cx="-3" cy="4.5" r="2.6" fill="#0b1220" />
                  <circle cx="4" cy="4.5" r="2.6" fill="#0b1220" />
                </g>
                <text x="20" y="2.5" fontSize="9" fontWeight="700" fill="#8aa3bd">
                  {t.id}
                </text>
                <animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" rotate="auto">
                  <mpath xlinkHref={`#noPath${t.corridor}`} />
                </animateMotion>
              </g>
            );
          })}
        </g>
      </g>
    </svg>
  );
}
