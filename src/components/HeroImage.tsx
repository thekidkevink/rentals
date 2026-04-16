import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { usePreferences } from '../providers/PreferencesProvider';

export function HeroImage({ imageUrl }: { imageUrl: string }) {
  const { palette } = usePreferences();
  const styles = createStyles(palette);

  return (
    <View style={styles.wrapper}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} contentFit="cover" style={styles.image} transition={300} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Photo coming soon</Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (palette: ReturnType<typeof usePreferences>['palette']) =>
  StyleSheet.create({
    wrapper: {
      height: 220,
      width: '100%',
      borderRadius: 28,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    placeholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.surface,
    },
    placeholderText: {
      color: palette.textMuted,
      fontSize: 15,
      fontWeight: '600',
    },
  });
