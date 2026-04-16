import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useListingLookups } from '../../src/hooks/useListingLookups';
import { createListing } from '../../src/lib/listings';
import { createListingSchema } from '../../src/lib/validation';
import { usePreferences } from '../../src/providers/PreferencesProvider';
import { useAuth } from '../../src/providers/AuthProvider';

const initialForm = {
  title: '',
  description: '',
  city: 'Windhoek',
  suburb: '',
  propertyType: 'Room',
  rentAmount: '',
  depositAmount: '',
  whatsappNumber: '',
  images: [] as { uri: string; base64: string; mimeType: string; fileName?: string }[],
  availableFrom: '2026-05-01',
  furnished: false,
  utilitiesIncluded: [] as string[],
};

function formatDateForStorage(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseStoredDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return new Date();
  }

  return new Date(year, month - 1, day);
}

function formatDateForDisplay(value: string) {
  return parseStoredDate(value).toLocaleDateString('en-NA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function PostScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = usePreferences();
  const styles = createStyles(palette);
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { propertyTypes, cities, utilities, areas, loading: lookupsLoading, error: lookupError } = useListingLookups(form.city);

  function updateField<Key extends keyof typeof initialForm>(key: Key, value: (typeof initialForm)[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleUtility(value: string) {
    setForm((current) => {
      const exists = current.utilitiesIncluded.includes(value);
      return {
        ...current,
        utilitiesIncluded: exists
          ? current.utilitiesIncluded.filter((item) => item !== value)
          : [...current.utilitiesIncluded, value],
      };
    });
  }

  async function pickImage() {
    setErrorMessage('');

    if (form.images.length >= 10) {
      setErrorMessage('You can add up to 10 photos per listing.');
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setErrorMessage('Photo access is needed so you can upload a listing image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    if (!asset?.base64 || !asset.uri) {
      setErrorMessage('We could not read that photo. Please choose another image.');
      return;
    }

    updateField('images', [
      ...form.images,
      {
        uri: asset.uri,
        base64: asset.base64,
        mimeType: asset.mimeType ?? 'image/jpeg',
        fileName: asset.fileName ?? `listing-photo-${form.images.length + 1}.jpg`,
      },
    ]);
  }

  function removeImage(index: number) {
    updateField(
      'images',
      form.images.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  function handleAvailableDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }

    updateField('availableFrom', formatDateForStorage(selectedDate));
  }

  async function handleSubmit() {
    setErrorMessage('');
    setSuccessMessage('');

    const parsed = createListingSchema.safeParse(form);
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? 'Please review the form and try again.');
      return;
    }

    setSubmitting(true);

    try {
      await createListing(parsed.data);
      setSuccessMessage('Listing published. You can now browse it in the live feed.');
      setForm(initialForm);
      setTimeout(() => {
        router.push('/search');
      }, 500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'We could not publish the listing right now.');
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Checking your session...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Sign in before posting.</Text>
        <Text style={styles.subtitle}>Listings now belong to the account that created them, so we need a real session before publishing.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/auth/sign-in')}>
          <Text style={styles.buttonLabel}>Go to sign in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const availableAreaNames = areas.map((area) => area.name);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
      <Text style={styles.title}>Post a live listing</Text>
      <Text style={styles.subtitle}>
        Keep it short, accurate, and WhatsApp-ready. This form writes directly to your Supabase `listings` table.
      </Text>
      {lookupError ? <Text style={styles.error}>{lookupError}</Text> : null}

      <View style={styles.profileCard}>
        <Text style={styles.profileLabel}>Posting as</Text>
        <Text style={styles.profileName}>{[profile?.firstName, profile?.lastName].filter(Boolean).join(' ')}</Text>
        <Text style={styles.profileBody}>Your account identity is pulled from your profile. You only need to provide listing-specific details here.</Text>
      </View>

      <View style={styles.card}>
        <FormField label="Listing title">
          <TextInput
            value={form.title}
            onChangeText={(value) => updateField('title', value)}
            placeholder="Sunny room in Pioneers Park"
            placeholderTextColor={palette.textMuted}
            style={styles.input}
          />
        </FormField>

        <FormField label="Description">
          <TextInput
            value={form.description}
            onChangeText={(value) => updateField('description', value)}
            placeholder="What makes this place worth contacting you about?"
            placeholderTextColor={palette.textMuted}
            style={[styles.input, styles.textArea]}
            multiline
            textAlignVertical="top"
          />
        </FormField>

        <View style={styles.row}>
          <FormField label="City" style={styles.halfField}>
            <View style={styles.chipRow}>
              {cities.map((option) => {
                const selected = form.city === option.label;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.chip, selected && styles.chipActive]}
                    onPress={() => updateField('city', option.label)}
                  >
                    <Text style={[styles.chipLabel, selected && styles.chipLabelActive]}>{option.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput
              value={form.city}
              onChangeText={(value) => updateField('city', value)}
              placeholder={lookupsLoading ? 'Loading cities...' : 'Windhoek'}
              placeholderTextColor={palette.textMuted}
              style={[styles.input, styles.inputTopSpacing]}
            />
          </FormField>
          <FormField label="Suburb / Area" style={styles.halfField}>
            <TextInput
              value={form.suburb}
              onChangeText={(value) => updateField('suburb', value)}
              placeholder="Khomasdal"
              placeholderTextColor={palette.textMuted}
              style={styles.input}
            />
            {availableAreaNames.length > 0 ? (
              <View style={[styles.chipRow, styles.inputTopSpacing]}>
                {availableAreaNames.map((areaName) => {
                  const selected = form.suburb === areaName;
                  return (
                    <TouchableOpacity
                      key={areaName}
                      style={[styles.chip, selected && styles.chipActive]}
                      onPress={() => updateField('suburb', areaName)}
                    >
                      <Text style={[styles.chipLabel, selected && styles.chipLabelActive]}>{areaName}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={[styles.helper, styles.inputTopSpacing]}>
                {form.city.trim() ? 'No saved areas yet for this city. You can type a new one.' : 'Choose a city first to load saved areas.'}
              </Text>
            )}
          </FormField>
        </View>

        <View style={styles.row}>
          <FormField label="Property type" style={styles.halfField}>
            <View style={styles.chipRow}>
              {propertyTypes.map((option) => {
                const selected = form.propertyType === option.label;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.chip, selected && styles.chipActive]}
                    onPress={() => updateField('propertyType', option.label)}
                  >
                    <Text style={[styles.chipLabel, selected && styles.chipLabelActive]}>{option.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </FormField>
        </View>

        <FormField label="Available from">
          {Platform.OS === 'ios' ? (
            <View style={styles.dateField}>
              <Text style={styles.dateValue}>{formatDateForDisplay(form.availableFrom)}</Text>
              <DateTimePicker
                value={parseStoredDate(form.availableFrom)}
                mode="date"
                display="compact"
                minimumDate={new Date()}
                onChange={handleAvailableDateChange}
                style={styles.iosDatePicker}
              />
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateButtonText}>{formatDateForDisplay(form.availableFrom)}</Text>
              </TouchableOpacity>
              {showDatePicker ? (
                <DateTimePicker
                  value={parseStoredDate(form.availableFrom)}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={handleAvailableDateChange}
                />
              ) : null}
            </>
          )}
        </FormField>

        <View style={styles.row}>
          <FormField label="Rent (N$)" style={styles.halfField}>
            <TextInput
              value={form.rentAmount}
              onChangeText={(value) => updateField('rentAmount', value)}
              placeholder="3200"
              placeholderTextColor={palette.textMuted}
              style={styles.input}
              keyboardType="numeric"
            />
          </FormField>
          <FormField label="Deposit (N$)" style={styles.halfField}>
            <TextInput
              value={form.depositAmount}
              onChangeText={(value) => updateField('depositAmount', value)}
              placeholder="3200"
              placeholderTextColor={palette.textMuted}
              style={styles.input}
              keyboardType="numeric"
            />
          </FormField>
        </View>

        <FormField label="WhatsApp number">
          <TextInput
            value={form.whatsappNumber}
            onChangeText={(value) => updateField('whatsappNumber', value)}
            placeholder="+264811234567"
            placeholderTextColor={palette.textMuted}
            style={styles.input}
            keyboardType="phone-pad"
          />
        </FormField>

        <FormField label="Listing photos">
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            <Text style={styles.imagePickerLabel}>{form.images.length ? 'Add another photo' : 'Choose a photo from your phone'}</Text>
          </TouchableOpacity>
          <Text style={[styles.helper, styles.inputTopSpacing]}>{`${form.images.length}/10 photos selected. The first photo will be used as the main cover image.`}</Text>
          {form.images.length ? (
            <View style={styles.imageGrid}>
              {form.images.map((image, index) => (
                <View key={`${image.uri}-${index}`} style={styles.imageTile}>
                  <Image source={{ uri: image.uri }} style={styles.imagePreview} contentFit="cover" />
                  <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                    <Text style={styles.removeImageLabel}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.helper, styles.inputTopSpacing]}>Add up to 10 clear photos so renters can understand the space before they contact you.</Text>
          )}
        </FormField>

        <View style={styles.toggleRow}>
          <View style={styles.toggleTextWrap}>
            <Text style={styles.label}>Furnished</Text>
            <Text style={styles.helper}>Turn this on if the room comes ready with furniture.</Text>
          </View>
          <Switch
            value={form.furnished}
            onValueChange={(value) => updateField('furnished', value)}
            thumbColor={form.furnished ? palette.primary : '#D8DCE6'}
            trackColor={{ false: '#394865', true: '#6F431B' }}
          />
        </View>

        <FormField label="Utilities included">
          <View style={styles.chipRow}>
            {utilities.map((option) => {
              const selected = form.utilitiesIncluded.includes(option.label);
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.chip, selected && styles.chipActive]}
                  onPress={() => toggleUtility(option.label)}
                >
                  <Text style={[styles.chipLabel, selected && styles.chipLabelActive]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </FormField>
      </View>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

      <TouchableOpacity style={[styles.button, submitting && styles.buttonDisabled]} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.buttonLabel}>{submitting ? 'Publishing...' : 'Publish listing'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function FormField({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: object;
}) {
  const { palette } = usePreferences();
  const styles = createStyles(palette);

  return (
    <View style={style}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const createStyles = (palette: ReturnType<typeof usePreferences>['palette']) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  centered: {
    flex: 1,
    backgroundColor: palette.background,
    padding: 18,
    justifyContent: 'center',
  },
  content: {
    padding: 18,
    paddingTop: 12,
    paddingBottom: 36,
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
  card: {
    marginTop: 20,
    backgroundColor: palette.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 18,
    gap: 16,
  },
  profileCard: {
    marginTop: 20,
    backgroundColor: palette.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 18,
  },
  profileLabel: {
    color: palette.highlight,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  profileName: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
  },
  profileBody: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  label: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  helper: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 18,
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
  inputTopSpacing: {
    marginTop: 10,
  },
  dateButton: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dateButtonText: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '600',
  },
  dateField: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateValue: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  iosDatePicker: {
    marginRight: -8,
  },
  imagePickerButton: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  imagePickerLabel: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  imagePreviewCard: {
    marginTop: 10,
    gap: 10,
  },
  imageGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageTile: {
    width: '48%',
    gap: 8,
  },
  imagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 20,
    backgroundColor: palette.surface,
  },
  removeImageButton: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    paddingVertical: 10,
    alignItems: 'center',
  },
  removeImageLabel: {
    color: palette.text,
    fontWeight: '700',
  },
  textArea: {
    minHeight: 112,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  toggleTextWrap: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  chipLabel: {
    color: palette.text,
    fontWeight: '600',
  },
  chipLabelActive: {
    color: '#1A120A',
  },
  error: {
    color: '#FF9D8A',
    fontSize: 14,
    marginTop: 16,
    lineHeight: 20,
  },
  success: {
    color: '#8BE0A8',
    fontSize: 14,
    marginTop: 16,
    lineHeight: 20,
  },
  button: {
    marginTop: 18,
    backgroundColor: palette.primary,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonLabel: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
