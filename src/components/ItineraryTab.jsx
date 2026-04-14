import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ItineraryTab = ({ tripId, destination }) => {
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapCoords, setMapCoords] = useState([51.505, -0.09]); // Default to London

  useEffect(() => {
    fetchItinerary();
    geocodeDestination();
  }, [tripId, destination]);

  const fetchItinerary = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/trips/${tripId}/itinerary`);
      if (response.ok) {
        const data = await response.json();
        setItinerary(data.content_json);
      }
    } catch (err) {
      console.error('Error fetching itinerary:', err);
    }
  };

  const geocodeDestination = async () => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setMapCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };

  const generateItinerary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/api/trips/${tripId}/itinerary/generate`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to generate itinerary');
      const data = await response.json();
      setItinerary(data.content_json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-4">
      {!itinerary && !loading && (
        <div className="flex flex-col items-center justify-center py-12 bg-purple-50 rounded-xl border-2 border-dashed border-purple-200">
          <h3 className="text-xl font-semibold text-purple-900 mb-4">No itinerary yet!</h3>
          <button
            onClick={generateItinerary}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 shadow-lg flex items-center"
          >
            <span className="mr-2">✨</span>
            Generate Itinerary with AI
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-4"></div>
          <p className="text-purple-700 font-medium animate-pulse">Consulting the travel spirits... ✨</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {itinerary && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
          {itinerary.map((day, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-md overflow-hidden border border-purple-100 hover:shadow-xl transition-shadow duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-purple-600 text-white p-4">
                <h4 className="font-bold text-lg">Day {day.day_number || index + 1}</h4>
                <p className="text-purple-100 text-sm">{day.date}</p>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h5 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Morning</h5>
                  <p className="text-gray-700">{day.morning_activity}</p>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Afternoon</h5>
                  <p className="text-gray-700">{day.afternoon_activity}</p>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Evening</h5>
                  <p className="text-gray-700">{day.evening_activity}</p>
                </div>
                <div className="pt-2 border-t border-purple-50">
                  <h5 className="text-xs font-bold text-orange-400 uppercase tracking-wider">🍴 Restaurant</h5>
                  <p className="text-gray-700 italic">{day.recommended_restaurant}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="h-96 w-full rounded-xl overflow-hidden shadow-inner border border-purple-200">
        <MapContainer center={mapCoords} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={mapCoords}>
            <Popup>
              {destination}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default ItineraryTab;
