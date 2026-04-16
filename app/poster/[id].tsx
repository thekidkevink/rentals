import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListingCard } from '../../src/components/ListingCard';
import { fetchListings } from '../../src/lib/listings';
import { fetchPublicProfile, PublicProfile } from '../../src/lib/profiles';
import { usePreferences } from '../../src/providers/PreferencesProvider';
import { ListingSummary } from '../../src/types/listing';

export default function PosterProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { palette } = usePreferences();
  const styles = createStyles(palette);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) {
        setLoading(false);
        setError('This profile could not be found.');
        return;
      }

      setLoading(true);

      try {
        const [nextProfile, nextListings] = await Promise.all([
          fetchPublicProfile(id),
          fetchListings({ userId: id, activeOnly: true, limit: 6 }),
        ]);

        if (cancelled) {
          return;
        }

        setProfile(nextProfile);
        setListings(nextListings);
        setError(nextProfile ? '' : 'This profile could not be found.');
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'We could not load this profile right now.');
          setProfile(null);
          setListings([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const initials = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .map((value) => value?.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonLabel}>Back</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Loading profile...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Profile unavailable</Text>
          <Text style={styles.emptyBody}>{error}</Text>
        </View>
      ) : profile ? (
        <>
          <View style={styles.heroCard}>
            <View style={styles.avatarWrap}>
              {profile.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>{initials || 'U'}</Text>
                </View>
              )}
            </View>
            <Text style={styles.name}>{[profile.firstName, profile.lastName].filter(Boolean).join(' ')}</Text>
            <Text style={styles.subtext}>{profile.bio || 'This poster has not added a bio yet.'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active listings</Text>
            {listings.length ? (
              <View style={styles.list}>
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} compact />
                ))}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No active listings right now</Text>
                <Text style={styles.emptyBody}>This poster does not have any live places at the moment.</Text>
              </View>
            )}
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const createStyles = (palette: ReturnType<typeof usePreferences>['palette']) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: palette.background,
    },
    content: {
      paddingHorizontal: 18,
      paddingBottom: 30,
      gap: 18,
    },
    backButton: {
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: palette.card,
    },
    backButtonLabel: {
      color: palette.text,
      fontWeight: '600',
    },
    heroCard: {
      backgroundColor: palette.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: palette.border,
      padding: 22,
      alignItems: 'center',
    },
    avatarWrap: {
      width: 100,
      height: 100,
      borderRadius: 50,
      overflow: 'hidden',
      backgroundColor: palette.surface,
      marginBottom: 16,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarFallback: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.illustrationBlock,
    },
    avatarText: {
      color: palette.text,
      fontSize: 32,
      fontWeight: '800',
    },
    name: {
      color: palette.text,
      fontSize: 24,
      fontWeight: '800',
      textAlign: 'center',
    },
    subtext: {
      color: palette.textMuted,
      marginTop: 10,
      lineHeight: 22,
      textAlign: 'center',
    },
    section: {
      gap: 12,
    },
    sectionTitle: {
      color: palette.text,
      fontSize: 20,
      fontWeight: '700',
    },
    list: {
      gap: 12,
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
  });
