export type Unit = { title: string; br: number; guests: number; pricePerNight: number; highlights: string[] }

export type UnitsMap = Record<string, Unit[]>

export const unitsByCity: UnitsMap = {
  Lekki: [
    { title: 'Cozy Studio by the Lagoon', br: 0, guests: 2, pricePerNight: 65000, highlights: ['Wifi', 'Kitchen', 'Security'] },
    { title: 'Bright 1BR with Pool Access', br: 1, guests: 3, pricePerNight: 85000, highlights: ['Pool', 'Gym', 'Wifi'] },
  ],
  'Victoria Island': [
    { title: 'Modern 1BR with Terrace', br: 1, guests: 3, pricePerNight: 120000, highlights: ['Terrace', 'Security', 'AC'] },
    { title: 'Sea View 2BR Apartment', br: 2, guests: 5, pricePerNight: 145000, highlights: ['Sea view', 'Generator', 'Parking'] },
  ],
  Ajah: [
    { title: 'Minimalist Studio Close to Palms', br: 0, guests: 2, pricePerNight: 50000, highlights: ['Wifi', 'AC', 'Security'] },
  ],
  Ikeja: [
    { title: 'Ikeja GRA 1BR Near Airport', br: 1, guests: 2, pricePerNight: 60000, highlights: ['Wifi', 'Parking', 'Security'] },
  ],
}

