import express from 'express';
import { authenticate, adminOnly } from '../../middleware/auth.js';

const router = express.Router();

// Get all events
router.get('/', (req, res) => {
  // TODO: Fetch events from database
  res.json({
    events: [
      // {
      //   id: 1,
      //   name: 'Poly Speed Dating - June',
      //   date: '2026-06-03',
      //   location: 'Trashtelier, Berlin',
      //   status: 'postponed',
      //   maxParticipants: 40,
      //   registered: 28
      // }
    ]
  });
});

// Get single event
router.get('/:id', (req, res) => {
  const { id } = req.params;
  // TODO: Fetch event from database
  res.json({
    id,
    name: 'Event Name',
    date: '2026-06-03',
    location: 'Berlin',
    status: 'postponed'
  });
});

// Create event (admin only)
router.post('/', authenticate, adminOnly, (req, res) => {
  const { name, date, location, maxParticipants } = req.body;
  // TODO: Create event in database
  res.status(201).json({
    id: 1,
    name,
    date,
    location,
    maxParticipants,
    message: 'Event created successfully'
  });
});

// Update event (admin only)
router.put('/:id', authenticate, adminOnly, (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  // TODO: Update event in database
  res.json({
    id,
    ...updates,
    message: 'Event updated successfully'
  });
});

// Delete event (admin only)
router.delete('/:id', authenticate, adminOnly, (req, res) => {
  const { id } = req.params;
  // TODO: Delete event from database
  res.json({
    id,
    message: 'Event deleted successfully'
  });
});

// Get event participants
router.get('/:id/participants', (req, res) => {
  const { id } = req.params;
  // TODO: Fetch participants from database
  res.json({
    eventId: id,
    participants: []
  });
});

export default router;
