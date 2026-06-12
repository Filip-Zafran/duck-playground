import express from 'express';
import { authenticate, adminOnly } from '../../middleware/auth.js';

const router = express.Router();

// Get matches for a user
router.get('/user/:userId', authenticate, (req, res) => {
  const { userId } = req.params;
  // TODO: Calculate matches based on interests, preferences
  res.json({
    userId,
    matches: [
      // {
      //   id: 1,
      //   name: 'Match Name',
      //   matchScore: 85,
      //   sharedInterests: ['hiking', 'yoga'],
      //   suggestedEvents: []
      // }
    ]
  });
});

// Calculate matches for event (admin only)
router.post('/calculate/:eventId', authenticate, adminOnly, (req, res) => {
  const { eventId } = req.params;
  // TODO: Run matching algorithm for all approved applicants
  res.json({
    eventId,
    matchesCalculated: 0,
    message: 'Matching algorithm executed'
  });
});

// Get match details
router.get('/:matchId', authenticate, (req, res) => {
  const { matchId } = req.params;
  // TODO: Fetch match details
  res.json({
    matchId,
    user1: {},
    user2: {},
    matchScore: 85,
    sharedInterests: []
  });
});

// Update match status
router.post('/:matchId/status', authenticate, (req, res) => {
  const { matchId } = req.params;
  const { status } = req.body; // interested, passed, etc
  // TODO: Update match status
  res.json({
    matchId,
    status,
    message: 'Match status updated'
  });
});

export default router;
