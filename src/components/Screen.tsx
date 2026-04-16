import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { palette } from '../theme/palette';

type ScreenProps = {
  children: ReactNode;
  scrollable?: boolean;
};

export function Screen({ children, scrollable = false }: ScreenProps) {
  if (scrollable) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    padding: 18,
    paddingBottom: 30,
  },
});
