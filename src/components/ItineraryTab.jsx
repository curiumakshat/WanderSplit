import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Sparkles, RefreshCw, Sunrise, Sun, Moon, Utensils } from 'lucide-react';

// Custom Marker with Neon Glow
const createGlowIcon = () => L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="
    background-color: #C6FF33;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 3px solid #000;
    box-shadow: 0 0 15px #C6FF33, 0 0 30px #C6FF33;
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const ItineraryTab = ({ tripId, destination }) => {
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapCoords, setMapCoords] = useState([51.505, -0.09]);

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
    <div className="space-y-12 pb-12">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
          <span className="bg-violet p-2 rounded-xl">
             <Sparkles className="text-white" size={24} />
          </span>
          AI Plan <span className="text-lime">Beta</span>
        </h2>
        {itinerary && (
          <button
            onClick={generateItinerary}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-semibold transition-all group"
          >
            <RefreshCw className={`group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} size={16} />
            Regenerate
          </button>
        )}
      </div>

      {!itinerary && !loading && (
        <div className="flex flex-col items-center justify-center py-20 glass-card bg-gradient-to-br from-white/5 to-white/0 border-white/10">
          <div className="w-20 h-20 bg-violet/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Sparkles className="text-violet" size={40} />
          </div>
          <h3 className="text-3xl font-black mb-2 tracking-tight">Your Dream Trip Awaits</h3>
          <p className="text-white/50 mb-8 max-w-sm text-center">Let our travel AI craft the perfect day-by-day experience for your group.</p>
          <button
            onClick={generateItinerary}
            className="bg-violet hover:bg-[#8e52f0] text-white px-8 py-4 rounded-2xl font-black transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(125,57,235,0.4)] flex items-center gap-3"
          >
            Craft My Itinerary
            <Sparkles size={20} />
          </button>
        </div>
      )}

      {loading && (
        <div className="space-y-8 animate-fadeIn">
          <div className="flex flex-col items-center justify-center py-20 glass-card relative overflow-hidden">
             <div className="absolute inset-0 animate-shimmer"></div>
             <div className="relative z-10 flex flex-col items-center">
                <div className="flex gap-2 mb-6">
                   <div className="w-3 h-3 bg-lime rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                   <div className="w-3 h-3 bg-violet rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                   <div className="w-3 h-3 bg-lime rounded-full animate-bounce"></div>
                </div>
                <h3 className="text-2xl font-black animate-pulse">Generating your dream trip...</h3>
                <p className="text-white/40 mt-2 font-medium">Analyzing local hotspots & hidden gems</p>
             </div>
          </div>
          {/* Skeleton Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1,2,3].map(i => (
                <div key={i} className="h-64 glass-card animate-shimmer opacity-20"></div>
             ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-2xl">
          {error}
        </div>
      )}

      {itinerary && !loading && (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {itinerary.map((day, index) => (
            <div 
              key={index} 
              className="glass-card glass-card-hover group animate-fadeIn"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="p-6 border-b border-white/5 bg-white/5 rounded-t-2xl flex justify-between items-start">
                <div>
                   <p className="text-xs font-black text-violet uppercase tracking-[0.2em] mb-1">Day {day.day_number || index + 1}</p>
                   <h4 className="font-black text-xl tracking-tight">{day.date}</h4>
                </div>
                <div className="bg-black/40 px-3 py-1 rounded-full border border-white/10 text-[10px] font-black uppercase text-white/40">
                   Plan
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 bg-white/5 p-2 rounded-lg text-white/40">
                    <Sunrise size={18} />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Morning</h5>
                    <p className="text-sm font-medium leading-relaxed">{day.morning_activity}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 bg-white/5 p-2 rounded-lg text-white/40">
                    <Sun size={18} />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Afternoon</h5>
                    <p className="text-sm font-medium leading-relaxed">{day.afternoon_activity}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 bg-white/5 p-2 rounded-lg text-white/40">
                    <Moon size={18} />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Evening</h5>
                    <p className="text-sm font-medium leading-relaxed">{day.evening_activity}</p>
                  </div>
                </div>
                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 bg-lime/10 border border-lime/20 p-3 rounded-xl">
                    <Utensils size={14} className="text-lime" />
                    <span className="text-xs font-black text-lime uppercase tracking-wider truncate">{day.recommended_restaurant}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="h-[500px] w-full glass-card overflow-hidden shadow-2xl relative">
        <div className="absolute top-4 left-4 z-[1000] bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs font-bold flex items-center gap-2">
           <div className="w-2 h-2 bg-lime rounded-full animate-pulse"></div>
           {destination} Exploration
        </div>
        <MapContainer 
          center={mapCoords} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          className="dark-map"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <Marker position={mapCoords} icon={createGlowIcon()}>
            <Popup className="dark-popup">
              <span className="font-bold">{destination}</span>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default ItineraryTab;
