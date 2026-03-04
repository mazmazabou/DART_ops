import React, { useRef, useEffect } from 'react';

// Chart.js is loaded from CDN and available on the global scope.
const Chart = window.Chart;

/**
 * ChartCanvas — lifecycle wrapper for Chart.js.
 *
 * The parent widget is responsible for pre-resolving CSS custom-property
 * colors via `resolveColor()` before building the chartConfig object.
 *
 * @param {object}  chartConfig - Full Chart.js configuration object
 * @param {Array}   [plugins]   - Optional array of Chart.js plugins
 */
export default function ChartCanvas({ chartConfig, plugins }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !chartConfig) return;

    // Destroy any previous instance
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const config = { ...chartConfig };
    if (plugins && plugins.length) {
      config.plugins = [...(config.plugins || []), ...plugins];
    }

    chartRef.current = new Chart(canvasRef.current, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [chartConfig, plugins]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
