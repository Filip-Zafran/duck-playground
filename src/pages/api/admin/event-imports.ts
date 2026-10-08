import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/apiAuth';
import { parseEventImport } from '../../../lib/eventImport';
import pool from '../../../config/database.js';

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS event_imports (
      event_id VARCHAR(120) PRIMARY KEY,
      event_name VARCHAR(255) NOT NULL DEFAULT '',
      event_date DATE NOT NULL,
      participant_count INTEGER NOT NULL,
      report_data JSONB NOT NULL,
      imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`ALTER TABLE event_imports ADD COLUMN IF NOT EXISTS event_name VARCHAR(255) NOT NULL DEFAULT ''`);
}

export const GET: APIRoute = async (context) => {
  const auth = requireAuth(context);
  if (!auth.valid) return auth.response!;
  try {
    await ensureTable();
    const { rows } = await pool.query(`
      SELECT event_id AS "eventId", event_name AS "eventName", event_date AS "eventDate", participant_count AS "participantCount", imported_at AS "importedAt", report_data AS "reportData"
      FROM event_imports ORDER BY event_date DESC, imported_at DESC
    `);
    return json({ events: rows });
  } catch (error) {
    console.error('Could not load event imports:', error);
    return json({ error: 'Could not load saved event imports. Check the database connection.' }, 503);
  }
};

export const POST: APIRoute = async (context) => {
  const auth = requireAuth(context);
  if (!auth.valid) return auth.response!;
  try {
    const form = await context.request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return json({ error: 'Choose a CSV file to upload.' }, 400);
    if (!file.name.toLowerCase().endsWith('.csv') || file.size > 2_000_000) {
      return json({ error: 'Upload a CSV file smaller than 2 MB.' }, 400);
    }

    const imported = parseEventImport(await file.text());
    await ensureTable();
    const result = await pool.query(`
      INSERT INTO event_imports (event_id, event_name, event_date, participant_count, report_data, imported_at)
      VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
      ON CONFLICT (event_id) DO UPDATE SET
        event_name = EXCLUDED.event_name,
        event_date = EXCLUDED.event_date,
        participant_count = EXCLUDED.participant_count,
        report_data = EXCLUDED.report_data,
        imported_at = NOW()
      RETURNING event_id AS "eventId", event_name AS "eventName", event_date AS "eventDate", participant_count AS "participantCount", imported_at AS "importedAt"
    `, [imported.eventId, imported.eventName, imported.eventDate, imported.participants.length, JSON.stringify(imported)]);

    return json({ event: result.rows[0], updated: result.rowCount === 1, message: 'Event data saved.' }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not import this CSV.';
    const isInputError = /CSV|Row |event ID|event name|event date|participant email|participant name|must equal|match-name|columns|quoted field/i.test(message);
    console.error('Event CSV import failed:', error);
    return json({ error: isInputError ? message : 'Could not save event data. Check the database connection and try again.' }, isInputError ? 400 : 503);
  }
};
