import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Scan,
  PanelLeft,
  Sparkles,
  MousePointer2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEMO_DATA } from '../data/demoData';
import { makeAnalyzer } from '../utils/analyzer';
import { NetworkMap } from '../components/NetworkMap';
import { NetworkSidebar } from '../components/NetworkSidebar';
import { NetworkDetailsDrawer } from '../components/NetworkDetailsDrawer';
import { netProject } from '../utils/networkProjection';
import './networkops.css';

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

const fitView = (n) => {
  const proj = netProject(n, n.sat);
  const pts = [];
  Object.values(proj.stations || {}).forEach(p => pts.push(p[0], p[1]));
  Object.values(proj.wired || {}).forEach(w => w.forEach(p => pts.push(p[0], p[1])));
  if (!pts.length) return { k: 1.45, tx: 0, ty: 0 };
  const minX = Math.min(...pts), maxX = Math.max(...pts);
  const minY = Math.min(...pts), maxY = Math.max(...pts);
  const spanX = maxX - minX, spanY = maxY - minY;
  // Fit the whole operating area on both axes with comfortable margin.
  const kX = (1200 - 120) / (spanX + 40);
  const kY = (740 - 60) / (spanY + 40);
  const k = Math.max(1.15, Math.min(1.7, Math.min(kX, kY)));
  const cy = minY + spanY * 0.55; // bias toward the junction/stations cluster
  const cx = (minX + maxX) / 2;
  return { k, tx: 600 - k * cx, ty: 370 - k * cy };
};

export function NetworkOpsPage() {
  const { blocks, trains } = useApp();
  const net = DEMO_DATA.networkDemo || {
    label: 'Nashik Road · Central Railway',
    sat: { lng0: 73.8425, lat0: 19.9491, lonSpan: 0.05 },
    stations: [],
    corridors: [],
    blocks: [],
  };

  const analyzer = useMemo(() => makeAnalyzer(blocks, trains, undefined), [blocks, trains]);

  const [filter, setFilter] = useState('all');
  const [collapsed, setCollapsed] = useState(false);
  const [view, setView] = useState(() => fitView(net));
  const [detail, setDetail] = useState(null);
  const [tip, setTip] = useState(null);
  const [hoverKey, setHoverKey] = useState(null);

  const satMapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const reducedMotion = useMemo(() => {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const analyzeBlockConflict = useCallback((b) => {
    if (!analyzer) return { hasConflict: false, hasCritical: false, level: 'clear', severity: 'No Conflict', all: [] };
    const res = analyzer.analyze(b);
    return {
      ...res,
      level: res.hasCritical ? 'crit' : res.hasConflict ? 'warn' : 'clear',
      severity: res.hasCritical ? 'Critical' : res.hasConflict ? 'Warning' : 'No Conflict',
    };
  }, [analyzer]);

  // Projected stations for focus/zoom
  const { stations: projectedStations } = useMemo(() => {
    return netProject(net, net.sat);
  }, [net]);

  // Initialize light vector Leaflet basemap behind SVG
  useEffect(() => {
    if (!mapContainerRef.current || satMapRef.current) return;

    const satMap = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
      zoomSnap: 0,
      zoomDelta: 0.25,
      minZoom: 2,
      maxZoom: 20,
      fadeAnimation: false,
      zoomAnimation: false,
      markerZoomAnimation: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      maxNativeZoom: 19,
      subdomains: 'abc',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      crossOrigin: true,
    }).addTo(satMap);

    satMap.setView([net.sat.lat0, net.sat.lng0], 15, { animate: false });
    satMapRef.current = satMap;

    return () => {
      if (satMapRef.current) {
        satMapRef.current.remove();
        satMapRef.current = null;
      }
    };
  }, [net.sat]);

  // Sync Leaflet map when SVG view transform changes
  const satSync = useCallback(() => {
    if (!satMapRef.current || !mapContainerRef.current) return;
    try {
      const r0 = document.getElementById('noSatP0');
      const r1 = document.getElementById('noSatP1');
      const noMap = document.getElementById('noMap');
      if (!r0 || !r1 || !noMap) return;

      const b0 = r0.getBoundingClientRect();
      const b1 = r1.getBoundingClientRect();
      const S = Math.sqrt((b1.left - b0.left) ** 2 + (b1.top - b0.top) ** 2) / 100;
      if (!(S > 0)) return;

      const box = noMap.getBoundingClientRect();
      const cxx = box.left + box.width / 2;
      const cyy = box.top + box.height / 2;
      const pCx = (cxx - b0.left - b0.width / 2) / S;
      const pCy = (cyy - b0.top - b0.height / 2) / S;
      const dpp = net.sat.lonSpan / 1200;
      const dlpp = (net.sat.lonSpan * (740 / 1200) * Math.cos((net.sat.lat0 * Math.PI) / 180)) / 740;
      const lng = net.sat.lng0 + (pCx - 600) * dpp;
      const lat = net.sat.lat0 - (pCy - 370) * dlpp;
      const lonShown = (box.width / S) * dpp;
      let Z = Math.log2((360 * box.width) / (256 * lonShown));
      Z = Math.max(4, Math.min(19, Z));

      satMapRef.current.setView([lat, lng], Z, { animate: false });
    } catch (e) {
      // ignore
    }
  }, [net.sat]);

  useEffect(() => {
    satSync();
  }, [view, satSync]);

  // ESC closes the details drawer
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setDetail(null);
        setFilter('all');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleFocus = useCallback((x, y, k) => {
    const clampedK = Math.max(1, Math.min(12, k));
    const tx = 1200 / 2 - clampedK * x;
    const ty = 740 / 2 - clampedK * y;
    setView({ k: clampedK, tx, ty });
  }, []);

  const handleResetView = useCallback(() => {
    setView(fitView(net));
    setDetail(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pan & Zoom handlers
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newK = Math.max(1, Math.min(12, view.k * zoomFactor));
    if (newK === view.k) return;

    // Zoom centered around mouse pointer
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const svgX = (mouseX - view.tx) / view.k;
    const svgY = (mouseY - view.ty) / view.k;

    const tx = mouseX - svgX * newK;
    const ty = mouseY - svgY * newK;
    setView({ k: newK, tx, ty });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // only main button
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      tx: view.tx,
      ty: view.ty,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setView(v => ({
      ...v,
      tx: dragStartRef.current.tx + dx,
      ty: dragStartRef.current.ty + dy,
    }));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Selection handler for blocks, stations, corridors, trains
  const handleSelect = (kind, id) => {
    if (kind === 'block' || kind === 'conflict') {
      const b = blocks.find(x => x.id === id);
      if (!b) return;
      const col = COLOR_BY_CORRIDOR[b.corridor] || '#94a3b8';
      const sui = analyzer ? analyzer.sui(b) : null;
      const rec = analyzer ? analyzer.rec(b) : null;
      setDetail({
        type: 'block',
        data: b,
        color: col,
        sui: sui ? { score: sui.score, factors: sui.analysis ? sui.analysis : sui.factors } : null,
        rec: rec ? { title: rec.title, reason: rec.reason } : null,
      });

      // auto zoom to block
      const pl = PLACE[b.id] || { c: b.corridor || 'C1', leg: 0, lane: 0 };
      const ch = CHAIN[pl.c];
      if (ch && ch[pl.leg] && projectedStations[ch[pl.leg]]) {
        const p1 = projectedStations[ch[pl.leg]];
        const p2 = projectedStations[ch[pl.leg + 1]];
        if (p1 && p2) {
          handleFocus((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2, 1.8);
        }
      }
    } else if (kind === 'station') {
      const p = projectedStations[id];
      if (!p) return;
      const corrs = Object.keys(CHAIN).filter(c => CHAIN[c].includes(id));
      const dep = !!DEPOT[id];
      const servingTrains = trains.filter(t => corrs.includes(t.corridor));
      const col = COLOR_BY_CORRIDOR[corrs[0]] || '#64748b';
      setDetail({
        type: 'station',
        data: { id, corridors: corrs, depot: dep },
        trains: servingTrains,
        color: col,
      });
      handleFocus(p[0], p[1], 1.6);
    } else if (kind === 'corridor') {
      const ch = CHAIN[id];
      if (!ch) return;
      const corrBlocks = blocks.filter(b => b.corridor === id);
      const col = COLOR_BY_CORRIDOR[id] || '#38bdf8';
      setDetail({
        type: 'corridor',
        data: { id, chain: ch },
        blocks: corrBlocks,
        color: col,
        onSelectBlock: (bid) => handleSelect('block', bid),
      });
      const xs = ch.map(s => projectedStations[s]?.[0] || 600);
      const ys = ch.map(s => projectedStations[s]?.[1] || 370);
      handleFocus((Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2, 1.3);
    } else if (kind === 'train') {
      const t = trains.find(x => x.id === id);
      if (!t) return;
      const col = COLOR_BY_CORRIDOR[t.corridor] || '#94a3b8';
      setDetail({ type: 'train', data: t, color: col });
      const ch = CHAIN[t.corridor];
      if (ch) {
        const p1 = projectedStations[ch[0]];
        const p2 = projectedStations[ch[ch.length - 1]];
        if (p1 && p2) handleFocus((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2, 1.5);
      }
    }
  };

  // Hover tooltip handler
  const handleHover = (info) => {
    if (!info) {
      setTip(null);
      setHoverKey(null);
      return;
    }
    const { value, rect } = info;
    setHoverKey(value);
    const idx = value.indexOf(':');
    const kind = value.slice(0, idx);
    const id = value.slice(idx + 1);

    let t = '';
    let s = '';

    if (kind === 'block') {
      const b = blocks.find(x => x.id === id);
      if (b) {
        t = `Block ${id}`;
        s = `${b.corridor || ''} · ${b.startTime || ''}–${b.endTime || ''} · ${b.utilization || ''}`;
      }
    } else if (kind === 'conflict') {
      t = `Conflict on ${id}`;
      s = 'Critical · Train schedule or overlap conflict';
    } else if (kind === 'station') {
      const corrs = Object.keys(CHAIN).filter(c => CHAIN[c].includes(id));
      t = `Station ${id}`;
      s = `${corrs.join(' · ')}${DEPOT[id] ? ' · Depot' : ''}`;
    } else if (kind === 'corridor') {
      t = `Corridor ${id}`;
      s = (CHAIN[id] || []).join(' → ');
    } else if (kind === 'train') {
      const tr = trains.find(x => x.id === id);
      if (tr) {
        t = tr.id;
        s = `${tr.type || ''} · ${tr.corridor} · ${tr.start || ''}–${tr.end || ''}`;
      }
    }

    if (t) {
      setTip({ title: t, sub: s, x: rect.left + rect.width / 2, y: rect.top - 10 });
    } else {
      setTip(null);
    }
  };

  // Compute live stats and AI insights
  const { counts, confs, totalConf, bestBlock } = useMemo(() => {
    const c = { C1: 0, C2: 0, C3: 0, C4: 0 };
    const cf = { C1: 0, C2: 0, C3: 0, C4: 0 };
    let total = 0;
    let best = null;

    blocks.forEach(b => {
      if (!b || !b.corridor) return;
      c[b.corridor] = (c[b.corridor] || 0) + 1;
      const res = analyzer ? analyzer.analyze(b) : { hasConflict: false };
      if (res.hasConflict) {
        cf[b.corridor] = (cf[b.corridor] || 0) + 1;
        total++;
      } else {
        const u = parseInt(String(b.utilization || '0').replace('%', ''), 10) || 0;
        if (!best || u > best.u) best = { u, id: b.id, corr: b.corridor };
      }
    });

    return { counts: c, confs: cf, totalConf: total, bestBlock: best };
  }, [blocks, analyzer]);

  // AI insight text
  const insightText = useMemo(() => {
    if (totalConf === 0) {
      return 'AI Insight: Network is clear — no active conflicts detected across all corridors.';
    }
    let topCorr = 'C1';
    let maxC = 0;
    Object.keys(confs).forEach(cv => {
      if (confs[cv] > maxC) {
        maxC = confs[cv];
        topCorr = cv;
      }
    });
    let txt = `AI Insight: <b>Corridor ${topCorr}</b> holds <b>${maxC} active conflict${maxC > 1 ? 's' : ''}</b> — review before approving.`;
    if (bestBlock) {
      txt += ` <b>${bestBlock.id}</b> offers the highest conflict-free utilization at <b>${bestBlock.u}%</b>.`;
    } else {
      txt += ' Every block currently has a conflict — resolve before planning further.';
    }
    return txt;
  }, [totalConf, confs, bestBlock]);

  const mapSelection = useMemo(() => {
    if (!detail || !detail.data) return null;
    return { kind: detail.type, id: detail.data.id };
  }, [detail]);

  return (
    <div id="netopsWrapper">
      <div
        id="netopsApp"
        data-filter={filter}
        className={collapsed ? 'no-col' : ''}
      >
        {/* Merged Header + Toolbar Strip */}
        <div className="no-hd">
          <div className="no-ht">
            <span className="no-live">
              <span className="no-live-dot" />
              LIVE
            </span>
            NETWORK OPERATIONS
          </div>
          <div className="no-grp">
            <span className="no-grp-label">VIEW</span>
            <div className="no-chips">
              {['all', 'blocks', 'trains', 'stations', 'conflicts', 'maintenance'].map(f => (
                <button
                  key={f}
                  className={`no-chip ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="no-grp">
            <span className="no-grp-label">CORRIDORS</span>
            <div className="no-legend">
              {['C1', 'C2', 'C3', 'C4'].map(cv => (
                <div
                  key={cv}
                  className={`no-leg${detail && detail.type === 'corridor' && detail.data.id === cv ? ' active' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSelect('corridor', cv)}
                >
                  <i style={{ background: COLOR_BY_CORRIDOR[cv] }} />
                  {cv}
                </div>
              ))}
            </div>
          </div>
          <div className="no-htools">
            <button className="no-btn" onClick={handleResetView}>
              <Scan width={13} height={13} />
              Reset View
            </button>
            <button className="no-btn" onClick={() => setCollapsed(c => !c)}>
              <PanelLeft width={13} height={13} />
              <span>{collapsed ? 'Show Blocks' : 'Hide Blocks'}</span>
            </button>
          </div>
        </div>

        {/* Compact stats strip */}
        <div className="no-stats">
          <div className="no-stat">
            <b>{trains.length}</b>
            <span>Trains</span>
          </div>
          <div className="no-stat">
            <b>{blocks.length}</b>
            <span>Blocks</span>
          </div>
          <div className="no-stat">
            <b>{Object.keys(projectedStations).length}</b>
            <span>Stations</span>
          </div>
          <div className="no-stat">
            <b>{totalConf}</b>
            <span>Conflicts</span>
          </div>
        </div>

        {/* Main Map + Sidebar Body */}
        <div className="no-bd">
          <div
            className="no-mw"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
          >
            <div className="no-map" id="noMap">
              {/* Light vector tile basemap */}
              <div id="noSat" ref={mapContainerRef} aria-label="Vector GIS basemap" />

              {/* SVG Railway Topology Overlay */}
              <NetworkMap
                networkDemo={net}
                blocks={blocks}
                trains={trains}
                filter={filter}
                view={view}
                onSelect={handleSelect}
                onHover={handleHover}
                analyzeConflicts={analyzeBlockConflict}
                reducedMotion={reducedMotion}
                selection={mapSelection}
                hover={hoverKey}
              />

              {/* Corner disclaimer & Hint */}
              <div className="no-corner">VECTOR GIS MAP · SYNTHETIC DEMO DATA · NOT OPERATIONAL AUTHORITY</div>
              <div className="no-hint">
                <MousePointer2 width={12} height={12} />
                Click elements for details · Scroll to zoom · Drag to pan
              </div>

              {/* Custom Tooltip */}
              {tip && (
                <div
                  className="no-tip"
                  style={{
                    display: 'block',
                    left: `${tip.x}px`,
                    top: `${tip.y}px`,
                    transform: 'translate(-50%, -100%)',
                  }}
                >
                  <div>{tip.title}</div>
                  {tip.sub && <span className="no-tip-sub">{tip.sub}</span>}
                </div>
              )}

              {/* Scale bar */}
              <div className="no-scalebar">
                <i />
                <span>≈ 2.5 KM · DEMO SCALE</span>
              </div>
            </div>
          </div>

          {/* Collapsible Blocks Watchlist Sidebar */}
          <NetworkSidebar
            blocks={blocks}
            analyzeConflicts={analyzeBlockConflict}
            onToggle={() => setCollapsed(c => !c)}
            onSelectBlock={bid => handleSelect('block', bid)}
            selectedId={detail && detail.type === 'block' ? detail.data.id : null}
          />

          {/* Slide-out Details Drawer */}
          <NetworkDetailsDrawer
            detail={detail}
            onClose={() => setDetail(null)}
            analyzeConflicts={analyzeBlockConflict}
          />
        </div>

        {/* AI Insight Banner */}
        <div className="no-ins no-glass">
          <div className="no-ins-ic">
            <Sparkles width={15} height={15} />
          </div>
          <div
            className="no-ins-t"
            dangerouslySetInnerHTML={{ __html: insightText }}
          />
          <span className="no-ins-chip">SYNTHETIC · DEMO</span>
        </div>

        {/* Corridor Status Bar (4 Cards) */}
        <div className="no-sb no-glass">
          {['C1', 'C2', 'C3', 'C4'].map(cv => {
            const nc = confs[cv] || 0;
            const lv = nc > 1 ? 'crit' : nc === 1 ? 'warn' : 'ok';
            const lbl = nc > 1 ? 'CRITICAL' : nc === 1 ? 'WARNING' : 'CLEAR';
            const col = COLOR_BY_CORRIDOR[cv];
            return (
              <div
                key={cv}
                className="no-corr"
                onClick={() => handleSelect('corridor', cv)}
              >
                <span className="no-cbar" style={{ background: col }} />
                <div style={{ minWidth: 0 }}>
                  <div className="no-cname">{cv}</div>
                  <div className="no-cmeta">
                    {counts[cv] || 0} blocks · {nc} conflicts
                  </div>
                </div>
                <span className={`no-cleve ${lv}`}>{lbl}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
