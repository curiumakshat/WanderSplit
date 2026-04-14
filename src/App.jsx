import { Routes, Route } from 'react-router-dom';
import Navbar from './components/ui/Navbar';
import HomePage from './pages/HomePage';
import CreateTripPage from './pages/CreateTripPage';
import TripDashboard from './pages/TripDashboard';

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container-shell py-8 md:py-10">
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
