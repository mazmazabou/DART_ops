import { useState, useEffect } from 'react';
import { fetchLocations } from '../api';

export function useLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations()
      .then(data => {
        const labels = data.map(loc =>
          typeof loc === 'string' ? loc : (loc.label || loc.value || '')
        ).filter(Boolean);
        setLocations(labels);
      })
      .catch(() => setLocations([]))
      .finally(() => setLoading(false));
  }, []);

  return { locations, loading };
}
