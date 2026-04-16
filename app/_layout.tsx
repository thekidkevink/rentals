import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

import { AppProvider } from '../src/providers/AppProvider';
import { usePreferences } from '../src/providers/PreferencesProvider';

function RootNavigator() {
  const { palette } = usePreferences();

  return (
    <>
      <StatusBar barStyle={palette.statusBar} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.background },
          animation: 'slide_from_right',
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}
