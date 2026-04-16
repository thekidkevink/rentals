export type ThemeMode = 'dark' | 'light';

export type ThemePalette = {
  isDark: boolean;
  background: string;
  surface: string;
  card: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  primary: string;
  highlight: string;
  heroStart: string;
  heroEnd: string;
  statusBar: 'light-content' | 'dark-content';
  overlayCard: string;
  overlayBorder: string;
  illustrationFrame: string;
  illustrationBorder: string;
  illustrationBlock: string;
  illustrationBlockMuted: string;
  floatingLabel: string;
  pillDefaultBg: string;
  pillSoftBg: string;
  pillSuccessBg: string;
  pillMutedBg: string;
  pillSoftText: string;
  pillSuccessText: string;
  pillMutedText: string;
};

export const darkPalette: ThemePalette = {
  isDark: true,
  background: '#07111F',
  surface: '#101D31',
  card: '#0D1728',
  border: '#1A2841',
  borderStrong: '#426188',
  text: '#F5F7FB',
  textMuted: '#A7B3C9',
  primary: '#FF7A18',
  highlight: '#FFD166',
  heroStart: '#13253F',
  heroEnd: '#251B38',
  statusBar: 'light-content',
  overlayCard: 'rgba(10, 19, 33, 0.78)',
  overlayBorder: 'rgba(255,255,255,0.08)',
  illustrationFrame: '#0E1727',
  illustrationBorder: '#24324C',
  illustrationBlock: '#253A5F',
  illustrationBlockMuted: '#18273F',
  floatingLabel: '#1A120A',
  pillDefaultBg: '#2A344A',
  pillSoftBg: '#182032',
  pillSuccessBg: '#183A2D',
  pillMutedBg: '#2A2F40',
  pillSoftText: '#A7B3C9',
  pillSuccessText: '#86E0B0',
  pillMutedText: '#D2D5DD',
};

export const lightPalette: ThemePalette = {
  isDark: false,
  background: '#F4F7FB',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#D8E0EB',
  borderStrong: '#9FB4CC',
  text: '#112033',
  textMuted: '#5D7089',
  primary: '#F97316',
  highlight: '#A85C00',
  heroStart: '#EAF3FF',
  heroEnd: '#FFF3E7',
  statusBar: 'dark-content',
  overlayCard: 'rgba(255,255,255,0.92)',
  overlayBorder: 'rgba(17,32,51,0.08)',
  illustrationFrame: '#FFFFFF',
  illustrationBorder: '#C8D7E8',
  illustrationBlock: '#D8E6F7',
  illustrationBlockMuted: '#EDF3FA',
  floatingLabel: '#FFFFFF',
  pillDefaultBg: '#E6EDF6',
  pillSoftBg: '#EEF4FA',
  pillSuccessBg: '#DCF4E5',
  pillMutedBg: '#E9EDF4',
  pillSoftText: '#5D7089',
  pillSuccessText: '#1F7A45',
  pillMutedText: '#6B778B',
};

export const palette = darkPalette;

export function getPalette(mode: ThemeMode) {
  return mode === 'light' ? lightPalette : darkPalette;
}
