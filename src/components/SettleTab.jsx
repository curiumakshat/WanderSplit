import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, index) => ({
        id: index,
        left: `${(index * 9) % 100}%`,
        delay: `${(index % 7) * 110}ms`,
        duration: `${2200 + (index % 5) * 200}ms`,
        color:
          index % 2 === 0
            ? 'linear-gradient(180deg, #a855f7, #0f172a)'
            : 'linear-gradient(180deg, #bef264, #111827)',
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

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-5">
      <p className="text-xs font-black uppercase tracking-[0.26em] text-white/45">{label}</p>
      <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-white">{value}</p>
    </div>
  );
}

function SettleTab({ tripId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingIds, setPendingIds] = useState([]);
  const [lastToggledId, setLastToggledId] = useState(null);

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

  useEffect(() => {
    if (!lastToggledId) {
      return undefined;
    }

    const timer = window.setTimeout(() => setLastToggledId(null), 520);
    return () => window.clearTimeout(timer);
  }, [lastToggledId]);

  async function handleToggle(settlementId, isSettled) {
    setPendingIds((current) => [...current, settlementId]);
    setError('');

    try {
      const response = await axios.patch(`http://localhost:3001/api/trips/${tripId}/settlements/${settlementId}`, {
        isSettled: !isSettled,
      });

      setLastToggledId(settlementId);
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
      <Card variant="gradient" className="p-12 text-center">
        <p className="eyebrow">Settle</p>
        <h3 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white">Building the payout map...</h3>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-rose-400/20 bg-rose-300/10 p-8 text-center text-rose-200">
        <h3 className="text-2xl font-black tracking-tight">Could not load settlements</h3>
        <p className="mt-3 text-sm font-medium">{error || 'Unknown error'}</p>
      </Card>
    );
  }

  const { summary, settlements, allSettled } = data;
  const openCount = settlements.filter((settlement) => !settlement.isSettled).length;

  return (
    <div className="space-y-6">
      <Card variant="gradient" className="overflow-hidden p-8">
        <div className="max-w-2xl">
          <p className="eyebrow">Emotional Payoff</p>
          <h2 className="mt-3 text-4xl font-black leading-tight tracking-[-0.05em] text-white md:text-5xl">
            The shortest path to zero balances.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/65 md:text-base">
            Greedy cash flow matches the largest debtor with the largest creditor until every balance lands at zero.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Total Spend" value={formatCurrency(summary.totalSpend)} />
          <SummaryCard label="Expenses" value={summary.expenseCount} />
          <SummaryCard label="Top Category" value={summary.mostExpensiveCategory} />
          <SummaryCard label="People" value={summary.peopleCount} />
        </div>
      </Card>

      <Card className="p-8">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Minimum Cash Flow</p>
            <h3 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">Settlement cards</h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/60">
              Mark each payment as it clears. Confetti only triggers once every transfer is settled.
            </p>
          </div>
          <Badge variant={allSettled ? 'success' : 'violet'}>{allSettled ? 'All Clear' : `${openCount} Remaining`}</Badge>
        </div>

        {settlements.length === 0 ? (
          <Card className="mt-6 border-dashed p-10 text-center">
            <h4 className="text-2xl font-black text-white">No settlements needed</h4>
            <p className="mt-3 text-sm text-white/55">Everyone is already square for this trip.</p>
          </Card>
        ) : (
          <div className="mt-6 grid gap-4">
            {settlements.map((settlement) => {
              const isPending = pendingIds.includes(settlement.id);
              const isAnimated = lastToggledId === settlement.id;

              return (
                <article
                  key={settlement.id}
                  className={`rounded-[28px] border p-5 transition duration-300 ${
                    settlement.isSettled
                      ? 'border-lime-300/25 bg-[linear-gradient(135deg,rgba(190,242,100,0.12),rgba(15,23,42,0.88))]'
                      : 'border-violet-400/20 bg-[linear-gradient(135deg,rgba(124,58,237,0.25),rgba(2,6,23,0.95))] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(124,58,237,0.18)]'
                  } ${isAnimated ? 'animate-settle-glow' : ''}`}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-white/45">Settlement #{settlement.id}</p>
                      <h4 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white">
                        {settlement.fromMember.name} pays {settlement.toMember.name} {formatCurrency(settlement.amount)}
                      </h4>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
                        This transfer comes from the minimum-cash-flow pass, so you get the smallest clean set of payouts.
                      </p>
                    </div>

                    <Button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggle(settlement.id, settlement.isSettled)}
                      variant={settlement.isSettled ? 'success' : 'primary'}
                      className="justify-center rounded-full px-5 py-3 text-xs uppercase tracking-[0.24em]"
                    >
                      <span className={`relative h-7 w-12 rounded-full ${settlement.isSettled ? 'bg-black/25' : 'bg-white/12'}`}>
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform duration-300 ${
                            settlement.isSettled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </span>
                      <span>{settlement.isSettled ? 'Mark Unsettled' : 'Mark Settled'}</span>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Card>

      {allSettled ? (
        <Card variant="gradient" className="relative overflow-hidden px-8 py-14 text-center">
          <ConfettiBurst />
          <p className="relative eyebrow">Celebration</p>
          <h3 className="relative mt-4 text-5xl font-black tracking-[-0.06em] text-white">Trip Settled 🎉</h3>
          <p className="relative mx-auto mt-4 max-w-xl text-sm leading-7 text-white/65 md:text-base">
            Every transfer is settled. The books are closed and the trip ends on a clean note.
          </p>
        </Card>
      ) : null}
    </div>
  );
}

export default SettleTab;
