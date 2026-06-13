import { Router } from 'express';
import { randomUUID, randomBytes } from 'crypto';
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

// GET /api/polls - List all polls
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, expected, created_at, admin_token
      FROM polls
      ORDER BY created_at DESC
    `);

    const pollsWithCounts = await Promise.all(
      result.rows.map(async (poll) => {
        const counts = await getVoteCounts(poll.id);
        const totalVotes = counts.date1 + counts.date2 + counts.date3 + counts.none;
        return {
          ...poll,
          vote_count: totalVotes
        };
      })
    );

    res.json(pollsWithCounts);
  } catch (error) {
    console.error('Error listing polls:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/polls - Create new poll
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      expected,
      open_access,
      date1,
      time1,
      date2,
      time2,
      date3,
      time3,
      timer_minutes = 0,
      invite_emails = []
    } = req.body;

    const pollId = randomUUID();
    const adminToken = randomBytes(16).toString('hex');

    let timerEnd = null;
    if (timer_minutes > 0) {
      const endTime = new Date(Date.now() + timer_minutes * 60000);
      timerEnd = endTime.toISOString();
    }

    await pool.query(`
      INSERT INTO polls (id, admin_token, title, description, duration, expected, open_access, date1, time1, date2, time2, date3, time3, timer_end)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [pollId, adminToken, title, description || null, duration || null, expected || 0, open_access ? true : false, date1, time1 || null, date2, time2 || null, date3, time3 || null, timerEnd]);

    // Add invites if not open access
    if (!open_access && invite_emails.length > 0) {
      for (const email of invite_emails) {
        await pool.query(
          'INSERT INTO invites (poll_id, email) VALUES ($1, $2)',
          [pollId, email.toLowerCase().trim()]
        );
      }
    }

    res.status(201).json({
      id: pollId,
      admin_token: adminToken,
      vote_url: `/poll-vote?token=${pollId}`,
      admin_url: `/poll?admin=${adminToken}`
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/polls/:id - Delete poll (admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_token } = req.query;

    // Verify admin token
    const pollResult = await pool.query('SELECT id FROM polls WHERE id = $1 AND admin_token = $2', [id, admin_token]);
    if (pollResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid admin token' });
    }

    // Delete poll (cascades to votes and invites)
    await pool.query('DELETE FROM polls WHERE id = $1', [id]);

    res.json({ id, message: 'Poll deleted successfully' });
  } catch (error) {
    console.error('Error deleting poll:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
