import React, { useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Pencil, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { makeAnalyzer } from '../utils/analyzer';
import { Panel, Badge } from '../components/ui';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function WeeklyPage() {
  const { blocks, trains, taskData, updateBlock, showToast } = useApp();
  const navigate = useNavigate();
  const analyzer = useMemo(() => makeAnalyzer(blocks, trains, taskData), [blocks, trains, taskData]);
  const [week, setWeek] = useState(1);
  const [dragId, setDragId] = useState(null);
  const [overDay, setOverDay] = useState(null);

  const grid = useMemo(() => {
    const m = {};
    DAYS.forEach(d => { m[d] = blocks.filter(b => b.date === d).sort((a, b) => timeMin(a.startTime) - timeMin(b.startTime)); });
    return m;
  }, [blocks]);

  const weekTotal = useMemo(() => {
    const conflicts = blocks.filter(b => analyzer.analyze(b).hasConflict).length;
    const util = blocks.length ? Math.round(blocks.reduce((s, b) => s + (parseInt(String(b.utilization || '0').replace('%', ''), 10) || 0), 0) / blocks.length) : 0;
    return { blocks: blocks.length, conflicts, util };
  }, [blocks, analyzer]);

  const changeWeek = dir => {
    const n = Math.max(1, Math.min(4, week + dir));
    setWeek(n);
    showToast(`Week ${n} loaded`, 'info');
  };

  const onDrop = day => e => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/blockId') || dragId;
    setDragId(null);
    setOverDay(null);
    if (!id) return;
    const b = blocks.find(x => x.id === id);
    if (!b) return;
    if (b.date === day) return;
    updateBlock(id, { date: day });
    showToast(`Block ${id} rescheduled to ${day}`, 'success');
  };

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="page-title">Weekly Schedule</div>
          <div className="page-description">Maintenance blocks by day with live AI suitability and conflict indicators. Drag a block to another day to reschedule.</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => changeWeek(-1)}><ChevronLeft width={15} height={15} /> Prev</button>
          <b style={{ minWidth: 96, textAlign: 'center', fontSize: 13 }}>Week {week} · Aug 24–30</b>
          <button className="btn btn-secondary btn-sm" onClick={() => changeWeek(1)}>Next <ChevronRight width={15} height={15} /></button>
        </div>
      </div>

      <Panel title={`Plan Week ${week} · Aug 24–30`} icon={<Sparkles width={16} height={16} color="var(--purple)" />}
        actions={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <Badge tone="critical">{weekTotal.conflicts} conflict(s)</Badge>
            <Badge tone="info">{weekTotal.blocks} blocks</Badge>
            <Badge tone="low">{weekTotal.util}% utilization</Badge>
          </div>
        }>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
          {DAYS.map(d => (
            <div key={d}
              onDragOver={e => { e.preventDefault(); setOverDay(d); }}
              onDragLeave={() => setOverDay(o => (o === d ? null : o))}
              onDrop={onDrop(d)}
              style={{ borderRadius: 12, padding: 2, background: overDay === d ? 'rgba(59,130,246,.08)' : 'transparent', transition: 'background .15s ease' }}
            >
              <Panel title={`${d} (${grid[d].length})`} icon={<Calendar width={15} height={15} color="var(--blue)" />}>
                {grid[d].length === 0 ? (
                  <div className="note">No blocks scheduled. Drop a block here to move it.</div>
                ) : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {grid[d].map(b => {
                      const a = analyzer.analyze(b);
                      const sui = analyzer.sui(b);
                      return (
                        <div
                          key={b.id}
                          draggable
                          onDragStart={e => {
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('text/plain', b.id);
                            e.dataTransfer.setData('text/blockId', b.id);
                            setDragId(b.id);
                          }}
                          onDragEnd={() => setDragId(null)}
                          style={{
                              borderStyle: 'solid',
                              borderTopWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderLeftWidth: 3,
                              borderTopColor: 'var(--border)', borderRightColor: 'var(--border)', borderBottomColor: 'var(--border)',
                              borderLeftColor: a.hasCritical ? 'var(--red)' : a.hasConflict ? 'var(--orange)' : 'var(--green)',
                            borderRadius: 8, padding: 8, background: 'var(--card)', cursor: 'grab',
                            opacity: dragId === b.id ? .5 : 1,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                            <b style={{ fontSize: 12.5 }}>{b.id}</b>
                            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{b.corridor}/{b.track}</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text2)' }}>{b.startTime}–{b.endTime} · {b.tasks.length} task(s)</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, alignItems: 'center' }}>
                            <span style={{ color: 'var(--muted)' }}>Suitability <b>{sui.score}</b> · {b.utilization || '—'} use</span>
                            {a.hasCritical ? <Badge tone="critical">Conflict</Badge> : a.hasConflict ? <Badge tone="medium">Warning</Badge> : <Badge tone="low">Clear</Badge>}
                          </div>
                          <button
                            className="btn btn-ghost btn-sm" style={{ marginTop: 6, width: '100%', justifyContent: 'center' }}
                            onClick={() => navigate('/block-planner', { state: { openBlock: b.id } })}
                          >
                            <Pencil width={12} height={12} /> Edit Block
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Panel>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 14, marginTop: 14, flexWrap: 'wrap', fontSize: 12, color: 'var(--muted)', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 4, borderRadius: 2, background: 'var(--red)' }} /> Conflict</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 4, borderRadius: 2, background: 'var(--orange)' }} /> Warning</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 4, borderRadius: 2, background: 'var(--green)' }} /> Clear</span>
          <span style={{ marginLeft: 'auto' }}>Drag a card to reschedule · Edit opens the Block Planner</span>
        </div>
      </Panel>
    </div>
  );
}

function timeMin(t) { const m = String(t || '').match(/^(\d{1,2}):(\d{2})$/); return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : 0; }