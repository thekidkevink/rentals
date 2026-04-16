import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListingCard } from '../../src/components/ListingCard';
import { SectionHeading } from '../../src/components/SectionHeading';
import { useListings } from '../../src/hooks/useListings';
import { usePreferences } from '../../src/providers/PreferencesProvider';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = usePreferences();
  const styles = createStyles(palette);
  const { listings, error } = useListings();
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const filteredListings = useMemo(() => {
    const lower = query.trim().toLowerCase();
    const min = minPrice.trim() ? Number(minPrice) : null;
    const max = maxPrice.trim() ? Number(maxPrice) : null;

    return listings.filter((listing) => {
      const matchesQuery = !lower
        ? true
        : [listing.title, listing.city, listing.suburb, listing.propertyType].some((value) => value.toLowerCase().includes(lower));
      const matchesMin = min === null || listing.rentAmount >= min;
      const matchesMax = max === null || listing.rentAmount <= max;

      return matchesQuery && matchesMin && matchesMax;
    });
  }, [listings, maxPrice, minPrice, query]);

  const averagePrice = filteredListings.length
    ? Math.round(filteredListings.reduce((total, item) => total + item.rentAmount, 0) / filteredListings.length)
    : 0;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
      <Text style={styles.title}>Search listings</Text>
      <Text style={styles.subtitle}>Search for places by suburb, city, or property type.</Text>

      <TextInput
        placeholder="Search by suburb, city, or type"
        placeholderTextColor={palette.textMuted}
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />

      <View style={styles.filterRow}>
        <TextInput
          placeholder="Min price"
          placeholderTextColor={palette.textMuted}
          value={minPrice}
          onChangeText={setMinPrice}
          style={[styles.input, styles.filterInput]}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Max price"
          placeholderTextColor={palette.textMuted}
          value={maxPrice}
          onChangeText={setMaxPrice}
          style={[styles.input, styles.filterInput]}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{filteredListings.length}</Text>
          <Text style={styles.metricLabel}>Results</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{averagePrice ? `N$${averagePrice}` : '--'}</Text>
          <Text style={styles.metricLabel}>Avg room</Text>
        </View>
      </View>

      <SectionHeading title="Matches" subtitle="Live search results from Supabase." />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.list}>
        {filteredListings.length ? (
          filteredListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No matches yet</Text>
            <Text style={styles.emptyBody}>Try a different suburb, city, or property type, or publish the first listing for that area.</Text>
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
  title: {
    color: palette.text,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
  },
  input: {
    marginTop: 18,
    backgroundColor: palette.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    color: palette.text,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  filterInput: {
    flex: 1,
    marginTop: 0,
  },
  metricCard: {
    flex: 1,
    backgroundColor: palette.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
  },
  metricValue: {
    color: palette.highlight,
    fontSize: 28,
    fontWeight: '800',
  },
  metricLabel: {
    color: palette.textMuted,
    marginTop: 6,
    fontSize: 14,
  },
  list: {
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
    lineHeight: 20,
    marginBottom: 12,
  },
});
