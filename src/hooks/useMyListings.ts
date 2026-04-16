import { useCallback, useEffect, useState } from 'react';

import { fetchListings } from '../lib/listings';
import { useAuth } from '../providers/AuthProvider';
import { ListingSummary } from '../types/listing';

type UseMyListingsResult = {
  listings: ListingSummary[];
  loading: boolean;
  error: string;
  refreshListings: () => Promise<void>;
};

export function useMyListings(): UseMyListingsResult {
  const { user } = useAuth();
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshListings = useCallback(async () => {
    if (!user) {
      setListings([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const nextListings = await fetchListings({ userId: user.id });
      setListings(nextListings);
      setError('');
      setLoading(false);
    } catch (loadError) {
      setListings([]);
      setError(loadError instanceof Error ? loadError.message : 'We could not load your listings.');
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshListings();
  }, [user]);

  return { listings, loading, error, refreshListings };
}
