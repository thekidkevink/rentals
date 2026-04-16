import { StyleSheet, Text, View } from 'react-native';

import { usePreferences } from '../providers/PreferencesProvider';

type PillTone = 'default' | 'soft' | 'success' | 'muted';

export function Pill({ label, tone = 'default' }: { label: string; tone?: PillTone }) {
  const { palette } = usePreferences();
  const styles = createStyles();
  const toneStyles = createToneStyles(palette);
  const labelStyles = createLabelStyles(palette);

  return (
    <View style={[styles.base, toneStyles[tone]]}>
      <Text style={[styles.label, labelStyles[tone]]}>{label}</Text>
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
    base: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
    },
  });

const createToneStyles = (palette: ReturnType<typeof usePreferences>['palette']) =>
  StyleSheet.create({
    default: {
      backgroundColor: palette.pillDefaultBg,
    },
    soft: {
      backgroundColor: palette.pillSoftBg,
    },
    success: {
      backgroundColor: palette.pillSuccessBg,
    },
    muted: {
      backgroundColor: palette.pillMutedBg,
    },
  });

const createLabelStyles = (palette: ReturnType<typeof usePreferences>['palette']) =>
  StyleSheet.create({
    default: {
      color: palette.text,
    },
    soft: {
      color: palette.pillSoftText,
    },
    success: {
      color: palette.pillSuccessText,
    },
    muted: {
      color: palette.pillMutedText,
    },
  });
