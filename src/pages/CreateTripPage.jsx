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
  const [memberEmail, setMemberEmail] = useState('');
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const addMember = () => {
    if (!memberInput.trim()) return;
    if (!memberEmail.trim() || !validateEmail(memberEmail)) {
      setError('Please provide a valid email for the member.');
      return;
    }
    if (members.find(m => m.email === memberEmail.trim())) {
      setError('Member with this email already added.');
      return;
    }

    setMembers([...members, { name: memberInput.trim(), email: memberEmail.trim() }]);
    setMemberInput('');
    setMemberEmail('');
    setError('');
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
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                placeholder="Friend's Name"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all shadow-sm bg-white"
              />
              <input 
                type="email" 
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="Email Address"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all shadow-sm bg-white"
              />
            </div>
            <button 
              type="button" 
              onClick={addMember}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm w-full"
            >
              <UserPlus size={18} />
              Add Member
            </button>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {members.map((member, index) => (
              <div 
                key={index} 
                className="bg-white px-4 py-2 rounded-lg border border-teal-200 text-teal-800 flex items-center justify-between text-sm font-medium shadow-sm"
              >
                <div className="flex flex-col">
                  <span>{member.name}</span>
                  <span className="text-xs text-teal-600 opacity-70">{member.email}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeMember(index)}
                  className="text-teal-400 hover:text-teal-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
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
