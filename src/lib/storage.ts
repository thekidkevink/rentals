import { decode } from 'base64-arraybuffer';

import { supabase } from './supabase';

const listingImagesBucket = 'listing-images';
const profileImagesBucket = 'profile-images';

function fileExtensionForMimeType(mimeType: string) {
  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'jpg';
  }
}

export async function uploadListingImage(params: {
  userId: string;
  listingId: string;
  base64: string;
  mimeType: string;
  fileName?: string;
}) {
  const extension = fileExtensionForMimeType(params.mimeType);
  const safeName = params.fileName?.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/\.[^.]+$/, '') || 'listing-photo';
  const path = `${params.userId}/${params.listingId}-${safeName}.${extension}`;
  const arrayBuffer = decode(params.base64);

  const { error: uploadError } = await supabase.storage.from(listingImagesBucket).upload(path, arrayBuffer, {
    contentType: params.mimeType,
    upsert: false,
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(listingImagesBucket).getPublicUrl(path);

  return { path, publicUrl: data.publicUrl };
}

export async function removeListingImage(path: string) {
  const { error } = await supabase.storage.from(listingImagesBucket).remove([path]);

  if (error) {
    throw new Error(error.message);
  }
}

export async function uploadProfileImage(params: {
  userId: string;
  base64: string;
  mimeType: string;
  fileName?: string;
}) {
  const extension = fileExtensionForMimeType(params.mimeType);
  const safeName = params.fileName?.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/\.[^.]+$/, '') || 'profile-photo';
  const path = `${params.userId}/${safeName}.${extension}`;
  const arrayBuffer = decode(params.base64);

  const { error: uploadError } = await supabase.storage.from(profileImagesBucket).upload(path, arrayBuffer, {
    contentType: params.mimeType,
    upsert: true,
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(profileImagesBucket).getPublicUrl(path);

  return { path, publicUrl: data.publicUrl };
}
