import { useEffect, useState } from 'react';
import { getCountries } from '../services/countryService';
import { normalizeMessage } from '../utils/formatUtils';
import type { ICountry } from '../types/ICountry';

export function useCountries() {
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const response = await getCountries();
      if (cancelled) return;

      if (response.success && response.data) {
        setCountries(response.data);
      } else {
        setError(normalizeMessage(response.message, 'Failed to load countries')); // fixed
      }
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, []);

  return { countries, loading, error };
}