import { useState, useEffect } from 'react';
import axios from 'axios';
import { ThumbsUp, Plus, Trophy, Vote } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';

function DestinationVoting({ tripId, members }) {
  const [votes, setVotes] = useState([]);
  const [newDestination, setNewDestination] = useState('');
  const [voterName, setVoterName] = useState(members?.[0]?.name || '');
  const [error, setError] = useState('');
  const [animatedDestination, setAnimatedDestination] = useState('');

  useEffect(() => {
    fetchVotes();
  }, [tripId]);

  useEffect(() => {
    if (!animatedDestination) {
      return undefined;
    }

    const timer = window.setTimeout(() => setAnimatedDestination(''), 450);
    return () => window.clearTimeout(timer);
  }, [animatedDestination]);

  const fetchVotes = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/trips/${tripId}/votes`);
      setVotes(response.data);
    } catch (requestError) {
      console.error('Error fetching votes:', requestError);
    }
  };

  const submitVote = async (destination) => {
    try {
      await axios.post(`http://localhost:3001/api/trips/${tripId}/votes`, {
        destination,
        member_name: voterName,
      });
      setAnimatedDestination(destination);
      setError('');
      if (newDestination === destination) {
        setNewDestination('');
      }
      fetchVotes();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Error casting vote.');
    }
  };

  const handleVote = async (e) => {
    e.preventDefault();
    if (!newDestination || !voterName) return;
    submitVote(newDestination.trim());
  };

  const voteCounts = votes.reduce((acc, vote) => {
    acc[vote.destination] = (acc[vote.destination] || 0) + 1;
    return acc;
  }, {});

  const votesByVoter = votes.reduce((acc, vote) => {
    if (!acc[vote.member_name]) {
      acc[vote.member_name] = new Set();
    }
    acc[vote.member_name].add(vote.destination);
    return acc;
  }, {});

  const destinations = Object.keys(voteCounts).sort((a, b) => voteCounts[b] - voteCounts[a]);
  const maxVotes = Math.max(...Object.values(voteCounts), 0);
  const selectedVotes = votesByVoter[voterName] ?? new Set();

  return (
    <div className="space-y-8 animate-fadeIn">
      <Card variant="glass" className="p-8">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="eyebrow">Destination Voting</p>
            <h3 className="flex items-center gap-3 text-3xl font-black tracking-[-0.04em] text-white">
              <Vote className="text-violet-300" />
              Destination Voting
            </h3>
            <p className="section-copy">Propose destinations, vote fast, and spot consensus at a glance.</p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
            <label className="whitespace-nowrap text-xs font-black uppercase tracking-[0.24em] text-white/45">Voting as</label>
            <select
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              className="cursor-pointer bg-transparent font-medium text-lime-300 outline-none focus:ring-0"
            >
              {members?.map((member) => (
                <option key={member.id} value={member.name}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-200">{error}</div>
        ) : null}

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="eyebrow">Propose</p>
              <h4 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">Pitch a destination</h4>
            </div>

            <form onSubmit={handleVote} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter destination name..."
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-4 pl-4 pr-14 outline-none transition focus:border-violet-400/50"
                />
                <Button type="submit" className="absolute bottom-2 right-2 top-2 rounded-xl px-3">
                  <Plus size={20} />
                </Button>
              </div>
            </form>

            <Card className="rounded-[24px] border-white/8 bg-white/[0.03] p-6">
              <h4 className="mb-4 flex items-center gap-2 font-bold text-white">
                <Trophy size={18} className="text-amber-300" />
                Current Winner
              </h4>
              {destinations.length > 0 ? (
                <div className="rounded-2xl border border-lime-300/20 bg-lime-300/10 p-4">
                  <p className="text-xl font-black text-white">{destinations[0]}</p>
                  <p className="mt-1 text-sm font-bold uppercase tracking-wider text-lime-300">{voteCounts[destinations[0]]} Votes</p>
                </div>
              ) : (
                <p className="text-sm italic text-white/45">No proposals yet. Be the first.</p>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <div>
              <p className="eyebrow">All Proposals</p>
              <h4 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">Vote on the board</h4>
            </div>

            <div className="max-h-[430px] space-y-3 overflow-y-auto pr-2">
              {destinations.map((destination) => (
                <Card
                  key={destination}
                  className={`flex items-center justify-between p-5 transition-all ${
                    selectedVotes.has(destination)
                      ? 'border-lime-300/45 shadow-[0_0_0_1px_rgba(190,242,100,0.35)]'
                      : voteCounts[destination] === maxVotes && maxVotes > 0
                        ? 'border-violet-400/35'
                        : 'border-white/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">{destination}</span>
                      {selectedVotes.has(destination) ? <Badge variant="lime">Voted</Badge> : null}
                    </div>
                    <div className="mt-2 flex gap-1">
                      {Array.from({ length: voteCounts[destination] }).map((_, index) => (
                        <div key={index} className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`text-lg font-black text-lime-300 ${animatedDestination === destination ? 'animate-vote-pop' : ''}`}>
                      {voteCounts[destination]}
                    </span>
                    <Button
                      onClick={() => submitVote(destination)}
                      variant={selectedVotes.has(destination) ? 'success' : 'secondary'}
                      className="p-3"
                    >
                      <ThumbsUp size={18} />
                    </Button>
                  </div>
                </Card>
              ))}

              {destinations.length === 0 ? (
                <Card className="border-dashed py-10 text-center text-white/40">No destinations proposed yet.</Card>
              ) : null}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default DestinationVoting;
