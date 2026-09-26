import React, { useMemo, useState } from 'react';
import { AlertTriangle, TrainFront, Layers, Wrench, ChevronDown, ChevronUp, ArrowRight, GitBranch, CheckCircle2, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { makeAnalyzer } from '../utils/analyzer';
import { Panel, Badge, EmptyState, MetricCard, StatusBadge } from '../components/ui';

export function ConflictsPage() {
  const { blocks, trains, taskData, addAudit, showToast } = useApp();
  const analyzer = useMemo(() => makeAnalyzer(blocks, trains, taskData), [blocks, trains, taskData]);
  const [filter, setFilter] = useState('All');
  const [severe, setSevere] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [resolved, setResolved] = useState({});

  const rows = useMemo(() => {
    return blocks.map(b => ({ block: b, analysis: analyzer.analyze(b) }));
  }, [blocks, analyzer]);

  const filtered = useMemo(() => {
    let list = rows;
    if (filter === 'train') list = list.filter(r => r.analysis.trainConflicts.length > 0);
    else if (filter === 'block') list = list.filter(r => r.analysis.blockConflicts.length > 0);
    else if (filter === 'resource') list = list.filter(r => r.analysis.resourceConflicts.length > 0);
    else if (filter === 'clear') list = list.filter(r => r.analysis.all.length === 0);
    if (severe) list = list.filter(r => r.analysis.hasCritical);
    return list;
  }, [rows, filter, severe]);

  const counts = useMemo(() => ({
    critical: rows.filter(r => r.analysis.level === 'critical').length,
    high: rows.filter(r => r.analysis.level === 'high').length,
    medium: rows.filter(r => r.analysis.level === 'medium').length,
    clear: rows.filter(r => r.analysis.level === 'clear').length,
    aiResolved: Object.keys(resolved).length,
  }), [rows, resolved]);

  const applyResolution = (block) => {
    const a = analyzer.analyze(block);
    const text = a.all.length ? a.recommendation || 'Reschedule the block to a scored candidate window and re-validate resources.' : 'No conflicts active — nothing to apply.';
    setResolved(r => ({ ...r, [block.id]: { time: Date.now(), text } }));
    addAudit('edit', `AI resolution applied to ${block.id}: ${text}`, 'AI-assisted resolution', block.id, false);
    showToast(`AI resolution locked for ${block.id}`, 'success');
  };

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div>
        <div className="page-title">Conflict Center</div>
        <div className="page-description">Train schedule, block overlap and resource conflicts detected by the AI engine across all corridors.</div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
        <MetricCard label="Critical" value={counts.critical} color="var(--red)" delta={<span>train / overlap</span>} />
        <MetricCard label="High" value={counts.high} color="#f97316" delta={<span>resource severity</span>} />
        <MetricCard label="Medium" value={counts.medium} color="var(--orange)" delta={<span>advisory</span>} />
        <MetricCard label="Conflict-Free" value={counts.clear} color="var(--green)" delta={<span>blocks</span>} />
        <MetricCard label="AI Assisted Resolutions" value={counts.aiResolved} color="var(--purple)" delta={<span>locked this session</span>} />
      </div>

      <Panel
        title={`Blocks (${filtered.length})`}
        icon={<AlertTriangle width={18} height={18} color="var(--orange)" />}
        actions={
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[['All', 'All'], ['train', 'Train'], ['block', 'Overlap'], ['resource', 'Resource'], ['clear', 'Clear']].map(([v, l]) => (
              <button key={v} className={`btn btn-sm ${filter === v ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(v)}>{l}</button>
            ))}
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
              <input type="checkbox" checked={severe} onChange={e => setSevere(e.target.checked)} /> Critical only
            </label>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState icon={<AlertTriangle width={40} height={40} />} title="No conflicts in this view" desc="The AI found no matching issues for the selected filter." />
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {filtered.map(({ block, analysis }) => {
              const open = expanded === block.id;
              const sui = analyzer.sui(block);
              return (
                <div key={block.id} style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--card)' }}>
                  <button style={{ width: '100%', padding: '12px 14px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left' }} onClick={() => setExpanded(open ? null : block.id)}>
                    <div>
                      <StatusBadge status={block.status} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{block.id} · {block.corridor}/{block.track} · {block.date} {block.startTime}–{block.endTime}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{block.tasks.map(t => t.id).join(', ')} · AI suitability {sui.score}</div>
                    </div>
                    <Badge tone={analysis.level === 'clear' ? 'low' : analysis.level === 'critical' ? 'critical' : analysis.level === 'high' ? 'high' : 'medium'}>
                      {analysis.severity}
                    </Badge>
                    {open ? <ChevronUp width={16} height={16} /> : <ChevronDown width={16} height={16} />}
                  </button>
                  {open && (
                    <div style={{ padding: '4px 14px 14px', display: 'grid', gap: 6 }}>
                      {analysis.trainConflicts.map((c, i) => (
                        <ConflictLine key={'t' + i} icon={<TrainFront width={14} height={14} />} tone="alert-red" kind="Train" msg={c.message} detail={`${c.time} · ${c.recommendation}`} />
                      ))}
                      {analysis.blockConflicts.map((c, i) => (
                        <ConflictLine key={'b' + i} icon={<Layers width={14} height={14} />} tone="alert-red" kind="Block Overlap" msg={c.message} detail={`${c.overlap} · ${c.recommendation}`} />
                      ))}
                      {analysis.resourceConflicts.map((c, i) => (
                        <ConflictLine key={'r' + i} icon={<Wrench width={14} height={14} />} tone="alert-orange" kind="Resource" msg={c.message} detail={c.recommendation} />
                      ))}
                      {analysis.all.length === 0 && (
                        <div className="alert alert-green"><CheckCircle2 width={15} height={15} style={{ color: 'var(--green)' }} /><div>No conflicts detected for this block in the current state.</div></div>
                      )}
                      {resolved[block.id] && (
                        <div className="alert alert-blue"><span className="alert-icon"><Bot width={14} height={14} /></span><div><b>AI Resolution locked:</b> {resolved[block.id].text}</div></div>
                      )}
                      <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => applyResolution(block)}><CheckCircle2 width={13} height={13} /> Apply AI Resolution</button>
                        <Link to="/block-planner" className="btn btn-secondary btn-sm">Open in Planner</Link>
                        <Link to="/what-if" className="btn btn-primary btn-sm"><GitBranch width={13} height={13} /> Analyze Impact <ArrowRight width={13} height={13} /></Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}

function ConflictLine({ icon, tone, kind, msg, detail }) {
  return (
    <div className={`alert ${tone}`} style={{ padding: 10 }}>
      <span className="alert-icon">{icon}</span>
      <div style={{ flex: 1 }}>
        <b>{kind}</b> — {msg}
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{detail}</div>
      </div>
    </div>
  );
}