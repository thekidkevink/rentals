import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';

function normalizePhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/[^\d+]/g, '');
}

export async function openPhoneDialer(phoneNumber: string) {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const url = `tel:${normalizedPhone}`;

  const canOpen = await Linking.canOpenURL(url);

  if (canOpen) {
    await Linking.openURL(url);
  }
}

export async function copyPhoneNumber(phoneNumber: string) {
  await Clipboard.setStringAsync(normalizePhoneNumber(phoneNumber));
}
