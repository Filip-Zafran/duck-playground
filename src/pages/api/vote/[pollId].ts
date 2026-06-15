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

async function getVotePreviews(pollId: string) {
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

export const GET: APIRoute = async ({ params }) => {
  try {
    const { pollId } = params;

    const pollResult = await pool.query('SELECT * FROM polls WHERE id = $1', [pollId]);
    if (pollResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Poll not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const poll = pollResult.rows[0];
    const counts = await getVoteCounts(pollId as string);
    const votesPreviews = await getVotePreviews(pollId as string);

    return new Response(JSON.stringify({
      title: poll.title,
      description: poll.description,
      duration: poll.duration,
      date1: poll.date1,
      time1: poll.time1,
      date2: poll.date2,
      time2: poll.time2,
      date3: poll.date3,
      time3: poll.time3,
      expected: poll.expected,
      timer_end: poll.timer_end,
      counts,
      votes_preview: votesPreviews
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching poll:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { pollId } = params;
    const body = await request.json();
    const { voter_name, choice, alt_date, voter_token } = body;

    const pollResult = await pool.query('SELECT id FROM polls WHERE id = $1', [pollId]);
    if (pollResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Poll not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      await pool.query(`
        INSERT INTO votes (poll_id, voter_name, choice, alt_date, voter_token)
        VALUES ($1, $2, $3, $4, $5)
      `, [pollId, voter_name, choice, alt_date || null, voter_token]);
    } catch (error: any) {
      if (error.code === '23505') {
        return new Response(JSON.stringify({ error: 'Vote already submitted from this device' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      throw error;
    }

    const counts = await getVoteCounts(pollId as string);
    const votesPreviews = await getVotePreviews(pollId as string);

    return new Response(JSON.stringify({
      ok: true,
      counts,
      votes_preview: votesPreviews
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
