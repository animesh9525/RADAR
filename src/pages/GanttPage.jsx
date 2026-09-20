import React, { useMemo, useState } from 'react';
import { ChartNoAxesGantt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Panel } from '../components/ui';
import { timeToMinutes } from '../services/time';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const END = 1440;

export function GanttPage() {
  const { blocks, trains } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const rows = useMemo(() => DAYS.map(d => ({
    day: d,
    blocks: blocks.filter(b => b.date === d),
    trains: trains.filter(t => t.date === d),
  })), [blocks, trains]);

  const showBlocks = filter === 'all' || filter === 'maintenance';
  const showTrains = filter === 'all' || filter === 'trains';

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div>
        <div className="page-title">Gantt View</div>
        <div className="page-description">24-hour timeline of maintenance blocks per day, with train movements overlaid for conflict context.</div>
      </div>
      <Panel title="Weekly Timeline" icon={<ChartNoAxesGantt width={18} height={18} color="var(--blue)" />} actions={
        <div style={{ display: 'flex', gap: 6 }}>
          {[['all', 'All'], ['maintenance', 'Maintenance'], ['trains', 'Trains']].map(([v, l]) => (
            <button key={v} className={`btn btn-sm ${filter === v ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
      }>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 900 }}>
            <div style={{ display: 'flex', marginLeft: 70, borderBottom: '1px solid var(--border)' }}>
              {[0, 3, 6, 9, 12, 15, 18, 21, 24].map(h => (
                <div key={h} style={{ flex: 1, fontSize: 11, color: 'var(--muted)', padding: '4px 0' }}>{String(h).padStart(2, '0')}:00</div>
              ))}
            </div>
            {rows.map(({ day, blocks: dayBlocks, trains: dayTrains }) => (
              <div key={day} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)', minHeight: 54 }}>
                <div style={{ width: 70, flexShrink: 0, fontWeight: 700, fontSize: 12, color: 'var(--muted)' }}>{day.slice(0, 3)}</div>
                <div style={{ flex: 1, position: 'relative', height: 46 }}>
                  {showTrains && dayTrains.map((t, i) => {
                    const s = timeToMinutes(t.start), e = timeToMinutes(t.end);
                    return (
                      <div key={i} title={`${t.id} ${t.start}-${t.end}`} style={{ position: 'absolute', left: `${(s / END) * 100}%`, width: `${Math.max(0.5, ((e - s) / END) * 100)}%`, top: 2, height: 4, background: 'var(--navy3)', borderRadius: 3, opacity: .5 }} />
                    );
                  })}
                  {showBlocks && dayBlocks.map((b, i) => {
                    const s = timeToMinutes(b.startTime), e = timeToMinutes(b.endTime);
                    const top = 12 + (i % 3) * 11;
                    const color = b.status === 'Conflict' ? 'var(--red)' : b.status === 'Warning' ? 'var(--orange)' : 'var(--green)';
                    return (
                      <div key={b.id} title={`${b.id} ${b.startTime}-${b.endTime} — click to view`} onClick={() => navigate('/block-planner', { state: { openBlock: b.id } })}
                        style={{ position: 'absolute', left: `${(s / END) * 100}%`, width: `${Math.max(1, ((e - s) / END) * 100)}%`, top, height: 10, background: color, borderRadius: 4, opacity: .9, fontSize: 9, color: '#fff', overflow: 'hidden', paddingLeft: 3, whiteSpace: 'nowrap', cursor: 'pointer' }}>
                        {b.id}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="note" style={{ marginTop: 10 }}>Dark strip = train schedule window · Colored bars = maintenance blocks (red = conflict, orange = warning, green = clear).</div>
      </Panel>
    </div>
  );
}