import express from 'express';
import db from '../db.js';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const membersForTripStmt = db.prepare('SELECT id, name FROM members WHERE trip_id = ? ORDER BY name COLLATE NOCASE');
const expensesForTripStmt = db.prepare(`
  SELECT id, amount, category, paid_by_member_id
  FROM expenses
  WHERE trip_id = ?
  ORDER BY created_at DESC, id DESC
`);
const expenseSplitsForTripStmt = db.prepare(`
  SELECT es.member_id, es.share_amount, e.paid_by_member_id
  FROM expense_splits es
  JOIN expenses e ON e.id = es.expense_id
  WHERE e.trip_id = ?
`);
const categorySummaryStmt = db.prepare(`
  SELECT category, SUM(amount) AS total
  FROM expenses
  WHERE trip_id = ?
  GROUP BY category
  ORDER BY total DESC, category ASC
  LIMIT 1
`);
const settlementsForTripStmt = db.prepare(`
  SELECT
    s.id,
    s.amount,
    s.is_settled,
    s.created_at,
    sender.id AS from_member_id,
    sender.name AS from_member_name,
    receiver.id AS to_member_id,
    receiver.name AS to_member_name
  FROM settlements s
  JOIN members sender ON sender.id = s.from_member
  JOIN members receiver ON receiver.id = s.to_member
  WHERE s.trip_id = ?
  ORDER BY s.is_settled ASC, s.amount DESC, s.id ASC
`);
const insertSettlementStmt = db.prepare(`
  INSERT INTO settlements (trip_id, from_member, to_member, amount, is_settled)
  VALUES (?, ?, ?, ?, 0)
`);
const clearSettlementsStmt = db.prepare('DELETE FROM settlements WHERE trip_id = ?');

function toPaise(amount) {
  return Math.round(Number(amount) * 100);
}

function toRupees(paise) {
  return Number((paise / 100).toFixed(2));
}

function serializeSettlements(rows) {
  return rows.map((row) => ({
    id: row.id,
    amount: Number(row.amount),
    isSettled: Boolean(row.is_settled),
    createdAt: row.created_at,
    fromMember: {
      id: row.from_member_id,
      name: row.from_member_name,
    },
    toMember: {
      id: row.to_member_id,
      name: row.to_member_name,
    },
  }));
}

function buildTripSummary(tripId) {
  const expenseStats = db.prepare(`
    SELECT COUNT(*) AS expenseCount, COALESCE(SUM(amount), 0) AS totalSpend
    FROM expenses
    WHERE trip_id = ?
  `).get(tripId);
  const peopleCount = db.prepare('SELECT COUNT(*) AS peopleCount FROM members WHERE trip_id = ?').get(tripId);
  const topCategory = categorySummaryStmt.get(tripId);

  return {
    totalSpend: Number(expenseStats.totalSpend),
    expenseCount: expenseStats.expenseCount,
    mostExpensiveCategory: topCategory?.category ?? 'None',
    peopleCount: peopleCount.peopleCount,
  };
}

function computeSettlementPlan(tripId) {
  const members = membersForTripStmt.all(tripId);
  const expenses = expensesForTripStmt.all(tripId);
  const splits = expenseSplitsForTripStmt.all(tripId);
  const balances = new Map(members.map((member) => [member.id, 0]));

  for (const expense of expenses) {
    balances.set(
      expense.paid_by_member_id,
      (balances.get(expense.paid_by_member_id) ?? 0) + toPaise(expense.amount)
    );
  }

  for (const split of splits) {
    balances.set(
      split.member_id,
      (balances.get(split.member_id) ?? 0) - toPaise(split.share_amount)
    );
  }

  const debtors = [];
  const creditors = [];

  for (const member of members) {
    const balance = balances.get(member.id) ?? 0;

    if (balance < 0) {
      debtors.push({ memberId: member.id, amount: Math.abs(balance) });
    } else if (balance > 0) {
      creditors.push({ memberId: member.id, amount: balance });
    }
  }

  const sortByAmount = (left, right) => right.amount - left.amount;
  debtors.sort(sortByAmount);
  creditors.sort(sortByAmount);

  const plan = [];

  while (debtors.length > 0 && creditors.length > 0) {
    debtors.sort(sortByAmount);
    creditors.sort(sortByAmount);

    const debtor = debtors[0];
    const creditor = creditors[0];
    const transferAmount = Math.min(debtor.amount, creditor.amount);

    plan.push({
      fromMember: debtor.memberId,
      toMember: creditor.memberId,
      amount: toRupees(transferAmount),
    });

    debtor.amount -= transferAmount;
    creditor.amount -= transferAmount;

    if (debtor.amount === 0) {
      debtors.shift();
    }

    if (creditor.amount === 0) {
      creditors.shift();
    }
  }

  return plan;
}

function ensureSettlements(tripId) {
  const plan = computeSettlementPlan(tripId);
  const existingRows = settlementsForTripStmt.all(tripId);
  const normalizedExisting = existingRows
    .map((row) => `${row.from_member_id}:${row.to_member_id}:${toPaise(row.amount)}`)
    .sort();
  const normalizedPlan = plan
    .map((row) => `${row.fromMember}:${row.toMember}:${toPaise(row.amount)}`)
    .sort();

  if (
    existingRows.length === plan.length &&
    normalizedExisting.length === normalizedPlan.length &&
    normalizedExisting.every((value, index) => value === normalizedPlan[index])
  ) {
    return existingRows;
  }

  const syncSettlements = db.transaction(() => {
    clearSettlementsStmt.run(tripId);

    for (const settlement of plan) {
      insertSettlementStmt.run(tripId, settlement.fromMember, settlement.toMember, settlement.amount);
    }
  });

  syncSettlements();

  return settlementsForTripStmt.all(tripId);
}

// GET /api/trips - List all trips
router.get('/trips', (req, res) => {
  try {
    const trips = db.prepare('SELECT * FROM trips ORDER BY created_at DESC').all();
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/trips/:id - Get trip details including members
router.get('/trips/:id', (req, res) => {
  try {
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    
    const members = db.prepare('SELECT * FROM members WHERE trip_id = ?').all(req.params.id);
    res.json({ ...trip, members });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/trips - Create a new trip
router.post('/trips', (req, res) => {
  const { name, destination, start_date, end_date, members } = req.body;
  
  if (!name || !destination) {
    return res.status(400).json({ error: 'Name and destination are required' });
  }

  try {
    const insertTrip = db.prepare(`
      INSERT INTO trips (name, destination, start_date, end_date)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = insertTrip.run(name, destination, start_date, end_date);
    const tripId = result.lastInsertRowid;

    if (members && Array.isArray(members)) {
      const insertMember = db.prepare('INSERT INTO members (trip_id, name) VALUES (?, ?)');
      members.forEach(memberName => {
        insertMember.run(tripId, memberName);
      });
    }

    res.status(201).json({ id: tripId, name, destination, start_date, end_date });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/trips/:id/members - Add member to trip
router.post('/trips/:id/members', (req, res) => {
  const { name, email } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const result = db.prepare('INSERT INTO members (trip_id, name, email) VALUES (?, ?, ?)')
      .run(req.params.id, name, email);
    res.status(201).json({ id: result.lastInsertRowid, name, email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/trips/:id/votes - Get votes for a trip
router.get('/trips/:id/votes', (req, res) => {
  try {
    const votes = db.prepare('SELECT * FROM destination_votes WHERE trip_id = ?').all(req.params.id);
    res.json(votes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/trips/:id/votes - Cast a vote
router.post('/trips/:id/votes', (req, res) => {
  const { destination, member_name } = req.body;
  if (!destination || !member_name) {
    return res.status(400).json({ error: 'Destination and member_name are required' });
  }

  try {
    const result = db.prepare('INSERT INTO destination_votes (trip_id, destination, member_name) VALUES (?, ?, ?)')
      .run(req.params.id, destination, member_name);
    res.status(201).json({ id: result.lastInsertRowid, destination, member_name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /trips/:id/itinerary - Return saved itinerary
router.get('/trips/:id/itinerary', (req, res) => {
  try {
    const itinerary = db.prepare('SELECT * FROM itineraries WHERE trip_id = ? ORDER BY generated_at DESC LIMIT 1')
      .get(req.params.id);

    if (itinerary) {
      res.json({ ...itinerary, content_json: JSON.parse(itinerary.content_json) });
    } else {
      res.status(404).json({ error: 'Itinerary not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /trips/:id/itinerary/generate - Generate itinerary with AI
router.post('/trips/:id/itinerary/generate', async (req, res) => {
  try {
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const prompt = `Create a detailed day-by-day travel itinerary for a group trip to ${trip.destination} from ${trip.start_date} to ${trip.end_date}. For each day provide: day number, date, morning activity, afternoon activity, evening activity, recommended restaurant. Return ONLY valid JSON array.`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 4000,
      messages: [
        { role: "user", content: prompt }
      ],
    });

    const content = message.content[0].text;
    // Extract JSON if Claude adds markdown formatting
    const jsonMatch = content.match(/\[.*\]/s);
    const content_json = jsonMatch ? jsonMatch[0] : content;

    const result = db.prepare('INSERT INTO itineraries (trip_id, content_json) VALUES (?, ?)')
      .run(req.params.id, content_json);

    res.status(201).json({ 
      id: result.lastInsertRowid, 
      trip_id: req.params.id, 
      content_json: JSON.parse(content_json) 
    });
  } catch (error) {
    console.error('Claude API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/trips/:id/settlements', (req, res) => {
  try {
    const tripId = Number(req.params.id);
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const settlements = serializeSettlements(ensureSettlements(tripId));
    const allSettled = settlements.length > 0 && settlements.every((settlement) => settlement.isSettled);

    return res.json({
      trip,
      summary: buildTripSummary(tripId),
      settlements,
      allSettled,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/trips/:id/settlements/:sid', (req, res) => {
  try {
    const tripId = Number(req.params.id);
    const settlementId = Number(req.params.sid);
    const settlement = db
      .prepare('SELECT id, is_settled FROM settlements WHERE trip_id = ? AND id = ?')
      .get(tripId, settlementId);

    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    const nextValue =
      typeof req.body?.isSettled === 'boolean' ? Number(req.body.isSettled) : settlement.is_settled ? 0 : 1;

    db.prepare('UPDATE settlements SET is_settled = ? WHERE trip_id = ? AND id = ?')
      .run(nextValue, tripId, settlementId);

    const settlements = serializeSettlements(settlementsForTripStmt.all(tripId));
    const updatedSettlement = settlements.find((item) => item.id === settlementId);
    const allSettled = settlements.length > 0 && settlements.every((item) => item.isSettled);

    return res.json({
      settlement: updatedSettlement,
      allSettled,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
