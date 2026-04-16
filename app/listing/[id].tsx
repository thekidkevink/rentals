import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeroImage } from '../../src/components/HeroImage';
import { Pill } from '../../src/components/Pill';
import { copyPhoneNumber, openPhoneDialer } from '../../src/lib/contact';
import { submitListingReport, toggleSavedListing } from '../../src/lib/listingEngagement';
import { useListingDetails } from '../../src/hooks/useListingDetails';
import { useSavedListings } from '../../src/hooks/useSavedListings';
import { formatCurrency, formatDate } from '../../src/lib/formatters';
import { openWhatsApp } from '../../src/lib/whatsapp';
import { usePreferences } from '../../src/providers/PreferencesProvider';
import { useAuth } from '../../src/providers/AuthProvider';

const reportReasons = ['Scam or fraud', 'Wrong price', 'Already rented', 'Misleading photos'];

export default function ListingDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = usePreferences();
  const styles = createStyles(palette);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { listing, loading, error } = useListingDetails(id ?? '');
  const { savedListingIds, refreshSavedListings } = useSavedListings();
  const [isSaving, setIsSaving] = useState(false);
  const [reportReason, setReportReason] = useState(reportReasons[0]);
  const [reportNotes, setReportNotes] = useState('');
  const [feedback, setFeedback] = useState('');
  const [reporting, setReporting] = useState(false);

  const isSaved = Boolean(listing && savedListingIds.includes(listing.id));

  async function handleSaveToggle() {
    if (!listing) {
      return;
    }

    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    setFeedback('');
    setIsSaving(true);

    try {
      const nextSaved = await toggleSavedListing(listing.id, isSaved);
      await refreshSavedListings();
      setFeedback(nextSaved ? 'Listing saved to your account.' : 'Listing removed from your saved places.');
    } catch (saveError) {
      setFeedback(saveError instanceof Error ? saveError.message : 'We could not update your saved listings.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReport() {
    if (!listing) {
      return;
    }

    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    setFeedback('');
    setReporting(true);

    try {
      await submitListingReport({ listingId: listing.id, reason: reportReason, notes: reportNotes });
      setReportNotes('');
      setFeedback('Report submitted. We can now review this listing from the backend.');
    } catch (reportError) {
      setFeedback(reportError instanceof Error ? reportError.message : 'We could not submit the report.');
    } finally {
      setReporting(false);
    }
  }

  if (!listing && !loading) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>This listing is no longer available.</Text>
        {error ? <Text style={styles.emptyBody}>{error}</Text> : null}
        <TouchableOpacity onPress={() => router.back()} style={styles.ghostButton}>
          <Text style={styles.ghostButtonLabel}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Loading listing...</Text>
      </View>
    );
  }

  const perks = [
    listing.furnished ? 'Furnished' : 'Unfurnished',
    ...listing.utilitiesIncluded,
    `Available ${formatDate(listing.availableFrom)}`,
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
      <View style={styles.heroWrap}>
        <HeroImage imageUrl={listing.imageUrl} />
      </View>
      {listing.imageUrls.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
          {listing.imageUrls.map((imageUrl, index) => (
            <View key={`${imageUrl}-${index}`} style={styles.galleryItem}>
              <HeroImage imageUrl={imageUrl} />
            </View>
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.ghostButton}>
          <Text style={styles.ghostButtonLabel}>Back</Text>
        </TouchableOpacity>
        <Pill label={listing.status === 'active' ? 'Available' : 'Rented'} tone={listing.status === 'active' ? 'success' : 'muted'} />
      </View>

      <Text style={styles.price}>{formatCurrency(listing.rentAmount)}</Text>
      <Text style={styles.title}>{listing.title}</Text>
      <Text style={styles.location}>
        {listing.suburb}, {listing.city}
      </Text>

      <View style={styles.tagRow}>
        <Pill label={listing.propertyType} />
        <Pill label={`Deposit ${formatCurrency(listing.depositAmount)}`} />
      </View>

      <Text style={styles.sectionTitle}>What stands out</Text>
      <View style={styles.tagRow}>
        {perks.map((perk) => (
          <Pill key={perk} label={perk} tone="soft" />
        ))}
      </View>

      <Text style={styles.sectionTitle}>About this place</Text>
      <Text style={styles.description}>{listing.description}</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          if (listing.posterId) {
            router.push({
              pathname: '/poster/[id]',
              params: { id: listing.posterId },
            });
          }
        }}
        disabled={!listing.posterId}
      >
        <Text style={styles.cardTitle}>Poster</Text>
        <Text style={styles.cardText}>{listing.posterName}</Text>
        <Text style={styles.cardSubtext}>{listing.posterId ? 'Tap to view profile' : 'Contact preference: WhatsApp'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSaveToggle} style={styles.secondaryButton} disabled={isSaving}>
        <Text style={styles.secondaryButtonLabel}>{isSaving ? 'Updating...' : isSaved ? 'Remove from saved' : 'Save this listing'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => openWhatsApp(listing.whatsappNumber, `Hi, I'm interested in "${listing.title}" in ${listing.suburb}. Is it still available?`)}
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonLabel}>Contact on WhatsApp</Text>
      </TouchableOpacity>

      <View style={styles.contactActionsRow}>
        <TouchableOpacity onPress={() => openPhoneDialer(listing.whatsappNumber)} style={styles.secondaryHalfButton}>
          <Text style={styles.secondaryButtonLabel}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            await copyPhoneNumber(listing.whatsappNumber);
            setFeedback('Phone number copied.');
          }}
          style={styles.secondaryHalfButton}
        >
          <Text style={styles.secondaryButtonLabel}>Copy number</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Report this listing</Text>
        <View style={styles.tagRow}>
          {reportReasons.map((reason) => (
            <TouchableOpacity key={reason} style={[styles.reasonChip, reportReason === reason && styles.reasonChipActive]} onPress={() => setReportReason(reason)}>
              <Text style={[styles.reasonLabel, reportReason === reason && styles.reasonLabelActive]}>{reason}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          value={reportNotes}
          onChangeText={setReportNotes}
          placeholder="Add a short note if needed"
          placeholderTextColor={palette.textMuted}
          style={styles.notesInput}
          multiline
        />
        <TouchableOpacity onPress={handleReport} style={styles.secondaryButton} disabled={reporting}>
          <Text style={styles.secondaryButtonLabel}>{reporting ? 'Submitting...' : 'Submit report'}</Text>
        </TouchableOpacity>
      </View>

      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
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
    paddingBottom: 32,
  },
  heroWrap: {
    marginTop: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  galleryRow: {
    gap: 12,
    paddingTop: 12,
  },
  galleryItem: {
    width: 180,
  },
  ghostButton: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: palette.card,
  },
  ghostButtonLabel: {
    color: palette.text,
    fontWeight: '600',
  },
  price: {
    color: palette.highlight,
    fontSize: 30,
    fontWeight: '800',
    marginTop: 20,
  },
  title: {
    color: palette.text,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 8,
  },
  location: {
    color: palette.textMuted,
    fontSize: 16,
    marginTop: 6,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 28,
  },
  description: {
    color: palette.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
  },
  card: {
    marginTop: 24,
    padding: 18,
    borderRadius: 20,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cardTitle: {
    color: palette.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardText: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  cardSubtext: {
    color: palette.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: palette.primary,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonLabel: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 16,
    backgroundColor: palette.surface,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.borderStrong,
  },
  secondaryButtonLabel: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  contactActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  secondaryHalfButton: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.borderStrong,
  },
  reasonChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  reasonChipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  reasonLabel: {
    color: palette.text,
    fontWeight: '600',
  },
  reasonLabelActive: {
    color: '#1A120A',
  },
  notesInput: {
    marginTop: 14,
    minHeight: 110,
    backgroundColor: palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    color: palette.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  feedback: {
    color: '#8BE0A8',
    marginTop: 16,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyBody: {
    color: palette.textMuted,
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'center',
  },
});
