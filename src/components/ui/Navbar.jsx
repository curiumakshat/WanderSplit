import { Compass, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Button from './Button';

function BrandMark() {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#8b5cf6,#1f2937)] shadow-[0_12px_30px_rgba(139,92,246,0.35)]">
      <Compass size={22} className="text-lime-300" />
      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-lime-300 shadow-[0_0_16px_rgba(190,242,100,0.8)]" />
    </div>
  );
}

export default function Navbar() {
  const location = useLocation();
  const onCreate = location.pathname === '/create';

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/55 backdrop-blur-xl">
      <div className="container-shell flex h-20 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-4">
          <BrandMark />
          <div>
            <p className="text-lg font-black tracking-[-0.04em] text-white md:text-2xl">
              Wander<span className="text-violet-400">Split</span>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-white/45">Trips. Votes. Splits.</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className={`hidden rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.24em] transition md:inline-flex ${
              location.pathname === '/' ? 'text-lime-300' : 'text-white/55 hover:text-white'
            }`}
          >
            My Trips
          </Link>
          <Link to="/create">
            <Button variant={onCreate ? 'success' : 'primary'} className="px-5 py-3 text-xs uppercase tracking-[0.24em]">
              <Plus size={16} />
              New Trip
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
