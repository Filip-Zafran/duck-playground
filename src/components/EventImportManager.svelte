<script lang="ts">
  import { onMount } from 'svelte';

  type Participant = { email: string; name: string; romanticLikesGiven: number; socialLikesGiven: number; romanticLikesReceived: number; socialLikesReceived: number; romanticMatches: number; socialMatches: number; totalMatches: number; romanticMatchNames: string[]; socialMatchNames: string[] };
  type SavedEvent = { eventId: string; eventName: string; eventDate: string; participantCount: number; importedAt: string; reportData: { participants: Participant[] } };
  let file: File | null = null;
  let events: SavedEvent[] = [];
  let loading = true;
  let uploading = false;
  let message = '';
  let error = '';
  let expandedEvent = '';

  async function loadEvents() {
    loading = true;
    try {
      const response = await fetch('/api/admin/event-imports');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load saved events.');
      events = data.events;
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Could not load saved events.';
    } finally {
      loading = false;
    }
  }

  onMount(loadEvents);

  async function upload() {
    if (!file) {
      error = 'Choose a CSV file first.';
      return;
    }
    uploading = true;
    message = '';
    error = '';
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch('/api/admin/event-imports', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed.');
      message = `${data.event.eventId} saved with ${data.event.participantCount} participants.`;
      file = null;
      const input = document.querySelector<HTMLInputElement>('#event-csv');
      if (input) input.value = '';
      await loadEvents();
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Upload failed.';
    } finally {
      uploading = false;
    }
  }

  function dateLabel(value: string) {
    const date = new Date(`${value.slice(0, 10)}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  }
</script>

<section class="manager" aria-labelledby="import-title">
  <div class="intro">
    <p class="eyebrow">Event data</p>
    <h2 id="import-title">Import a participant report</h2>
    <p>Upload the DDA event CSV to save participant totals and match names. Put Event Name first, with the ID in parentheses, for example: Riverside Golden Hour (riverside-golden-hour-2026-07-30). Uploading the same ID updates its saved data.</p>
  </div>

  <form class="upload-card" on:submit|preventDefault={upload}>
    <label for="event-csv">CSV report</label>
    <input id="event-csv" type="file" accept=".csv,text/csv" on:change={(event) => { file = event.currentTarget.files?.[0] ?? null; message = ''; error = ''; }} />
    <div class="upload-actions">
      <span class="file-name">{file ? file.name : 'DDA CRM import CSV · Event Name first column'}</span>
      <button type="submit" disabled={!file || uploading}>{uploading ? 'Saving…' : 'Upload and save'}</button>
    </div>
    {#if message}<p class="status success" role="status">{message}</p>{/if}
    {#if error}<p class="status failure" role="alert">{error}</p>{/if}
    <p class="hint">CSV rows must share one event ID and date. Required columns and match totals are checked before saving.</p>
  </form>

  <div class="saved-heading">
    <div><h3>Saved events</h3><p>Stored report data can be reviewed here after each import.</p></div>
    <button class="refresh" type="button" on:click={loadEvents} disabled={loading}>Refresh</button>
  </div>

  {#if loading}
    <p class="empty">Loading saved events…</p>
  {:else if events.length === 0}
    <p class="empty">No event reports have been imported yet.</p>
  {:else}
    <div class="table-wrap">
      <table>
        <thead><tr><th>Event Name</th><th>Event ID</th><th>Date</th><th>Participants</th><th>Last saved</th></tr></thead>
        <tbody>
          {#each events as event (event.eventId)}
            <tr class="event-row" on:click={() => expandedEvent = expandedEvent === event.eventId ? '' : event.eventId}>
              <td><button class="event-link" type="button" aria-expanded={expandedEvent === event.eventId} on:click|stopPropagation={() => expandedEvent = expandedEvent === event.eventId ? '' : event.eventId}>{event.eventName || event.eventId}</button></td>
              <td>{event.eventId}</td>
              <td>{dateLabel(event.eventDate)}</td><td>{event.participantCount}</td><td>{new Date(event.importedAt).toLocaleString()}</td>
            </tr>
            {#if expandedEvent === event.eventId}
              <tr><td colspan="5" class="details-cell">
                <div class="details-wrap">
                  <table class="participants">
                    <thead><tr><th>Participant</th><th>Email</th><th>Likes given (R/S)</th><th>Likes received (R/S)</th><th>Matches (R/S)</th><th>Match names (R/S)</th></tr></thead>
                    <tbody>{#each event.reportData.participants as participant (participant.email)}
                      <tr>
                        <td>{participant.name}</td><td>{participant.email}</td>
                        <td>{participant.romanticLikesGiven} / {participant.socialLikesGiven}</td>
                        <td>{participant.romanticLikesReceived} / {participant.socialLikesReceived}</td>
                        <td>{participant.romanticMatches} / {participant.socialMatches} ({participant.totalMatches} total)</td>
                        <td><strong>Romantic:</strong> {participant.romanticMatchNames.join(', ') || '—'}<br/><strong>Social:</strong> {participant.socialMatchNames.join(', ') || '—'}</td>
                      </tr>
                    {/each}</tbody>
                  </table>
                </div>
              </td></tr>
            {/if}
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</section>

<style>
  .manager { max-width: 900px; margin: 0 auto; color: #2f2f2f; }
  .intro { margin-bottom: 1.5rem; }
  .eyebrow { margin: 0 0 .35rem; color: #9451a7; font-size: .78rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
  h2 { margin: 0; font-size: clamp(1.5rem, 4vw, 2rem); letter-spacing: -.03em; }
  .intro > p:last-child, .saved-heading p { color: #6f6872; margin: .5rem 0 0; }
  .upload-card { padding: 1.4rem; border: 1px solid #eadfed; border-radius: 18px; background: white; box-shadow: 0 6px 24px #340c460d; }
  label { display: block; font-weight: 750; margin-bottom: .6rem; }
  input[type=file] { width: 100%; padding: .9rem; border: 1px dashed #b9a3c2; border-radius: 12px; background: #fcf9fd; }
  .upload-actions { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 1rem; }
  .file-name, .hint { color: #77717a; font-size: .9rem; }
  button { border: 0; border-radius: 999px; padding: .8rem 1.2rem; background: #743b87; color: white; font-weight: 750; cursor: pointer; }
  button:disabled { opacity: .5; cursor: wait; }
  .hint { margin: 1rem 0 0; }
  .status { margin: 1rem 0 0; font-weight: 650; }
  .success { color: #176b43; }
  .failure { color: #a32c39; }
  .saved-heading { display: flex; justify-content: space-between; align-items: end; gap: 1rem; margin: 2rem 0 .8rem; }
  h3 { margin: 0; font-size: 1.2rem; }
  .refresh { background: #f0e9f3; color: #542962; padding: .6rem 1rem; }
  .event-row { cursor: pointer; }
  .event-link { padding: 0; border-radius: 0; color: #643377; background: transparent; text-decoration: underline; text-align: left; }
  .event-link:hover { background: transparent; }
  .details-cell { padding: 0 !important; background: #fcf9fd; }
  .details-wrap { padding: .75rem; overflow-x: auto; }
  .participants { min-width: 820px; }
  .participants td { white-space: normal; vertical-align: top; }
  .empty { padding: 1.5rem; color: #77717a; text-align: center; background: #fff; border-radius: 14px; }
  .table-wrap { overflow-x: auto; border: 1px solid #eee5f0; border-radius: 14px; background: white; }
  table { width: 100%; border-collapse: collapse; text-align: left; }
  th, td { padding: .9rem 1rem; border-bottom: 1px solid #f0ebf1; white-space: nowrap; }
  th { color: #64586a; font-size: .82rem; background: #faf7fb; }
  tbody tr:last-child td { border-bottom: 0; }
  @media (max-width: 560px) { .upload-actions { align-items: stretch; flex-direction: column; } .upload-actions button { width: 100%; } .saved-heading { align-items: start; } }
</style>
