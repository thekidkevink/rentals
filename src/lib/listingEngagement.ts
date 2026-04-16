import { supabase } from './supabase';
import { mapListingRow, normalizedListingSelect, NormalizedListingRow } from './listingMapper';

export async function fetchSavedListingIds(userId: string) {
  const { data, error } = await supabase.from('saved_listings').select('listing_id').eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((item) => item.listing_id);
}

export async function fetchSavedListings(userId: string) {
  const listingIds = await fetchSavedListingIds(userId);

  if (!listingIds.length) {
    return [];
  }

  const { data, error } = await supabase.from('listings').select(normalizedListingSelect).in('id', listingIds).order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as NormalizedListingRow[]).map(mapListingRow);
}

export async function fetchReportCount(userId: string) {
  const { count, error } = await supabase
    .from('listing_reports')
    .select('id', { count: 'exact', head: true })
    .eq('reporter_user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function toggleSavedListing(listingId: string, isSaved: boolean) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Please sign in to save listings.');
  }

  if (isSaved) {
    const { error } = await supabase.from('saved_listings').delete().eq('user_id', user.id).eq('listing_id', listingId);
    if (error) {
      throw new Error(error.message);
    }
    return false;
  }

  const { error } = await supabase.from('saved_listings').upsert({ user_id: user.id, listing_id: listingId });
  if (error) {
    throw new Error(error.message);
  }
  return true;
}

export async function submitListingReport(input: { listingId: string; reason: string; notes: string }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Please sign in to report a listing.');
  }

  const { error } = await supabase.from('listing_reports').insert({
    listing_id: input.listingId,
    reporter_user_id: user.id,
    reason: input.reason.trim(),
    notes: input.notes.trim(),
  });

  if (error) {
    throw new Error(error.message);
  }
}
