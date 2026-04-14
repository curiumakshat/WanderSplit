import { Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Button from './Button';
import BrandLogo from './BrandLogo';

export default function Navbar() {
  const location = useLocation();
  const onCreate = location.pathname === '/create';

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/55 backdrop-blur-xl">
      <div className="container-shell flex h-20 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-4">
          <BrandLogo size="sm" className="shadow-[0_14px_34px_rgba(124,58,237,0.18)]" />
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
