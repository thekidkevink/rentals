import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { usePreferences } from '../src/providers/PreferencesProvider';

export default function NotFoundScreen() {
  const { palette } = usePreferences();
  const styles = createStyles(palette);

  return (
    <>
      <Stack.Screen options={{ title: 'Not Found', headerShown: true, headerTintColor: palette.text }} />
      <View style={styles.container}>
        <Text style={styles.title}>We could not find that screen.</Text>
        <Link href="/" style={styles.link}>
          Return home
        </Link>
      </View>
    </>
  );
}

const createStyles = (palette: ReturnType<typeof usePreferences>['palette']) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.background,
    padding: 24,
  },
  title: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  link: {
    color: palette.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
