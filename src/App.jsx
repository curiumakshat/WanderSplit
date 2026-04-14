import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateTripPage from './pages/CreateTripPage';
import TripDashboard from './pages/TripDashboard';
import { Plane } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-teal-100 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-teal-600 p-2 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-teal-200">
              <Plane size={24} className="text-white" />
            </div>
            <span className="text-2xl font-black text-teal-900 tracking-tighter">Wander<span className="text-teal-600">Split</span></span>
          </Link>
          
          <div className="flex items-center gap-6">
             <Link to="/" className="text-sm font-bold text-gray-600 hover:text-teal-600 transition-colors">My Trips</Link>
             <Link to="/create" className="bg-teal-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-teal-700 transition-all hover:shadow-lg hover:shadow-teal-100 active:scale-95">New Trip</Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto py-10 px-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateTripPage />} />
          <Route path="/trip/:id/*" element={<TripDashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
