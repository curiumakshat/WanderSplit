import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, X, Send } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

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
    if (!memberInput.trim()) {
      setError('Please provide a member name.');
      return;
    }

    if (!memberEmail.trim() || !validateEmail(memberEmail)) {
      setError('Please provide a valid email for the member.');
      return;
    }

    if (members.find((member) => member.email === memberEmail.trim())) {
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

    if (members.some((member) => !validateEmail(member.email))) {
      setError('Every member needs a valid email.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/trips', {
        name,
        destination,
        start_date: startDate,
        end_date: endDate,
        members,
      });
      navigate(`/trip/${response.data.id}`);
    } catch (err) {
      console.error('Error creating trip:', err);
      setError(err.response?.data?.error || 'Failed to create trip. Please try again.');
    }
  };

  const inputClass =
    'w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none transition focus:border-violet-400/50 focus:bg-white/[0.08]';

  return (
    <Card variant="glass" className="mx-auto max-w-4xl p-8 md:p-10">
      <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">New Trip</p>
          <h2 className="section-title">Plan the next group escape.</h2>
        </div>
        <Badge variant="violet">Invite with email</Badge>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm font-medium text-rose-200">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">Trip Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Summer in Bali" className={inputClass} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">Destination</label>
            <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g., Denpasar, Bali" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/70">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/70">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        <Card className="space-y-5 rounded-[24px] border-white/8 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Members</p>
              <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">Invite the crew</h3>
            </div>
            <Badge variant="lime">{members.length} Added</Badge>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 md:flex-row">
              <input type="text" value={memberInput} onChange={(e) => setMemberInput(e.target.value)} placeholder="Friend's Name" className={inputClass} />
              <input type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="Email Address" className={inputClass} />
            </div>
            <Button type="button" onClick={addMember} variant="secondary" className="w-full justify-center rounded-2xl py-3 text-xs uppercase tracking-[0.24em]">
              <UserPlus size={18} />
              Add Member
            </Button>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {members.map((member, index) => (
              <div key={index} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white">
                <div className="flex flex-col gap-1">
                  <span className="font-bold">{member.name}</span>
                  <span className="text-xs text-white/55">{member.email}</span>
                </div>
                <button type="button" onClick={() => removeMember(index)} className="text-white/45 transition-colors hover:text-rose-300">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Button type="submit" className="w-full justify-center rounded-2xl py-4 text-xs uppercase tracking-[0.24em]">
          <Send size={20} />
          Create Trip
        </Button>
      </form>
    </Card>
  );
}

export default CreateTripPage;
