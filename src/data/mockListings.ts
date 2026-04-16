import { ListingSummary } from '../types/listing';

export const mockListings: ListingSummary[] = [
  {
    id: '1',
    posterId: 'sample-user-1',
    title: 'Sunny room near UNAM with WiFi included',
    description:
      'A bright room in a quiet shared house with prepaid electricity, fast WiFi, and easy taxi access. Best for students or a young professional.',
    city: 'Windhoek',
    suburb: 'Pioneers Park',
    propertyType: 'Room',
    rentAmount: 3200,
    depositAmount: 3200,
    furnished: true,
    utilitiesIncluded: ['WiFi', 'Water'],
    availableFrom: '2026-05-01',
    imageUrl:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'],
    whatsappNumber: '+264811234567',
    posterName: 'Martha K',
    status: 'active',
  },
  {
    id: '2',
    posterId: 'sample-user-2',
    title: 'Affordable bachelor flat close to CBD routes',
    description:
      'Compact bachelor unit with its own bathroom and kitchenette. Ideal for someone who wants privacy and quick transport into town.',
    city: 'Windhoek',
    suburb: 'Katutura',
    propertyType: 'Bachelor',
    rentAmount: 4100,
    depositAmount: 2000,
    furnished: false,
    utilitiesIncluded: ['Water'],
    availableFrom: '2026-04-20',
    imageUrl:
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'],
    whatsappNumber: '+264811234568',
    posterName: 'Joel P',
    status: 'active',
  },
  {
    id: '3',
    posterId: 'sample-user-3',
    title: 'Shared apartment with secure parking',
    description:
      'One room available in a neat shared apartment. Parking, built-in cupboards, and a calm environment for working professionals.',
    city: 'Windhoek',
    suburb: 'Khomasdal',
    propertyType: 'Shared',
    rentAmount: 2900,
    depositAmount: 1500,
    furnished: false,
    utilitiesIncluded: ['Water', 'Electricity'],
    availableFrom: '2026-05-10',
    imageUrl:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'],
    whatsappNumber: '+264811234569',
    posterName: 'Nelia S',
    status: 'active',
  },
];
