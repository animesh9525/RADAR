import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle2, ArrowRight, Activity, Radar, TrendingUp,
  ClipboardCheck, Clock, Sparkles, Info, Database,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { makeAnalyzer } from '../utils/analyzer';
import { refreshDashboardMetrics, getPriorityCategory, getSuitabilityCategory } from '../services/ai';
import { getApprovalStatus } from '../services/approval';
import { MetricCard, Panel, ProgressBar, Badge, StatusBadge, EmptyState } from '../components/ui';
import { timeToMinutes } from '../services/time';

export function DashboardPage() {
  const { blocks, tasks, trains, approvals, auditRecords, datasource, whatIf } = useApp();
  const navigate = useNavigate();
  const analyzer = useMemo(() => makeAnalyzer(blocks, trains, undefined), [blocks, trains]);
  const session = { taskData: {}, trainSchedule: trains, blocks };

  const metrics = useMemo(() => refreshDashboardMetrics(tasks, { ...session, blocks }), [tasks, blocks, trains]);

  const liveAlerts = useMemo(() => blocks.filter(b => b.status === 'Conflict' || b.status === 'Requires Review'), [blocks]);

  const topRec = useMemo(() => {
    let best = null;
    blocks.forEach(b => {
      const sui = analyzer.sui(b);
      if (!best || sui.score > best.sui.score) best = { block: b, sui, rec: analyzer.rec(b) };
    });
    return best;
  }, [blocks, analyzer]);

  const corridorCards = useMemo(() => {
    const corr = ['C1', 'C2', 'C3', 'C4'];
    return corr.map(c => {
      const cb = blocks.filter(b => b.corridor === c);
      const conflicts = analyzer ? blocks.filter(b => b.corridor === c && (b.status === 'Conflict' || b.status === 'Requires Review')).length : 0;
      const util = cb.length ? Math.round(cb.reduce((s, b) => s + (parseInt(String(b.utilization || '0').replace('%', ''), 10) || 0), 0) / cb.length) : 0;
      const trainsDay = trains.filter(t => t.corridor === c).length;
      const attn = cb.filter(b => b.status === 'Conflict').length;
      return { c, blocks: cb.length, conflicts: attn ? attn : conflicts, util, trains: trainsDay };
    });
  }, [blocks, trains, analyzer]);

  const todayBlocks = useMemo(() => {
    return blocks.slice().sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }, [blocks]);

  const pendingApprovals = useMemo(() => blocks.filter(b => {
    const a = getApprovalStatus(approvals, b.id);
    return a.category === 'pending' || a.category === 'requires';
  }), [blocks, approvals]);

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="page-title">Operations Dashboard</div>
          <div className="page-description" style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
            <span><Database width={12} height={12} style={{ verticalAlign: -2 }} /> {datasource?.label || 'Synthetic Demo Dataset'}</span>
            <span>·</span>
            <span>Plan week Aug 24–30</span>
            <span>·</span>
            <span className="status clear" style={{ fontWeight: 700 }}>● LIVE</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/what-if')}>What-If Simulator</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/block-planner')}>Open Block Planner</button>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
        <MetricCard label="Critical Tasks" value={metrics.critical} delta={<span>AI Priority ≥ 85</span>} color="var(--red)" />
        <MetricCard label="High Priority Tasks" value={metrics.high} delta={<span>AI Priority 70–84</span>} color="var(--orange)" />
        <MetricCard label="High Suitability Blocks" value={metrics.highSuit} delta={<span>suitability ≥ 90</span>} color="var(--green)" />
        <MetricCard label="Blocks Needing Review" value={metrics.needReview} delta={<span>conflicts / review</span>} color="var(--purple)" />
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        {corridorCards.map(cc => (
          <div className="app-card" key={cc.c}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-label">Corridor {cc.c}</div>
              {cc.conflicts > 0 ? <Badge tone="critical">{cc.conflicts} conflict</Badge> : <StatusBadge status="Clear" />}
            </div>
            <div className="card-value" style={{ fontSize: 20 }}>{cc.util}% <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>utilization</span></div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
              <span><Activity width={12} height={12} style={{ verticalAlign: -2 }} /> {cc.blocks} blocks</span>
              <span><Radar width={12} height={12} style={{ verticalAlign: -2 }} /> {cc.trains} trains</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        <div style={{ display: 'grid', gap: 18 }}>
          <Panel title="Live Alerts" icon={<AlertTriangle width={18} height={18} color="var(--orange)" />}>
            {liveAlerts.length === 0 ? (
              <EmptyState icon={<CheckCircle2 width={40} height={40} />} title="All clear" desc="No blocks currently flagged for conflicts. Open Block Planner to review." />
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {liveAlerts.slice(0, 4).map(b => {
                  const conflicts = analyzer.analyze(b);
                  return (
                    <div key={b.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 10, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--red)' }}>
                        <AlertTriangle width={16} height={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{b.id} · {b.corridor}/{b.track} · {b.startTime}–{b.endTime}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{conflicts.all.length} conflicts — {conflicts.trainConflicts.length} train, {conflicts.blockConflicts.length} overlap, {conflicts.resourceConflicts.length} resource</div>
                      </div>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/conflicts')}>Resolve</button>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          <Panel title="Today's Timeline" icon={<Clock width={18} height={18} color="var(--blue)" />} actions={<button className="btn btn-ghost btn-sm" onClick={() => navigate('/schedule')}>Weekly Schedule <ArrowRight width={14} height={14} /></button>}>
            <div style={{ display: 'grid', gap: 10 }}>
              {todayBlocks.map(b => {
                const sui = analyzer.sui(b);
                const a = analyzer.analyze(b);
                const cat = getSuitabilityCategory(sui.score);
                return (
                  <div key={b.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 88, flexShrink: 0, fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>{b.startTime}</div>
                    <div style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', background: a.hasCritical ? 'rgba(239,68,68,.06)' : 'var(--card)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{b.id} <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{b.corridor}/{b.track}</span></span>
                        <StatusBadge status={b.status} />
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{b.tasks.length} task(s) · AI suitability <b style={{ color: toneC(cat.cls) }}>{sui.score}</b></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        <div style={{ display: 'grid', gap: 18 }}>
          <Panel title="AI Top Recommendation" icon={<Sparkles width={18} height={18} color="var(--purple)" />}>
            {topRec ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 16 }}>{topRec.block.id}</span>
                  <Badge tone={getPriorityCategory(topRec.sui.score >= 70 ? topRec.sui.score : 40).cls}>{getSuitabilityCategory(topRec.sui.score).label}</Badge>
                </div>
                <div className="note" style={{ margin: '6px 0 4px' }}>{topRec.block.corridor}/{topRec.block.track} · {topRec.block.date} {topRec.block.startTime}–{topRec.block.endTime}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, margin: '10px 0 4px' }}>
                  <span style={{ color: 'var(--muted)', fontWeight: 700 }}>AI SUITABILITY</span>
                  <b>{topRec.sui.score}/100</b>
                </div>
                <ProgressBar value={topRec.sui.score} color="var(--green)" />
                <div style={{ marginTop: 10, padding: 10, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12, color: 'var(--text2)' }}>
                  <b>{topRec.rec.title}:</b> {topRec.rec.reason}
                </div>
                <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} onClick={() => navigate('/block-planner', { state: { openBlock: topRec.block.id } })}>View Details</button>
              </div>
            ) : <EmptyState title="No blocks" />}
          </Panel>

          <Panel title="Approval Watchlist" icon={<ClipboardCheck width={18} height={18} color="var(--green)" />}>
            {pendingApprovals.length === 0 ? (
              <EmptyState icon={<CheckCircle2 width={40} height={40} />} title="Nothing pending" />
            ) : (
              <div style={{ display: 'grid', gap: 6 }}>
                {pendingApprovals.slice(0, 4).map(b => {
                  const a = getApprovalStatus(approvals, b.id);
                  return (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                      <b>{b.id}</b>
                      <span style={{ color: 'var(--muted)' }}>{b.startTime}–{b.endTime}</span>
                      <Badge tone={a.category === 'requires' ? 'medium' : 'info'}>{(a.category === 'requires' ? 'REQUIRES REVIEW' : 'PENDING').toUpperCase()}</Badge>
                    </div>
                  );
                })}
                <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={() => navigate('/approval')}>Open Approval &amp; Audit</button>
              </div>
            )}
          </Panel>

          <Panel title="Recent Activity" icon={<TrendingUp width={18} height={18} color="var(--blue)" />}>
            {auditRecords.length === 0 ? (
              <div className="note">No audit records yet. Approve or reject blocks to build the log.</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {auditRecords.slice(0, 4).map((r, i) => (
                  <div key={i} style={{ fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: r.category === 'approval' ? 'var(--green)' : r.category === 'rejection' ? 'var(--red)' : 'var(--blue)' }}>{(r.category || 'info').toUpperCase()}</span>
                      <span style={{ color: 'var(--muted)' }}>{new Date(r.time).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ color: 'var(--text2)', marginTop: 2 }}><Info width={11} height={11} style={{ verticalAlign: -1, display: 'none' }} />{r.message}</div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function toneC(cls) {
  return cls === 'low' ? 'var(--green)' : cls === 'info' ? 'var(--blue)' : cls === 'medium' ? 'var(--orange)' : 'var(--red)';
}