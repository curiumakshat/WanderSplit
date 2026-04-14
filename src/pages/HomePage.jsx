import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, MapPin, Calendar, Plane, ArrowRight } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">My Trips</h2>
        <Link 
          to="/create" 
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <PlusCircle size={20} />
          Create New Trip
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading trips...</div>
      ) : trips.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 mb-4 text-lg">No trips planned yet.</p>
          <Link to="/create" className="text-teal-600 font-semibold hover:underline">
            Start planning your first adventure!
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Link 
              key={trip.id} 
              to={`/trip/${trip.id}`}
              className="relative group bg-white/40 backdrop-blur-md p-8 rounded-3xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_32px_rgba(20,184,166,0.15)] transition-all duration-500 overflow-hidden hover:-translate-y-1"
            >
               {/* Decorative Gradient Background */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl group-hover:bg-teal-500/20 transition-all duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-white/60 rounded-2xl shadow-sm border border-white/50 group-hover:scale-110 transition-transform">
                    <Plane size={24} className="text-teal-600" />
                  </div>
                </div>

                <h3 className="text-2xl font-black mb-2 text-slate-900 group-hover:text-teal-700 transition-colors tracking-tight">{trip.name}</h3>
                
                <div className="flex flex-col gap-3 text-slate-600 font-medium">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                      <MapPin size={16} className="text-teal-500" />
                    </div>
                    <span className="text-sm">{trip.destination}</span>
                  </div>
                  {trip.start_date && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                        <Calendar size={16} className="text-teal-500" />
                      </div>
                      <span className="text-sm">
                        {new Date(trip.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        {trip.end_date ? ` - ${new Date(trip.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-teal-600/60 bg-teal-50/50 px-3 py-1 rounded-full border border-teal-100/50">View Trip</span>
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-300">
                     <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
