import { useState, useEffect } from 'react';

export default function NowLine({ startHour, cols }) {
  const [nowFraction, setNowFraction] = useState(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const nowHours = now.getHours() + now.getMinutes() / 60;
      if (nowHours >= startHour && nowHours < startHour + cols) {
        setNowFraction((nowHours - startHour) / cols);
      } else {
        setNowFraction(null);
      }
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [startHour, cols]);

  if (nowFraction === null) return null;

  return (
    <div
      className="time-grid__now-line"
      style={{ left: `calc(100px + (100% - 100px) * ${nowFraction})` }}
    />
  );
}
