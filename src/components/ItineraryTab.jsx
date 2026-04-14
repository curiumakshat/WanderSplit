import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Sparkles, RefreshCw, Sunrise, Sun, Moon, Utensils } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';

const createGlowIcon = () =>
  L.divIcon({
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
    iconAnchor: [10, 10],
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
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight text-white">
          <span className="rounded-xl bg-violet p-2">
            <Sparkles className="text-white" size={24} />
          </span>
          AI Plan <span className="text-lime">Beta</span>
        </h2>
        {itinerary ? (
          <Button onClick={generateItinerary} disabled={loading} variant="secondary" className="group px-4 py-2 text-sm font-semibold">
            <RefreshCw className={`duration-700 group-hover:rotate-180 ${loading ? 'animate-spin' : 'transition-transform'}`} size={16} />
            Regenerate
          </Button>
        ) : null}
      </div>

      {!itinerary && !loading ? (
        <Card variant="glass" className="flex flex-col items-center justify-center py-20">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-violet/20 animate-pulse">
            <Sparkles className="text-violet" size={40} />
          </div>
          <h3 className="mb-2 text-3xl font-black tracking-tight">Your dream trip awaits</h3>
          <p className="mb-8 max-w-sm text-center text-white/50">Let the AI draft a day-by-day plan for your group.</p>
          <Button onClick={generateItinerary} className="rounded-2xl px-8 py-4">
            Craft My Itinerary
            <Sparkles size={20} />
          </Button>
        </Card>
      ) : null}

      {loading ? (
        <div className="space-y-8 animate-fadeIn">
          <Card className="relative flex flex-col items-center justify-center overflow-hidden py-20">
            <div className="absolute inset-0 animate-shimmer"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-6 flex gap-2">
                <div className="h-3 w-3 animate-bounce rounded-full bg-lime [animation-delay:-0.3s]"></div>
                <div className="h-3 w-3 animate-bounce rounded-full bg-violet [animation-delay:-0.15s]"></div>
                <div className="h-3 w-3 animate-bounce rounded-full bg-lime"></div>
              </div>
              <h3 className="text-2xl font-black animate-pulse">Generating your dream trip...</h3>
              <p className="mt-2 font-medium text-white/40">Analyzing local hotspots and hidden gems</p>
            </div>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((index) => (
              <Card key={index} className="h-64 animate-shimmer opacity-20"></Card>
            ))}
          </div>
        </div>
      ) : null}

      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">{error}</div> : null}

      {itinerary && !loading ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {itinerary.map((day, index) => (
            <Card key={index} className="group animate-fadeIn overflow-hidden" style={{ animationDelay: `${index * 150}ms` }}>
              <div className="flex items-start justify-between rounded-t-2xl border-b border-white/5 bg-white/5 p-6">
                <div>
                  <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-violet">Day {day.day_number || index + 1}</p>
                  <h4 className="text-xl font-black tracking-tight">{day.date}</h4>
                </div>
                <div className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-black uppercase text-white/40">Plan</div>
              </div>
              <div className="space-y-6 p-6">
                <div className="flex gap-4">
                  <div className="mt-1 rounded-lg bg-white/5 p-2 text-white/40">
                    <Sunrise size={18} />
                  </div>
                  <div>
                    <h5 className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/30">Morning</h5>
                    <p className="text-sm font-medium leading-relaxed">{day.morning_activity}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 rounded-lg bg-white/5 p-2 text-white/40">
                    <Sun size={18} />
                  </div>
                  <div>
                    <h5 className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/30">Afternoon</h5>
                    <p className="text-sm font-medium leading-relaxed">{day.afternoon_activity}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 rounded-lg bg-white/5 p-2 text-white/40">
                    <Moon size={18} />
                  </div>
                  <div>
                    <h5 className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/30">Evening</h5>
                    <p className="text-sm font-medium leading-relaxed">{day.evening_activity}</p>
                  </div>
                </div>
                <div className="border-t border-white/5 pt-6">
                  <div className="flex items-center gap-2 rounded-xl border border-lime/20 bg-lime/10 p-3">
                    <Utensils size={14} className="text-lime" />
                    <span className="truncate text-xs font-black uppercase tracking-wider text-lime">{day.recommended_restaurant}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      <Card className="relative h-[500px] w-full overflow-hidden shadow-2xl">
        <div className="absolute left-4 top-4 z-[1000] flex items-center gap-2 rounded-full border border-white/20 bg-black/80 px-4 py-2 text-xs font-bold backdrop-blur-md">
          <div className="h-2 w-2 animate-pulse rounded-full bg-lime"></div>
          {destination} Exploration
        </div>
        <MapContainer center={mapCoords} zoom={13} style={{ height: '100%', width: '100%' }} className="dark-map">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          <Marker position={mapCoords} icon={createGlowIcon()}>
            <Popup className="dark-popup">
              <span className="font-bold">{destination}</span>
            </Popup>
          </Marker>
        </MapContainer>
      </Card>
    </div>
  );
};

export default ItineraryTab;
