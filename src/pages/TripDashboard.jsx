import { useState, useEffect } from 'react';
import { useParams, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Calendar, Users, LayoutDashboard, Map, Wallet, Scale } from 'lucide-react';
import DestinationVoting from '../components/DestinationVoting';
import ItineraryTab from '../components/ItineraryTab';
import ExpensesTab from '../components/ExpensesTab';
import SettleTab from '../components/SettleTab';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

function TripDashboard() {
  const { id } = useParams();
  const location = useLocation();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/trips/${id}`);
        setTrip(response.data);
      } catch (error) {
        console.error('Error fetching trip:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  if (loading) return <Card className="p-12 text-center">Loading trip details...</Card>;
  if (!trip) return <Card className="p-12 text-center text-rose-300">Trip not found.</Card>;

  const tabs = [
    { name: 'Plan', path: `/trip/${id}/plan`, icon: <LayoutDashboard size={18} /> },
    { name: 'Itinerary', path: `/trip/${id}/itinerary`, icon: <Map size={18} /> },
    { name: 'Expenses', path: `/trip/${id}/expenses`, icon: <Wallet size={18} /> },
    { name: 'Settle', path: `/trip/${id}/settle`, icon: <Scale size={18} /> },
  ];

  const currentTab = location.pathname;

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <Card variant="glass" className="overflow-hidden p-8 md:p-10">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="eyebrow">Trip Dashboard</p>
              <h2 className="text-5xl font-black leading-none tracking-[-0.05em] text-white md:text-6xl">{trip.name}</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <MapPin size={16} className="text-lime" />
                <span className="font-black uppercase tracking-widest text-[10px] text-white/70">{trip.destination}</span>
              </div>
              {trip.start_date ? (
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <Calendar size={16} className="text-violet" />
                  <span className="font-black uppercase tracking-widest text-[10px] text-white/70">
                    {trip.start_date} - {trip.end_date || 'TBD'}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 md:items-end">
            <div className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-tighter text-white/50">
              <Users size={16} className="text-lime" />
              <span>{trip.members?.length || 0} Explorers</span>
            </div>
            <div className="flex -space-x-4">
              {trip.members?.map((member, index) => (
                <div
                  key={index}
                  className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-violet text-xs font-black uppercase text-white shadow-2xl ring-4 ring-black transition-transform hover:-translate-y-2"
                  title={member.name}
                >
                  {member.name.charAt(0)}
                </div>
              ))}
            </div>
            <div className="pt-2">
              <Badge variant="violet">Shared design system active</Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-8">
        <div className="mx-auto flex w-fit gap-4 rounded-full border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-xl">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.path || (tab.name === 'Plan' && currentTab === `/trip/${id}`);
            return (
              <Link
                key={tab.name}
                to={tab.path}
                className={`flex items-center gap-2 rounded-full px-8 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                  isActive ? 'bg-lime text-black shadow-[0_0_20px_rgba(198,255,51,0.4)]' : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.name}
              </Link>
            );
          })}
        </div>

        <div className="min-h-[400px]">
          <Routes>
            <Route index element={<DestinationVoting tripId={id} members={trip.members} />} />
            <Route path="plan" element={<DestinationVoting tripId={id} members={trip.members} />} />
            <Route path="itinerary" element={<ItineraryTab tripId={trip.id} destination={trip.destination} />} />
            <Route path="expenses" element={<ExpensesTab tripId={id} />} />
            <Route path="settle" element={<SettleTab tripId={trip.id} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default TripDashboard;
