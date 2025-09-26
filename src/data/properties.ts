export type Category = 'Service Apartment' | 'Rent' | 'Land';

export type Property = {
  id: string;
  title: string;
  city: string;
  neighborhood?: string;
  category: Category;
  bedrooms?: number;
  maxGuests?: number;
  pricePerNight?: number; // for service apartments
  priceNGN?: number; // for rent/land
  media?: string[];
};

export const PROPS: Property[] = [
  { id: 'lekki-sa-1', title: 'Lekki Phase 1 Studio', city: 'Lekki', neighborhood: 'Lekki Phase 1', category: 'Service Apartment', bedrooms: 0, maxGuests: 2, pricePerNight: 65000, media: [] },
  { id: 'lekki-rent-1', title: '2BR Apartment (Chevron)', city: 'Lekki', neighborhood: 'Chevron', category: 'Rent', bedrooms: 2, priceNGN: 5500000 },
  { id: 'vi-sa-1', title: 'VI 1BR with Sea View', city: 'Victoria Island', neighborhood: 'Oniru', category: 'Service Apartment', bedrooms: 1, maxGuests: 3, pricePerNight: 120000 },
  { id: 'ikeja-sa-1', title: 'Ikeja GRA 1BR', city: 'Ikeja', neighborhood: 'GRA', category: 'Service Apartment', bedrooms: 1, maxGuests: 2, pricePerNight: 60000 },
  { id: 'abuja-land-1', title: '600sqm Residential Plot', city: 'Abuja', neighborhood: 'Gwarinpa', category: 'Land', priceNGN: 25000000 },
];

