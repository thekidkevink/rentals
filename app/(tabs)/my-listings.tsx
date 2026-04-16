import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListingCard } from '../../src/components/ListingCard';
import { updateListingStatus } from '../../src/lib/listings';
import { useMyListings } from '../../src/hooks/useMyListings';
import { usePreferences } from '../../src/providers/PreferencesProvider';
import { useAuth } from '../../src/providers/AuthProvider';
import { useState } from 'react';

export default function MyListingsScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = usePreferences();
  const styles = createStyles(palette);
  const { user, loading: authLoading } = useAuth();
  const { listings, loading, error, refreshListings } = useMyListings();
  const [busyId, setBusyId] = useState('');
  const [actionError, setActionError] = useState('');

  async function handleStatusChange(listingId: string, nextStatus: 'active' | 'rented') {
    setActionError('');
    setBusyId(listingId);

    try {
      await updateListingStatus(listingId, nextStatus);
      await refreshListings();
    } catch (statusError) {
      setActionError(statusError instanceof Error ? statusError.message : 'We could not update the listing status.');
    } finally {
      setBusyId('');
    }
  }

  if (authLoading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Loading your account...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Your listings live behind sign-in now.</Text>
        <Text style={styles.subtitle}>Once you sign in, this tab will only show the places attached to your account.</Text>
        <Link href="/auth/sign-in" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonLabel}>Sign in</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
      <Text style={styles.title}>My listings</Text>
      <Text style={styles.subtitle}>Only listings created by {user.email ?? 'your account'} appear here.</Text>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryValue}>{loading ? '...' : listings.length}</Text>
          <Text style={styles.summaryLabel}>Owned listings</Text>
        </View>
        <View>
          <Text style={styles.summaryValue}>{loading ? '...' : listings.filter((item) => item.status === 'active').length}</Text>
          <Text style={styles.summaryLabel}>Currently live</Text>
        </View>
      </View>

      <View style={styles.list}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
        {listings.length ? (
          listings.map((listing) => (
            <View key={listing.id} style={styles.listingWrap}>
              <ListingCard listing={listing} compact />
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => handleStatusChange(listing.id, listing.status === 'active' ? 'rented' : 'active')}
                disabled={busyId === listing.id}
              >
                <Text style={styles.secondaryButtonLabel}>
                  {busyId === listing.id ? 'Updating...' : listing.status === 'active' ? 'Mark as rented' : 'Make live again'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No listings yet.</Text>
            <Text style={styles.emptyBody}>Post your first room or flat and it will appear here right after publish.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const createStyles = (palette: ReturnType<typeof usePreferences>['palette']) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    padding: 18,
    paddingTop: 12,
    paddingBottom: 30,
  },
  centered: {
    flex: 1,
    backgroundColor: palette.background,
    padding: 18,
    justifyContent: 'center',
  },
  title: {
    color: palette.text,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
  },
  summaryCard: {
    marginTop: 18,
    backgroundColor: palette.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryValue: {
    color: palette.highlight,
    fontSize: 28,
    fontWeight: '800',
  },
  summaryLabel: {
    color: palette.textMuted,
    marginTop: 6,
  },
  list: {
    gap: 14,
    marginTop: 18,
  },
  listingWrap: {
    gap: 10,
  },
  emptyCard: {
    backgroundColor: palette.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 20,
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyBody: {
    color: palette.textMuted,
    marginTop: 8,
    lineHeight: 22,
  },
  button: {
    marginTop: 24,
    backgroundColor: palette.primary,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonLabel: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: palette.surface,
  },
  secondaryButtonLabel: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  error: {
    color: '#FF9D8A',
    lineHeight: 20,
  },
});
