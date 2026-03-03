import { useState, useEffect } from 'react';
import { fetchOpsConfig } from '../api';

export function useOpsConfig() {
  const [opsConfig, setOpsConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpsConfig()
      .then(setOpsConfig)
      .finally(() => setLoading(false));
  }, []);

  return { opsConfig, loading };
}
