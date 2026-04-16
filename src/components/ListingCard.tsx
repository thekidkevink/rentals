import { Link } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { formatCurrency } from '../lib/formatters';
import { usePreferences } from '../providers/PreferencesProvider';
import { ListingSummary } from '../types/listing';
import { HeroImage } from './HeroImage';
import { Pill } from './Pill';

type ListingCardProps = {
  listing: ListingSummary;
  compact?: boolean;
};

export function ListingCard({ listing, compact = false }: ListingCardProps) {
  const { palette } = usePreferences();
  const styles = createStyles(palette);

  return (
    <Link href={`/listing/${listing.id}`} asChild>
      <TouchableOpacity style={styles.card}>
        {!compact && <HeroImage imageUrl={listing.imageUrl} />}
        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.price}>{formatCurrency(listing.rentAmount)}</Text>
            <Pill label={listing.status === 'active' ? 'Live' : 'Closed'} tone={listing.status === 'active' ? 'success' : 'muted'} />
          </View>
          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.location}>
            {listing.suburb}, {listing.city}
          </Text>
          <View style={styles.tagRow}>
            <Pill label={listing.propertyType} />
            <Pill label={listing.furnished ? 'Furnished' : 'Unfurnished'} tone="soft" />
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const createStyles = (palette: ReturnType<typeof usePreferences>['palette']) =>
  StyleSheet.create({
    card: {
      backgroundColor: palette.card,
      borderRadius: 26,
      borderWidth: 1,
      borderColor: palette.border,
      overflow: 'hidden',
    },
    content: {
      padding: 18,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 10,
    },
    price: {
      color: palette.highlight,
      fontSize: 24,
      fontWeight: '800',
    },
    title: {
      color: palette.text,
      fontSize: 20,
      fontWeight: '700',
      marginTop: 8,
    },
    location: {
      color: palette.textMuted,
      fontSize: 15,
      marginTop: 6,
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 14,
    },
  });
