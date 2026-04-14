import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, X, Send } from 'lucide-react';

function CreateTripPage() {
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const addMember = () => {
    if (memberInput.trim() && !members.includes(memberInput.trim())) {
      setMembers([...members, memberInput.trim()]);
      setMemberInput('');
    }
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !destination) {
      setError('Please provide a name and destination.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/trips', {
        name,
        destination,
        start_date: startDate,
        end_date: endDate,
        members
      });
      navigate(`/trip/${response.data.id}`);
    } catch (err) {
      console.error('Error creating trip:', err);
      setError('Failed to create trip. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Plan New Adventure</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Trip Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Summer in Bali"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Destination</label>
            <input 
              type="text" 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Denpasar, Bali"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl space-y-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Add Members</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
              placeholder="Friend's Name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all shadow-sm bg-white"
            />
            <button 
              type="button" 
              onClick={addMember}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              <UserPlus size={18} />
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {members.map((member, index) => (
              <span 
                key={index} 
                className="bg-white px-3 py-1.5 rounded-full border border-teal-200 text-teal-800 flex items-center gap-2 text-sm font-medium shadow-sm"
              >
                {member}
                <button 
                  type="button" 
                  onClick={() => removeMember(index)}
                  className="text-teal-400 hover:text-teal-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md transform active:scale-[0.98]"
        >
          <Send size={20} />
          Create Trip
        </button>
      </form>
    </div>
  );
}

export default CreateTripPage;
