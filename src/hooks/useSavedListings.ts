import { useCallback, useEffect, useState } from 'react';

import { fetchSavedListingIds, fetchSavedListings } from '../lib/listingEngagement';
import { useAuth } from '../providers/AuthProvider';
import { ListingSummary } from '../types/listing';

type UseSavedListingsResult = {
  savedListingIds: string[];
  savedListings: ListingSummary[];
  loading: boolean;
  refreshSavedListings: () => Promise<void>;
};

export function useSavedListings(): UseSavedListingsResult {
  const { user } = useAuth();
  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
  const [savedListings, setSavedListings] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshSavedListings = useCallback(async () => {
    if (!user) {
      setSavedListingIds([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [ids, listings] = await Promise.all([fetchSavedListingIds(user.id), fetchSavedListings(user.id)]);
      setSavedListingIds(ids);
      setSavedListings(listings);
    } catch {
      setSavedListingIds([]);
      setSavedListings([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshSavedListings();
  }, [user]);

  return { savedListingIds, savedListings, loading, refreshSavedListings };
}
