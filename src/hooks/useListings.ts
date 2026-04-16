import { startTransition, useEffect, useState } from 'react';

import { fetchListings } from '../lib/listings';
import { ListingSummary } from '../types/listing';

type UseListingsResult = {
  listings: ListingSummary[];
  loading: boolean;
  sourceLabel: string;
  error: string;
};

export function useListings(): UseListingsResult {
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceLabel, setSourceLabel] = useState('Live listings from Supabase.');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      try {
        const nextListings = await fetchListings({ activeOnly: true, limit: 24 });

        if (!cancelled) {
          startTransition(() => {
            setListings(nextListings);
            setSourceLabel(nextListings.length ? 'Live listings from Supabase.' : 'No live listings yet. Publish the first one from the Post tab.');
            setError('');
            setLoading(false);
          });
        }
      } catch (loadError) {
        if (!cancelled) {
          startTransition(() => {
            setListings([]);
            setSourceLabel('We could not load live listings right now.');
            setError(loadError instanceof Error ? loadError.message : 'We could not load listings.');
            setLoading(false);
          });
        }
      }
    }

    loadListings();

    return () => {
      cancelled = true;
    };
  }, []);

  return { listings, loading, sourceLabel, error };
}
