import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function SummaryCard({ label, value, accentClass }) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-amber-200/70 bg-white/80 p-5 shadow-sm shadow-amber-900/5 backdrop-blur">
      <div className={`mb-4 h-1.5 w-16 rounded-full ${accentClass}`} />
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700/70">{label}</p>
      <p className="mt-3 text-2xl font-black tracking-tight text-stone-900">{value}</p>
    </div>
  );
}

function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 30 }, (_, index) => ({
        id: index,
        left: `${(index * 11) % 100}%`,
        delay: `${(index % 6) * 120}ms`,
        duration: `${2400 + (index % 4) * 260}ms`,
        color:
          index % 3 === 0
            ? 'linear-gradient(180deg, #fcd34d, #d97706)'
            : index % 3 === 1
              ? 'linear-gradient(180deg, #fde68a, #f59e0b)'
              : 'linear-gradient(180deg, #fdba74, #c2410c)',
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="absolute top-[-24px] h-5 w-3 rounded-sm animate-settle-confetti"
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            background: piece.color,
          }}
        />
      ))}
    </div>
  );
}

function SettleTab({ tripId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingIds, setPendingIds] = useState([]);

  useEffect(() => {
    let active = true;

    async function fetchSettlements() {
      setLoading(true);
      setError('');

      try {
        const response = await axios.get(`http://localhost:3001/api/trips/${tripId}/settlements`);

        if (active) {
          setData(response.data);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.error || 'Failed to load settlements.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchSettlements();

    return () => {
      active = false;
    };
  }, [tripId]);

  async function handleToggle(settlementId, isSettled) {
    setPendingIds((current) => [...current, settlementId]);
    setError('');

    try {
      const response = await axios.patch(`http://localhost:3001/api/trips/${tripId}/settlements/${settlementId}`, {
        isSettled: !isSettled,
      });

      setData((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          settlements: current.settlements.map((settlement) =>
            settlement.id === settlementId ? response.data.settlement : settlement
          ),
          allSettled: response.data.allSettled,
        };
      });
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Failed to update settlement.');
    } finally {
      setPendingIds((current) => current.filter((id) => id !== settlementId));
    }
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Settle</p>
        <h3 className="mt-4 text-3xl font-black tracking-tight text-stone-900">Building the payout map...</h3>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-center text-red-700">
        <h3 className="text-2xl font-black tracking-tight">Could not load settlements</h3>
        <p className="mt-3 text-sm font-medium">{error || 'Unknown error'}</p>
      </div>
    );
  }

  const { summary, settlements, allSettled } = data;
  const openCount = settlements.filter((settlement) => !settlement.isSettled).length;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-amber-200/80 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.22),_transparent_30%),linear-gradient(135deg,rgba(255,251,235,0.98),rgba(254,243,199,0.88))] p-8 shadow-[0_30px_80px_rgba(120,53,15,0.10)]">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">Emotional Payoff</p>
          <h2 className="mt-3 font-serif text-4xl font-black leading-tight text-stone-900 md:text-5xl">
            Shortest path to zero balances.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-stone-700 md:text-base">
            The trip is done. These are the fewest transfers needed to clear every balance,
            generated by matching the largest debtor with the largest creditor until everyone lands at zero.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Total Spend" value={formatCurrency(summary.totalSpend)} accentClass="bg-gradient-to-r from-amber-400 to-yellow-300" />
          <SummaryCard label="Expenses" value={summary.expenseCount} accentClass="bg-gradient-to-r from-yellow-500 to-amber-300" />
          <SummaryCard label="Top Category" value={summary.mostExpensiveCategory} accentClass="bg-gradient-to-r from-orange-500 to-amber-300" />
          <SummaryCard label="People" value={summary.peopleCount} accentClass="bg-gradient-to-r from-amber-700 to-yellow-400" />
        </div>
      </section>

      <section className="rounded-[2rem] border border-amber-200/80 bg-white/90 p-8 shadow-sm shadow-amber-900/5">
        <div className="flex flex-col gap-4 border-b border-amber-100 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Minimum Cash Flow</p>
            <h3 className="mt-2 text-3xl font-black tracking-tight text-stone-900">Settlement cards</h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-stone-600">
              Toggle each transfer as it is paid. Once every card is settled, the trip closes cleanly.
            </p>
          </div>
          <div className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-bold ${
            allSettled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {allSettled ? 'All clear' : `${openCount} remaining`}
          </div>
        </div>

        {settlements.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-amber-200 bg-amber-50/60 p-10 text-center">
            <h4 className="text-2xl font-black text-stone-900">No settlements needed</h4>
            <p className="mt-3 text-sm text-stone-600">Everyone is already square for this trip.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {settlements.map((settlement) => {
              const isPending = pendingIds.includes(settlement.id);

              return (
                <article
                  key={settlement.id}
                  className={`rounded-[1.75rem] border p-5 transition duration-200 ${
                    settlement.isSettled
                      ? 'border-emerald-200 bg-emerald-50/70 opacity-80'
                      : 'border-amber-200 bg-gradient-to-r from-white to-amber-50/80 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-900/5'
                  }`}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700/80">
                        Settlement #{settlement.id}
                      </p>
                      <h4 className="mt-3 text-2xl font-black tracking-tight text-stone-900">
                        {settlement.fromMember.name} pays {settlement.toMember.name} {formatCurrency(settlement.amount)}
                      </h4>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
                        Greedy matching paired the largest debtor with the largest creditor to minimize the number of transfers.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggle(settlement.id, settlement.isSettled)}
                      className={`inline-flex items-center justify-center gap-3 rounded-full px-5 py-3 text-sm font-bold transition ${
                        settlement.isSettled
                          ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                          : 'bg-stone-900 text-amber-50 hover:bg-stone-800'
                      } disabled:cursor-progress disabled:opacity-70`}
                    >
                      <span
                        className={`relative h-7 w-12 rounded-full ${
                          settlement.isSettled ? 'bg-emerald-200/40' : 'bg-white/20'
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                            settlement.isSettled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </span>
                      <span>{settlement.isSettled ? 'Mark as unsettled' : 'Mark as settled'}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {allSettled ? (
        <section className="relative overflow-hidden rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 px-8 py-12 text-center shadow-[0_24px_60px_rgba(180,83,9,0.10)]">
          <ConfettiBurst />
          <p className="relative text-xs font-semibold uppercase tracking-[0.26em] text-amber-700">Complete</p>
          <h3 className="relative mt-4 font-serif text-4xl font-black tracking-tight text-stone-900">
            All settled up!
          </h3>
          <p className="relative mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-700 md:text-base">
            Every transfer is marked settled. The books are closed and the trip ends on a clean note.
          </p>
        </section>
      ) : null}
    </div>
  );
}

export default SettleTab;
