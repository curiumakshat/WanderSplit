import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from '../db.js';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

export default router;
