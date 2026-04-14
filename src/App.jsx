import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateTripPage from './pages/CreateTripPage';
import TripDashboard from './pages/TripDashboard';

function App() {
  return (
    <div className="min-h-screen">
      <nav className="bg-teal-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">WanderSplit</h1>
        </div>
      </nav>
      <main className="container mx-auto py-8 px-4">
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
