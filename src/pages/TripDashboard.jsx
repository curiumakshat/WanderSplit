import { useState, useEffect } from 'react';
import { useParams, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Calendar, Users, LayoutDashboard, Map, Wallet, Scale } from 'lucide-react';
import DestinationVoting from '../components/DestinationVoting';

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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Shell */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">{trip.name}</h2>
            <div className="flex flex-wrap gap-4 text-gray-600">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <MapPin size={18} className="text-teal-500" />
                <span className="font-medium">{trip.destination}</span>
              </div>
              {trip.start_date && (
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <Calendar size={18} className="text-teal-500" />
                  <span className="font-medium">{trip.start_date} - {trip.end_date || 'TBD'}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-3">
             <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Users size={18} className="text-teal-500" />
                <span className="font-semibold">{trip.members?.length || 0} Members</span>
             </div>
             <div className="flex -space-x-3 overflow-hidden">
                {trip.members?.map((member, i) => (
                  <div 
                    key={i} 
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm uppercase shadow-sm border border-teal-200"
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.path || (tab.name === 'Plan' && currentTab === `/trip/${id}`);
            return (
              <Link
                key={tab.name}
                to={tab.path}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                  isActive 
                  ? 'border-teal-600 text-teal-600 bg-teal-50/30' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.name}
              </Link>
            );
          })}
        </div>

        <div className="p-8 min-h-[400px]">
          <Routes>
            <Route index element={<DestinationVoting tripId={id} members={trip.members} />} />
            <Route path="plan" element={<DestinationVoting tripId={id} members={trip.members} />} />
            <Route path="itinerary" element={<div className="text-center py-20 text-gray-400 font-medium italic">Itinerary content coming soon...</div>} />
            <Route path="expenses" element={<div className="text-center py-20 text-gray-400 font-medium italic">Expenses content coming soon...</div>} />
            <Route path="settle" element={<div className="text-center py-20 text-gray-400 font-medium italic">Settle content coming soon...</div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default TripDashboard;
