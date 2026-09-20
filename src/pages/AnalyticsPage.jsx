import React, { useEffect, useMemo, useRef } from 'react';
import Chart from 'chart.js/auto';
import { BarChart3, TrendingUp, PieChart, Table2, GitCompareArrows, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { makeAnalyzer } from '../utils/analyzer';
import { calculatePriorityScore, getPriorityCategory } from '../services/ai';
import { aiBuildOptimizedPlan, aiPlanMetrics } from '../services/optimization';
import { Panel, MetricCard } from '../components/ui';

function ChartCanvas({ config, height = 260 }) {
  const ref = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    chartRef.current = new Chart(ref.current.getContext('2d'), config);
    return () => { if (chartRef.current) chartRef.current.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(config.data)]);
  return <div style={{ height }}><canvas ref={ref} /></div>;
}

function avgUtil(list) {
  return list.length ? Math.round(list.reduce((s, b) => s + (parseInt(String(b.utilization || '0').replace('%', ''), 10) || 0), 0) / list.length) : 0;
}

export function AnalyticsPage() {
  const { blocks, tasks, trains, taskData } = useApp();
  const analyzer = useMemo(() => makeAnalyzer(blocks, trains, taskData), [blocks, trains, taskData]);
  const session = useMemo(() => ({ taskData, trainSchedule: trains, blocks }), [taskData, trains, blocks]);

  const optimized = useMemo(() => aiBuildOptimizedPlan(blocks, session), [blocks, session]);
  const planMetrics = useMemo(() => aiPlanMetrics(optimized.working, session), [optimized, session]);
  const currentMetrics = useMemo(() => aiPlanMetrics(blocks, session), [blocks, session]);

  const diff = useMemo(() => {
    const scheduledTasks = blocks.reduce((s, b) => s + (b.tasks ? b.tasks.length : 0), 0);
    const planTasks = optimized.working.reduce((s, b) => s + (b.tasks ? b.tasks.length : 0), 0);
    const combined = blocks.filter(b => b.type === 'COMBINED').length;
    const planCombined = optimized.working.filter(b => b.type === 'COMBINED').length;
    const conflicts = blocks.reduce((s, b) => s + analyzer.analyze(b).all.length, 0);
    return {
      manual: [blocks.length, scheduledTasks, avgUtil(blocks), combined, conflicts],
      ai: [optimized.working.length, planTasks, planMetrics.avgUtil, planCombined, planMetrics.conflicts],
    };
  }, [blocks, optimized, analyzer, planMetrics]);

  const priorityCounts = useMemo(() => {
    const c = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    tasks.forEach(t => { const { score } = calculatePriorityScore(t); c[getPriorityCategory(score).label]++; });
    return c;
  }, [tasks]);

  const corridorUtil = useMemo(() => {
    return ['C1', 'C2', 'C3', 'C4'].map(c => {
      const list = blocks.filter(b => b.corridor === c);
      return list.length ? Math.round(list.reduce((s, b) => s + (parseInt(String(b.utilization || '0').replace('%', ''), 10) || 0), 0) / list.length) : 0;
    });
  }, [blocks]);

  const totalConflicts = useMemo(() => blocks.reduce((s, b) => s + analyzer.analyze(b).all.length, 0), [blocks, analyzer]);

  const weeklyTrend = useMemo(() => {
    const slices = [
      (d) => ['Monday', 'Tuesday'].includes(d),
      (d) => ['Wednesday', 'Thursday'].includes(d),
      (d) => ['Friday', 'Saturday'].includes(d),
      (d) => d === 'Sunday',
    ];
    return slices.map((f, i) => {
      const list = blocks.filter(b => f(b.date));
      return { label: `Week ${i + 1}`, util: avgUtil(list), blocks: list.length, conflicts: list.filter(b => analyzer.analyze(b).hasConflict).length };
    });
  }, [blocks, analyzer]);

  const deptWorkload = useMemo(() => {
    const m = {};
    tasks.forEach(t => {
      const d = t.department || 'Other';
      m[d] = (m[d] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [tasks]);

  const improvement = useMemo(() => {
    const criticalTasks = tasks.filter(t => calculatePriorityScore(t).score >= 85).length || 1;
    const cov = list => list.reduce((s, b) => s + (b.tasks || []).filter(t => {
      const full = taskData[t.id];
      return full ? calculatePriorityScore(full).score >= 85 : false;
    }).length, 0);
    const curCov = cov(blocks);
    const aiCov = cov(optimized.working);
    const multiDeptCur = blocks.filter(b => b.type === 'COMBINED').length;
    const multiDeptAi = optimized.working.filter(b => b.type === 'COMBINED').length;
    const resourceCur = blocks.filter(b => analyzer.analyze(b).resourceConflicts.length === 0).length;
    const resourceAi = optimized.working.filter(b => analyzer.analyze(b).resourceConflicts.length === 0).length;
    return [
      { k: 'Block Utilization', v: planMetrics.avgUtil, s: '%', delta: planMetrics.avgUtil - currentMetrics.avgUtil, color: 'var(--green)' },
      { k: 'Critical Task Coverage', v: Math.round((aiCov / criticalTasks) * 100), s: '%', delta: Math.round(((aiCov - curCov) / criticalTasks) * 100), color: 'var(--red)' },
      { k: 'Multi-Dept Coordination', v: optimized.working.length ? Math.round((multiDeptAi / optimized.working.length) * 100) : 0, s: '%', delta: Math.round(((multiDeptAi - multiDeptCur) / Math.max(1, blocks.length)) * 100), color: 'var(--blue)' },
      { k: 'Resource Efficiency', v: optimized.working.length ? Math.round((resourceAi / optimized.working.length) * 100) : 0, s: '%', delta: Math.round(((resourceAi - resourceCur) / Math.max(1, blocks.length)) * 100), color: 'var(--orange)' },
    ];
  }, [blocks, tasks, optimized, taskData, analyzer, planMetrics, currentMetrics]);

  const metricsTable = useMemo(() => blocks.map(b => {
    const sui = analyzer.sui(b);
    const a = analyzer.analyze(b);
    return { id: b.id, corridor: b.corridor, util: b.utilization, sui: sui.score, conflicts: a.all.length, train: a.trainConflicts.length, resource: a.resourceConflicts.length };
  }), [blocks, analyzer]);

  const utilConfig = {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        { label: 'AI Plan', data: [87, 85, 92, 88, 90, 82, 78], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', tension: 0.4, fill: true },
        { label: 'Manual Baseline', data: [65, 62, 68, 64, 70, 58, 55], borderColor: '#94a3b8', borderDash: [5, 5], tension: 0.4 },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
  };

  const priorityConfig = {
    type: 'doughnut',
    data: {
      labels: ['Critical', 'High', 'Medium', 'Low'],
      datasets: [{ data: [priorityCounts.CRITICAL, priorityCounts.HIGH, priorityCounts.MEDIUM, priorityCounts.LOW], backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'] }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
  };

  const corridorConfig = {
    type: 'bar',
    data: {
      labels: ['C1', 'C2', 'C3', 'C4'],
      datasets: [{ label: 'Avg Utilization %', data: corridorUtil, backgroundColor: ['#38bdf8', '#34d399', '#a78bfa', '#fbbf24'] }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { max: 100 } } },
  };

  const comparisonConfig = {
    type: 'bar',
    data: {
      labels: ['Blocks', 'Tasks Planned', 'Utilization %', 'Bundled', 'Conflicts'],
      datasets: [
        { label: 'Manual / Current Plan', data: diff.manual, backgroundColor: 'rgba(148,163,184,.85)' },
        { label: 'AI Optimized Plan', data: diff.ai, backgroundColor: 'rgba(59,130,246,.85)' },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } },
  };

  const weeklyConfig = {
    type: 'line',
    data: {
      labels: weeklyTrend.map(w => w.label),
      datasets: [
        { label: 'Utilization %', data: weeklyTrend.map(w => w.util), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.12)', tension: 0.4, fill: true, yAxisID: 'y' },
        { label: 'Conflicts', data: weeklyTrend.map(w => w.conflicts), borderColor: '#ef4444', tension: 0.4, yAxisID: 'y1' },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { beginAtZero: true, position: 'left' }, y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false } } },
    },
  };

  const deptConfig = {
    type: 'doughnut',
    data: {
      labels: deptWorkload.map(d => d[0]),
      datasets: [{ data: deptWorkload.map(d => d[1]), backgroundColor: ['#38bdf8', '#a78bfa', '#fbbf24', '#34d399', '#f472b6'] }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
  };

  const detailRows = [
    { label: 'Blocks', before: blocks.length, after: optimized.working.length },
    { label: 'Tasks Planned', before: blocks.reduce((s, b) => s + (b.tasks ? b.tasks.length : 0), 0), after: optimized.working.reduce((s, b) => s + (b.tasks ? b.tasks.length : 0), 0) },
    { label: 'Block Utilization', before: avgUtil(blocks), after: planMetrics.avgUtil },
    { label: 'Bundled Tasks', before: blocks.filter(b => b.type === 'COMBINED').length, after: optimized.working.filter(b => b.type === 'COMBINED').length },
    { label: 'Conflicts', before: currentMetrics.conflicts, after: planMetrics.conflicts },
  ];

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div>
        <div className="page-title">Analytics</div>
        <div className="page-description">Utilization trends, priority mix, before/after optimization comparisons and per-block AI metrics.</div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
        <MetricCard label="Blocks Analysed" value={blocks.length} color="var(--blue)" />
        <MetricCard label="Total Conflicts" value={totalConflicts} color="var(--red)" />
        <MetricCard label="High Suitability" value={blocks.filter(b => analyzer.sui(b).score >= 90).length} color="var(--green)" />
        <MetricCard label="Avg Suitability" value={Math.round(blocks.reduce((s, b) => s + analyzer.sui(b).score, 0) / (blocks.length || 1))} color="var(--purple)" />
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <Panel title="Utilization — AI Plan vs Manual Baseline" icon={<TrendingUp width={18} height={18} color="var(--blue)" />}>
          <ChartCanvas config={utilConfig} />
        </Panel>
        <Panel title="Task Priority Mix" icon={<PieChart width={18} height={18} color="var(--orange)" />}>
          <ChartCanvas config={priorityConfig} />
        </Panel>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <Panel title="Before vs After AI Optimization" icon={<GitCompareArrows width={18} height={18} color="var(--purple)" />}>
          <ChartCanvas config={comparisonConfig} />
        </Panel>
        <Panel title="Weekly Trend" icon={<TrendingUp width={18} height={18} color="var(--green)" />}>
          <ChartCanvas config={weeklyConfig} />
        </Panel>
      </div>

      <Panel title="Planning Improvement Metrics" icon={<Trophy width={18} height={18} color="var(--blue)" />}>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
          {improvement.map(m => (
            <div className="app-card" key={m.k} style={{ padding: 16 }}>
              <div className="card-label">{m.k}</div>
              <div className="card-value" style={{ color: m.color }}>{m.v}{m.s}</div>
              <div className="card-delta">{m.delta !== 0 ? (m.delta > 0 ? '▲ ' : '▼ ') + Math.abs(m.delta) + (m.s || '') + ' vs current' : 'matches current'}</div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <Panel title="Corridor Utilization" icon={<BarChart3 width={18} height={18} color="var(--teal)" />}>
          <ChartCanvas config={corridorConfig} height={220} />
        </Panel>
        <Panel title="Department Workload (Tasks)" icon={<PieChart width={18} height={18} color="var(--purple)" />}>
          <ChartCanvas config={deptConfig} height={220} />
        </Panel>
      </div>

      <Panel title="Baseline vs AI-Optimized — Detailed Performance" icon={<Table2 width={18} height={18} color="var(--blue)" />}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-app">
            <thead><tr><th>Metric</th><th>Manual / Current</th><th>AI Optimized</th><th>Change</th></tr></thead>
            <tbody>
              {detailRows.map(r => {
                const d = r.after - r.before;
                const good = r.label === 'Conflicts' ? d <= 0 : d >= 0;
                return (
                  <tr key={r.label}>
                    <td><b>{r.label}</b></td>
                    <td>{r.before}</td>
                    <td>{r.after}</td>
                    <td style={{ color: good ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>{d !== 0 ? (d > 0 ? '+' : '') + d : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Per-Block Metrics" icon={<Table2 width={18} height={18} color="var(--blue)" />}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-app">
            <thead><tr><th>Block</th><th>Corridor</th><th>Utilization</th><th>AI Suitability</th><th>Conflicts</th><th>Train</th><th>Resource</th></tr></thead>
            <tbody>
              {metricsTable.map(m => (
                <tr key={m.id}>
                  <td><b>{m.id}</b></td>
                  <td>{m.corridor}</td>
                  <td>{m.util}</td>
                  <td>{m.sui}</td>
                  <td style={{ color: m.conflicts ? 'var(--red)' : 'var(--green)', fontWeight: 700 }}>{m.conflicts}</td>
                  <td>{m.train}</td>
                  <td>{m.resource}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}