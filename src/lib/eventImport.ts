export const EVENT_IMPORT_HEADERS = [
  'event_id',
  'event_date',
  'participant_email',
  'participant_name',
  'romantic_likes_given',
  'social_likes_given',
  'romantic_likes_received',
  'social_likes_received',
  'romantic_matches',
  'social_matches',
  'total_matches',
  'romantic_matches_names',
  'social_matches_names',
] as const;

export interface EventParticipantImport {
  email: string;
  name: string;
  romanticLikesGiven: number;
  socialLikesGiven: number;
  romanticLikesReceived: number;
  socialLikesReceived: number;
  romanticMatches: number;
  socialMatches: number;
  totalMatches: number;
  romanticMatchNames: string[];
  socialMatchNames: string[];
}

export interface EventImport {
  eventId: string;
  eventDate: string;
  participants: EventParticipantImport[];
  importedAt: string;
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (quoted) throw new Error('CSV contains an unclosed quoted field.');
  row.push(cell);
  if (row.some((value) => value.trim() !== '')) rows.push(row);
  return rows;
}

const splitNames = (value: string) => value.split('|').map((name) => name.trim()).filter(Boolean);

export function parseEventImport(csv: string): EventImport {
  const rows = parseCsv(csv);
  if (rows.length < 2) throw new Error('The CSV must include a header row and at least one participant.');
  const headers = rows[0].map((header) => header.trim().replace(/^\uFEFF/, ''));
  if (headers.length !== EVENT_IMPORT_HEADERS.length || EVENT_IMPORT_HEADERS.some((header, index) => headers[index] !== header)) {
    throw new Error(`CSV columns must match this order: ${EVENT_IMPORT_HEADERS.join(', ')}.`);
  }

  const participants: EventParticipantImport[] = [];
  let eventId = '';
  let eventDate = '';
  const seenEmails = new Set<string>();
  const count = (row: string[], index: number, label: string) => {
    const value = row[index]?.trim() ?? '';
    if (!/^\d+$/.test(value)) throw new Error(`${label} must be a whole number of zero or more.`);
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed)) throw new Error(`${label} is outside the supported range.`);
    return parsed;
  };

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    if (row.length !== EVENT_IMPORT_HEADERS.length) throw new Error(`Row ${rowIndex + 1} has ${row.length} columns; expected ${EVENT_IMPORT_HEADERS.length}.`);
    const rowEventId = row[0].trim();
    const rowEventDate = row[1].trim();
    const email = row[2].trim().toLowerCase();
    const name = row[3].trim();
    if (!rowEventId || rowEventId.length > 120) throw new Error(`Row ${rowIndex + 1} has an invalid event ID.`);
    const parsedDate = new Date(`${rowEventDate}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(rowEventDate) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== rowEventDate) {
      throw new Error(`Row ${rowIndex + 1} must use an event date in YYYY-MM-DD format.`);
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error(`Row ${rowIndex + 1} has an invalid participant email.`);
    if (!name) throw new Error(`Row ${rowIndex + 1} is missing a participant name.`);
    if (eventId && eventId !== rowEventId) throw new Error('A CSV upload can contain only one event ID.');
    if (eventDate && eventDate !== rowEventDate) throw new Error('All rows in the upload must use the same event date.');
    if (seenEmails.has(email)) throw new Error(`Participant email ${email} appears more than once.`);
    eventId = rowEventId;
    eventDate = rowEventDate;
    seenEmails.add(email);

    const romanticMatchNames = splitNames(row[11]);
    const socialMatchNames = splitNames(row[12]);
    const romanticMatches = count(row, 8, `Row ${rowIndex + 1} romantic_matches`);
    const socialMatches = count(row, 9, `Row ${rowIndex + 1} social_matches`);
    const totalMatches = count(row, 10, `Row ${rowIndex + 1} total_matches`);
    if (totalMatches !== romanticMatches + socialMatches) throw new Error(`Row ${rowIndex + 1} total_matches must equal romantic_matches plus social_matches.`);
    if (romanticMatchNames.length !== romanticMatches || socialMatchNames.length !== socialMatches) {
      throw new Error(`Row ${rowIndex + 1} match-name counts must agree with romantic_matches and social_matches.`);
    }

    participants.push({
      email,
      name,
      romanticLikesGiven: count(row, 4, `Row ${rowIndex + 1} romantic_likes_given`),
      socialLikesGiven: count(row, 5, `Row ${rowIndex + 1} social_likes_given`),
      romanticLikesReceived: count(row, 6, `Row ${rowIndex + 1} romantic_likes_received`),
      socialLikesReceived: count(row, 7, `Row ${rowIndex + 1} social_likes_received`),
      romanticMatches,
      socialMatches,
      totalMatches,
      romanticMatchNames,
      socialMatchNames,
    });
  }

  return { eventId, eventDate, participants, importedAt: new Date().toISOString() };
}
