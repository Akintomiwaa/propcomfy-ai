import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import React, { useState } from 'react';

export default function NavBar({ onSearch }: { onSearch?: (q: string) => void }) {
  const { user, signOut } = useAuth();
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  return (
    <nav className="sticky top-2 z-40">
      <div className="flex items-center justify-between gap-4 rounded-[14px] border border-[#1a1a1d] bg-[#0e0e0f]/75 backdrop-blur px-3 py-2 shadow-[0_6px_24px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#d6b14d] to-[#b99328]" />
          <Link to="/" className="text-[#f3f4f6] font-semibold tracking-[.02em]">PropComfy</Link>
        </div>

        <div className="hidden md:flex items-center flex-1 max-w-[520px] mx-2">
          <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ onSearch?.(q); } }} className="flex-1 bg-[#0d0d0e] border border-[#1a1a1d] rounded-l-[10px] px-3 py-2 text-[14px] placeholder-[#a0a4ad]" placeholder="Search city, Studio/1BD/2BD, under 100k…" />
          <button onClick={()=>onSearch?.(q)} className="border border-[#1a1a1d] rounded-r-[10px] px-3 py-2 bg-gradient-to-b from-[#d6b14d] to-[#b99328] text-black text-[14px]">Search</button>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button onClick={()=>navigate('/assets')} className="opacity-90">My Assets</button>
              <button onClick={()=>signOut()} className="opacity-90">Sign Out</button>
            </>
          ) : (
            <Link to="/auth" className="opacity-90">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

