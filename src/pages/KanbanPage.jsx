import React, { useMemo, useState } from 'react';
import { Kanban, GripVertical, Link2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { makeAnalyzer } from '../utils/analyzer';
import { Panel, Badge, EmptyState } from '../components/ui';

const COLUMNS = [
  { key: 'CRITICAL', label: 'Critical', tone: 'critical' },
  { key: 'HIGH', label: 'High', tone: 'high' },
  { key: 'MEDIUM', label: 'Medium', tone: 'medium' },
  { key: 'LOW', label: 'Low', tone: 'low' },
];

export function KanbanPage() {
  const { tasks, blocks, trains, taskData, setTaskPriority, showToast } = useApp();
  const [dragId, setDragId] = useState(null);
  const [over, setOver] = useState(null);
  const analyzer = useMemo(() => makeAnalyzer(blocks, trains, taskData), [blocks, trains, taskData]);

  const columns = useMemo(() => {
    const map = { CRITICAL: [], HIGH: [], MEDIUM: [], LOW: [] };
    tasks.forEach(t => {
      const key = map[t.priority] ? t.priority : 'MEDIUM';
      const blk = t.block ? blocks.find(b => b.id === t.block) : null;
      const a = blk ? analyzer.analyze(blk) : null;
      const conflict = !!blk && !!(a && (a.hasCritical || a.hasConflict));
      map[key].push({ t, blk, conflict });
    });
    COLUMNS.forEach(c => map[c.key].sort((A, B) => {
      const sa = A.scored || 0;
      const sb = B.scored || 0;
      return sb - sa;
    }));
    return map;
  }, [tasks, blocks, analyzer]);

  const onDrop = (col) => (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/blockId') || dragId;
    setOver(null);
    setDragId(null);
    if (!id) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    if (task.priority === col) return;
    setTaskPriority(id, col);
    showToast(`${id} priority set to ${col}`, 'success');
  };

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div>
        <div className="page-title">Task Kanban</div>
        <div className="page-description">Maintenance backlog prioritised by AI priority category — drag a task card between columns to reprioritise it.</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 14 }}>
        {COLUMNS.map(col => (
          <div
            key={col.key}
            onDragOver={e => { e.preventDefault(); setOver(col.key); }}
            onDragLeave={() => setOver(o => (o === col.key ? null : o))}
            onDrop={onDrop(col.key)}
            style={{
              borderRadius: 12, padding: 2,
              background: over === col.key ? 'rgba(59,130,246,.08)' : 'transparent',
              transition: 'background .15s ease',
            }}
          >
            <Panel title={`${col.label} (${columns[col.key].length})`} icon={<Kanban width={16} height={16} color="var(--blue)" />}>
              {columns[col.key].length === 0 ? (
                <EmptyState icon="—" title="Empty" desc="Drag a task here to raise priority." />
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {columns[col.key].map(({ t, blk, conflict }) => (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={e => {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', t.id);
                        e.dataTransfer.setData('text/blockId', t.id);
                        setDragId(t.id);
                      }}
                      onDragEnd={() => setDragId(null)}
                      style={{
                        border: '1px solid var(--border)',
                        borderLeft: `3px solid ${conflict ? 'var(--red)' : 'var(--blue)'}`,
                        borderRadius: 8, padding: 10, background: 'var(--card)', cursor: 'grab',
                        opacity: dragId === t.id ? .5 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                        <b style={{ fontSize: 13 }}>{t.id}</b>
                        <GripVertical width={13} height={13} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                      </div>
                      <div style={{ fontSize: 13, margin: '4px 0' }}>{(t.title || '').split(' · ')[1] || t.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t.department} · {t.corridor} · {t.duration} · due {t.due}</div>
                      {t.reason && <div className="note" style={{ marginTop: 4 }}>{t.reason}</div>}
                      {blk && (
                        <div style={{ marginTop: 6, fontSize: 11, display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Link2 width={11} height={11} style={{ color: 'var(--muted)' }} />
                          <Link to="/block-planner" state={{ openBlock: blk.id }} className="badge plain">{blk.id}</Link>
                          {conflict && <Badge tone="critical">Conflict</Badge>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        ))}
      </div>
      <div className="note">Columns follow AI priority categories (score ≥ 85 Critical, 70–84 High, 40–69 Medium, &lt; 40 Low). Dropping a card onto another column updates its priority for this session.</div>
    </div>
  );
}