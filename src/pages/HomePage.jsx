import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, MapPin, Calendar } from 'lucide-react';

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
        <div className="grid gap-6 md:grid-cols-2">
          {trips.map((trip) => (
            <Link 
              key={trip.id} 
              to={`/trip/${trip.id}`}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 group"
            >
              <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-teal-600">{trip.name}</h3>
              <div className="flex flex-col gap-2 text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-teal-500" />
                  <span>{trip.destination}</span>
                </div>
                {trip.start_date && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-teal-500" />
                    <span>{trip.start_date} {trip.end_date ? ` - ${trip.end_date}` : ''}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
