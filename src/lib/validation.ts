import { z } from 'zod';

const phonePattern = /^\+?\d{9,15}$/;
const supportedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const listingImageSchema = z.object({
  uri: z.string().trim().min(1, 'Add at least one photo for the listing.'),
  base64: z.string().trim().min(1, 'Add at least one photo for the listing.'),
  mimeType: z
    .string()
    .trim()
    .refine((value) => supportedImageTypes.includes(value), 'Use a JPG, PNG, or WebP image.'),
  fileName: z.string().trim().optional(),
});

export const createListingSchema = z.object({
  title: z.string().trim().min(8, 'Add a clearer title with at least 8 characters.'),
  description: z.string().trim().min(24, 'Add a short description so renters know what stands out.'),
  city: z.string().trim().min(2, 'City is required.'),
  suburb: z.string().trim().min(2, 'Suburb or area is required.'),
  propertyType: z.string().trim().min(2, 'Choose a property type.'),
  rentAmount: z
    .string()
    .trim()
    .min(1, 'Rent amount is required.')
    .refine((value) => Number(value) >= 0, 'Rent amount must be zero or more.'),
  depositAmount: z
    .string()
    .trim()
    .min(1, 'Deposit amount is required.')
    .refine((value) => Number(value) >= 0, 'Deposit amount must be zero or more.'),
  whatsappNumber: z.string().trim().regex(phonePattern, 'Use a valid WhatsApp number, e.g. +264811234567.'),
  images: z.array(listingImageSchema).min(1, 'Add at least one photo for the listing.').max(10, 'You can add up to 10 photos.'),
  availableFrom: z.string().trim().min(10, 'Use a date in YYYY-MM-DD format.'),
  furnished: z.boolean(),
  utilitiesIncluded: z.array(z.string()).default([]),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
