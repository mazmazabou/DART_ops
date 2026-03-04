import React, { useRef, useEffect } from 'react';
import { resolveColor } from '../constants';
import { getCampusPalette, getCampusSlug, hexToRgb } from '../../../../utils/campus';

const Chart = window.Chart;

export default function RideVolumeWidget({ data }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const items = data?.data;
    if (!items || items.length === 0 || !canvasRef.current || !Chart) return;

    const palette = getCampusPalette(getCampusSlug());
    const primaryColor = palette[0] || '#4682B4';
    const rgbStr = hexToRgb(primaryColor);

    const ctx = canvasRef.current.getContext('2d');

    const labels = items.map((d) => {
      const dt = new Date(d.date);
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const totals = items.map((d) => d.total || 0);

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Rides',
            data: totals,
            borderColor: primaryColor,
            backgroundColor: (context) => {
              const chartCtx = context.chart.ctx;
              const gradient = chartCtx.createLinearGradient(0, 0, 0, context.chart.height);
              gradient.addColorStop(0, 'rgba(' + rgbStr + ', 0.35)');
              gradient.addColorStop(1, 'rgba(' + rgbStr + ', 0.02)');
              return gradient;
            },
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointHoverRadius: 5,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (tipItems) => {
                const idx = tipItems[0]?.dataIndex;
                if (idx == null) return '';
                const d = items[idx];
                return new Date(d.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              },
              label: (tipItem) => {
                const idx = tipItem.dataIndex;
                const d = items[idx];
                return d.total + ' rides (' + (d.completed || 0) + ' completed, ' + (d.noShows || 0) + ' no-shows, ' + (d.cancelled || 0) + ' cancelled)';
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { maxTicksLimit: 12 },
          },
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data]);

  const items = data?.data;
  if (!items || items.length === 0) {
    return (
      <div className="ro-empty" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted, #6b7280)' }}>
        <i className="ti ti-chart-area-line" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }} />
        No ride volume data available
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
