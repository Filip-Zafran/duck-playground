import { Router } from 'express';
import pool from '../../config/database.js';

const router = Router();

// Helper function: Get vote counts for a poll
async function getVoteCounts(pollId) {
  const result = await pool.query(`
    SELECT choice, COUNT(*) as count
    FROM votes
    WHERE poll_id = $1
    GROUP BY choice
  `, [pollId]);

  const counts = { date1: 0, date2: 0, date3: 0, none: 0 };
  result.rows.forEach(row => {
    if (row.choice in counts) {
      counts[row.choice] = parseInt(row.count);
    }
  });
  return counts;
}

// Helper function: Get vote previews (last 20 votes)
async function getVotePreviews(pollId) {
  const result = await pool.query(`
    SELECT voter_name, choice
    FROM votes
    WHERE poll_id = $1
    ORDER BY submitted_at DESC
    LIMIT 20
  `, [pollId]);

  return result.rows.map(v => ({
    initials: (v.voter_name || '?').slice(0, 2).toUpperCase(),
    choice: v.choice
  }));
}

// GET /api/vote/:pollId - Get poll details with vote counts
router.get('/:pollId', async (req, res) => {
  try {
    const { pollId } = req.params;

    const pollResult = await pool.query('SELECT * FROM polls WHERE id = $1', [pollId]);
    if (pollResult.rows.length === 0) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    const poll = pollResult.rows[0];
    const counts = await getVoteCounts(pollId);
    const votesPreviews = await getVotePreviews(pollId);

    res.json({
      title: poll.title,
      description: poll.description,
      duration: poll.duration,
      date1: poll.date1,
      date2: poll.date2,
      date3: poll.date3,
      expected: poll.expected,
      timer_end: poll.timer_end,
      counts,
      votes_preview: votesPreviews
    });
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/vote/:pollId - Submit a vote
router.post('/:pollId', async (req, res) => {
  try {
    const { pollId } = req.params;
    const { voter_name, choice, alt_date, voter_token } = req.body;

    // Check if poll exists
    const pollResult = await pool.query('SELECT id FROM polls WHERE id = $1', [pollId]);
    if (pollResult.rows.length === 0) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Insert vote
    try {
      await pool.query(`
        INSERT INTO votes (poll_id, voter_name, choice, alt_date, voter_token)
        VALUES ($1, $2, $3, $4, $5)
      `, [pollId, voter_name, choice, alt_date || null, voter_token]);
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ error: 'Vote already submitted from this device' });
      }
      throw error;
    }

    const counts = await getVoteCounts(pollId);
    const votesPreviews = await getVotePreviews(pollId);

    res.status(201).json({
      ok: true,
      counts,
      votes_preview: votesPreviews
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
