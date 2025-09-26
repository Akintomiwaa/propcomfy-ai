import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';

function cardImg(seed: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/2000/1600`;
}

export default function Auth() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [mode, setMode] = React.useState<'signin' | 'create'>('signin');

  const scenario = (search.get('scenario') || '').toLowerCase();
  const redirect = (() => {
    const raw = search.get('redirect') || '/';
    // prevent external redirects
    return raw.startsWith('/') ? raw : '/';
  })();

  React.useEffect(() => {
    document.title = 'PropComfy — Sign In';
  }, []);

  const title =
    scenario === 'hosts'
      ? 'Become a verified host'
      : scenario === 'investors'
      ? 'Invest in property assets'
      : 'Let’s get you settled';

  const subtitle =
    scenario === 'hosts'
      ? 'List apartments with verification and seamless payouts.'
      : scenario === 'investors'
      ? 'Diversify with asset‑backed units and track ROI.'
      : 'Book verified apartments with flexible deposits and instant payments.';

  function handleSignInSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') || '').trim();
    const phone = String(fd.get('phone') || '').trim() || undefined;
    const name = email ? email.split('@')[0] : 'Guest';
    signIn({ name, email, phone });
    navigate(redirect);
  }

  function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') || '').trim() || 'Guest';
    const email = String(fd.get('email') || '').trim();
    const phone = String(fd.get('phone') || '').trim();
    signIn({ name, email, phone });
    navigate(redirect);
  }

  function oauthSignIn(kind: 'google' | 'apple') {
    const mock =
      kind === 'google'
        ? { name: 'Google User', email: 'user@gmail.com' }
        : { name: 'Apple User', email: 'user@icloud.com' };
    signIn(mock);
    navigate(redirect);
  }

  return (
    <div className="w-full px-4 md:px-8">
      {/* Minimal page nav */}
      <nav className="sticky top-2 z-40">
        <div className="flex items-center justify-between gap-4 rounded-[14px] border border-[#1a1a1d] bg-[#0e0e0f]/75 backdrop-blur px-3 py-2 shadow-[0_6px_24px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#d6b14d] to-[#b99328]" />
            <Link to="/" className="text-[#f3f4f6] font-semibold tracking-[.02em]">PropComfy</Link>
          </div>
          <Link to="/" className="opacity-90">Back to Home</Link>
        </div>
      </nav>

      <main className="pt-2">
        <section className="grid grid-cols-1 md:grid-cols-2 min-h-[calc(100vh-72px)]">
          {/* Left: full-height image */}
          <div className="relative order-2 md:order-1 md:sticky md:top-[72px] md:h-[calc(100vh-72px)]">
            <img
              src={cardImg('propcomfy-auth')}
              alt="PropComfy apartments"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={(e) => {
                const t = e.currentTarget;
                t.onerror = null;
                t.src = 'https://placehold.co/1200x800/0e0e0f/9aa4b2?text=PropComfy';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute left-6 right-6 bottom-8">
              <div className="text-[26px] md:text-[32px] font-extrabold">Your stay, simplified</div>
              <p className="text-[#d4d7dd] text-sm md:text-[15px] mt-2 max-w-[560px]">Verified serviced apartments. Flexible deposits. Instant virtual accounts.</p>
            </div>
          </div>

          {/* Right: form area */}
          <div className="order-1 md:order-2 bg-[#0e0e0f] border-l border-[#1a1a1d] flex items-center justify-center p-6 md:p-12">
            <div className="w-full max-w-[460px] mx-auto text-center">
              <h1 className="text-[26px] md:text-[32px] font-extrabold">{title}</h1>
              <p className="text-[#d4d7dd] mt-2">{subtitle}</p>

              <div className="mt-6 flex gap-2 justify-center">
                <button
                  onClick={() => setMode('signin')}
                  className={`tab border border-[#1a1a1d] rounded-[10px] px-4 py-2 ${mode === 'signin' ? 'bg-[#141414]' : 'bg-[#0d0d0e]'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode('create')}
                  className={`tab border border-[#1a1a1d] rounded-[10px] px-4 py-2 ${mode === 'create' ? 'bg-[#141414]' : 'bg-[#0d0d0e]'}`}
                >
                  Create Account
                </button>
              </div>

              {mode === 'signin' ? (
                <form onSubmit={handleSignInSubmit} className="mt-6 grid grid-cols-1 gap-5 text-left">
                  <label className="text-sm">Email
                    <input required type="email" name="email" className="mt-2 w-full bg-transparent border-0 border-b border-[#2a2a2e] rounded-none px-0 py-3 focus:outline-none focus:border-[#d6b14d] placeholder-[#a0a4ad]" placeholder="you@example.com" />
                  </label>
                  <label className="text-sm">Phone (optional)
                    <input type="tel" name="phone" className="mt-2 w-full bg-transparent border-0 border-b border-[#2a2a2e] rounded-none px-0 py-3 focus:outline-none focus:border-[#d6b14d] placeholder-[#a0a4ad]" placeholder="e.g. 0803…" />
                  </label>
                  <button className="mt-2 inline-block border border-[#1a1a1d] rounded-[10px] px-5 py-2.5 bg-gradient-to-b from-[#d6b14d] to-[#b99328] text-black font-semibold">Continue</button>
                </form>
              ) : (
                <form onSubmit={handleCreateSubmit} className="mt-6 grid grid-cols-1 gap-5 text-left">
                  <label className="text-sm">Full name
                    <input required name="name" className="mt-2 w-full bg-transparent border-0 border-b border-[#2a2a2e] rounded-none px-0 py-3 focus:outline-none focus:border-[#d6b14d] placeholder-[#a0a4ad]" placeholder="Jane Doe" />
                  </label>
                  <label className="text-sm">Email
                    <input required type="email" name="email" className="mt-2 w-full bg-transparent border-0 border-b border-[#2a2a2e] rounded-none px-0 py-3 focus:outline-none focus:border-[#d6b14d] placeholder-[#a0a4ad]" placeholder="you@example.com" />
                  </label>
                  <label className="text-sm">Phone
                    <input required type="tel" name="phone" className="mt-2 w-full bg-transparent border-0 border-b border-[#2a2a2e] rounded-none px-0 py-3 focus:outline-none focus:border-[#d6b14d] placeholder-[#a0a4ad]" placeholder="e.g. 0803…" />
                  </label>
                  <button className="mt-2 inline-block border border-[#1a1a1d] rounded-[10px] px-5 py-2.5 bg-gradient-to-b from-[#d6b14d] to-[#b99328] text-black font-semibold">Create account</button>
                </form>
              )}

              <div className="mt-6">
                <div className="text-[#a0a4ad] text-sm mb-3">Or continue with</div>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => oauthSignIn('google')} className="border border-[#1a1a1d] rounded-[10px] px-4 py-2 bg-[#0d0d0e]">Google</button>
                  <button onClick={() => oauthSignIn('apple')} className="border border-[#1a1a1d] rounded-[10px] px-4 py-2 bg-[#0d0d0e]">Apple</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

