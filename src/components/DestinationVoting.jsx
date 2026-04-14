import { useState, useEffect } from 'react';
import axios from 'axios';
import { ThumbsUp, Plus, Trophy, Vote } from 'lucide-react';

function DestinationVoting({ tripId, members }) {
  const [votes, setVotes] = useState([]);
  const [newDestination, setNewDestination] = useState('');
  const [voterName, setVoterName] = useState(members?.[0]?.name || '');

  useEffect(() => {
    fetchVotes();
  }, [tripId]);

  const fetchVotes = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/trips/${tripId}/votes`);
      setVotes(response.data);
    } catch (error) {
      console.error('Error fetching votes:', error);
    }
  };

  const handleVote = async (e) => {
    e.preventDefault();
    if (!newDestination || !voterName) return;

    try {
      await axios.post(`http://localhost:3001/api/trips/${tripId}/votes`, {
        destination: newDestination,
        member_name: voterName
      });
      setNewDestination('');
      fetchVotes();
    } catch (error) {
      console.error('Error casting vote:', error);
    }
  };

  const castExistingVote = async (destination) => {
    if (!voterName) return;
    try {
      await axios.post(`http://localhost:3001/api/trips/${tripId}/votes`, {
        destination,
        member_name: voterName
      });
      fetchVotes();
    } catch (error) {
      console.error('Error casting vote:', error);
    }
  };

  const voteCounts = votes.reduce((acc, vote) => {
    acc[vote.destination] = (acc[vote.destination] || 0) + 1;
    return acc;
  }, {});

  const destinations = Object.keys(voteCounts).sort((a, b) => voteCounts[b] - voteCounts[a]);
  const maxVotes = Math.max(...Object.values(voteCounts), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Vote className="text-teal-500" />
            Destination Voting
          </h3>
          <p className="text-gray-500 text-sm">Propose and vote for where we should go!</p>
        </div>
        
        <div className="flex items-center gap-3 bg-teal-50 px-4 py-2 rounded-xl border border-teal-100">
           <label className="text-sm font-bold text-teal-800 whitespace-nowrap">Voting as:</label>
           <select 
             value={voterName} 
             onChange={(e) => setVoterName(e.target.value)}
             className="bg-transparent text-teal-700 font-medium outline-none cursor-pointer focus:ring-0"
           >
             {members?.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
           </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-gray-700">Propose New</h4>
          <form onSubmit={handleVote} className="space-y-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Enter destination name..." 
                value={newDestination}
                onChange={(e) => setNewDestination(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all shadow-sm"
              />
              <button 
                type="submit"
                className="absolute right-2 top-2 bottom-2 bg-teal-600 text-white px-3 rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </form>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
               <Trophy size={18} className="text-yellow-500" />
               Current Winner
            </h4>
            {destinations.length > 0 ? (
              <div className="bg-white p-4 rounded-xl shadow-sm border border-teal-100 border-l-4 border-l-teal-500">
                <p className="text-xl font-black text-teal-900">{destinations[0]}</p>
                <p className="text-teal-600 font-bold text-sm uppercase tracking-wider mt-1">{voteCounts[destinations[0]]} Votes</p>
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">No proposals yet. Be the first!</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-bold text-gray-700">All Proposals</h4>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {destinations.map(dest => (
              <div 
                key={dest} 
                className={`p-4 rounded-xl border transition-all flex items-center justify-between group ${
                  voteCounts[dest] === maxVotes && maxVotes > 0
                  ? 'bg-teal-50 border-teal-200 shadow-sm' 
                  : 'bg-white border-gray-100 hover:border-teal-200'
                }`}
              >
                <div>
                  <span className="font-bold text-gray-800">{dest}</span>
                  <div className="flex gap-1 mt-1">
                    {Array.from({ length: voteCounts[dest] }).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-teal-600 font-black text-lg">{voteCounts[dest]}</span>
                  <button 
                    onClick={() => castExistingVote(dest)}
                    className="p-2.5 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-600 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                  >
                    <ThumbsUp size={18} />
                  </button>
                </div>
              </div>
            ))}
            {destinations.length === 0 && (
              <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                No destinations proposed yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DestinationVoting;
