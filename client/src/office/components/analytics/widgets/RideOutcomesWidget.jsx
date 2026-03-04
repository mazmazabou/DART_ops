import React, { useRef, useEffect } from 'react';
import { resolveColor } from '../constants';

const Chart = window.Chart;

// Center text plugin for doughnut chart
const centerTextPlugin = {
  id: 'rideOutcomesCenterText',
  afterDraw(chart) {
    const meta = chart.getDatasetMeta(0);
    if (!meta || !meta.data || meta.data.length === 0) return;

    const { ctx, width, height } = chart;
    const total = chart.config.options.plugins.centerText?.total;
    if (total == null) return;

    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 1.5rem system-ui, -apple-system, sans-serif';
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim() || '#1f2937';
    ctx.fillText(total.toLocaleString(), centerX, centerY - 8);

    ctx.font = '0.7rem system-ui, -apple-system, sans-serif';
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text-muted').trim() || '#6b7280';
    ctx.fillText('total rides', centerX, centerY + 14);

    ctx.restore();
  },
};

export default function RideOutcomesWidget({ data }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const dist = data?.distribution;
    if (!dist || !canvasRef.current || !Chart) return;

    const completed = dist.completed || 0;
    const noShows = dist.noShows || 0;
    const cancelled = dist.cancelled || 0;
    const denied = dist.denied || 0;
    const total = completed + noShows + cancelled + denied;

    if (total === 0) return;

    const ctx = canvasRef.current.getContext('2d');

    const colors = [
      resolveColor('var(--status-completed)') || '#2fb344',
      resolveColor('var(--color-warning)') || '#f59f00',
      resolveColor('var(--status-cancelled)') || '#6c757d',
      resolveColor('var(--status-denied)') || '#d63939',
    ];

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'No-Shows', 'Cancelled', 'Denied'],
        datasets: [
          {
            data: [completed, noShows, cancelled, denied],
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-card-bg').trim() || '#fff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 12,
              usePointStyle: true,
              pointStyleWidth: 8,
            },
          },
          tooltip: {
            callbacks: {
              label: (tipItem) => {
                const val = tipItem.raw;
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
                return tipItem.label + ': ' + val + ' (' + pct + '%)';
              },
            },
          },
          centerText: { total },
        },
      },
      plugins: [centerTextPlugin],
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data]);

  const dist = data?.distribution;
  const total = dist ? (dist.completed || 0) + (dist.noShows || 0) + (dist.cancelled || 0) + (dist.denied || 0) : 0;

  if (!dist || total === 0) {
    return (
      <div className="ro-empty" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted, #6b7280)' }}>
        <i className="ti ti-chart-donut-3" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }} />
        No ride outcome data available
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
