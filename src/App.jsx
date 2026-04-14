import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateTripPage from './pages/CreateTripPage';
import TripDashboard from './pages/TripDashboard';

function App() {
  return (
    <div className="min-h-screen bg-stone-100">
      <nav className="border-b border-amber-100 bg-gradient-to-r from-amber-700 via-amber-600 to-orange-500 text-amber-50 shadow-lg shadow-amber-900/10">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-black tracking-tight">WanderSplit</h1>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
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
