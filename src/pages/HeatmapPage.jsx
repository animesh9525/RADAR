import React, { useState } from 'react';
import { Flame } from 'lucide-react';
import { Panel, MetricCard, EmptyState } from '../components/ui';
import { heatmapProfiles, heatmapColors, heatmapLevelNames } from '../services/heatmap';

const CORRIDORS = ['C1', 'C2', 'C3', 'C4'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function HeatmapPage() {
  const [corrFilter, setCorrFilter] = useState('All');
  const [tip, setTip] = useState(null);

  const corridors = corrFilter === 'All' ? CORRIDORS : CORRIDORS.filter(c => c === corrFilter);

  const peak = () => {
    let best = { c: 'C1', h: 0, level: 0 };
    CORRIDORS.forEach(c => HOURS.forEach(h => {
      const lvl = heatmapProfiles[c][h];
      if (lvl > best.level) best = { c, h, level: lvl };
    }));
    return best;
  };
  const p = peak();

  const corridorPeak = (c) => {
    let best = { h: 0, level: 0 };
    HOURS.forEach(h => {
      const lvl = heatmapProfiles[c][h];
      if (lvl > best.level) best = { h, level: lvl };
    });
    return best;
  };

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div>
        <div className="page-title">Traffic Heatmap</div>
        <div className="page-description">Deterministic 24-hour traffic intensity by corridor (1 = Low, 4 = Very High). Hover any cell for details; filter to a single corridor.</div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
        <MetricCard label="Peak Traffic Slot" value={`${String(p.h).padStart(2, '0')}:00`} delta={`Corridor ${p.c}`} color="var(--red)" />
        <MetricCard label="Peak Intensity" value={heatmapLevelNames[p.level - 1]} color="var(--orange)" />
        <MetricCard label="Corridors" value={CORRIDORS.length} color="var(--blue)" />
      </div>

      <Panel
        title="Corridor × Hour Traffic Intensity"
        icon={<Flame width={18} height={18} color="var(--orange)" />}
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', ...CORRIDORS].map(c => (
              <button key={c} className={`btn btn-sm ${corrFilter === c ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCorrFilter(c)}>{c}</button>
            ))}
          </div>
        }
      >
        {!heatmapProfiles ? <EmptyState title="No heatmap data" /> : (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: 8, minWidth: 820 }}>
              <div />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24,1fr)', gap: 3 }}>
                {HOURS.map(h => <div key={h} style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'center' }}>{String(h).padStart(2, '0')}</div>)}
              </div>
              {corridors.map(c => {
                const cp = corridorPeak(c);
                return (
                  <React.Fragment key={c}>
                    <div style={{ fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
                      <span>{c}</span>
                      <span className="small" style={{ color: 'var(--muted)', fontWeight: 600 }}>peak {String(cp.h).padStart(2, '0')}:00</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24,1fr)', gap: 3 }}>
                      {HOURS.map(h => {
                        const lvl = heatmapProfiles[c][h];
                        const text = `${c} ${String(h).padStart(2, '0')}:00 — ${heatmapLevelNames[lvl - 1]}`;
                        return (
                          <div
                            key={h}
                            onMouseEnter={e => setTip({ x: e.clientX, y: e.clientY, text })}
                            onMouseMove={e => setTip({ x: e.clientX, y: e.clientY, text })}
                            onMouseLeave={() => setTip(null)}
                            style={{ height: 26, borderRadius: 4, background: heatmapColors[lvl - 1], border: '1px solid rgba(15,23,42,.08)', cursor: 'crosshair' }} />
                        );
                      })}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 14, marginTop: 14, flexWrap: 'wrap' }}>
          {heatmapColors.map((col, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--muted)' }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, background: col, border: '1px solid var(--border)' }} />
              {heatmapLevelNames[i]}
            </div>
          ))}
        </div>
        {tip && (
          <div style={{
            position: 'fixed', left: Math.min(tip.x + 14, window.innerWidth - 240), top: tip.y - 12,
            background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px',
            fontSize: 12, fontWeight: 600, pointerEvents: 'none', zIndex: 300, boxShadow: 'var(--shadow-lg)',
          }}>{tip.text}</div>
        )}
      </Panel>
    </div>
  );
}