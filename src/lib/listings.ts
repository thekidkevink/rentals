import { mapListingRow, normalizedListingSelect, NormalizedListingRow } from './listingMapper';
import { supabase } from './supabase';
import { removeListingImage, uploadListingImage } from './storage';
import { createListingSchema, CreateListingInput } from './validation';

export async function createListing(input: CreateListingInput) {
  const listing = createListingSchema.parse(input);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Please sign in before posting a listing.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('first_name,last_name')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('We could not load your profile. Please sign in again.');
  }

  const { data: propertyType, error: propertyTypeError } = await supabase
    .from('property_types')
    .select('id')
    .ilike('label', listing.propertyType)
    .single();

  if (propertyTypeError || !propertyType) {
    throw new Error('Property type could not be matched. Please choose a supported type.');
  }

  const { data: city, error: cityError } = await supabase
    .from('cities')
    .upsert({ name: listing.city.trim() }, { onConflict: 'name' })
    .select('id')
    .single();

  if (cityError || !city) {
    throw new Error('City could not be saved right now.');
  }

  const { data: area, error: areaError } = await supabase
    .from('areas')
    .upsert({ city_id: city.id, name: listing.suburb.trim() }, { onConflict: 'city_id,name' })
    .select('id')
    .single();

  if (areaError || !area) {
    throw new Error('Area could not be saved right now.');
  }

  const { data: contact, error: contactError } = await supabase
    .from('listing_contacts')
    .upsert(
      {
        user_id: user.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        whatsapp_number: listing.whatsappNumber.trim(),
      },
      { onConflict: 'user_id' },
    )
    .select('id')
    .single();

  if (contactError || !contact) {
    throw new Error('Your contact details could not be saved right now.');
  }

  const { data: insertedListing, error: insertedListingError } = await supabase
    .from('listings')
    .insert({
      user_id: user.id,
      contact_id: contact.id,
      title: listing.title,
      description: listing.description,
      city_id: city.id,
      area_id: area.id,
      property_type_id: propertyType.id,
      rent_amount: Number(listing.rentAmount),
      deposit_amount: Number(listing.depositAmount),
      furnished: listing.furnished,
      available_from: listing.availableFrom,
      status: 'active',
    })
    .select('id')
    .single();

  if (insertedListingError || !insertedListing) {
    throw new Error(insertedListingError?.message ?? 'Listing could not be created right now.');
  }

  const listingId = insertedListing.id;

  async function rollbackListing() {
    await supabase.from('listings').delete().eq('id', listingId);
  }

  const utilityRows =
    listing.utilitiesIncluded.length > 0
      ? await supabase.from('utilities').select('id,label').in('label', listing.utilitiesIncluded)
      : { data: [], error: null };

  if (utilityRows.error) {
    await rollbackListing();
    throw new Error(utilityRows.error.message);
  }

  if (utilityRows.data?.length) {
    const { error: utilityInsertError } = await supabase.from('listing_utilities').insert(
      utilityRows.data.map((utility) => ({
        listing_id: insertedListing.id,
        utility_id: utility.id,
      })),
    );

    if (utilityInsertError) {
      await rollbackListing();
      throw new Error(utilityInsertError.message);
    }
  }

  const uploadedImagePaths: string[] = [];

  try {
    const uploadedImages = await Promise.all(
      listing.images.map((image, index) =>
        uploadListingImage({
          userId: user.id,
          listingId,
          base64: image.base64,
          mimeType: image.mimeType,
          fileName: image.fileName || `listing-photo-${index + 1}.jpg`,
        }),
      ),
    );

    uploadedImagePaths.push(...uploadedImages.map((item) => item.path));

    const { error: imageError } = await supabase.from('listing_images').insert(
      uploadedImages.map((image, index) => ({
        listing_id: listingId,
        image_url: image.publicUrl,
        sort_order: index,
      })),
    );

    if (imageError) {
      throw new Error(imageError.message);
    }
  } catch (error) {
    if (uploadedImagePaths.length) {
      await Promise.all(uploadedImagePaths.map((path) => removeListingImage(path).catch(() => undefined)));
    }

    await rollbackListing();
    throw error instanceof Error ? error : new Error('Image upload failed while publishing the listing.');
  }
}

export async function fetchListings(options?: { userId?: string; activeOnly?: boolean; limit?: number }) {
  let query = supabase.from('listings').select(normalizedListingSelect).order('created_at', { ascending: false });

  if (options?.userId) {
    query = query.eq('user_id', options.userId);
  }

  if (options?.activeOnly) {
    query = query.eq('status', 'active');
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as NormalizedListingRow[]).map(mapListingRow);
}

export async function fetchListingById(id: string) {
  const { data, error } = await supabase.from('listings').select(normalizedListingSelect).eq('id', id).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapListingRow(data as NormalizedListingRow);
}

export async function updateListingStatus(listingId: string, status: 'active' | 'rented' | 'inactive') {
  const { error } = await supabase.from('listings').update({ status }).eq('id', listingId);

  if (error) {
    throw new Error(error.message);
  }
}
