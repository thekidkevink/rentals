import { useEffect, useState } from 'react';

import { fetchListingById } from '../lib/listings';
import { ListingSummary } from '../types/listing';

export function useListingDetails(id: string) {
  const [listing, setListing] = useState<ListingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) {
        setListing(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const nextListing = await fetchListingById(id);

        if (!cancelled) {
          setListing(nextListing);
          setError('');
          setLoading(false);
        }
      } catch (loadError) {
        if (!cancelled) {
          setListing(null);
          setError(loadError instanceof Error ? loadError.message : 'We could not load this listing.');
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { listing, loading, error };
}
