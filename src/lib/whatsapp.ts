import * as Linking from 'expo-linking';

export async function openWhatsApp(phoneNumber: string, message: string) {
  const normalisedPhone = phoneNumber.replace(/[^\d+]/g, '');
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${normalisedPhone.replace('+', '')}?text=${encodedMessage}`;

  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  }
}
