import { useState, useEffect } from 'react';
import { useParams, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Calendar, Users, LayoutDashboard, Map, Wallet, Scale } from 'lucide-react';
import DestinationVoting from '../components/DestinationVoting';
import ItineraryTab from '../components/ItineraryTab';
import ExpensesTab from '../components/ExpensesTab';
import SettleTab from '../components/SettleTab';

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

  if (loading) return <div className="text-center py-10">Loading trip details...</div>;
  if (!trip) return <div className="text-center py-10 text-red-500">Trip not found.</div>;

  const tabs = [
    { name: 'Plan', path: `/trip/${id}/plan`, icon: <LayoutDashboard size={18} /> },
    { name: 'Itinerary', path: `/trip/${id}/itinerary`, icon: <Map size={18} /> },
    { name: 'Expenses', path: `/trip/${id}/expenses`, icon: <Wallet size={18} /> },
    { name: 'Settle', path: `/trip/${id}/settle`, icon: <Scale size={18} /> },
  ];

  const currentTab = location.pathname;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header Shell */}
      <div className="glass-card p-10 bg-gradient-to-br from-white/10 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-6">
            <h2 className="text-6xl font-black text-white leading-none tracking-tight">
               {trip.name}
            </h2>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                <MapPin size={16} className="text-lime" />
                <span className="font-black uppercase tracking-widest text-[10px]">{trip.destination}</span>
              </div>
              {trip.start_date && (
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                  <Calendar size={16} className="text-violet" />
                  <span className="font-black uppercase tracking-widest text-[10px]">{trip.start_date} - {trip.end_date || 'TBD'}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-4">
             <div className="flex items-center gap-2 text-white/50 mb-2 font-black uppercase tracking-tighter text-sm">
                <Users size={16} className="text-lime" />
                <span>{trip.members?.length || 0} Explorers</span>
             </div>
             <div className="flex -space-x-4">
                {trip.members?.map((member, i) => (
                  <div 
                    key={i} 
                    className="h-12 w-12 rounded-full ring-4 ring-black bg-violet text-white flex items-center justify-center font-black text-xs uppercase shadow-2xl border border-white/20 transition-transform hover:-translate-y-2 cursor-pointer"
                    title={member.name}
                  >
                    {member.name.charAt(0)}
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Tabs Shell */}
      <div className="space-y-8">
        <div className="flex gap-4 p-1.5 glass-card bg-white/5 rounded-full overflow-hidden w-fit mx-auto">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.path || (tab.name === 'Plan' && currentTab === `/trip/${id}`);
            return (
              <Link
                key={tab.name}
                to={tab.path}
                className={`flex items-center gap-2 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  isActive 
                  ? 'bg-lime text-black shadow-[0_0_20px_rgba(198,255,51,0.4)]' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
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
