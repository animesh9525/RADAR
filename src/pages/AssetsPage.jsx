import React, { useMemo, useState } from 'react';
import { Boxes, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Panel, Badge, EmptyState, MetricCard } from '../components/ui';

export function AssetsPage() {
  const { assets } = useApp();
  const [q, setQ] = useState('');
  const [crit, setCrit] = useState('All');

  const filtered = useMemo(() => {
    let list = assets;
    if (crit !== 'All') list = list.filter(a => String(a.criticality).toLowerCase() === crit.toLowerCase());
    if (q) list = list.filter(a => (a.id + ' ' + a.type + ' ' + a.location).toLowerCase().includes(q.toLowerCase()));
    return list;
  }, [assets, q, crit]);

  const counts = useMemo(() => ({
    total: assets.length,
    critical: assets.filter(a => String(a.criticality).toLowerCase() === 'critical').length,
    highRisk: assets.filter(a => (a.riskScore || 0) >= 68).length,
    avgRisk: assets.length ? Math.round(assets.reduce((s, a) => s + (a.riskScore || 0), 0) / assets.length) : 0,
  }), [assets]);

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div>
        <div className="page-title">Asset Registry</div>
        <div className="page-description">Tracked railway assets with condition, criticality and risk scoring.</div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))' }}>
        <MetricCard label="Total Assets" value={counts.total} color="var(--blue)" />
        <MetricCard label="Critical Assets" value={counts.critical} color="var(--red)" />
        <MetricCard label="High Risk (≥68)" value={counts.highRisk} color="var(--orange)" />
        <MetricCard label="Avg Risk Score" value={counts.avgRisk} color="var(--purple)" />
      </div>

      <Panel title={`Assets (${filtered.length})`} icon={<Boxes width={18} height={18} color="var(--teal)" />} actions={
        <>
          <div style={{ position: 'relative' }}>
            <Search width={14} height={14} style={{ position: 'absolute', left: 8, top: 9, color: 'var(--muted)' }} />
            <input className="field-input" style={{ width: 220, paddingLeft: 28 }} placeholder="Search assets…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <select className="field-select" style={{ width: 150 }} value={crit} onChange={e => setCrit(e.target.value)}>
            <option value="All">All Criticality</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </>
      }>
        {filtered.length === 0 ? <EmptyState title="No assets match" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-app">
              <thead><tr><th>ID</th><th>Type</th><th>Location</th><th>Condition</th><th>Criticality</th><th>Last Maintenance</th><th>Risk</th><th>Source</th></tr></thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td><b>{a.id}</b></td>
                    <td>{a.type}</td>
                    <td style={{ maxWidth: 220 }}>{a.location}</td>
                    <td>{a.condition}</td>
                    <td><Badge tone={String(a.criticality).toLowerCase() === 'critical' ? 'critical' : String(a.criticality).toLowerCase() === 'high' ? 'high' : 'medium'}>{a.criticality}</Badge></td>
                    <td>{a.lastMaintenance}</td>
                    <td style={{ fontWeight: 700, color: a.riskScore >= 68 ? 'var(--red)' : a.riskScore >= 55 ? 'var(--orange)' : 'var(--green)' }}>{a.riskScore}</td>
                    <td><span className="badge plain">{a.source || 'synthetic_demo'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}