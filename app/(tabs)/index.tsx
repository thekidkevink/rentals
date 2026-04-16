import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListingCard } from '../../src/components/ListingCard';
import { SectionHeading } from '../../src/components/SectionHeading';
import { useListings } from '../../src/hooks/useListings';
import { usePreferences } from '../../src/providers/PreferencesProvider';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = usePreferences();
  const styles = createStyles(palette);
  const { listings, error } = useListings();
  const featured = listings.slice(0, 3);
  const quickFilters = [...new Set(listings.flatMap((listing) => [listing.propertyType, listing.suburb]).filter(Boolean))].slice(0, 5);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
      <LinearGradient colors={[palette.heroStart, palette.heroEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Text style={styles.heroEyebrow}>Namibia rentals</Text>
        <Text style={styles.heroTitle}>Find the next room worth visiting before it disappears into statuses.</Text>
        <Text style={styles.heroBody}>
          Browse rooms, shared spaces, and affordable flats in one place.
        </Text>
        <View style={styles.heroActions}>
          <Link href="/search" asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonLabel}>Browse listings</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/post" asChild>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonLabel}>Post a place</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </LinearGradient>

      <View style={styles.section}>
        <SectionHeading title="Quick picks" subtitle="Filters we expect people to use most on day one." />
        <View style={styles.filterRow}>
          {quickFilters.map((filter) => (
            <View key={filter} style={styles.filterChip}>
              <Text style={styles.filterLabel}>{filter}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeading title="Featured right now" subtitle="Places worth checking today." />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.stack}>
          {featured.length ? featured.map((listing) => <ListingCard key={listing.id} listing={listing} />) : <EmptyState body="Live listings will appear here as soon as people start posting." />}
        </View>
      </View>
    </ScrollView>
  );
}

function EmptyState({ body }: { body: string }) {
  const { palette } = usePreferences();
  const styles = createStyles(palette);

  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>Nothing featured yet</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

const createStyles = (palette: ReturnType<typeof usePreferences>['palette']) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    paddingTop: 12,
    paddingBottom: 30,
  },
  hero: {
    marginHorizontal: 18,
    padding: 22,
    borderRadius: 28,
  },
  heroEyebrow: {
    color: palette.text,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontWeight: '700',
    fontSize: 12,
  },
  heroTitle: {
    color: palette.text,
    fontSize: 31,
    fontWeight: '800',
    lineHeight: 37,
    marginTop: 14,
  },
  heroBody: {
    color: palette.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
  },
  heroActions: {
    gap: 12,
    marginTop: 22,
  },
  primaryButton: {
    backgroundColor: palette.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonLabel: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  secondaryButtonLabel: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    marginHorizontal: 18,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  filterLabel: {
    color: palette.text,
    fontWeight: '600',
  },
  stack: {
    gap: 14,
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
  error: {
    color: '#FF9D8A',
    marginBottom: 12,
    lineHeight: 20,
  },
});
