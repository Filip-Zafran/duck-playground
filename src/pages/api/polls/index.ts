import { randomUUID, randomBytes } from 'crypto';
import pool from '../../../config/database';
import type { APIRoute } from 'astro';

async function getVoteCounts(pollId: string) {
  const result = await pool.query(`
    SELECT choice, COUNT(*) as count
    FROM votes
    WHERE poll_id = $1
    GROUP BY choice
  `, [pollId]);

  const counts: any = { date1: 0, date2: 0, date3: 0, none: 0 };
  result.rows.forEach(row => {
    if (row.choice in counts) {
      counts[row.choice] = parseInt(row.count);
    }
  });
  return counts;
}

export const GET: APIRoute = async () => {
  try {
    const result = await pool.query(`
      SELECT id, title, expected, created_at, admin_token, date1, time1, date2, time2, date3, time3, timer_end
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

    return new Response(JSON.stringify(pollsWithCounts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error listing polls:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json();
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
    } = body;

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

    if (!open_access && invite_emails.length > 0) {
      for (const email of invite_emails) {
        await pool.query(
          'INSERT INTO invites (poll_id, email) VALUES ($1, $2)',
          [pollId, email.toLowerCase().trim()]
        );
      }
    }

    return new Response(JSON.stringify({
      id: pollId,
      admin_token: adminToken,
      vote_url: `/poll-vote?token=${pollId}`,
      admin_url: `/poll?admin=${adminToken}`
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
