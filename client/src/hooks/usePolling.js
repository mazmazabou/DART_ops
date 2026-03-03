import { useEffect, useRef, useCallback } from 'react';

export function usePolling(callback, intervalMs) {
  const callbackRef = useRef(callback);
  const intervalRef = useRef(null);

  // Always use latest callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const start = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => callbackRef.current(), intervalMs);
  }, [intervalMs]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Call immediately
    callbackRef.current();
    start();

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        callbackRef.current();
        start();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [start, stop]);
}
