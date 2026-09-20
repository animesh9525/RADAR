import React, { useMemo, useState } from 'react';
import { Brain, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calculatePriorityScore, getPriorityCategory, calculateSuitabilityScore } from '../services/ai';
import { Badge, Panel, EmptyState, MetricCard, Modal, ProgressBar } from '../components/ui';

const FACTOR_WEIGHTS = [
  { key: 'safety', label: 'Safety Criticality', weight: 30 },
  { key: 'asset', label: 'Asset Criticality', weight: 25 },
  { key: 'urgency', label: 'Urgency', weight: 20 },
  { key: 'delayImpact', label: 'Overdue / Delay Impact', weight: 15 },
  { key: 'operational', label: 'Operational Impact', weight: 10 },
];

export function TasksPage() {
  const { tasks, blocks, trains, openTaskModal } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('All');
  const [q, setQ] = useState('');
  const [detail, setDetail] = useState(null);

  const tbl = useMemo(() => {
    return tasks.map(t => {
      const scored = calculatePriorityScore(t);
      const prio = getPriorityCategory(scored.score);
      const blk = t.block ? blocks.find(b => b.id === t.block) || null : null;
      const sui = blk ? calculateSuitabilityScore(blk, { blocks, trainSchedule: trains, taskData: {} }) : null;
      return { t, scored, prio, blk, sui };
    });
  }, [tasks, blocks, trains]);

  const filtered = useMemo(() => {
    let list = tbl;
    if (tab === 'Critical') list = list.filter(x => x.scored.score >= 85);
    else if (tab === 'High') list = list.filter(x => x.scored.score >= 70 && x.scored.score < 85);
    else if (tab === 'Medium') list = list.filter(x => x.scored.score >= 40 && x.scored.score < 70);
    else if (tab === 'Low') list = list.filter(x => x.scored.score < 40);
    if (q) list = list.filter(x => (x.t.title + ' ' + x.t.id + ' ' + x.t.corridor + ' ' + x.t.department).toLowerCase().includes(q.toLowerCase()));
    return list;
  }, [tbl, tab, q]);

  const counts = useMemo(() => ({
    all: tbl.length,
    critical: tbl.filter(x => x.scored.score >= 85).length,
    high: tbl.filter(x => x.scored.score >= 70 && x.scored.score < 85).length,
    medium: tbl.filter(x => x.scored.score >= 40 && x.scored.score < 70).length,
    low: tbl.filter(x => x.scored.score < 40).length,
  }), [tbl]);

  const detailRow = detail ? tbl.find(x => x.t.id === detail) : null;

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div>
        <div className="page-title">Task Register</div>
        <div className="page-description">AI priority scoring across the maintenance task backlog (deterministic prototype — scores stable). Click a row to inspect the score breakdown.</div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
        <MetricCard label="Total Tasks" value={counts.all} color="var(--blue)" />
        <MetricCard label="Critical" value={counts.critical} color="var(--red)" />
        <MetricCard label="High" value={counts.high} color="var(--orange)" />
        <MetricCard label="Medium" value={counts.medium} color="var(--blue2)" />
        <MetricCard label="Low" value={counts.low} color="var(--green)" />
      </div>

      <Panel
        title="Tasks with AI Priority"
        icon={<Brain width={18} height={18} color="var(--purple)" />}
        actions={
          <>
            <div style={{ position: 'relative' }}>
              <Search width={14} height={14} style={{ position: 'absolute', left: 8, top: 9, color: 'var(--muted)' }} />
              <input className="field-input" style={{ width: 220, paddingLeft: 28 }} placeholder="Search tasks…" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            {['All', 'Critical', 'High', 'Medium', 'Low'].map(t => (
              <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState icon="📋" title="No tasks match" desc="Try a different filter or search term." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-app">
              <thead>
                <tr>
                  <th>Task</th><th>Description</th><th>Department</th><th>Corridor</th><th>AI Priority</th><th>Risk</th><th>Due</th><th>Block</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ t, scored, prio, blk }) => (
                  <tr key={t.id} data-task-id={t.id} style={{ cursor: 'pointer' }} onClick={() => openTaskModal(t.id)}>
                    <td><b>{t.id}</b></td>
                    <td style={{ maxWidth: 260 }}>
                      <div style={{ fontWeight: 600 }}>{(t.title || '').split(' · ')[1] || t.title}</div>
                      <div className="note">{t.description || ''}</div>
                    </td>
                    <td>{t.department}</td>
                    <td><span className="badge info">{t.corridor}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800 }}>{scored.score}</span>
                        <Badge tone={prio.cls}>{prio.label}</Badge>
                      </div>
                    </td>
                    <td>{t.risk}%</td>
                    <td>{t.due}</td>
                    <td>{blk ? <span className="badge plain">{blk.id}</span> : <span className="note">unassigned</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {detailRow && (
        <Modal open title={`${detailRow.t.id} — AI Priority Breakdown`} onClose={() => setDetail(null)} width={560}>
          <TaskDetail row={detailRow} onViewBlock={(id) => { setDetail(null); navigate('/block-planner', { state: { openBlock: id } }); }} />
        </Modal>
      )}
    </div>
  );
}

function TaskDetail({ row, onViewBlock }) {
  const { t, scored, blk, sui } = row;
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{t.id} — {(t.title || '').split(' · ')[1] || t.title}</div>
          <div className="note">{t.department} · {t.corridor} · {t.duration} · due {t.due}</div>
        </div>
        <Badge tone={getPriorityCategory(scored.score).cls}>{getPriorityCategory(scored.score).label}</Badge>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, letterSpacing: .5, color: 'var(--muted)', marginBottom: 4 }}>
          <span>WEIGHTED PRIORITY SCORE</span>
          <b style={{ fontSize: 16, color: 'var(--text)' }}>{scored.score}/100</b>
        </div>
        <ProgressBar value={scored.score} color={getPriorityCategory(scored.score).cls === 'critical' ? 'var(--red)' : getPriorityCategory(scored.score).cls === 'high' ? 'var(--orange)' : 'var(--blue)'} />
      </div>

      <div className="card-label">FACTOR BREAKDOWN</div>
      <div style={{ display: 'grid', gap: 8 }}>
        {FACTOR_WEIGHTS.map(f => (
          <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <span style={{ width: 150, color: 'var(--muted)', fontWeight: 600 }}>{f.label}</span>
            <div style={{ flex: 1 }}><ProgressBar value={scored.factors[f.key]} color={scored.factors[f.key] >= 80 ? 'var(--red)' : scored.factors[f.key] >= 60 ? 'var(--orange)' : 'var(--blue)'} /></div>
            <b style={{ width: 40, textAlign: 'right' }}>{scored.factors[f.key]}%</b>
            <span style={{ width: 46, textAlign: 'right', color: 'var(--muted)' }}>×{f.weight / 100}</span>
          </div>
        ))}
      </div>

      {t.reason && (
        <div className="alert alert-orange"><span className="alert-icon">!</span><div><b>Why is this scored this way?</b><br />{t.reason}</div></div>
      )}

      {blk && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>Assigned block: <span className="badge info">{blk.id}</span> · {blk.corridor} {blk.date} {blk.startTime}–{blk.endTime}</span>
            <Badge tone={sui ? (sui.score >= 90 ? 'low' : sui.score >= 70 ? 'medium' : 'critical') : 'plain'}>Suitability {sui ? sui.score : '—'}</Badge>
          </div>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }} onClick={() => onViewBlock(blk.id)}>Open Block in Planner</button>
        </div>
      )}
    </div>
  );
}