import React, { useMemo, useState } from 'react';
import { ClipboardCheck, Check, X, Eye, Trash2, History, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { makeAnalyzer } from '../utils/analyzer';
import { Panel, Badge, MetricCard, Modal, EmptyState, StatusBadge } from '../components/ui';
import { getApprovalStatus, approvalSummary, filterAudit, isApprovalOverride } from '../services/approval';

export function ApprovalPage() {
  const { blocks, trains, taskData, approvals, auditRecords, doRecordApproval, addAudit, clearAudit, approvalSelection, setApprovalSelection, showToast } = useApp();
  const analyzer = useMemo(() => makeAnalyzer(blocks, trains, taskData), [blocks, trains, taskData]);
  const [detail, setDetail] = useState(null);
  const [reasonFor, setReasonFor] = useState(null); // {blockId, category}
  const [reasonText, setReasonText] = useState('');
  const [auditFilter, setAuditFilter] = useState('all');
  const [manualResult, setManualResult] = useState(null);

  const summary = useMemo(() => approvalSummary(blocks, approvals), [blocks, approvals]);
  const audited = useMemo(() => filterAudit(auditRecords, auditFilter), [auditRecords, auditFilter]);

  const toggleSelect = (id) => setApprovalSelection(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);

  const decide = (blockId, category) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    const rec = analyzer.rec(block);
    const action = category === 'approved' ? 'approve' : 'reject';
    const override = isApprovalOverride(rec.type, action);
    if (override) {
      setReasonFor({ blockId, category });
      setReasonText('');
    } else {
      doRecordApproval(blockId, category, '', false);
    }
  };

  const confirmReason = () => {
    if (!reasonText.trim()) { showToast('A reason is required for a human override', 'error'); return; }
    doRecordApproval(reasonFor.blockId, reasonFor.category, reasonText.trim(), true);
    setReasonFor(null);
    setReasonText('');
  };

  const bulk = (category) => {
    if (!approvalSelection.length) { showToast('No blocks selected', 'error'); return; }
    approvalSelection.forEach(id => doRecordApproval(id, category, 'Bulk action', false));
    setApprovalSelection([]);
    showToast(`${approvalSelection.length} block(s) marked ${category}`, 'success');
  };

  const runManualValidation = () => {
    const issues = blocks.map(b => ({ b, a: analyzer.analyze(b) }));
    const trainConflicts = issues.reduce((s, x) => s + x.a.trainConflicts.length, 0);
    const resConflicts = issues.reduce((s, x) => s + x.a.resourceConflicts.length, 0);
    const longBlocks = blocks.filter(b => {
      const w = (b.startTime && b.endTime) ? timeDiffMin(b.startTime, b.endTime) : NaN;
      return !isNaN(w) && w > 300;
    }).length;
    const missingLoc = blocks.filter(b => !b.from || !b.to).length;
    const checks = [
      { label: 'Train conflict', ok: trainConflicts === 0, state: trainConflicts === 0 ? 'PASSED' : 'FAILED', detail: trainConflicts === 0 ? 'No windows overlap train movements' : `${trainConflicts} overlap(s) detected` },
      { label: 'Duration', ok: longBlocks === 0, state: longBlocks === 0 ? 'PASSED' : 'FAILED', detail: longBlocks === 0 ? 'All blocks within 5h limit' : `${longBlocks} block(s) exceed 5 hours` },
      { label: 'Location', ok: missingLoc === 0, state: missingLoc === 0 ? 'PASSED' : 'FAILED', detail: missingLoc === 0 ? 'All blocks define from/to stations' : `${missingLoc} block(s) missing location` },
      { label: 'Resource availability', ok: resConflicts === 0, state: resConflicts === 0 ? 'PASSED' : 'WARNING', warn: resConflicts > 0, detail: resConflicts === 0 ? 'All crew/equipment demands met' : `${resConflicts} resource shortfall(s)` },
    ];
    setManualResult({ checks, resourceWarn: resConflicts > 0 });
    addAudit('edit', 'Manual change submitted by planner', `Validation run — ${checks.filter(c => c.ok).length}/${checks.length} passed`, '', false);
    showToast(resConflicts > 0 ? 'Manual change validated with warnings' : 'Manual change validated — all checks passed', resConflicts > 0 ? 'warning' : 'success');
  };

  const detailBlock = blocks.find(b => b.id === detail);

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div>
        <div className="page-title">Approval &amp; Audit</div>
        <div className="page-description">Human-in-the-loop governance. AI recommends; a planner finalises. Overrides are flagged and logged.</div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))' }}>
        <MetricCard label="Pending Review" value={summary.pending} color="var(--orange)" />
        <MetricCard label="Approved" value={summary.approved} color="var(--green)" />
        <MetricCard label="Rejected" value={summary.rejected} color="var(--red)" />
        <MetricCard label="Total Blocks" value={summary.total} color="var(--blue)" />
      </div>

      <Panel
        title="Decision Queue"
        icon={<ClipboardCheck width={18} height={18} color="var(--green)" />}
        actions={
          <>
            <Badge tone={summary.pending > 0 ? 'info' : summary.rejected > 0 ? 'critical' : 'low'}>
              {summary.pending > 0 ? `${summary.pending} PENDING REVIEW` : summary.rejected > 0 ? 'REJECTED' : 'ALL APPROVED'}
            </Badge>
            <button className="btn btn-success btn-sm" onClick={() => bulk('approved')}><Check width={13} height={13} /> Approve Selected</button>
            <button className="btn btn-danger btn-sm" onClick={() => bulk('rejected')}><X width={13} height={13} /> Reject Selected</button>
          </>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="table-app">
            <thead><tr><th></th><th>Block</th><th>Corridor</th><th>Time</th><th>AI Priority</th><th>Status / Recommendation</th><th>Suitability</th><th>Conflicts</th><th>Actions</th></tr></thead>
            <tbody>
              {blocks.map(b => {
                const a = getApprovalStatus(approvals, b.id);
                const rec = analyzer.rec(b);
                const pri = analyzer.pri(b).score;
                const sui = analyzer.sui(b).score;
                const conflicts = analyzer.analyze(b).all.length;
                return (
                  <tr key={b.id}>
                    <td><input type="checkbox" checked={approvalSelection.includes(b.id)} onChange={() => toggleSelect(b.id)} /></td>
                    <td><b>{b.id}</b></td>
                    <td>{b.corridor}</td>
                    <td>{b.startTime}–{b.endTime}<div className="small" style={{ color: 'var(--muted)' }}>{b.date}</div></td>
                    <td><b>{pri}/100</b></td>
                    <td>
                      {a.category === 'approved' ? <Badge tone="low"><Check width={12} height={12} /> APPROVED</Badge> : a.category === 'rejected' ? <Badge tone="critical"><X width={12} height={12} /> REJECTED</Badge> : <Badge tone="info">PENDING</Badge>}
                      <div className="small" style={{ color: 'var(--muted)' }}>{rec.title}</div>
                    </td>
                    <td><b>{sui}</b></td>
                    <td>{conflicts}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setDetail(b.id)}><Eye width={12} height={12} /> View</button>
                        {a.category !== 'approved' && <button className="btn btn-success btn-sm" onClick={() => decide(b.id, 'approved')}>Approve</button>}
                        {a.category !== 'rejected' && <button className="btn btn-danger btn-sm" onClick={() => decide(b.id, 'rejected')}>Reject</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Manual Change Validation" icon={<ShieldCheck width={18} height={18} color="var(--orange)" />} actions={
        <button className="btn btn-primary btn-sm" onClick={runManualValidation}>Run Validation</button>
      }>
        <div className="note" style={{ marginBottom: 10 }}>Re-validate planner edits before final approval. Every manual change is logged to the audit trail.</div>
        {manualResult === null ? (
          <div className="alert alert-blue"><span className="alert-icon">i</span><div>No validation run yet in this session. Run validation to check train conflicts, duration, location and resource availability across the current plan.</div></div>
        ) : (
          <div className="alert alert-orange">
            <span className="alert-icon">!</span>
            <div>
              <b>Manual Change Submitted</b><br /><br />
              Validation checks:<br />
              {manualResult.checks.map(c => (
                <div key={c.label} style={{ margin: '2px 0' }}>
                  <span style={{ display: 'inline-flex', verticalAlign: '-2px', color: c.ok ? 'var(--green)' : c.warn ? 'var(--orange)' : 'var(--red)' }}>
                    {c.ok ? <Check width={13} height={13} /> : c.warn ? <AlertTriangle width={13} height={13} /> : <X width={13} height={13} />}
                  </span> {c.label} — <b>{c.state}</b>
                  <span className="small" style={{ color: 'var(--muted)' }}> · {c.detail}</span>
                </div>
              ))}
              <br />
              <b>Recommendation:</b> {manualResult.resourceWarn ? 'Review crew allocation before final approval.' : 'No warnings — safe to finalise the plan.'}
            </div>
          </div>
        )}
      </Panel>

      <Panel title="Audit Log" icon={<History width={18} height={18} color="var(--blue)" />} actions={
        <>
          <select className="field-select" style={{ width: 160 }} value={auditFilter} onChange={e => setAuditFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="approvals">Approvals</option>
            <option value="rejections">Rejections</option>
            <option value="overrides">Overrides</option>
            <option value="edits">Edits</option>
          </select>
          <button className="btn btn-secondary btn-sm" onClick={clearAudit}><Trash2 width={13} height={13} /> Clear</button>
        </>
      }>
        {audited.length === 0 ? <EmptyState title="No audit records" desc="Approve or reject blocks to build the audit log." /> : (
          <div style={{ display: 'grid', gap: 8 }}>
            {audited.map((r, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Badge tone={r.category === 'approval' ? 'low' : r.category === 'rejection' ? 'critical' : r.category === 'import' ? 'info' : 'plain'}>{(r.category || 'INFO').toUpperCase()}</Badge>
                  {r.isOverride && <Badge tone="medium">OVERRIDE</Badge>}
                  <span className="small" style={{ color: 'var(--muted)' }}>{new Date(r.time).toLocaleString()} · {r.by}</span>
                </div>
                <div style={{ fontSize: 13, marginTop: 4 }}>{r.message}</div>
                {r.reason && <div className="small" style={{ color: 'var(--muted)' }}>Reason: {r.reason}</div>}
              </div>
            ))}
          </div>
        )}
      </Panel>

      {detailBlock && (
        <Modal open title={`${detailBlock.id} — Approval Detail`} onClose={() => setDetail(null)} width={560}>
          <ApprovalDetail block={detailBlock} analyzer={analyzer} approval={getApprovalStatus(approvals, detailBlock.id)} />
        </Modal>
      )}

      {reasonFor && (
        <Modal open title="Human Override — Reason Required" onClose={() => setReasonFor(null)} width={460}>
          <div className="alert alert-orange"><span className="alert-icon">!</span><div>The AI recommendation for <b>{reasonFor.blockId}</b> differs from your decision. Provide a reason to record this as a human override.</div></div>
          <label className="field-label" style={{ marginTop: 12 }}>Reason</label>
          <textarea className="field-textarea" rows={3} value={reasonText} onChange={e => setReasonText(e.target.value)} placeholder="Explain why you are overriding the AI recommendation…" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
            <button className="btn btn-secondary" onClick={() => setReasonFor(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={confirmReason}>Record Decision</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function timeDiffMin(s, e) {
  const m = t => { const x = String(t || '').match(/^(\d{1,2}):(\d{2})$/); return x ? parseInt(x[1], 10) * 60 + parseInt(x[2], 10) : NaN; };
  return m(e) - m(s);
}

function ApprovalDetail({ block, analyzer, approval }) {
  const rec = analyzer.rec(block);
  const pri = analyzer.pri(block);
  const sui = analyzer.sui(block);
  const explain = analyzer.explain(block);
  return (
    <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <StatusBadge status={block.status} />
        <Badge tone={approval.category === 'approved' ? 'low' : approval.category === 'rejected' ? 'critical' : 'info'}>{(approval.category || 'pending').toUpperCase()}</Badge>
      </div>
      <div><b>{block.corridor}</b> / {block.track} · {block.date} · {block.startTime}–{block.endTime}</div>
      <div>AI Priority <b>{pri.score}</b> · AI Suitability <b>{sui.score}</b></div>
      <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
        <div className="card-label">AI Recommendation</div>
        <div style={{ fontWeight: 800, margin: '4px 0' }}>{rec.title}</div>
        <div style={{ color: 'var(--muted)' }}>{rec.reason}</div>
      </div>
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, fontSize: 12, lineHeight: 1.6 }}>
        {explain.text}
      </div>
      {approval.reason && <div className="alert alert-orange"><span className="alert-icon">!</span><div>Recorded reason: {approval.reason}</div></div>}
    </div>
  );
}