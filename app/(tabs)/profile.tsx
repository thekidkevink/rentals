import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListingCard } from '../../src/components/ListingCard';
import { useMyListings } from '../../src/hooks/useMyListings';
import { useSavedListings } from '../../src/hooks/useSavedListings';
import { fetchReportCount } from '../../src/lib/listingEngagement';
import { fetchProfileContact, updateProfile } from '../../src/lib/profiles';
import { usePreferences } from '../../src/providers/PreferencesProvider';
import { uploadProfileImage } from '../../src/lib/storage';
import { useAuth } from '../../src/providers/AuthProvider';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { palette, themeMode, setThemeMode, showSavedListingsInProfile, setShowSavedListingsInProfile } = usePreferences();
  const styles = createStyles(palette);
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { listings: myListings, refreshListings } = useMyListings();
  const { savedListings, savedListingIds, refreshSavedListings } = useSavedListings();
  const [firstName, setFirstName] = useState(profile?.firstName ?? '');
  const [lastName, setLastName] = useState(profile?.lastName ?? '');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? '');
  const [reportCount, setReportCount] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFirstName(profile?.firstName ?? '');
    setLastName(profile?.lastName ?? '');
    setBio(profile?.bio ?? '');
    setAvatarUrl(profile?.avatarUrl ?? '');
  }, [profile?.avatarUrl, profile?.bio, profile?.firstName, profile?.lastName]);

  useEffect(() => {
    let cancelled = false;

    async function loadExtras() {
      if (!user) {
        setWhatsappNumber('');
        setReportCount(0);
        return;
      }

      try {
        const [contact, reports] = await Promise.all([fetchProfileContact(user.id), fetchReportCount(user.id)]);

        if (!cancelled) {
          setWhatsappNumber(contact);
          setReportCount(reports);
        }
      } catch {
        if (!cancelled) {
          setWhatsappNumber('');
          setReportCount(0);
        }
      }
    }

    void loadExtras();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const stats = useMemo(
    () => [
      { label: 'Live listings', value: myListings.filter((item) => item.status === 'active').length },
      { label: 'Saved places', value: savedListingIds.length },
      { label: 'Reports sent', value: reportCount },
    ],
    [myListings, reportCount, savedListingIds.length],
  );

  const initials = [firstName || profile?.firstName, lastName || profile?.lastName]
    .filter(Boolean)
    .map((value) => value?.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  async function handlePickAvatar() {
    setError('');
    setMessage('');

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError('Photo access is needed so you can choose a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    if (!asset?.base64 || !asset.uri || !user) {
      setError('We could not read that photo. Please choose another image.');
      return;
    }

    try {
      const uploaded = await uploadProfileImage({
        userId: user.id,
        base64: asset.base64,
        mimeType: asset.mimeType ?? 'image/jpeg',
        fileName: asset.fileName ?? 'profile-photo.jpg',
      });
      setAvatarUrl(uploaded.publicUrl);
      setMessage('Profile photo updated. Save changes to keep everything in sync.');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'We could not upload your profile photo.');
    }
  }

  async function handleSave() {
    setError('');
    setMessage('');

    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      setError('Enter both your first name and last name.');
      return;
    }

    if (whatsappNumber.trim().length < 9) {
      setError('Enter a WhatsApp number so people can reach you.');
      return;
    }

    setSaving(true);

    try {
      await updateProfile({ firstName, lastName, whatsappNumber, bio, avatarUrl });
      await Promise.all([refreshProfile(), refreshListings(), refreshSavedListings()]);
      setMessage('Profile updated successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'We could not update your profile.');
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Sign in to manage your profile.</Text>
        <Text style={styles.emptyBody}>Your saved listings, activity, and contact details appear here once you are signed in.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
      <View style={styles.accountCard}>
        <View style={styles.accountHeader}>
          <TouchableOpacity style={styles.avatarWrap} onPress={handlePickAvatar}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} contentFit="cover" />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials || 'U'}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.accountText}>
            <Text style={styles.accountName}>{[profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Your account'}</Text>
            <Text style={styles.accountEmail}>{user.email ?? 'Signed in'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        {stats.map((item) => (
          <View key={item.label} style={styles.statCard}>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profile details</Text>
        <TextInput value={firstName} onChangeText={setFirstName} placeholder="First name" placeholderTextColor={palette.textMuted} style={styles.input} />
        <TextInput
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name"
          placeholderTextColor={palette.textMuted}
          style={[styles.input, styles.inputSpacing]}
        />
        <TextInput
          value={whatsappNumber}
          onChangeText={setWhatsappNumber}
          placeholder="+264811234567"
          placeholderTextColor={palette.textMuted}
          style={[styles.input, styles.inputSpacing]}
          keyboardType="phone-pad"
        />
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Short bio"
          placeholderTextColor={palette.textMuted}
          style={[styles.input, styles.inputSpacing, styles.bioInput]}
          multiline
          textAlignVertical="top"
        />
        <Text style={styles.helper}>These details are used when someone reaches out about one of your listings.</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.success}>{message}</Text> : null}
        <TouchableOpacity style={[styles.secondaryButton, styles.inputSpacing]} onPress={handleSave} disabled={saving}>
          <Text style={styles.secondaryButtonLabel}>{saving ? 'Saving...' : 'Save changes'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Settings</Text>

        <Text style={styles.settingLabel}>Appearance</Text>
        <View style={styles.modeRow}>
          {(['dark', 'light'] as const).map((mode) => {
            const selected = themeMode === mode;
            return (
              <TouchableOpacity key={mode} style={[styles.modeChip, selected && styles.modeChipActive]} onPress={() => void setThemeMode(mode)}>
                <Text style={[styles.modeChipLabel, selected && styles.modeChipLabelActive]}>{mode === 'dark' ? 'Dark mode' : 'Light mode'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingText}>
            <Text style={styles.settingLabel}>Saved listings preview</Text>
            <Text style={styles.settingBody}>Show your saved places directly on the profile screen.</Text>
          </View>
          <Switch
            value={showSavedListingsInProfile}
            onValueChange={(value) => void setShowSavedListingsInProfile(value)}
            thumbColor={showSavedListingsInProfile ? palette.primary : '#D8DCE6'}
            trackColor={{ false: '#AEBBCB', true: palette.isDark ? '#6F431B' : '#FDBA74' }}
          />
        </View>
      </View>

      {showSavedListingsInProfile ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Saved listings</Text>
          {savedListings.length ? (
            <View style={styles.savedList}>
              {savedListings.slice(0, 2).map((listing) => (
                <ListingCard key={listing.id} listing={listing} compact />
              ))}
            </View>
          ) : (
            <Text style={styles.helper}>Listings you save from the details screen will appear here.</Text>
          )}
        </View>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={signOut}>
        <Text style={styles.buttonLabel}>Sign out</Text>
      </TouchableOpacity>
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
      paddingTop: 12,
      paddingBottom: 30,
      gap: 18,
    },
    centered: {
      flex: 1,
      backgroundColor: palette.background,
      padding: 18,
      justifyContent: 'center',
    },
    accountCard: {
      backgroundColor: palette.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: palette.border,
      padding: 20,
    },
    accountHeader: {
      flexDirection: 'row',
      gap: 16,
      alignItems: 'center',
    },
    avatarWrap: {
      width: 82,
      height: 82,
      borderRadius: 41,
      overflow: 'hidden',
      backgroundColor: palette.surface,
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
    avatarInitials: {
      color: palette.text,
      fontSize: 28,
      fontWeight: '800',
    },
    accountText: {
      flex: 1,
    },
    accountName: {
      color: palette.text,
      fontSize: 22,
      fontWeight: '800',
    },
    accountEmail: {
      color: palette.textMuted,
      fontSize: 15,
      marginTop: 8,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: palette.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: palette.border,
      padding: 16,
    },
    statValue: {
      color: palette.highlight,
      fontSize: 24,
      fontWeight: '800',
    },
    statLabel: {
      color: palette.textMuted,
      marginTop: 8,
      fontSize: 13,
    },
    card: {
      backgroundColor: palette.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: palette.border,
      padding: 20,
    },
    cardTitle: {
      color: palette.text,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 12,
    },
    input: {
      backgroundColor: palette.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: palette.border,
      color: palette.text,
      paddingHorizontal: 14,
      paddingVertical: 14,
      fontSize: 15,
    },
    inputSpacing: {
      marginTop: 12,
    },
    bioInput: {
      minHeight: 110,
    },
    helper: {
      color: palette.textMuted,
      fontSize: 15,
      marginTop: 10,
      lineHeight: 22,
    },
    savedList: {
      gap: 12,
    },
    secondaryButton: {
      backgroundColor: palette.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      paddingVertical: 16,
      alignItems: 'center',
    },
    secondaryButtonLabel: {
      color: palette.text,
      fontSize: 15,
      fontWeight: '700',
    },
    button: {
      backgroundColor: palette.primary,
      borderRadius: 18,
      paddingVertical: 18,
      alignItems: 'center',
    },
    buttonLabel: {
      color: palette.isDark ? palette.text : '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    error: {
      color: '#FF9D8A',
      marginTop: 12,
      lineHeight: 20,
    },
    success: {
      color: '#2E8B57',
      marginTop: 12,
      lineHeight: 20,
    },
    emptyTitle: {
      color: palette.text,
      fontSize: 24,
      fontWeight: '800',
    },
    emptyBody: {
      color: palette.textMuted,
      marginTop: 10,
      lineHeight: 22,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 14,
      alignItems: 'center',
      marginTop: 18,
    },
    settingText: {
      flex: 1,
    },
    settingLabel: {
      color: palette.text,
      fontSize: 15,
      fontWeight: '700',
    },
    settingBody: {
      color: palette.textMuted,
      marginTop: 6,
      lineHeight: 20,
    },
    modeRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 8,
    },
    modeChip: {
      flex: 1,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surface,
      paddingVertical: 14,
      alignItems: 'center',
    },
    modeChipActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    modeChipLabel: {
      color: palette.text,
      fontWeight: '700',
    },
    modeChipLabelActive: {
      color: palette.isDark ? '#1A120A' : '#FFFFFF',
    },
  });
