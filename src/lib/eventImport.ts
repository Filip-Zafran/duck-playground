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
const PARTICIPANT_HEADERS = EVENT_IMPORT_HEADERS.slice(2);

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
  eventName: string;
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
const normalizeHeader = (value: string) => value.trim().replace(/^\uFEFF/, '').toLowerCase().replace(/[\s-]+/g, '_');
const humanizeEventId = (value: string) => value.replace(/[-_]+\d{4}-\d{2}-\d{2}$/, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

function splitEventName(value: string): { name: string; id: string } {
  const match = value.trim().match(/^(.*?)\s*(?:\(([^()]+)\)|\[([^\]]+)\]|\|\s*([^|]+))\s*$/);
  if (!match) return { name: value.trim(), id: '' };
  return { name: (match[1] || '').trim(), id: (match[2] || match[3] || match[4] || '').trim() };
}

export function parseEventImport(csv: string): EventImport {
  const rows = parseCsv(csv);
  if (rows.length < 2) throw new Error('The CSV must include a header row and at least one participant.');
  const headers = rows[0].map(normalizeHeader);
  const legacy = headers.length === EVENT_IMPORT_HEADERS.length && EVENT_IMPORT_HEADERS.every((header, index) => headers[index] === header);
  const namedWithId = headers[0] === 'event_name' && headers[1] === 'event_id' && headers.length === EVENT_IMPORT_HEADERS.length + 1 &&
    headers[2] === 'event_date' && headers.slice(3).every((header, index) => header === PARTICIPANT_HEADERS[index]);
  const namedCombined = headers[0] === 'event_name' && headers.length === EVENT_IMPORT_HEADERS.length &&
    headers.slice(1).every((header, index) => header === EVENT_IMPORT_HEADERS[index + 1]);
  if (!legacy && !namedWithId && !namedCombined) {
    throw new Error(`CSV must start with Event Name (and optionally Event ID), then Event Date and these participant columns: ${PARTICIPANT_HEADERS.join(', ')}.`);
  }

  const participants: EventParticipantImport[] = [];
  let eventId = '';
  let eventName = '';
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
    const expectedColumns = namedWithId ? EVENT_IMPORT_HEADERS.length + 1 : EVENT_IMPORT_HEADERS.length;
    if (row.length !== expectedColumns) throw new Error(`Row ${rowIndex + 1} has ${row.length} columns; expected ${expectedColumns}.`);
    const rowEventDate = row[legacy ? 1 : namedWithId ? 2 : 1].trim();
    let rowEventId = legacy ? row[0].trim() : namedWithId ? row[1].trim() : '';
    let rowEventName = legacy ? humanizeEventId(rowEventId) : row[0].trim();
    if (namedCombined) {
      const split = splitEventName(rowEventName);
      rowEventName = split.name;
      rowEventId = split.id || `${rowEventName}-${rowEventDate}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    const start = legacy ? 2 : namedWithId ? 3 : 2;
    const shift = namedWithId ? 1 : 0;
    const email = row[start].trim().toLowerCase();
    const name = row[start + 1].trim();
    if (!rowEventId || rowEventId.length > 120) throw new Error(`Row ${rowIndex + 1} has an invalid event ID.`);
    if (!rowEventName || rowEventName.length > 255) throw new Error(`Row ${rowIndex + 1} has an invalid Event Name.`);
    const parsedDate = new Date(`${rowEventDate}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(rowEventDate) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== rowEventDate) {
      throw new Error(`Row ${rowIndex + 1} must use an event date in YYYY-MM-DD format.`);
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error(`Row ${rowIndex + 1} has an invalid participant email.`);
    if (!name) throw new Error(`Row ${rowIndex + 1} is missing a participant name.`);
    if (eventId && eventId !== rowEventId) throw new Error('A CSV upload can contain only one event ID.');
    if (eventName && eventName !== rowEventName) throw new Error('All rows in the upload must use the same Event Name.');
    if (eventDate && eventDate !== rowEventDate) throw new Error('All rows in the upload must use the same event date.');
    if (seenEmails.has(email)) throw new Error(`Participant email ${email} appears more than once.`);
    eventId = rowEventId;
    eventName = rowEventName;
    eventDate = rowEventDate;
    seenEmails.add(email);

    const romanticMatchNames = splitNames(row[11 + shift]);
    const socialMatchNames = splitNames(row[12 + shift]);
    const romanticMatches = count(row, 8 + shift, `Row ${rowIndex + 1} romantic_matches`);
    const socialMatches = count(row, 9 + shift, `Row ${rowIndex + 1} social_matches`);
    const totalMatches = count(row, 10 + shift, `Row ${rowIndex + 1} total_matches`);
    if (totalMatches !== romanticMatches + socialMatches) throw new Error(`Row ${rowIndex + 1} total_matches must equal romantic_matches plus social_matches.`);
    if (romanticMatchNames.length !== romanticMatches || socialMatchNames.length !== socialMatches) {
      throw new Error(`Row ${rowIndex + 1} match-name counts must agree with romantic_matches and social_matches.`);
    }

    participants.push({
      email,
      name,
      romanticLikesGiven: count(row, 4 + shift, `Row ${rowIndex + 1} romantic_likes_given`),
      socialLikesGiven: count(row, 5 + shift, `Row ${rowIndex + 1} social_likes_given`),
      romanticLikesReceived: count(row, 6 + shift, `Row ${rowIndex + 1} social_likes_received`),
      socialLikesReceived: count(row, 7 + shift, `Row ${rowIndex + 1} social_likes_received`),
      romanticMatches,
      socialMatches,
      totalMatches,
      romanticMatchNames,
      socialMatchNames,
    });
  }

  return { eventId, eventName, eventDate, participants, importedAt: new Date().toISOString() };
}
