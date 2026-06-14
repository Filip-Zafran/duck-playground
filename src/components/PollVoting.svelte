<script>
  import { onMount } from 'svelte';

  export let pollId = '';

  let poll = null;
  let loading = true;
  let error = '';
  let voterName = '';
  let selectedDates = {
    date1: false,
    date2: false,
    date3: false
  };
  let cantMakeIt = false;
  let altDate = '';
  let submitting = false;
  let voteSubmitted = false;
  let timeRemaining = '';
  let timerInterval;

  function updateTimer() {
    if (!poll || !poll.timer_end) return;

    const endTime = new Date(poll.timer_end).getTime();
    const now = new Date().getTime();
    const diff = endTime - now;

    if (diff <= 0) {
      timeRemaining = 'Voting has ended';
      if (timerInterval) clearInterval(timerInterval);
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    timeRemaining = `${hours}h ${minutes}m ${seconds}s`;
  }

  onMount(async () => {
    // If pollId not provided as prop, try to get from URL
    if (!pollId) {
      const params = new URLSearchParams(window.location.search);
      pollId = params.get('token') || '';
    }

    if (!pollId) {
      error = `No poll ID provided. URL: ${window.location.href} | Search: ${window.location.search}`;
      loading = false;
      return;
    }

    try {
      const response = await fetch(`/api/vote/${pollId}`);
      if (!response.ok) {
        error = 'Poll not found';
        loading = false;
        return;
      }

      poll = await response.json();
      loading = false;

      // Start timer if poll has a deadline
      if (poll.timer_end) {
        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
      }
    } catch (e) {
      error = 'Failed to load poll';
      console.error(e);
      loading = false;
    }

    // Cleanup interval on unmount
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  });

  async function submitVote() {
    const hasSelectedDate = selectedDates.date1 || selectedDates.date2 || selectedDates.date3 || cantMakeIt;
    if (!voterName || !hasSelectedDate) {
      error = 'Please enter your name and select at least one option';
      return;
    }

    submitting = true;
    error = '';

    try {
      const votesToSubmit = [];

      if (selectedDates.date1) votesToSubmit.push('date1');
      if (selectedDates.date2) votesToSubmit.push('date2');
      if (selectedDates.date3) votesToSubmit.push('date3');
      if (cantMakeIt) votesToSubmit.push('none');

      // Submit a vote for each selected option
      const responses = await Promise.all(
        votesToSubmit.map(choice =>
          fetch(`/api/vote/${pollId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              voter_name: voterName,
              choice: choice,
              alt_date: (choice === 'none' && altDate) ? altDate : null,
              voter_token: `vote_${Date.now()}_${Math.random()}`
            })
          })
        )
      );

      const response = responses[0];

      if (!response.ok) {
        const data = await response.json();
        error = data.error || 'Failed to submit vote';
        submitting = false;
        return;
      }

      const result = await response.json();
      poll = { ...poll, ...result };
      voteSubmitted = true;
      submitting = false;
    } catch (e) {
      error = 'Failed to submit vote';
      console.error(e);
      submitting = false;
    }
  }

  function getDateLabel(dateStr) {
    if (!dateStr) return 'TBD';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }
</script>

<div class="poll-container">
  {#if loading}
    <div class="loading">
      <p>Loading poll...</p>
    </div>
  {:else if error}
    <div class="error-box">
      <h2>⚠️ Error</h2>
      <p>{error}</p>
    </div>
  {:else if poll}
    <div class="poll-content">
      <div class="poll-header">
        <h1>{poll.title}</h1>
        {#if poll.description}
          <p class="description">{poll.description}</p>
        {/if}
      </div>

      {#if poll.timer_end}
        <div class="timer-info">
          <p>⏱️ Time remaining: <strong>{timeRemaining}</strong></p>
        </div>
      {/if}

      {#if voteSubmitted}
        <div class="success-box">
          <h2>✅ Vote Submitted</h2>
          <p>Thank you for voting! Your response has been recorded.</p>
        </div>
      {:else}
        <form on:submit|preventDefault={submitVote} class="vote-form">
          <div class="form-section">
            <label for="voterName">Your Name *</label>
            <input
              id="voterName"
              type="text"
              bind:value={voterName}
              placeholder="Enter your name"
              required
              disabled={submitting}
            />
          </div>

          <div class="form-section">
            <label>Which dates work for you? *</label>
            <div class="date-options">
              <label class="checkbox-option">
                <input
                  type="checkbox"
                  bind:checked={selectedDates.date1}
                  disabled={submitting || cantMakeIt}
                  on:change={() => { if (selectedDates.date1) cantMakeIt = false; }}
                />
                <span class="checkbox-label">{getDateLabel(poll.date1, poll.time1)}</span>
              </label>
              <label class="checkbox-option">
                <input
                  type="checkbox"
                  bind:checked={selectedDates.date2}
                  disabled={submitting || cantMakeIt}
                  on:change={() => { if (selectedDates.date2) cantMakeIt = false; }}
                />
                <span class="checkbox-label">{getDateLabel(poll.date2, poll.time2)}</span>
              </label>
              <label class="checkbox-option">
                <input
                  type="checkbox"
                  bind:checked={selectedDates.date3}
                  disabled={submitting || cantMakeIt}
                  on:change={() => { if (selectedDates.date3) cantMakeIt = false; }}
                />
                <span class="checkbox-label">{getDateLabel(poll.date3, poll.time3)}</span>
              </label>
              <label class="checkbox-option cant-make-it">
                <input
                  type="checkbox"
                  bind:checked={cantMakeIt}
                  disabled={submitting}
                  on:change={() => { if (cantMakeIt) { selectedDates.date1 = false; selectedDates.date2 = false; selectedDates.date3 = false; } }}
                />
                <span class="checkbox-label">I can't make it this month</span>
              </label>
            </div>
          </div>

          {#if cantMakeIt}
            <div class="disclaimer-box">
              <p>No worries, we have backups that we will engage right away</p>
            </div>
            <div class="form-section">
              <label for="altDate">Suggest an alternative date</label>
              <input
                id="altDate"
                type="date"
                bind:value={altDate}
                disabled={submitting}
              />
            </div>
          {/if}

          {#if error}
            <div class="error-message">{error}</div>
          {/if}

          <button
            type="submit"
            class="submit-btn"
            disabled={submitting || !voterName || (!selectedDates.date1 && !selectedDates.date2 && !selectedDates.date3 && !cantMakeIt)}
          >
            {submitting ? 'Submitting...' : 'Submit Vote'}
          </button>
        </form>
      {/if}

      <div class="results-section">
        <h2>Current Votes</h2>
        {#if poll.counts}
          <div class="vote-counts">
            <div class="count-item">
              <span class="label">{getDateLabel(poll.date1)}</span>
              <span class="count">{poll.counts.date1 || 0}</span>
            </div>
            <div class="count-item">
              <span class="label">{getDateLabel(poll.date2)}</span>
              <span class="count">{poll.counts.date2 || 0}</span>
            </div>
            <div class="count-item">
              <span class="label">{getDateLabel(poll.date3)}</span>
              <span class="count">{poll.counts.date3 || 0}</span>
            </div>
            <div class="count-item">
              <span class="label">None of these</span>
              <span class="count">{poll.counts.none || 0}</span>
            </div>
          </div>
        {/if}

        {#if poll.counts && (poll.counts.date1 > 0 || poll.counts.date2 > 0 || poll.counts.date3 > 0 || poll.counts.none > 0)}
          <div class="voters-summary">
            <h3>Vote Summary</h3>
            <ul>
              {#if poll.counts.date1 > 0}
                <li>{getDateLabel(poll.date1, poll.time1)}: <strong>{poll.counts.date1}</strong> {poll.counts.date1 === 1 ? 'person' : 'people'}</li>
              {/if}
              {#if poll.counts.date2 > 0}
                <li>{getDateLabel(poll.date2, poll.time2)}: <strong>{poll.counts.date2}</strong> {poll.counts.date2 === 1 ? 'person' : 'people'}</li>
              {/if}
              {#if poll.counts.date3 > 0}
                <li>{getDateLabel(poll.date3, poll.time3)}: <strong>{poll.counts.date3}</strong> {poll.counts.date3 === 1 ? 'person' : 'people'}</li>
              {/if}
              {#if poll.counts.none > 0}
                <li>Can't make it this month: <strong>{poll.counts.none}</strong> {poll.counts.none === 1 ? 'person' : 'people'}</li>
              {/if}
            </ul>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .poll-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .loading,
  .error-box,
  .success-box {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
  }

  .error-box {
    background: #fff1f1;
    border: 1px solid #f0b7b7;
    color: #8d1f1f;
  }

  .success-box {
    background: #eefcf3;
    border: 1px solid #b7e5c7;
    color: #14663c;
  }

  .poll-header {
    margin-bottom: 2rem;
  }

  .poll-header h1 {
    color: var(--psd-primary, #340c46);
    margin: 0 0 1rem 0;
    font-size: 2rem;
  }

  .description {
    color: #666;
    font-size: 1.1rem;
    line-height: 1.6;
    margin: 0;
  }

  .timer-info {
    background: #fff3cd;
    border: 2px solid #ffc107;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 2rem;
    color: #856404;
    animation: pulse 2s infinite;
  }

  .timer-info p {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .timer-info strong {
    color: #d39e00;
    font-family: 'Courier New', monospace;
    font-size: 1.2rem;
  }

  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.4);
    }
    50% {
      box-shadow: 0 0 0 10px rgba(255, 193, 7, 0);
    }
  }

  .disclaimer-box {
    background: #e8f5e9;
    border: 2px solid #81c784;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    color: #2e7d32;
  }

  .disclaimer-box p {
    margin: 0;
    font-weight: 500;
    font-size: 1rem;
  }

  .poll-content {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .vote-form {
    margin-bottom: 3rem;
  }

  .form-section {
    margin-bottom: 2rem;
  }

  .form-section label {
    display: block;
    font-weight: 600;
    color: var(--psd-primary, #340c46);
    margin-bottom: 0.75rem;
  }

  .form-section input[type="text"],
  .form-section input[type="date"] {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    font-family: inherit;
  }

  .form-section input:focus {
    outline: none;
    border-color: var(--psd-primary, #340c46);
    box-shadow: 0 0 0 3px rgba(52, 12, 70, 0.1);
  }

  .date-options {
    display: grid;
    gap: 0.75rem;
  }

  .checkbox-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: #f9f9f9;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .checkbox-option:hover {
    background: #f0f0f0;
    border-color: var(--psd-primary, #340c46);
  }

  .checkbox-option.cant-make-it {
    background: #e3f2fd;
    border-color: #90caf9;
  }

  .checkbox-option.cant-make-it:hover {
    background: #bbdefb;
    border-color: #64b5f6;
  }

  .checkbox-option input[type="checkbox"] {
    cursor: pointer;
    accent-color: var(--psd-primary, #340c46);
  }

  .checkbox-label {
    flex: 1;
    font-weight: 500;
    color: #1a1a1a;
    cursor: pointer;
  }

  .error-message {
    background: #fff1f1;
    border: 1px solid #f0b7b7;
    color: #8d1f1f;
    padding: 0.75rem;
    border-radius: 6px;
    margin-bottom: 1rem;
  }

  .submit-btn {
    width: 100%;
    padding: 0.875rem;
    background: var(--psd-primary, #340c46);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .submit-btn:hover:not(:disabled) {
    background: var(--psd-primary-dark, #1a0623);
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .results-section {
    border-top: 2px solid #f0f0f0;
    padding-top: 2rem;
  }

  .results-section h2 {
    font-size: 1.5rem;
    color: var(--psd-primary, #340c46);
    margin-top: 0;
  }

  .vote-counts {
    display: grid;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .count-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  }

  .count-item .label {
    font-weight: 600;
    color: #333;
  }

  .count-item .count {
    background: var(--psd-primary, #340c46);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-weight: bold;
    font-size: 1.1rem;
  }

  .voters-summary {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e0e0e0;
  }

  .voters-summary h3 {
    color: var(--psd-primary, #340c46);
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
  }

  .voters-summary ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .voters-summary li {
    padding: 0.75rem 0;
    color: #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
  }

  .voters-summary li:last-child {
    border-bottom: none;
  }

  .voters-summary li strong {
    color: var(--psd-primary, #340c46);
    font-size: 1.1rem;
  }

  .vote-counts {
    display: grid;
    gap: 0.75rem;
    margin-bottom: 2rem;
  }

  .count-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  }

  .label {
    font-weight: 500;
    color: #333;
  }

  .count {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--psd-primary, #340c46);
  }

  .voters-list {
    margin-top: 2rem;
  }

  .voters-list h3 {
    font-size: 1.1rem;
    color: var(--psd-primary, #340c46);
    margin-bottom: 1rem;
  }

  .voters-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .voters-list li {
    padding: 0.75rem;
    background: #f9f9f9;
    border-bottom: 1px solid #e0e0e0;
    color: #666;
  }

  .voters-list li:last-child {
    border-bottom: none;
  }
</style>
