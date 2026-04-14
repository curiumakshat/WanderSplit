import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, MapPin, Calendar, Plane, ArrowRight } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import BrandLogo from '../components/ui/BrandLogo';

function HomePage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/trips');
        setTrips(response.data);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <Card variant="gradient" className="overflow-hidden p-8 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-4">
              <BrandLogo size="md" className="shrink-0" />
              <div>
                <p className="eyebrow">Travel Control Room</p>
                <h2 className="section-title">Plan trips, vote fast, split cleanly.</h2>
              </div>
            </div>
            <p className="section-copy">
              WanderSplit keeps itinerary decisions, group expenses, and final settlements in one polished flow.
            </p>
          </div>
          <Link to="/create">
            <Button className="px-6 py-3 text-xs uppercase tracking-[0.24em]">
              <PlusCircle size={18} />
              Create New Trip
            </Button>
          </Link>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">My Trips</p>
          <h3 className="text-2xl font-black tracking-[-0.04em] text-white">Active adventures</h3>
        </div>
        <Badge variant="violet">{trips.length} Trips</Badge>
      </div>

      {loading ? (
        <Card className="p-12 text-center">
          <p className="eyebrow">Loading</p>
          <p className="mt-4 text-lg font-bold text-white/80">Syncing your trip library...</p>
        </Card>
      ) : trips.length === 0 ? (
        <Card className="border-dashed p-16 text-center">
          <p className="text-lg font-bold text-white/70">No trips planned yet.</p>
          <Link to="/create" className="mt-3 inline-block text-sm font-semibold text-lime-300 hover:underline">
            Start planning your first adventure
          </Link>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Link key={trip.id} to={`/trip/${trip.id}`} className="group">
              <Card variant="glass" className="relative overflow-hidden p-8 transition duration-500 group-hover:-translate-y-1 group-hover:border-violet-400/40 group-hover:shadow-[0_18px_60px_rgba(139,92,246,0.16)]">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl transition duration-500 group-hover:bg-lime-300/10" />

                <div className="relative z-10">
                  <div className="mb-6 flex items-start justify-between">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 shadow-sm transition-transform group-hover:scale-105">
                      <Plane size={24} className="text-violet-300" />
                    </div>
                    <Badge variant="lime">Open</Badge>
                  </div>

                  <h3 className="mb-2 text-2xl font-black tracking-[-0.04em] text-white transition-colors group-hover:text-lime-300">
                    {trip.name}
                  </h3>

                  <div className="flex flex-col gap-3 font-medium text-white/60">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
                        <MapPin size={16} className="text-lime-300" />
                      </div>
                      <span className="text-sm">{trip.destination}</span>
                    </div>

                    {trip.start_date ? (
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
                          <Calendar size={16} className="text-violet-300" />
                        </div>
                        <span className="text-sm">
                          {new Date(trip.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          {trip.end_date
                            ? ` - ${new Date(trip.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
                            : ''}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/50">
                      View Trip
                    </span>
                    <div className="flex h-10 w-10 scale-0 items-center justify-center rounded-full bg-lime-300 text-black transition-transform duration-300 group-hover:scale-100">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
