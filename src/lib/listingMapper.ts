import { ListingSummary } from '../types/listing';

export const normalizedListingSelect = `
  id,
  user_id,
  title,
  description,
  rent_amount,
  deposit_amount,
  furnished,
  available_from,
  status,
  property_type:property_type_id(label),
  city:city_id(name),
  area:area_id(name),
  contact:contact_id(first_name,last_name,whatsapp_number),
  images:listing_images(image_url,sort_order),
  listing_utilities(
    utility:utility_id(label)
  )
`;

type RelationLabel = { label: string } | { label: string }[] | null;
type RelationName = { name: string } | { name: string }[] | null;

export type NormalizedListingRow = {
  id: string | number;
  user_id: string | null;
  title: string;
  description: string;
  rent_amount: number;
  deposit_amount: number;
  furnished: boolean;
  available_from: string;
  status: ListingSummary['status'];
  property_type: RelationLabel;
  city: RelationName;
  area: RelationName;
  contact:
    | {
        first_name: string;
        last_name: string;
        whatsapp_number: string;
      }
    | {
        first_name: string;
        last_name: string;
        whatsapp_number: string;
      }[]
    | null;
  images:
    | {
        image_url: string;
        sort_order: number;
      }[]
    | null;
  listing_utilities:
    | {
        utility: RelationLabel;
      }[]
    | null;
};

function readLabel(relation: RelationLabel) {
  if (Array.isArray(relation)) {
    return relation[0]?.label ?? null;
  }

  return relation?.label ?? null;
}

function readName(relation: RelationName) {
  if (Array.isArray(relation)) {
    return relation[0]?.name ?? null;
  }

  return relation?.name ?? null;
}

function readContact(relation: NormalizedListingRow['contact']) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
}

export function mapListingRow(row: NormalizedListingRow): ListingSummary {
  const contact = readContact(row.contact);
  const posterName = [contact?.first_name, contact?.last_name].filter(Boolean).join(' ').trim();
  const sortedImages = [...(row.images ?? [])].sort((left, right) => left.sort_order - right.sort_order);

  return {
    id: String(row.id),
    posterId: row.user_id ?? '',
    title: row.title,
    description: row.description,
    city: readName(row.city) ?? 'Unknown city',
    suburb: readName(row.area) ?? 'Unknown area',
    propertyType: readLabel(row.property_type) ?? 'Unknown type',
    rentAmount: row.rent_amount,
    depositAmount: row.deposit_amount,
    furnished: row.furnished,
    utilitiesIncluded: (row.listing_utilities ?? [])
      .map((item) => readLabel(item.utility))
      .filter((value): value is string => Boolean(value)),
    availableFrom: row.available_from,
    imageUrl: sortedImages[0]?.image_url ?? '',
    imageUrls: sortedImages.map((item) => item.image_url).filter(Boolean),
    whatsappNumber: contact?.whatsapp_number ?? '',
    posterName: posterName || 'Rental poster',
    status: row.status,
  };
}
