export type LawNote = { title: string; summary: string; link?: string };

export type PaymentPolicy = {
  minDepositPercent: number; // e.g., 20 means 20%
  installmentOptions: string; // free text summary
  refundPolicy: string;
};

export type LocationInfo = {
  city: string;
  neighborhoods: string[];
  categories: ('Service Apartment' | 'Land' | 'Rent')[];
  medianPriceNGN?: number;
  highlights: string[];
  laws: LawNote[];
  payments: PaymentPolicy;
  media?: string[]; // image/video urls
};

export const LOCATIONS: LocationInfo[] = [
  {
    city: 'Lekki',
    neighborhoods: ['Lekki Phase 1', 'Ikate', 'Chevron'],
    categories: ['Service Apartment', 'Rent', 'Land'],
    medianPriceNGN: 90000,
    highlights: ['Gated estates', 'Proximity to VI', 'Modern serviced units'],
    laws: [
      { title: 'Tenancy Law (Lagos)', summary: 'Defines tenant/landlord rights, notice periods, and rent review guidelines.' },
      { title: 'Service Charge Transparency', summary: 'Landlords must disclose service charge scope and reconciliation annually.' },
    ],
    payments: {
      minDepositPercent: 20,
      installmentOptions: '3–12 month plans common for off-plan and some rentals (subject to checks).',
      refundPolicy: 'Deposits refundable less administrative fees if conditions are unmet before exchange.',
    },
    media: ['https://images.unsplash.com/photo-1502005229762-cf1b2da7c05c?q=80&w=1200&auto=format&fit=crop'],
  },
  {
    city: 'Victoria Island',
    neighborhoods: ['Oniru', 'Ozumba Mbadiwe'],
    categories: ['Service Apartment', 'Rent'],
    medianPriceNGN: 140000,
    highlights: ['Prime business district', 'Sea views', 'High security buildings'],
    laws: [
      { title: 'Condo/Strata Rules', summary: 'Building by-laws often govern short-lets, pets, and alterations.' },
      { title: 'Title Verification', summary: 'Always verify Governor’s Consent and deed chain for long leases.' },
    ],
    payments: {
      minDepositPercent: 30,
      installmentOptions: 'Quarterly payments typical for high-end rentals; off-plan varies by developer.',
      refundPolicy: 'Developer contracts stipulate refund steps; read termination clauses carefully.',
    },
    media: ['https://images.unsplash.com/photo-1505691723518-36a5ac3b2d95?q=80&w=1200&auto=format&fit=crop'],
  },
  {
    city: 'Ikeja',
    neighborhoods: ['GRA', 'Allen', 'Opebi'],
    categories: ['Service Apartment', 'Rent', 'Land'],
    medianPriceNGN: 65000,
    highlights: ['Close to airport', 'Quieter streets', 'Corporate stays'],
    laws: [
      { title: 'Lagos Planning Permit', summary: 'Development and change-of-use require permits from LASPPPA/LASBCA.' },
    ],
    payments: {
      minDepositPercent: 15,
      installmentOptions: 'Monthly/Quarterly for rents; staged payments for land with excision/COO.',
      refundPolicy: 'Subject to due diligence outcomes; ensure escrow or trustee arrangements.',
    },
    media: ['https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop'],
  },
  {
    city: 'Abuja',
    neighborhoods: ['Central Area', 'Wuse', 'Gwarinpa'],
    categories: ['Service Apartment', 'Rent', 'Land'],
    medianPriceNGN: 95000,
    highlights: ['Planned districts', 'Good infrastructure', 'Steady power in select estates'],
    laws: [
      { title: 'FCTA Land Administration', summary: 'Titles via R of O/Statutory Right—verify with AGIS and consent for transfer.' },
      { title: 'Short-let Policies', summary: 'Some districts impose short-let restrictions—confirm HOA rules.' },
    ],
    payments: {
      minDepositPercent: 20,
      installmentOptions: '6–18 month developer plans for land/off-plan; proof of income required.',
      refundPolicy: 'Cooling-off varies; ensure clauses on delays and completion milestones.',
    },
    media: ['https://images.unsplash.com/photo-1499955085172-a104c9463ece?q=80&w=1200&auto=format&fit=crop'],
  },
];

