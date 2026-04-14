import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';

const ExpensesTab = ({ tripId }) => {
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    paid_by: '',
    split_with: [],
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, [tripId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch trip details which includes members
      const tripRes = await fetch(`http://localhost:3001/api/trips/${tripId}`);
      if (tripRes.ok) {
        const tripData = await tripRes.json();
        console.log('Trip data:', tripData);
        const tripMembers = tripData.members || [];
        setMembers(tripMembers);
        setFormData((prev) => ({
          ...prev,
          split_with: tripMembers.map((member) => member.id),
        }));
      } else {
        console.error('Failed to fetch trip:', tripRes.status);
      }

      const expensesRes = await fetch(`http://localhost:3001/api/trips/${tripId}/expenses`);
      if (expensesRes.ok) {
        const expensesData = await expensesRes.json();
        setExpenses(expensesData);
      }

      const balancesRes = await fetch(`http://localhost:3001/api/trips/${tripId}/balances`);
      if (balancesRes.ok) {
        const balancesData = await balancesRes.json();
        setBalances(balancesData);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSplitWithChange = (memberId) => {
    setFormData((prev) => ({
      ...prev,
      split_with: prev.split_with.includes(memberId) ? prev.split_with.filter((id) => id !== memberId) : [...prev.split_with, memberId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description || !formData.amount || !formData.paid_by || formData.split_with.length === 0) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/trips/${tripId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: formData.description,
          amount: parseFloat(formData.amount),
          paid_by_member_id: parseInt(formData.paid_by),
          split_with: formData.split_with.map((id) => parseInt(id)),
          category: formData.category,
          date: formData.date,
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({
          description: '',
          amount: '',
          paid_by: '',
          split_with: members.map((member) => member.id),
          category: 'Food',
          date: new Date().toISOString().split('T')[0],
        });
        fetchData();
      } else {
        const errData = await response.json();
        setError(errData.error || 'Failed to add expense');
      }
    } catch (err) {
      setError('Error adding expense');
      console.error(err);
    }
  };

  const totalSpend = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const getMemberName = (id) => {
    const member = members.find((item) => item.id === id);
    return member ? member.name : `Member ${id}`;
  };

  const inputClass = 'w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none transition focus:border-violet-400/50';

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-4 border-t-4 border-violet-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="flex items-center justify-between rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-rose-200">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={20} />
          </button>
        </div>
      ) : null}

      <Card variant="gradient" className="p-8">
        <p className="eyebrow">Expenses</p>
        <h2 className="mt-3 text-5xl font-black tracking-[-0.05em] text-white">
          ₹{totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
        <p className="mt-2 text-sm text-white/55">{expenses.length} expenses tracked</p>
      </Card>

      <Button onClick={() => setShowForm(!showForm)} className="w-full justify-center rounded-2xl py-3 text-xs uppercase tracking-[0.24em]">
        <Plus size={20} />
        Add Expense
      </Button>

      {showForm ? (
        <Card className="p-6">
          <h3 className="mb-4 text-xl font-black tracking-[-0.03em] text-white">Add New Expense</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/70">Description *</label>
              <input type="text" name="description" value={formData.description} onChange={handleFormChange} placeholder="e.g., Dinner at beachfront restaurant" className={inputClass} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/70">Amount (₹) *</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleFormChange} placeholder="0.00" step="0.01" min="0" className={inputClass} required />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white/70">Category</label>
                <select name="category" value={formData.category} onChange={handleFormChange} className={inputClass}>
                  <option>Food</option>
                  <option>Transport</option>
                  <option>Stay</option>
                  <option>Activities</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/70">Paid By *</label>
              <select name="paid_by" value={formData.paid_by} onChange={handleFormChange} className={inputClass} required>
                <option value="" className="bg-slate-900 text-white">Select who paid</option>
                {members && members.length > 0 ? (
                  members.map((member) => (
                    <option key={member.id} value={member.id} className="bg-slate-900 text-white">
                      {member.name}
                    </option>
                  ))
                ) : (
                  <option disabled className="bg-slate-900 text-white">No members available</option>
                )}
              </select>
              {members.length === 0 && (
                <p className="mt-2 text-xs text-red-400">⚠️ No members found. Please refresh the page.</p>
              )}
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-white/70">Split With *</label>
              <div className="space-y-2">
                {members.map((member) => (
                  <label key={member.id} className="flex cursor-pointer items-center gap-3 text-white/80">
                    <input
                      type="checkbox"
                      checked={formData.split_with.includes(member.id)}
                      onChange={() => handleSplitWithChange(member.id)}
                      className="h-4 w-4 rounded accent-lime-300"
                    />
                    <span>{member.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/70">Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleFormChange} className={inputClass} />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 justify-center rounded-2xl py-3 text-xs uppercase tracking-[0.24em]">
                Add Expense
              </Button>
              <Button type="button" onClick={() => setShowForm(false)} variant="ghost" className="flex-1 justify-center rounded-2xl py-3 text-xs uppercase tracking-[0.24em]">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white">Expenses</h3>
        {expenses.length === 0 ? (
          <Card className="border-dashed py-12 text-center text-white/45">No expenses yet. Add one to get started.</Card>
        ) : (
          expenses.map((expense) => {
            const shareWith = expense.split_with.map((id) => getMemberName(id)).join(', ');
            return (
              <Card key={expense.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h4 className="font-semibold text-white">{expense.description}</h4>
                      <Badge variant="amber">{expense.category}</Badge>
                    </div>
                    <p className="text-sm text-white/60">
                      Paid by <span className="font-semibold">{getMemberName(expense.paid_by_member_id ?? expense.paid_by)}</span>, split with {shareWith}
                    </p>
                    <p className="mt-1 text-xs text-white/35">{new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-lime-300">
                      ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {Object.keys(categoryTotals).length > 0 ? (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-bold text-white">Category Breakdown</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Object.entries(categoryTotals).map(([category, total]) => (
              <div key={category} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                <p className="text-sm font-semibold text-white/55">{category}</p>
                <p className="text-xl font-bold text-white">
                  ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {balances.length > 0 ? (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-bold text-white">Balance Summary</h3>
          <div className="space-y-3">
            {balances.map((balance) => {
              const isCreditor = balance.balance > 0;
              return (
                <div key={balance.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="font-semibold text-white">{balance.name}</p>
                  <div className={`text-right ${isCreditor ? 'text-lime-300' : 'text-rose-300'}`}>
                    <p className="text-lg font-bold">
                      ₹{Math.abs(balance.balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs font-semibold">{isCreditor ? 'Gets back' : 'Owes'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}
    </div>
  );
};

export default ExpensesTab;
