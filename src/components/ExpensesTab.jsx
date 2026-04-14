import React, { useState, useEffect } from 'react';
import { Trash2, Plus, X } from 'lucide-react';

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
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, [tripId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch members
      const membersRes = await fetch(`http://localhost:3001/api/trips/${tripId}/members`);
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData);
        // Set default split_with to all members
        setFormData(prev => ({
          ...prev,
          split_with: membersData.map(m => m.id)
        }));
      }

      // Fetch expenses
      const expensesRes = await fetch(`http://localhost:3001/api/trips/${tripId}/expenses`);
      if (expensesRes.ok) {
        const expensesData = await expensesRes.json();
        setExpenses(expensesData);
      }

      // Fetch balances
      const balancesRes = await fetch(`http://localhost:3001/api/trips/${tripId}/balances`);
      if (balancesRes.ok) {
        const balancesData = await balancesRes.json();
        setBalances(balancesData);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSplitWithChange = (memberId) => {
    setFormData(prev => ({
      ...prev,
      split_with: prev.split_with.includes(memberId)
        ? prev.split_with.filter(id => id !== memberId)
        : [...prev.split_with, memberId]
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
          paid_by: parseInt(formData.paid_by),
          split_with: formData.split_with.map(id => parseInt(id)),
          category: formData.category,
          date: formData.date
        })
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({
          description: '',
          amount: '',
          paid_by: '',
          split_with: members.map(m => m.id),
          category: 'Food',
          date: new Date().toISOString().split('T')[0]
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

  const totalSpend = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const getMemberName = (id) => {
    const member = members.find(m => m.id === id);
    return member ? member.name : `Member ${id}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food': 'bg-orange-100 text-orange-700',
      'Transport': 'bg-blue-100 text-blue-700',
      'Stay': 'bg-indigo-100 text-indigo-700',
      'Activities': 'bg-pink-100 text-pink-700',
      'Other': 'bg-gray-100 text-gray-700'
    };
    return colors[category] || colors['Other'];
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500"></div></div>;
  }

  return (
    <div className="space-y-6 p-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={20} /></button>
        </div>
      )}

      {/* Total Trip Spend Summary Card */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-lg p-8 text-white">
        <p className="text-orange-100 text-sm font-semibold uppercase tracking-wider mb-2">Total Trip Spend</p>
        <h2 className="text-5xl font-bold mb-2">₹{totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        <p className="text-orange-100">{expenses.length} expenses tracked</p>
      </div>

      {/* Add Expense Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-md"
      >
        <Plus size={20} />
        Add Expense
      </button>

      {/* Add Expense Form */}
      {showForm && (
        <div className="bg-white border-2 border-orange-200 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Expense</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="e.g., Dinner at beachfront restaurant"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option>Food</option>
                  <option>Transport</option>
                  <option>Stay</option>
                  <option>Activities</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Paid By *</label>
              <select
                name="paid_by"
                value={formData.paid_by}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">Select member</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Split With *</label>
              <div className="space-y-2">
                {members.map(member => (
                  <label key={member.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.split_with.includes(member.id)}
                      onChange={() => handleSplitWithChange(member.id)}
                      className="w-4 h-4 rounded accent-orange-500"
                    />
                    <span className="text-gray-700">{member.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-all"
              >
                Add Expense
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expense List */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-800">Expenses</h3>
        {expenses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">No expenses yet. Add one to get started!</p>
          </div>
        ) : (
          expenses.map(expense => {
            const shareWith = expense.split_with.map(id => getMemberName(id)).join(', ');
            return (
              <div key={expense.id} className="bg-white border border-orange-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-800">{expense.description}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                        {expense.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Paid by <span className="font-semibold">{getMemberName(expense.paid_by)}</span>, split with {shareWith}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Category Totals */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Category Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(categoryTotals).map(([category, total]) => (
              <div key={category} className={`${getCategoryColor(category)} p-4 rounded-lg text-center`}>
                <p className="text-sm font-semibold opacity-75">{category}</p>
                <p className="text-xl font-bold">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Balance Summary */}
      {balances.length > 0 && (
        <div className="bg-white border-2 border-orange-200 rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Settlement Summary</h3>
          <div className="space-y-3">
            {balances.map(balance => {
              const isCreditor = balance.balance > 0;
              return (
                <div key={balance.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-800">{balance.name}</p>
                  <div className={`text-right ${isCreditor ? 'text-green-600' : 'text-red-600'}`}>
                    <p className="text-lg font-bold">
                      ₹{Math.abs(balance.balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs font-semibold">
                      {isCreditor ? '💚 Gets back' : '💔 Owes'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesTab;
