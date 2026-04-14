import { useState, useEffect } from 'react';
import axios from 'axios';
import { ThumbsUp, Plus, Trophy, Vote, CheckCircle2 } from 'lucide-react';

function DestinationVoting({ tripId, members }) {
  const [votes, setVotes] = useState([]);
  const [newDestination, setNewDestination] = useState('');
  const [voterName, setVoterName] = useState(members?.[0]?.name || '');
  const [error, setError] = useState('');

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
      setError('');
      fetchVotes();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to cast vote');
      setTimeout(() => setError(''), 3000);
    }
  };

  const castExistingVote = async (destination) => {
    if (!voterName) return;
    try {
      await axios.post(`http://localhost:3001/api/trips/${tripId}/votes`, {
        destination,
        member_name: voterName
      });
      setError('');
      fetchVotes();
    } catch (error) {
      setError(error.response?.data?.error || 'Already voted for this');
      setTimeout(() => setError(''), 3000);
    }
  };

  const hasVotedFor = (destination) => {
    return votes.some(v => v.destination === destination && v.member_name === voterName);
  };

  const voteCounts = votes.reduce((acc, vote) => {
    acc[vote.destination] = (acc[vote.destination] || 0) + 1;
    return acc;
  }, {});

  const destinations = Object.keys(voteCounts).sort((a, b) => voteCounts[b] - voteCounts[a]);
  const maxVotes = Math.max(...Object.values(voteCounts), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {error && (
        <div className="fixed top-20 right-4 z-[100] bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl animate-bounce flex items-center gap-2">
          <CheckCircle2 size={20} />
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Vote className="text-teal-600" size={24} />
            </div>
            Where to next?
          </h3>
          <p className="text-slate-500 font-medium">Cast your vote for the next destination</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 pl-5 rounded-2xl shadow-sm border border-slate-100">
           <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Voting as</label>
           <select 
             value={voterName} 
             onChange={(e) => setVoterName(e.target.value)}
             className="bg-slate-50 text-teal-700 font-bold py-2 px-4 rounded-xl outline-none cursor-pointer hover:bg-teal-50 transition-colors border-none ring-0"
           >
             {members?.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
           </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-teal-500/40 transition-all duration-700"></div>
            <h4 className="text-lg font-bold mb-6 relative z-10">Propose New</h4>
            <form onSubmit={handleVote} className="space-y-4 relative z-10">
              <input 
                type="text" 
                placeholder="Ex: Tokyo, Japan" 
                value={newDestination}
                onChange={(e) => setNewDestination(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-white/40 focus:bg-white/20 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              />
              <button 
                type="submit"
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-black py-4 rounded-2xl transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Proposal
              </button>
            </form>
          </div>

          {destinations.length > 0 && (
            <div className="bg-teal-50 p-8 rounded-[2rem] border-2 border-teal-100">
              <h4 className="font-black text-teal-900 mb-4 flex items-center gap-2 uppercase tracking-tighter">
                 <Trophy size={20} className="text-teal-600" />
                 Top Pick
              </h4>
              <div className="space-y-1">
                <p className="text-3xl font-black text-teal-900 leading-none">{destinations[0]}</p>
                <p className="text-teal-600 font-bold">{voteCounts[destinations[0]]} votes so far</p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="grid md:grid-cols-2 gap-4">
            {destinations.map(dest => {
              const voted = hasVotedFor(dest);
              const isWinner = voteCounts[dest] === maxVotes && maxVotes > 0;
              
              return (
                <div 
                  key={dest} 
                  className={`group relative p-6 rounded-[2rem] border-4 transition-all duration-300 ${
                    voted 
                    ? 'bg-lime-50 border-lime-400 shadow-lg shadow-lime-100' 
                    : 'bg-white border-transparent shadow-sm hover:shadow-md hover:border-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                       <h5 className="text-xl font-black text-slate-900 group-hover:text-teal-600 transition-colors">{dest}</h5>
                       <div className="flex gap-1">
                          {Array.from({ length: voteCounts[dest] }).map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-teal-500 animate-in zoom-in duration-300" />
                          ))}
                       </div>
                    </div>
                    {voted && (
                      <div className="bg-lime-400 text-white p-1.5 rounded-full">
                        <CheckCircle2 size={16} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      <span className="text-3xl font-black text-slate-900 transition-all group-hover:scale-110 origin-left">
                        {voteCounts[dest]}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Votes</span>
                    </div>

                    <button 
                      onClick={() => castExistingVote(dest)}
                      disabled={voted}
                      className={`p-4 rounded-2xl transition-all transform active:scale-90 ${
                        voted 
                        ? 'bg-lime-100 text-lime-600 cursor-default' 
                        : 'bg-slate-100 text-slate-400 group-hover:bg-teal-600 group-hover:text-white group-hover:rotate-12'
                      }`}
                    >
                      <ThumbsUp size={24} fill={voted ? "currentColor" : "none"} />
                    </button>
                  </div>

                  {isWinner && (
                    <div className="absolute -top-3 -right-3 bg-yellow-400 text-white p-2 rounded-xl shadow-lg rotate-12">
                      <Trophy size={16} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {destinations.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-4 border-dashed border-slate-100 rounded-[3rem]">
              <Vote size={48} className="mb-4 opacity-20" />
              <p className="font-bold">No proposals yet. Start the movement!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DestinationVoting;
