import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle2, ArrowRight, Activity, Radar, TrendingUp,
  ClipboardCheck, Clock, Sparkles, Database,
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
        <MetricCard label="Critical Tasks" value={metrics.critical} delta={<span>AI Priority ≥ 85</span>} color="var(--red)" icon={AlertTriangle} />
        <MetricCard label="High Priority Tasks" value={metrics.high} delta={<span>AI Priority 70–84</span>} color="var(--orange)" icon={TrendingUp} />
        <MetricCard label="High Suitability Blocks" value={metrics.highSuit} delta={<span>suitability ≥ 90</span>} color="var(--green)" icon={CheckCircle2} />
        <MetricCard label="Blocks Needing Review" value={metrics.needReview} delta={<span>conflicts / review</span>} color="var(--purple)" icon={ClipboardCheck} />
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        {corridorCards.map(cc => (
          <div className="app-card dash-corr" key={cc.c}>
            <div className="dash-corr-top">
              <div className="dash-corr-name">
                <span className="dash-corr-dot" style={{ background: CORR_COLOR[cc.c] || '#94a3b8' }} />
                <div className="card-label">Corridor {cc.c}</div>
              </div>
              {cc.conflicts > 0 ? <Badge tone="critical">{cc.conflicts} conflict</Badge> : <StatusBadge status="Clear" />}
            </div>
            <div className="dash-corr-val">{cc.util}% <span className="dash-corr-unit">utilization</span></div>
            <ProgressBar value={cc.util} color={CORR_COLOR[cc.c] || '#60a5fa'} />
            <div className="dash-corr-meta">
              <span><Activity width={12} height={12} style={{ verticalAlign: -2 }} /> {cc.blocks} blocks</span>
              <span><Radar width={12} height={12} style={{ verticalAlign: -2 }} /> {cc.trains} trains</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="dash-col">
          <Panel title="Live Alerts" icon={<AlertTriangle width={18} height={18} color="var(--orange)" />}>
            {liveAlerts.length === 0 ? (
              <EmptyState icon={<CheckCircle2 width={40} height={40} />} title="All clear" desc="No blocks currently flagged for conflicts. Open Block Planner to review." />
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {liveAlerts.slice(0, 4).map(b => {
                  const conflicts = analyzer.analyze(b);
                  return (
                    <div key={b.id} className="dash-alert-row">
                      <div className="dash-alert-ic">
                        <AlertTriangle width={16} height={16} />
                      </div>
                      <div className="dash-alert-body">
                        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{b.id} · <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{b.corridor}/{b.track} · {b.startTime}–{b.endTime}</span></div>
                        <div className="small" style={{ color: 'var(--muted)', marginTop: 2 }}>{conflicts.all.length} conflicts — {conflicts.trainConflicts.length} train, {conflicts.blockConflicts.length} overlap, {conflicts.resourceConflicts.length} resource</div>
                      </div>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/conflicts')}>Resolve</button>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          <Panel title="Today's Timeline" icon={<Clock width={18} height={18} color="var(--blue)" />} actions={<button className="btn btn-ghost btn-sm" onClick={() => navigate('/schedule')}>Weekly Schedule <ArrowRight width={14} height={14} /></button>}>
            <div className="dash-tl">
              {todayBlocks.map(b => {
                const sui = analyzer.sui(b);
                const a = analyzer.analyze(b);
                const cat = getSuitabilityCategory(sui.score);
                return (
                  <div key={b.id} className="dash-tl-item">
                    <div className="dash-tl-time">{b.startTime}</div>
                    <div className="dash-tl-card" style={{ background: a.hasCritical ? 'rgba(220,38,38,0.05)' : undefined }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 13.5 }}>{b.id} <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{b.corridor}/{b.track}</span></span>
                        <StatusBadge status={b.status} />
                      </div>
                      <div className="small" style={{ color: 'var(--muted)', marginTop: 2 }}>{b.tasks.length} task(s) · AI suitability <b style={{ color: toneC(cat.cls) }}>{sui.score}</b></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        <div className="dash-col">
          <Panel title="AI Top Recommendation" icon={<Sparkles width={18} height={18} color="var(--purple)" />}>
            {topRec ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em' }}>{topRec.block.id}</span>
                  <Badge tone={getPriorityCategory(topRec.sui.score >= 70 ? topRec.sui.score : 40).cls}>{getSuitabilityCategory(topRec.sui.score).label}</Badge>
                </div>
                <div className="note" style={{ margin: '6px 0 4px' }}>{topRec.block.corridor}/{topRec.block.track} · {topRec.block.date} {topRec.block.startTime}–{topRec.block.endTime}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, margin: '10px 0 4px' }}>
                  <span style={{ color: 'var(--muted)', fontWeight: 700 }}>AI SUITABILITY</span>
                  <b style={{ fontVariantNumeric: 'tabular-nums' }}>{topRec.sui.score}/100</b>
                </div>
                <ProgressBar value={topRec.sui.score} color="var(--green)" />
                <div className="dash-rec-note">
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
              <div style={{ display: 'grid', gap: 2 }}>
                {pendingApprovals.slice(0, 4).map(b => {
                  const a = getApprovalStatus(approvals, b.id);
                  return (
                    <div key={b.id} className="dash-watch-row">
                      <b style={{ fontVariantNumeric: 'tabular-nums' }}>{b.id}</b>
                      <span style={{ color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{b.startTime}–{b.endTime}</span>
                      <Badge tone={a.category === 'requires' ? 'warning' : 'pending'}>{a.category === 'requires' ? 'REQUIRES REVIEW' : 'PENDING'}</Badge>
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
              <div style={{ display: 'grid', gap: 6 }}>
                {auditRecords.slice(0, 4).map((r, i) => (
                  <div key={i} className="dash-watch-row">
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: 11, color: r.category === 'approval' ? 'var(--green)' : r.category === 'rejection' ? 'var(--red)' : 'var(--blue)' }}>{(r.category || 'info').toUpperCase()}</span>
                        <span style={{ color: 'var(--muted)', fontSize: 11 }}>{new Date(r.time).toLocaleTimeString()}</span>
                      </div>
                      <div className="small" style={{ color: 'var(--text2)', marginTop: 2 }}>{r.message}</div>
                    </div>
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

const toneC = (cls) => cls === 'low' ? 'var(--green)' : cls === 'info' ? 'var(--blue)' : cls === 'medium' ? 'var(--orange)' : 'var(--red)';

const CORR_COLOR = { C1: '#38bdf8', C2: '#34d399', C3: '#fbbf24', C4: '#a78bfa' };