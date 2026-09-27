import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Map as MapIcon, TrainFront, Wrench } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { makeAnalyzer } from '../utils/analyzer';
import { Panel, Badge } from '../components/ui';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function CorridorPage() {
  const { blocks, trains, taskData, corridors } = useApp();
  const location = useLocation();
  const analyzer = useMemo(() => makeAnalyzer(blocks, trains, taskData), [blocks, trains, taskData]);
  const [day, setDay] = useState('Monday');
  const pendingCorridor = location.state && location.state.focusCorridor;
  const lastPending = useRef(null);
  const wrapRef = useRef(null);

  // Global search / deep link to a corridor: reveal it inside the scroll owner.
  useEffect(() => {
    if (!pendingCorridor || pendingCorridor === lastPending.current) return;
    lastPending.current = pendingCorridor;
    requestAnimationFrame(() => {
      const el = wrapRef.current && wrapRef.current.querySelector(`[data-corridor-id="${pendingCorridor}"]`);
      if (!el) return;
      const scroller = el.closest('.app-main') || window;
      if (scroller === window) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      const top = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
      const target = Math.max(0, top - (parseFloat(getComputedStyle(scroller).scrollPaddingTop) || 0));
      scroller.scrollTo({ top: target, behavior: 'smooth' });
    });
  }, [pendingCorridor]);

  return (
    <div style={{ display: 'grid', gap: 18 }} ref={wrapRef}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="page-title">Live Corridor Map</div>
          <div className="page-description">Schematic corridor view with stations, blocks and train movements.</div>
        </div>
        <select className="field-select" style={{ width: 180 }} value={day} onChange={e => setDay(e.target.value)}>
          {DAYS.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {corridors.map(co => {
          const cid = co.id;
          const stations = co.stations || [];
          const dayBlocks = blocks.filter(b => b.corridor === cid && b.date === day);
          const dayTrains = trains.filter(t => t.corridor === cid && t.date === day);
          return (
            <Panel key={cid} data-corridor-id={cid} title={`Corridor ${cid}`} icon={<MapIcon width={16} height={16} color={co.color} />} actions={
              <div style={{ display: 'flex', gap: 6 }}>
                <Badge tone="info"><Wrench width={11} height={11} /> {dayBlocks.length} blocks</Badge>
                <Badge tone="plain"><TrainFront width={11} height={11} /> {dayTrains.length} trains</Badge>
              </div>
            }>
              <div style={{ position: 'relative', padding: '26px 10px 46px' }}>
                <div style={{ height: 4, background: co.color || 'var(--blue)', borderRadius: 3, opacity: .8 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: -11 }}>
                  {stations.map(sid => (
                    <div key={sid} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 80 }}>
                      <div style={{ width: 14, height: 14, borderRadius: 99, background: 'var(--card)', border: `3px solid ${co.color || 'var(--blue)'}` }} />
                      <span style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, fontWeight: 700 }}>{sid}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                {dayBlocks.length === 0 ? (
                  <div className="note">No maintenance blocks on {day}.</div>
                ) : dayBlocks.map(b => {
                  const a = analyzer.analyze(b);
                  return (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', fontSize: 12, padding: '6px 10px', borderStyle: 'solid', borderTopWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderLeftWidth: 3, borderTopColor: 'var(--border)', borderRightColor: 'var(--border)', borderBottomColor: 'var(--border)', borderLeftColor: a.hasCritical ? 'var(--red)' : 'var(--green)', borderRadius: 8 }}>
                      <span><b>{b.id}</b> · {b.from} → {b.to}</span>
                      <span style={{ color: 'var(--muted)' }}>{b.startTime}–{b.endTime} · {b.track}</span>
                      {a.hasCritical ? <Badge tone="critical">Conflict</Badge> : <Badge tone="low">Clear</Badge>}
                    </div>
                  );
                })}
                {dayTrains.slice(0, 6).map(t => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11.5, color: 'var(--muted)' }}>
                    <span><TrainFront width={11} height={11} style={{ verticalAlign: -1 }} /> {t.id} {t.name}</span>
                    <span>{t.start}–{t.end} · {t.type}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, fontSize: 12, padding: 10, background: 'rgba(139,92,246,.07)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 8, color: 'var(--text2)', lineHeight: 1.6 }}>
                <b>AI Coordination Insight:</b> {dayBlocks.reduce((s, b) => s + (b.tasks ? b.tasks.length : 0), 0)} task(s) located within the {cid} planning area on {day}; the AI identifies them as potentially compatible for coordinated execution where travel time and safety permit.
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}