import React, { useRef, useEffect } from 'react';
import { getCampusPalette, getCampusSlug } from '../../../../utils/campus';

const Chart = window.Chart;

export default function RidesByDOWWidget({ data }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    if (!data || data.length === 0 || !canvasRef.current || !Chart) return;

    const palette = getCampusPalette(getCampusSlug());
    const ctx = canvasRef.current.getContext('2d');

    const labels = data.map((d) => d.label);
    const counts = data.map((d) => d.count || 0);
    const colors = data.map((_, i) => palette[i % palette.length]);

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Rides',
            data: counts,
            backgroundColor: colors,
            borderRadius: 4,
            borderSkipped: false,
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
              label: (tipItem) => tipItem.raw + ' rides',
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
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

  if (!data || data.length === 0) {
    return (
      <div className="ro-empty" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted, #6b7280)' }}>
        <i className="ti ti-calendar-stats" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }} />
        No day-of-week data available
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
