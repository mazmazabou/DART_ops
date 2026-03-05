import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { getCampusPalette, getCampusSlug } from '../../../../utils/campus';

export default function RidesByHourWidget({ data }) {
  const { chartData, chartOptions } = useMemo(() => {
    if (!data || data.length === 0) return { chartData: null, chartOptions: null };

    const palette = getCampusPalette(getCampusSlug());
    const labels = data.map((d) => d.label);
    const counts = data.map((d) => d.count || 0);
    const colors = data.map((_, i) => palette[i % palette.length]);

    return {
      chartData: {
        labels,
        datasets: [{
          label: 'Rides',
          data: counts,
          backgroundColor: colors,
          borderRadius: 4,
          borderSkipped: false,
        }],
      },
      chartOptions: {
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
          x: { grid: { display: false }, ticks: { maxRotation: 45 } },
          y: { beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="ro-empty ao-empty">
        <i className="ti ti-clock-hour-4 ao-empty-icon" />
        No hourly data available
      </div>
    );
  }

  return (
    <div className="ao-chart-wrap">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}
