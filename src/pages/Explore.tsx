import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { useAuth } from '../lib/auth';
import type { Unit, UnitsMap } from '../data/apartments';
import { unitsByCity as baseUnits } from '../data/apartments';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - vite/ts supports json imports via resolveJsonModule
import mediaJson from '../../no-build-media.json' assert { type: 'json' };

type MediaItem = { type: 'image' | 'video' | 'gif'; src: string };
type MediaMap = Record<string, { media: MediaItem[] }>; // city -> media list

function cardImg(city: string, title = '') {
  const seed = encodeURIComponent(`${city || 'city'}-${title || 'unit'}`);
  return `https://picsum.photos/seed/${seed}/1200/800`;
}

function mapWithIkate(m: UnitsMap): UnitsMap {
  const out: UnitsMap = { ...m };
  const lekki = m['Lekki'] || [];
  out['Ikate'] = lekki.filter((u) => /ikate/i.test(u.title)).concat(lekki.slice(0, 1));
  return out;
}

function ensureMinUnits(units: Unit[], minCount: number, city: string): Unit[] {
  const result = [...(units || [])];
  const base = units?.length ? units : [{ title: `${city} Apartment`, br: 1, guests: 2, pricePerNight: 80000, highlights: ['Wifi', 'Security'] }];
  let i = 0;
  while (result.length < minCount) {
    const src = base[i % base.length];
    result.push({ ...src, title: `${src.title} #${result.length + 1}` });
    i++;
  }
  return result;
}

function parseBudget(q: string) {
  const m = q.match(/(?:under|<=?|max|below)\s*(?:₦|ngn|#)?\s*([\d,.]+)\s*([km])?/i);
  if (!m) return null;
  let n = Number(String(m[1]).replace(/[,]/g, ''));
  if (!isFinite(n)) return null;
  if (m[2]) n = m[2].toLowerCase() === 'k' ? n * 1000 : n * 1_000_000;
  return Math.round(n);
}

function parseBedrooms(q: string) {
  if (/studio|\b0\s*bd|\b0\s*br/i.test(q)) return 0;
  const m = q.match(/(\d+)\s*(?:bd|br|bed(?:rooms?)?)/i);
  return m ? Number(m[1]) : null;
}

function parseCity(q: string): string {
  if (/\bvi\b|victoria\s*island/i.test(q)) return 'Victoria Island';
  if (/lekki|ikate/i.test(q)) return /ikate/i.test(q) ? 'Ikate' : 'Lekki';
  if (/ajah/i.test(q)) return 'Ajah';
  if (/ikeja/i.test(q)) return 'Ikeja';
  return '';
}

function allUnits(map: UnitsMap) {
  const arr: (Unit & { city: string })[] = [];
  Object.entries(map).forEach(([city, list]) => {
    (list || []).forEach((u) => arr.push({ city, ...u }));
  });
  return arr;
}

function filterUnits(map: UnitsMap, city: string, filter: string) {
  const all = map[city] || [];
  if (!filter || filter === 'all') return all;
  if (filter === 'studio') return all.filter((u) => (u.br || 0) === 0);
  if (filter === '1bd') return all.filter((u) => u.br === 1);
  if (filter === '2bd') return all.filter((u) => u.br === 2);
  if (filter === '3bd') return all.filter((u) => (u.br || 0) >= 3);
  return all;
}

function useLocalStorage<T>(key: string, initial: T) {
  const [state, setState] = React.useState<T>(initial);
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = React.useCallback(
    (val: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof val === 'function' ? (val as (p: T) => T)(prev) : val;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [key]
  );
  return [state, set] as const;
}

type ModalState =
  | { kind: 'none' }
  | { kind: 'media'; city: string }
  | { kind: 'details'; city: string; unit: Unit }
  | { kind: 'booking'; city: string; unit: Unit }
  | { kind: 'payment'; city: string; type: string; amount: number }
  | { kind: 'assets' }
  | { kind: 'lightbox'; media: MediaItem };

export default function Explore() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const unitsMap = React.useMemo(() => mapWithIkate(baseUnits), []);
  const [query, setQuery] = React.useState('');
  const [assets, setAssets] = useLocalStorage<any[]>('pc_assets', []);
  const [va, setVa] = useLocalStorage<{ bank: string; number: string; name: string } | null>('pc_va', null);
  const [modal, setModal] = React.useState<ModalState>({ kind: 'none' });

  React.useEffect(() => {
    document.title = 'PropComfy — Explore';
  }, []);

  function handleMedia(city: string) {
    setModal({ kind: 'media', city });
  }
  function handleDetails(city: string, unit: Unit) {
    setModal({ kind: 'details', city, unit });
  }
  function handleBook(city: string, unit: Unit) {
    if (!user) {
      navigate(`/auth?redirect=/explore`);
      return;
    }
    setModal({ kind: 'booking', city, unit });
  }
  function ensureVA() {
    if (va) return va;
    const newVa = {
      bank: 'PropBank (Demo)',
      number: '10' + Math.floor(100000000 + Math.random() * 899999999),
      name: `PropComfy Custody - ${user?.name || 'Customer'}`,
    };
    setVa(newVa);
    return newVa;
  }
  function addAsset(a: { city: string; type: string; amount: number; status?: string }) {
    setAssets((list) => [...(list || []), { id: 'a' + Date.now(), createdAt: new Date().toISOString(), currency: 'NGN', status: 'pending', ...a }]);
  }

  const all = React.useMemo(() => allUnits(unitsMap), [unitsMap]);
  const searchResults = React.useMemo(() => {
    const q = query.trim();
    if (!q) return [] as (Unit & { city: string })[];
    const city = parseCity(q);
    const bd = parseBedrooms(q);
    const budget = parseBudget(q);
    return all.filter((u) => {
      if (city && !new RegExp(city, 'i').test(u.city)) return false;
      if (bd !== null && bd !== undefined && (u.br || 0) !== bd) return false;
      if (budget && (u.pricePerNight || 0) > budget) return false;
      return new RegExp(q.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i').test(u.title) || !q;
    });
  }, [all, query]);

  return (
    <div className="w-full px-4 md:px-8">
      <NavBar onSearch={setQuery} />

      <main className="pt-2">
        <section aria-live="polite">
          {query && (
            <div className="mb-8">
              <h3 className="mb-1 text-[18px] md:text-[22px] font-bold">Search results</h3>
              <p className="mb-3 text-[#a0a4ad] text-[13px] md:text-[14px]">
                {parseCity(query) || 'All Lagos'}
                {(() => {
                  const bd = parseBedrooms(query);
                  return bd !== null && bd !== undefined ? ` • ${bd === 0 ? 'Studio' : bd + ' BD'}` : '';
                })()}
                {(() => {
                  const b = parseBudget(query);
                  return b ? ` • under ₦${b.toLocaleString('en-NG')}` : '';
                })()}
              </p>
              <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2">
                {ensureMinUnits(searchResults, 8, parseCity(query) || 'Lagos').map((u, i) => (
                  <Card key={i} city={(u as any).city || parseCity(query) || 'Lagos'} unit={u} onMedia={handleMedia} onBook={handleBook} onDetails={handleDetails} />
                ))}
              </div>
            </div>
          )}
        </section>

        <Hero city="Lekki" unit={(unitsMap['Lekki'] || [])[0]} onMedia={() => handleMedia('Lekki')} onBook={() => unitsMap['Lekki']?.[0] && handleBook('Lekki', unitsMap['Lekki'][0])} />

        <Rail title="Service Apartments — Lekki" city="Lekki" unitsMap={unitsMap} onMedia={handleMedia} onBook={handleBook} onDetails={handleDetails} />
        <Rail title="Service Apartments — Ikate" city="Ikate" unitsMap={unitsMap} onMedia={handleMedia} onBook={handleBook} onDetails={handleDetails} />
        <Rail title="Service Apartments — VI" city="Victoria Island" unitsMap={unitsMap} onMedia={handleMedia} onBook={handleBook} onDetails={handleDetails} />
        <Rail title="Service Apartments — Ajah" city="Ajah" unitsMap={unitsMap} onMedia={handleMedia} onBook={handleBook} onDetails={handleDetails} />

        <ContinueRail assets={assets} />
      </main>

      {/* Modals */}
      {modal.kind !== 'none' && (
        <Overlay onClose={() => setModal({ kind: 'none' })}>
          {modal.kind === 'media' && <MediaModal city={modal.city} onOpen={(m) => setModal({ kind: 'lightbox', media: m })} />}
          {modal.kind === 'details' && <DetailsModal city={modal.city} unit={modal.unit} onMedia={() => setModal({ kind: 'media', city: modal.city })} onBook={() => setModal({ kind: 'booking', city: modal.city, unit: modal.unit })} />}
          {modal.kind === 'booking' && (
            <BookingModal
              city={modal.city}
              unit={modal.unit}
              onPay={(amt) => setModal({ kind: 'payment', city: modal.city, type: `Apartment Booking — ${modal.unit.title}`, amount: amt })}
            />
          )}
          {modal.kind === 'payment' && (
            <PaymentModal
              va={ensureVA()}
              city={modal.city}
              type={modal.type}
              amount={modal.amount}
              onPaid={() => {
                addAsset({ city: modal.city, type: modal.type, amount: modal.amount });
                setModal({ kind: 'none' });
                alert('Payment recorded. View it in My Assets.');
              }}
            />
          )}
          {modal.kind === 'assets' && <AssetsModal assets={assets} />}
          {modal.kind === 'lightbox' && <Lightbox media={modal.media} />}
        </Overlay>
      )}
    </div>
  );
}

function Hero({ city, unit, onMedia, onBook }: { city: string; unit?: Unit; onMedia: () => void; onBook: () => void }) {
  return (
    <section className="relative overflow-hidden mb-6">
      <img src={cardImg(city, 'hero')} alt={`${city} hero`} className="w-full h-[60vh] md:h-[68vh] object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
      <div className="absolute left-4 bottom-4 max-w-[78%] pr-4">
        <div className="text-[28px] md:text-[38px] font-extrabold leading-tight">{unit ? unit.title : `Featured Apartments in ${city}`}</div>
        <div className="text-[#d4d7dd] text-[15px] md:text-[17px] mt-2">
          {city} • {unit ? `₦${unit.pricePerNight.toLocaleString('en-NG')}/night` : 'Great locations, flexible stays'}
        </div>
        <div className="text-[#a0a4ad] text-[13px] md:text-[14px] mt-1">Book verified stays with flexible deposits and instant virtual accounts.</div>
        <div className="mt-4 flex gap-3">
          <button className="border border-[#d6b14d]/60 text-[#f3f4f6] rounded-[10px] px-4 py-2 bg-[#0d0d0e]/80 hover:bg-[#141414]" onClick={onMedia}>
            View media
          </button>
          {unit && (
            <button className="border border-[#1a1a1d] rounded-[10px] px-5 py-2.5 bg-gradient-to-b from-[#d6b14d] to-[#b99328] text-black font-semibold" onClick={onBook}>
              Book now
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function Rail({ title, city, unitsMap, onMedia, onBook, onDetails }: { title: string; city: string; unitsMap: UnitsMap; onMedia: (city: string) => void; onBook: (city: string, unit: Unit) => void; onDetails: (city: string, unit: Unit) => void }) {
  const [filter, setFilter] = React.useState('all');
  const list = filterUnits(unitsMap, city, filter);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const count = (unitsMap[city] || []).length;
  const minPrice = Math.min(...(unitsMap[city] || []).map((u) => u.pricePerNight));

  return (
    <section className="mb-8">
      <h3 className="mb-1 text-[18px] md:text-[22px] font-bold">{title}</h3>
      <p className="mb-3 text-[#a0a4ad] text-[13px] md:text-[14px]">
        {city} • {count} {count === 1 ? 'unit' : 'units'} {isFinite(minPrice) && minPrice > 0 ? `• from ₦${minPrice.toLocaleString('en-NG')}/night` : ''}
      </p>
      <div className="mb-2 flex flex-wrap gap-2">
        {['All', 'Studio', '1BD', '2BD', '3BD', 'More'].map((label) => {
          const f = label.toLowerCase();
          const active = (label === 'All' && filter === 'all') || f === filter;
          return (
            <button key={label} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full border text-xs ${active ? 'border-[rgba(214,177,77,0.45)] bg-[#141414]' : 'border-[#1a1a1d] bg-[#0d0d0e]'}`}>
              {label}
            </button>
          );
        })}
      </div>
      <div ref={scrollRef} className="rail-scroll flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2">
        {ensureMinUnits(list, 12, city).map((u, i) => (
          <Card key={i} city={city} unit={u} onMedia={onMedia} onBook={onBook} onDetails={onDetails} />
        ))}
      </div>
      <div className="mt-1 flex justify-end gap-2">
        <button className="border border-[#1a1a1d] rounded-[10px] px-2 py-1 text-xs bg-[#0d0d0e]" aria-label="Scroll left" onClick={() => scrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}>
          ◄
        </button>
        <button className="border border-[#1a1a1d] rounded-[10px] px-2 py-1 text-xs bg-[#0d0d0e]" aria-label="Scroll right" onClick={() => scrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}>
          ►
        </button>
      </div>
    </section>
  );
}

function Card({ city, unit, onMedia, onBook, onDetails }: { city: string; unit: Unit; onMedia: (city: string) => void; onBook: (city: string, unit: Unit) => void; onDetails: (city: string, unit: Unit) => void }) {
  return (
    <div className="shrink-0 w-[300px] snap-start">
      <div className="relative rounded-[12px] overflow-hidden group">
        <img src={cardImg(city, unit.title)} alt={`${city} — ${unit.title}`} className="w-full h-[260px] object-cover transition duration-200 group-hover:scale-[1.03]" />
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
          <div className="text-sm font-semibold">{unit.title}</div>
          <div className="text-[12px] text-[#d4d7dd]">₦{unit.pricePerNight.toLocaleString('en-NG')}/night • {unit.br === 0 ? 'Studio' : `${unit.br} BR`}</div>
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <button className="border border-[#1a1a1d] rounded-[10px] px-2 py-1 text-sm bg-[#0d0d0e]" onClick={() => onMedia(city)}>
          Media
        </button>
        <button className="border border-[#1a1a1d] rounded-[10px] px-2 py-1 text-sm bg-[#0d0d0e]" onClick={() => onBook(city, unit)}>
          Book
        </button>
        <button className="border border-[#1a1a1d] rounded-[10px] px-2 py-1 text-sm bg-[#0d0d0e]" onClick={() => onDetails(city, unit)}>
          Details
        </button>
      </div>
    </div>
  );
}

function ContinueRail({ assets }: { assets: any[] }) {
  if (!assets?.length) return null;
  return (
    <section className="mb-8">
      <h3 className="mb-1 text-[18px] md:text-[22px] font-bold">Continue where you left off</h3>
      <p className="mb-3 text-[#a0a4ad] text-[13px] md:text-[14px]">{assets.length} in progress — deposits or bookings</p>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2">
        {assets.map((a, i) => (
          <div key={i} className="shrink-0 w-[300px] snap-start">
            <div className="rounded-[12px] border border-[#1a1a1d] bg-[#0e0e0f] p-3 h-[170px] flex flex-col justify-between">
              <div>
                <div className="text-sm font-semibold">{a.type}</div>
                <div className="text-[#d4d7dd] text-sm mt-1">{a.city} • ₦{Number(a.amount || 0).toLocaleString('en-NG')}</div>
                <div className="text-[#a0a4ad] text-xs mt-1">{new Date(a.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-xs capitalize">Status: {a.status || 'pending'}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="max-w-3xl w-full bg-[#0e0e0f] border border-[#1a1a1d] rounded-[16px] p-4 relative">
        <button className="absolute top-2 right-2 text-sm border border-[#1a1a1d] rounded-[10px] px-2 py-1 bg-[#0d0d0e]" onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

function DetailsModal({ city, unit, onMedia, onBook }: { city: string; unit: Unit; onMedia: () => void; onBook: () => void }) {
  return (
    <>
      <div className="text-lg font-semibold mb-2">{unit.title}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <img src={cardImg(city, unit.title)} alt={`${city} — ${unit.title}`} className="w-full h-48 object-cover rounded-[10px]" />
        <div>
          <div className="text-[#d4d7dd] text-sm mb-2">
            {city} • ₦{Number(unit.pricePerNight).toLocaleString('en-NG')}/night
          </div>
          <div className="flex gap-2">
            <button className="border border-[#1a1a1d] rounded-[10px] px-3 py-2 bg-[#0d0d0e]" onClick={onMedia}>
              View media
            </button>
            <button className="border border-[#1a1a1d] rounded-[10px] px-3 py-2 bg-gradient-to-b from-[#d6b14d] to-[#b99328] text-black" onClick={onBook}>
              Book
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function BookingModal({ city, unit, onPay }: { city: string; unit: Unit; onPay: (amount: number) => void }) {
  const [nights, setNights] = React.useState(2);
  const total = Math.max(1, nights) * unit.pricePerNight;
  return (
    <>
      <div className="text-lg font-semibold mb-2">Book — {unit.title}</div>
      <div className="grid grid-cols-1 gap-3">
        <div className="text-[#d4d7dd] text-sm">
          {city} • ₦{Number(unit.pricePerNight).toLocaleString('en-NG')}/night
        </div>
        <label className="text-sm">
          Check-in date
          <input type="date" className="mt-1 bg-transparent border border-[#1a1a1d] rounded-[10px] px-3 py-2 w-full" />
        </label>
        <label className="text-sm">
          Nights
          <input
            type="number"
            min={1}
            value={nights}
            onChange={(e) => setNights(Math.max(1, Number(e.target.value || '1')))}
            className="mt-1 bg-transparent border border-[#1a1a1d] rounded-[10px] px-3 py-2 w-full"
          />
        </label>
        <div className="text-sm">Total: ₦{total.toLocaleString('en-NG')}</div>
        <button className="border border-[#1a1a1d] rounded-[10px] px-3 py-2 bg-gradient-to-b from-[#d6b14d] to-[#b99328] text-black font-semibold" onClick={() => onPay(total)}>
          Proceed to payment
        </button>
      </div>
    </>
  );
}

function PaymentModal({ va, city, type, amount, onPaid }: { va: { bank: string; number: string; name: string }; city: string; type: string; amount: number; onPaid: () => void }) {
  return (
    <>
      <div className="text-lg font-semibold mb-2">Proceed to payment — {city}</div>
      <div className="col-span-2 text-[#d4d7dd] text-sm mb-2">Transfer your reservation deposit to your dedicated virtual account.</div>
      <div className="bg-[#0d0d0e] border border-[#1a1a1d] rounded-[12px] p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="text-[#f3f4f6]">Bank</div>
          <div className="font-semibold">{va.bank}</div>
        </div>
        <div>
          <div className="text-[#f3f4f6]">Account Number</div>
          <div className="font-semibold">{va.number}</div>
        </div>
        <div className="md:col-span-2">
          <div className="text-[#f3f4f6]">Account Name</div>
          <div className="font-semibold">{va.name}</div>
        </div>
        <div className="md:col-span-2">
          <button className="mt-1 border border-[#1a1a1d] rounded-[10px] px-3 py-2 bg-gradient-to-b from-[#d6b14d] to-[#b99328] text-black font-semibold" onClick={onPaid}>
            I’ve paid the deposit
          </button>
        </div>
      </div>
      <div className="text-xs text-[#a0a4ad] mt-2">Amount: ₦{amount.toLocaleString('en-NG')} • {type}</div>
    </>
  );
}

function MediaModal({ city, onOpen }: { city: string; onOpen: (m: MediaItem) => void }) {
  const items = mediaFor(city);
  return (
    <>
      <div className="text-lg font-semibold mb-2">Media — {city}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((it, idx) => (
          <button key={idx} className="text-left" onClick={() => onOpen(it)}>
            {it.type === 'video' ? (
              <video className="w-full rounded-[10px] cursor-zoom-in" controls src={it.src}></video>
            ) : (
              <img className="w-full h-48 object-cover rounded-[10px] cursor-zoom-in" src={it.src} alt={`${city} media`} />
            )}
          </button>
        ))}
      </div>
    </>
  );
}

function Lightbox({ media }: { media: MediaItem }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 p-4">
      <div className="max-w-5xl w-full relative">
        {media.type === 'video' ? (
          <video className="w-full max-h-[80vh] rounded-[12px]" controls src={media.src}></video>
        ) : (
          <img className="w-full max-h-[80vh] object-contain rounded-[12px]" src={media.src} />
        )}
      </div>
    </div>
  );
}

function AssetsModal({ assets }: { assets: any[] }) {
  return (
    <>
      <div className="text-lg font-semibold mb-2">My Assets</div>
      {!assets?.length ? (
        <div className="text-[#d4d7dd]">No assets yet.</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[#d4d7dd]">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Type</th>
                <th className="p-2">City</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a, i) => (
                <tr key={i} className="border-t border-[#1a1a1d]">
                  <td className="p-2">{new Date(a.createdAt).toLocaleString()}</td>
                  <td className="p-2">{a.type}</td>
                  <td className="p-2">{a.city}</td>
                  <td className="p-2">₦{Number(a.amount || 0).toLocaleString('en-NG')}</td>
                  <td className="p-2 capitalize">{a.status || 'pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function mediaFor(city: string): MediaItem[] {
  const key = resolveCityKey(city);
  const media: MediaMap = mediaJson as MediaMap;
  const entry = media[key] || media[capitalize(key)] || (media as any)[key?.toUpperCase?.()] || null;
  const base: MediaItem[] = [{ type: 'image', src: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c05c?q=80&w=1200&auto=format&fit=crop' }];
  if (entry?.media?.length) return base.concat(entry.media as any);
  return base.concat([
    { type: 'image', src: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1200&auto=format&fit=crop' },
    { type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  ]);
}

function resolveCityKey(city: string) {
  if (/^vi$/i.test(city)) return 'Victoria Island';
  if (/ikate/i.test(city)) return 'Lekki';
  return city;
}
function capitalize(s: string) {
  return (s || '').charAt(0).toUpperCase() + (s || '').slice(1);
}

