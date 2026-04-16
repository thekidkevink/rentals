import { supabase } from './supabase';

export type PublicProfile = {
  id: string;
  firstName: string;
  lastName: string;
  bio: string;
  avatarUrl: string;
};

export async function fetchPublicProfile(profileId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,first_name,last_name,bio,avatar_url')
    .eq('id', profileId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    bio: data.bio ?? '',
    avatarUrl: data.avatar_url ?? '',
  } satisfies PublicProfile;
}

export async function fetchProfileContact(userId: string) {
  const { data, error } = await supabase.from('listing_contacts').select('whatsapp_number').eq('user_id', userId).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.whatsapp_number ?? '';
}

export async function updateProfile(input: {
  firstName: string;
  lastName: string;
  whatsappNumber: string;
  bio: string;
  avatarUrl: string;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Please sign in before updating your profile.');
  }

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const whatsappNumber = input.whatsappNumber.trim();
  const bio = input.bio.trim();
  const avatarUrl = input.avatarUrl.trim();

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      bio,
      avatar_url: avatarUrl || null,
    })
    .eq('id', user.id);

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { error: contactError } = await supabase.from('listing_contacts').upsert(
    {
      user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      whatsapp_number: whatsappNumber,
    },
    { onConflict: 'user_id' },
  );

  if (contactError) {
    throw new Error(contactError.message);
  }
}
