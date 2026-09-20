import React, { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { CalendarDays, TrendingUp, Sparkles, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { makeAnalyzer } from '../utils/analyzer';
import { aiBuildOptimizedPlan, aiPlanMetrics } from '../services/optimization';
import { Panel, MetricCard, ProgressBar, Badge } from '../components/ui';

function ForecastChart({ weeks }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = new Chart(ref.current.getContext('2d'), {
      type: 'line',
      data: {
        labels: weeks.map(w => w.label),
        datasets: [
          { label: 'Planned Blocks', data: weeks.map(w => w.count), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,.12)', tension: 0.4, fill: true, yAxisID: 'y' },
          { label: 'Utilization %', data: weeks.map(w => w.util), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.1)', tension: 0.4, borderDash: [5, 5], yAxisID: 'y1' },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { beginAtZero: true, position: 'left' }, y1: { beginAtZero: true, max: 100, position: 'right', grid: { drawOnChartArea: false } } },
      },
    });
    return () => chart.destroy();
  }, [weeks]);
  return <div style={{ height: 220 }}><canvas ref={ref} /></div>;
}

export function MonthlyPage() {
  const { blocks, trains, taskData, showToast, addNotification, session } = useApp();
  const navigate = useNavigate();
  const analyzer = useMemo(() => makeAnalyzer(blocks, trains, taskData), [blocks, trains, taskData]);
  const [gen, setGen] = useState(false);

  const weeks = useMemo(() => {
    const mk = (label, filter) => {
      const list = blocks.filter(filter);
      const conflicts = list.filter(b => analyzer.analyze(b).hasConflict).length;
      const util = list.length ? Math.round(list.reduce((s, b) => s + (parseInt(String(b.utilization || '0').replace('%', ''), 10) || 0), 0) / list.length) : 0;
      return { label, count: list.length, conflicts, util, blocks: list };
    };
    return [
      mk('Week 1 · Mon–Tue', b => ['Monday', 'Tuesday'].includes(b.date)),
      mk('Week 2 · Wed–Thu', b => ['Wednesday', 'Thursday'].includes(b.date)),
      mk('Week 3 · Fri–Sat', b => ['Friday', 'Saturday'].includes(b.date)),
      mk('Week 4 · Sunday', b => b.date === 'Sunday'),
    ];
  }, [blocks, analyzer]);

  const corridorPlan = useMemo(() => {
    return ['C1', 'C2', 'C3', 'C4'].map(c => {
      const list = blocks.filter(b => b.corridor === c);
      const tasks = list.flatMap(b => b.tasks.map(t => t.id));
      const conflicts = list.filter(b => analyzer.analyze(b).hasConflict).length;
      return { c, blocks: list.length, tasks: tasks.length, conflicts };
    });
  }, [blocks, analyzer]);

  const generate = () => {
    if (gen) { showToast('Plan already generated this session', 'info'); return; }
    setGen(true);
    showToast('Generating AI monthly plan...', 'info');
    setTimeout(() => {
      const opt = aiBuildOptimizedPlan(blocks, session);
      const m = aiPlanMetrics(opt.working, session);
      showToast(`Monthly plan generated with ${opt.working.length} optimized blocks!`, 'success');
      addNotification(`AI monthly plan generated: ${opt.working.length} blocks, ${m.avgUtil}% utilization`);
    }, 1200);
  };

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="page-title">Monthly Plan</div>
          <div className="page-description">Four-week maintenance outlook with conflict load and utilization by corridor.</div>
        </div>
        <button className="btn btn-primary" onClick={generate}><Sparkles width={15} height={15} /> Generate AI Monthly Plan</button>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
        <MetricCard label="Blocks this month" value={blocks.length} color="var(--blue)" />
        <MetricCard label="Total Conflicts" value={weeks.reduce((s, w) => s + w.conflicts, 0)} color="var(--red)" />
        <MetricCard label="Avg Utilization" value={Math.round(weeks.reduce((s, w) => s + w.util, 0) / (weeks.filter(w => w.count).length || 1)) + '%'} color="var(--green)" />
        <MetricCard label="Corridors Active" value={corridorPlan.filter(c => c.blocks > 0).length} color="var(--purple)" />
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
        {weeks.map(w => (
          <Panel key={w.label} title={w.label} icon={<CalendarDays width={16} height={16} color="var(--blue)" />}>
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span className="note">Blocks</span><b>{w.count}</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span className="note">Conflicts</span><b style={{ color: w.conflicts ? 'var(--red)' : 'var(--green)' }}>{w.conflicts}</b></div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}><span className="note">Utilization</span><b>{w.util}%</b></div>
                <ProgressBar value={w.util} color="var(--blue)" />
              </div>
              {w.blocks.slice(0, 3).map(b => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: 'var(--muted)' }}>
                  <span>{b.id} · {b.corridor} · {b.date}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate('/block-planner', { state: { openBlock: b.id } })} title="Edit block"><Pencil width={11} height={11} /></button>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>

      <Panel title="Monthly KPI Forecast" icon={<TrendingUp width={18} height={18} color="var(--green)" />}>
        <ForecastChart weeks={weeks} />
      </Panel>

      <Panel title="Corridor Roll-up" icon={<TrendingUp width={18} height={18} color="var(--green)" />}>
        <table className="table-app">
          <thead><tr><th>Corridor</th><th>Blocks</th><th>Tasks Planned</th><th>Conflicts</th><th>Status</th></tr></thead>
          <tbody>
            {corridorPlan.map(c => (
              <tr key={c.c}>
                <td><b>{c.c}</b></td>
                <td>{c.blocks}</td>
                <td>{c.tasks}</td>
                <td>{c.conflicts}</td>
                <td>{c.conflicts === 0 ? <Badge tone="low">Clear</Badge> : <Badge tone="critical">Attention</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}