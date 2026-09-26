import Chart from 'chart.js/auto';

function palette() {
  const dark =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark');
  return {
    grid: dark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(100, 116, 139, 0.14)',
    tick: dark ? 'rgba(163, 178, 198, 0.9)' : '#64748b',
    border: dark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(100, 116, 139, 0.22)',
    tooltipBg: dark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(15, 23, 42, 0.9)',
  };
}

export function applyChartTheme() {
  const p = palette();
  const fallback =
    '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  let font = fallback;
  if (typeof document !== 'undefined' && document.body) {
    font = getComputedStyle(document.body).fontFamily || fallback;
  }

  Chart.defaults.color = p.tick;
  Chart.defaults.borderColor = p.border;
  Chart.defaults.font.family = font;
  Chart.defaults.font.size = 12;
  Chart.defaults.font.weight = '500';

  Chart.defaults.plugins.tooltip.backgroundColor = p.tooltipBg;
  Chart.defaults.plugins.tooltip.titleColor = '#f8fafc';
  Chart.defaults.plugins.tooltip.bodyColor = 'rgba(241, 245, 249, 0.92)';
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.displayColors = false;
  Chart.defaults.plugins.tooltip.boxPadding = 4;
  Chart.defaults.plugins.tooltip.titleFont = { weight: '700', size: 12 };
  Chart.defaults.plugins.tooltip.bodyFont = { size: 12 };

  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.boxWidth = 7;
  Chart.defaults.plugins.legend.labels.boxHeight = 7;
  Chart.defaults.plugins.legend.labels.padding = 16;
  Chart.defaults.plugins.legend.labels.font = { size: 12, weight: '600' };
  Chart.defaults.plugins.legend.position = 'bottom';
  Chart.defaults.plugins.legend.align = 'center';

  Chart.defaults.set('scales.x.grid', { color: p.grid, drawBorder: false });
  Chart.defaults.set('scales.y.grid', { color: p.grid, drawBorder: false });
  Chart.defaults.set('scales.x.ticks', { padding: 8, maxTicksLimit: 14 });
  Chart.defaults.set('scales.y.ticks', { padding: 8 });
  Chart.defaults.set('scales.y1.grid', { drawOnChartArea: false, drawBorder: false });

  Chart.defaults.set('datasets.line', {
    borderWidth: 2,
    pointRadius: 3,
    pointHoverRadius: 5,
    pointBorderWidth: 1.5,
  });
  Chart.defaults.set('datasets.bar', { borderRadius: 4, maxBarThickness: 44 });
  Chart.defaults.set('datasets.doughnut', { borderWidth: 0 });
}

export function ensureChartTheme() {
  applyChartTheme();
}

export function isDarkTheme() {
  return (
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  );
}