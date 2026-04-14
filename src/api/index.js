import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from '../db.js';

const router = express.Router();

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

export default router;
