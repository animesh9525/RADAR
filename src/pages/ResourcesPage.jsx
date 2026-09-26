import React, { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { Users, Boxes, Wrench, Sparkles, Eye, Search, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Panel, MetricCard, Badge, Modal, EmptyState } from '../components/ui';
import { ensureChartTheme } from '../services/chartTheme';

const RESOURCE_DEPTS = ['Engineering', 'S&T', 'Traction/OHE'];
const CREW_STATUS = { available: ['low', 'AVAILABLE'], limited: ['medium', 'LIMITED'], unavailable: ['high', 'UNAVAILABLE'] };
const CREW_STATUS_OPTS = ['All', 'available', 'limited', 'unavailable'];
const EQUIP_STATUS_OPTS = ['All', 'AVAILABLE', 'RESERVED', 'LIMITED', 'OUT OF SERVICE'];

function statusMeta(type, status) {
  const s = (status || '').toUpperCase();
  if (type === 'crew') return CREW_STATUS[status] || ['low', s || 'AVAILABLE'];
  if (s === 'AVAILABLE') return ['low', 'AVAILABLE'];
  if (s === 'RESERVED') return ['medium', 'RESERVED'];
  if (s === 'LIMITED') return ['medium', 'LIMITED'];
  return ['high', s || 'UNAVAILABLE'];
}

function getCrewAssignment(c, blocks) {
  if (c.required <= 0) return null;
  const deptKey = c.department === 'Traction/OHE' ? 'Traction' : c.department;
  return blocks.find(b =>
    b.corridor === c.corridor &&
    (b.tasks || []).some(t => (t.department || '') === deptKey || (t.department || '') === c.department)
  ) || null;
}

export function ResourcesPage() {
  const { crew, equipment, blocks } = useApp();
  const navigate = useNavigate();
  const [dept, setDept] = useState('All');
  const [status, setStatus] = useState('All');
  const [corr, setCorr] = useState('All');
  const [detail, setDetail] = useState(null);

  const stats = useMemo(() => {
    const availTeams = crew.filter(c => (c.status || '').toUpperCase() === 'AVAILABLE').length;
    const activeCrews = crew.filter(c => (parseInt(c.available, 10) || 0) > 0 && (parseInt(c.required, 10) || 0) > 0).length;
    const availEquip = equipment.reduce((s, e) => s + (parseInt(e.available, 10) || 0), 0);
    const conflicts = crew.filter(c => (parseInt(c.required, 10) || 0) > (parseInt(c.available, 10) || 0)).length
      + equipment.filter(e => (parseInt(e.required, 10) || 0) > (parseInt(e.available, 10) || 0)).length;
    const totalAvail = crew.reduce((s, c) => s + (parseInt(c.available, 10) || 0), 0) + availEquip;
    const totalReq = crew.reduce((s, c) => s + (parseInt(c.required, 10) || 0), 0) + equipment.reduce((s, e) => s + (parseInt(e.required, 10) || 0), 0);
    const utilization = totalAvail > 0 ? Math.round((totalReq / totalAvail) * 100) : 0;
    return { availTeams, activeCrews, availEquip, conflicts, utilization, totalAvail, totalReq };
  }, [crew, equipment]);

  const filteredCrew = useMemo(() => crew.filter(c =>
    (dept === 'All' || c.department === dept) &&
    (status === 'All' || (c.status || '').toUpperCase() === status) &&
    (corr === 'All' || c.corridor === corr)
  ), [crew, dept, status, corr]);

  const filteredEquip = useMemo(() => equipment.filter(e =>
    (dept === 'All' || e.department === dept) &&
    (status === 'All' || (e.status || '').toUpperCase() === status) &&
    (corr === 'All' || e.corridor === corr)
  ), [equipment, dept, status, corr]);

  const aiInsight = useMemo(() => {
    const deptConflicts = {};
    crew.forEach(c => { if ((parseInt(c.required, 10) || 0) > (parseInt(c.available, 10) || 0)) deptConflicts[c.department] = (deptConflicts[c.department] || 0) + 1; });
    equipment.forEach(e => { if ((parseInt(e.required, 10) || 0) > (parseInt(e.available, 10) || 0)) deptConflicts[e.department] = (deptConflicts[e.department] || 0) + 1; });
    const deptList = Object.entries(deptConflicts).sort((a, b) => b[1] - a[1]);
    const worstDept = deptList.length ? deptList[0][0] : null;
    const corrDemand = {};
    crew.forEach(c => {
      corrDemand[c.corridor] = corrDemand[c.corridor] || { avail: 0, req: 0 };
      corrDemand[c.corridor].avail += parseInt(c.available, 10) || 0;
      corrDemand[c.corridor].req += parseInt(c.required, 10) || 0;
    });
    let attentionCorr = 'None', worstShort = 0;
    ['C1', 'C2', 'C3', 'C4'].forEach(cid => {
      const v = corrDemand[cid] || { avail: 0, req: 0 };
      const short = v.req - v.avail;
      if (short > worstShort) { worstShort = short; attentionCorr = cid; }
    });
    const deptNote = deptList.length
      ? `Department <b>${worstDept}</b> carries the most active resource conflicts (${deptConflicts[worstDept]}), and Corridor <b>${attentionCorr}</b> ${worstShort > 0 ? `needs ${worstShort} additional crew` : 'has balanced coverage'} for the upcoming maintenance window.`
      : `No crew or equipment shortages are active; all departments are adequately resourced for the current week.`;
    return {
      util: stats.utilization, totalReq: stats.totalReq, totalAvail: stats.totalAvail, deptNote, worstDept,
      text: `Overall crew coverage is <b>${stats.utilization}%</b> (${stats.totalReq} required vs ${stats.totalAvail} available). ${deptNote} The AI recommends reviewing ${worstDept || 'resource'} assignments first and using reserve redeployment before opening any new maintenance windows.`,
    };
  }, [crew, equipment, stats]);

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div>
        <div className="page-title">Resources</div>
        <div className="page-description">Crew and equipment availability with shortage detection, AI observations and department utilisation.</div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))' }}>
        <MetricCard label="Available Crews" value={`${stats.availTeams} / ${crew.length}`} delta="maintenance teams ready" color="var(--blue)" />
        <MetricCard label="Active Crews" value={stats.activeCrews} delta="assigned to blocks" color="var(--teal)" />
        <MetricCard label="Equipment Available" value={`${stats.availEquip} / ${equipment.length}`} delta="units of types" color="var(--purple)" />
        <MetricCard label="Resource Conflicts" value={stats.conflicts} delta={stats.conflicts > 0 ? 'need attention' : 'none active'} color={stats.conflicts > 0 ? 'var(--red)' : 'var(--green)'} />
        <MetricCard label="Utilization" value={stats.utilization + '%'} delta="required vs available" color={stats.utilization <= 100 ? 'var(--green)' : 'var(--orange)'} />
      </div>

      <Panel title="Filters" icon={<Search width={16} height={16} color="var(--blue)" />}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div><label className="field-label">Department</label>
            <select className="field-select" style={{ width: 170 }} value={dept} onChange={e => setDept(e.target.value)}>
              <option value="All">All</option>
              {RESOURCE_DEPTS.map(d => <option key={d}>{d}</option>)}
            </select></div>
          <div><label className="field-label">Status</label>
            <select className="field-select" style={{ width: 160 }} value={status} onChange={e => setStatus(e.target.value)}>
              {[...new Set([...CREW_STATUS_OPTS, ...EQUIP_STATUS_OPTS])].map(s => <option key={s}>{s}</option>)}
            </select></div>
          <div><label className="field-label">Corridor</label>
            <select className="field-select" style={{ width: 110 }} value={corr} onChange={e => setCorr(e.target.value)}>
              <option value="All">All</option>
              {['C1', 'C2', 'C3', 'C4'].map(c => <option key={c}>{c}</option>)}
            </select></div>
        </div>
      </Panel>

      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
        <Panel title={`Crew Table (${filteredCrew.length})`} icon={<Users width={18} height={18} color="var(--blue)" />}>
          {filteredCrew.length === 0 ? <EmptyState icon={Search} title="No crews match" desc="Try resetting the Department, Status, or Corridor filters." /> : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table-app">
                <thead><tr><th>Crew/Team</th><th>Department</th><th>Corridor</th><th>Members</th><th>Required</th><th>Status</th><th>Assignment</th><th>Skills</th></tr></thead>
                <tbody>
                  {filteredCrew.map(c => {
                    const [cls, label] = statusMeta('crew', c.status);
                    const asg = getCrewAssignment(c, blocks);
                    return (
                      <tr key={c.name} style={{ cursor: 'pointer' }} onClick={() => setDetail({ type: 'crew', key: c.name })}>
                        <td><b>{c.name}</b></td>
                        <td>{c.department}</td>
                        <td>{c.corridor}</td>
                        <td>{c.available}</td>
                        <td>{c.required > 0 ? c.required : <span className="note">0</span>}</td>
                        <td><Badge tone={cls}>{label}</Badge></td>
                        <td>{asg ? <span className="badge info">{asg.id}</span> : <span className="note">Unassigned</span>}</td>
                        <td>{c.skills.slice(0, 3).map(s => <span key={s} className="badge plain" style={{ margin: 1, fontSize: 11 }}>{s}</span>)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title={`Equipment Table (${filteredEquip.length})`} icon={<Boxes width={18} height={18} color="var(--teal)" />}>
          {filteredEquip.length === 0 ? <EmptyState icon={Search} title="No equipment matches" desc="Try resetting the Department, Status, or Corridor filters." /> : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table-app">
                <thead><tr><th>Equipment</th><th>Department</th><th>Available</th><th>Required</th><th>Status</th><th>Assigned Block</th></tr></thead>
                <tbody>
                  {filteredEquip.map(e => {
                    const cls = e.status === 'AVAILABLE' ? 'low' : e.status === 'RESERVED' ? 'medium' : 'high';
                    return (
                      <tr key={e.name} style={{ cursor: 'pointer' }} onClick={() => setDetail({ type: 'equipment', key: e.name })}>
                        <td><b>{e.name}</b></td>
                        <td>{e.department}</td>
                        <td>{e.available}</td>
                        <td>{e.required > 0 ? e.required : <span className="note">0</span>}</td>
                        <td><Badge tone={cls}>{e.status}</Badge></td>
                        <td>{e.status !== 'AVAILABLE' && e.assignedBlock ? <span className="badge info">{e.assignedBlock}</span> : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      <ResourceConflicts crew={crew} equipment={equipment} />

      <Panel title="AI Resource Insight" icon={<Sparkles width={18} height={18} color="var(--blue)" />}>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: aiInsight.text }} />
      </Panel>

      <Panel title="Resource Availability by Department" icon={<Users width={18} height={18} color="var(--green)" />}>
        <ResourceUtilChart crew={crew} equipment={equipment} />
      </Panel>

      {detail && <ResourceDetailModal crew={crew} equipment={equipment} blocks={blocks} detail={detail} onClose={() => setDetail(null)} onViewBlock={(id) => { setDetail(null); navigate('/block-planner', { state: { openBlock: id } }); }} />}
    </div>
  );
}

function ResourceConflicts({ crew, equipment }) {
  const cards = [];
  const [crewShort, equipShort] = useMemo(() => [crew.filter(c => (parseInt(c.required, 10) || 0) > (parseInt(c.available, 10) || 0)), equipment.filter(e => (parseInt(e.required, 10) || 0) > (parseInt(e.available, 10) || 0))], [crew, equipment]);
  crewShort.forEach(c => {
    const short = c.required - c.available;
    cards.push({ icon: <Users width={13} height={13} />, title: c.name, block: c.currentBlock, msg: `${c.name} requires ${c.required} crew but only ${c.available} are available in Corridor ${c.corridor} (short by ${short}).`, rec: `Redeploy reserve crew from standby teams or reschedule the ${c.department} task to a gap in the ${c.corridor} weekly window to close the ${short} crew shortfall.` });
  });
  equipShort.forEach(e => {
    const short = e.required - e.available;
    cards.push({ icon: <Wrench width={13} height={13} />, title: e.name, block: e.assignedBlock, msg: `${e.name} requires ${e.required} unit(s) but only ${e.available} are available (short by ${short}).`, rec: `Borrow the unit from a lower-priority window or use the reserve alternative listed under ${e.department} before finalizing block assignment.` });
  });
  return (
    <Panel title={`Resource Conflicts (${cards.length})`} icon={<Wrench width={18} height={18} color="var(--orange)" />}>
      {cards.length === 0 ? (
        <div className="alert alert-green"><CheckCircle2 width={15} height={15} style={{ color: 'var(--green)' }} /><div>No active crew or equipment shortages detected in the current plan.</div></div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {cards.map((c, i) => (
            <div key={i} style={{ border: '1px solid rgba(245,158,11,.35)', borderRadius: 10, padding: 12, background: 'var(--card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <b style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{c.icon} {c.title}</b>
                <Badge tone="high">Resource Conflict</Badge>
              </div>
              <div className="note" style={{ marginTop: 8, fontSize: 13 }}>
                <b>Block:</b> {c.block ? <span className="badge info">{c.block}</span> : '—'}<br />
                <b>Conflict:</b> {c.msg}
              </div>
              <div style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)', padding: 10, borderRadius: 8, fontSize: 12, marginTop: 8 }}>
                <b>AI Recommendation:</b> {c.rec}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function ResourceUtilChart({ crew, equipment }) {
  const ref = useRef(null);
  const chartRef = useRef(null);
  const { theme } = useApp();
  const data = useMemo(() => {
    const deptMap = {};
    RESOURCE_DEPTS.forEach(d => deptMap[d] = { avail: 0, req: 0 });
    crew.forEach(c => {
      if (!deptMap[c.department]) deptMap[c.department] = { avail: 0, req: 0 };
      deptMap[c.department].avail += parseInt(c.available, 10) || 0;
      deptMap[c.department].req += parseInt(c.required, 10) || 0;
    });
    equipment.forEach(e => {
      if (!deptMap[e.department]) deptMap[e.department] = { avail: 0, req: 0 };
      deptMap[e.department].avail += parseInt(e.available, 10) || 0;
      deptMap[e.department].req += parseInt(e.required, 10) || 0;
    });
    return {
      avail: RESOURCE_DEPTS.map(d => deptMap[d].avail),
      req: RESOURCE_DEPTS.map(d => deptMap[d].req),
      remain: RESOURCE_DEPTS.map(d => Math.max(deptMap[d].avail - deptMap[d].req, 0)),
    };
  }, [crew, equipment]);

  useEffect(() => {
    if (!ref.current) return;
    ensureChartTheme();
    chartRef.current = new Chart(ref.current.getContext('2d'), {
      type: 'bar',
      data: {
        labels: RESOURCE_DEPTS,
        datasets: [
          { label: 'Available', data: data.avail, backgroundColor: '#10b981' },
          { label: 'Assigned / Required', data: data.req, backgroundColor: '#3b82f6' },
          { label: 'Remaining', data: data.remain, backgroundColor: '#94a3b8' },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'Resource availability by department (crew + equipment)' } },
        scales: { x: { stacked: true, beginAtZero: true }, y: { stacked: true } },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data.avail.join(','), data.req.join(','), data.remain.join(','), theme]);

  return <div style={{ height: 220 }}><canvas ref={ref} /></div>;
}

function ResourceDetailModal({ crew, equipment, blocks, detail, onClose, onViewBlock }) {
  const item = detail.type === 'crew'
    ? { ...crew.find(c => c.name === detail.key), kind: 'crew' }
    : { ...equipment.find(e => e.name === detail.key), kind: 'equipment' };
  if (!item || !item.name) return null;

  const [cls, label] = statusMeta(item.kind, item.status);
  const asg = item.kind === 'crew' ? getCrewAssignment(item, blocks) : (item.assignedBlock ? blocks.find(b => b.id === item.assignedBlock) || null : null);
  const balance = (item.available || 0) - (item.required || 0);
  const balanceTxt = item.kind === 'crew' ? (balance < 0 ? `Short by ${item.required - item.available}` : 'Sufficient') : null;

  return (
    <Modal open title={item.name} onClose={onClose} width={540}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <Badge tone={cls}>{label}</Badge>
        <Badge tone="plain">{item.department}</Badge>
      </div>
      <div style={{ overflowX: 'auto' }}>
      <table className="table-app">
        <tbody>
          <tr><td><b>Department</b></td><td>{item.department}</td></tr>
          <tr><td><b>Corridor</b></td><td>{item.corridor || '—'}</td></tr>
          <tr><td><b>{item.kind === 'crew' ? 'Members Available' : 'Units Available'}</b></td><td>{item.available}</td></tr>
          <tr><td><b>Required</b></td><td>{item.required}</td></tr>
          {item.kind === 'crew' && <tr><td><b>Crew Balance</b></td><td style={{ color: balance < 0 ? 'var(--red)' : 'var(--green)', fontWeight: 700 }}>{balanceTxt}</td></tr>}
          {item.kind === 'crew' && <tr><td><b>Sub-Status</b></td><td>{item.subStatus || '—'}</td></tr>}
          <tr><td><b>Current Assignment</b></td><td>{asg ? `${asg.id} · ${asg.corridor} · ${asg.date} ${asg.startTime}–${asg.endTime}` : '—'}</td></tr>
        </tbody>
      </table>
      </div>
      {item.kind === 'crew' && (
        <div className="note" style={{ marginTop: 12 }}><b>Skills</b><div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>{item.skills.map(s => <span key={s} className="badge plain">{s}</span>)}</div></div>
      )}
      {asg && (
        <button className="btn btn-primary" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }} onClick={() => onViewBlock(asg.id)}>
          <Eye width={14} height={14} /> View Assigned Block
        </button>
      )}
    </Modal>
  );
}