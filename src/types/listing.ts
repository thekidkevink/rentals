export type ListingStatus = 'active' | 'rented' | 'inactive';

export type ListingSummary = {
  id: string;
  posterId: string;
  title: string;
  description: string;
  city: string;
  suburb: string;
  propertyType: string;
  rentAmount: number;
  depositAmount: number;
  furnished: boolean;
  utilitiesIncluded: string[];
  availableFrom: string;
  imageUrl: string;
  imageUrls: string[];
  whatsappNumber: string;
  posterName: string;
  status: ListingStatus;
};
