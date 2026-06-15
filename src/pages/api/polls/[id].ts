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
    const { id } = params;

    const counts = await getVoteCounts(id as string);
    const previews = await getVotePreviews(id as string);

    return new Response(JSON.stringify({
      counts,
      previews
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error getting poll results:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    await pool.query('DELETE FROM polls WHERE id = $1', [id]);

    return new Response(JSON.stringify({ id, message: 'Poll deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting poll:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
