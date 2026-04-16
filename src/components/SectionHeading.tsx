import { StyleSheet, Text, View } from 'react-native';

import { usePreferences } from '../providers/PreferencesProvider';

export function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  const { palette } = usePreferences();
  const styles = createStyles(palette);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const createStyles = (palette: ReturnType<typeof usePreferences>['palette']) =>
  StyleSheet.create({
    container: {
      marginTop: 28,
      marginBottom: 14,
    },
    title: {
      color: palette.text,
      fontSize: 20,
      fontWeight: '700',
    },
    subtitle: {
      color: palette.textMuted,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 6,
    },
  });
