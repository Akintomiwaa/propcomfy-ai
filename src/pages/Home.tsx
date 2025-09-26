import React from 'react';
import NavBar from '../components/NavBar';
import { unitsByCity } from '../data/apartments';

function cardImg(city: string, title: string) {
  const seed = encodeURIComponent(`${city}-${title}`);
  return `https://picsum.photos/seed/${seed}/1200/800`;
}

export default function Home() {
  const [query, setQuery] = React.useState('');
  const rails = [
    { title: 'Service Apartments — Lekki', city: 'Lekki' },
    { title: 'Service Apartments — Ikate', city: 'Lekki' },
    { title: 'Service Apartments — VI', city: 'Victoria Island' },
    { title: 'Service Apartments — Ajah', city: 'Ajah' },
  ];

  return (
    <div className="w-full px-4 md:px-8">
      <NavBar onSearch={setQuery} />
      <main className="pt-2">
        <section className="relative overflow-hidden mb-6">
          <img src={cardImg('Lekki', 'hero')} alt="hero" className="w-full h-[60vh] md:h-[68vh] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          <div className="absolute left-4 bottom-4 max-w-[78%] pr-4">
            <div className="text-[28px] md:text-[38px] font-extrabold leading-tight">Cozy Studio by the Lagoon</div>
            <div className="text-[#d4d7dd] text-[15px] md:text-[17px] mt-2">Lekki • ₦65,000/night</div>
            <div className="text-[#a0a4ad] text-[13px] md:text-[14px] mt-1">Book verified stays with flexible deposits and instant virtual accounts.</div>
          </div>
        </section>

        {query && (
          <Rail title={`Search results: ${query}`} city={'Lekki'} units={(unitsByCity['Lekki'] || []).slice(0, 8)} />
        )}

        {rails.map((r) => (
          <Rail key={r.title} title={r.title} city={r.city} units={unitsByCity[r.city] || []} />
        ))}
      </main>
    </div>
  );
}

function Rail({ title, city, units }: { title: string; city: string; units: { title: string; br: number; guests: number; pricePerNight: number }[] }) {
  const minPrice = Math.min(...units.map((u) => u.pricePerNight));
  return (
    <section className="mb-8">
      <h3 className="mb-1 text-[18px] md:text-[22px] font-bold">{title}</h3>
      <p className="mb-3 text-[#a0a4ad] text-[13px] md:text-[14px]">
        {city} • {units.length} units • from ₦{isFinite(minPrice) ? minPrice.toLocaleString('en-NG') : 0}/night
      </p>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2">
        {units.map((u, i) => (
          <div key={i} className="shrink-0 w-[300px] snap-start">
            <div className="relative rounded-[12px] overflow-hidden group">
              <img src={cardImg(city, u.title)} alt={`${city} — ${u.title}`} className="w-full h-[260px] object-cover transition duration-200 group-hover:scale-[1.03]" />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                <div className="text-sm font-semibold">{u.title}</div>
                <div className="text-[12px] text-[#d4d7dd]">₦{u.pricePerNight.toLocaleString('en-NG')}/night • {u.br === 0 ? 'Studio' : `${u.br} BR`}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

