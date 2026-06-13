<script>
  import { onMount } from 'svelte';

  let pollId = '';
  let poll = null;
  let results = null;
  let loading = true;
  let error = '';

  onMount(async () => {
    pollId = new URLSearchParams(window.location.search).get('token') || '';
    if (!pollId) {
      error = 'No poll ID provided';
      loading = false;
      return;
    }

    try {
      const [pollResponse, resultsResponse] = await Promise.all([
        fetch(`/api/polls`),
        fetch(`/api/polls/${pollId}/results`)
      ]);

      if (!pollResponse.ok || !resultsResponse.ok) {
        error = 'Failed to load poll';
        loading = false;
        return;
      }

      const polls = await pollResponse.json();
      poll = polls.find(p => p.id === pollId);

      if (!poll) {
        error = 'Poll not found';
        loading = false;
        return;
      }

      results = await resultsResponse.json();
    } catch (e) {
      error = 'Error loading poll: ' + (e instanceof Error ? e.message : String(e));
    } finally {
      loading = false;
    }
  });

  function getDateLabel(dateStr, timeStr = '') {
    if (!dateStr) return 'TBD';
    try {
      const date = new Date(dateStr);
      const dateLabel = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });

      if (timeStr) {
        const [hours, minutes] = timeStr.split(':');
        const time = new Date(0, 0, 0, parseInt(hours), parseInt(minutes));
        const timeLabel = time.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        return `${dateLabel} at ${timeLabel}`;
      }
      return dateLabel;
    } catch {
      return dateStr;
    }
  }

  function getPercentage(count, total) {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  }
</script>

<div class="results-container">
  {#if loading}
    <p class="loading">Loading poll results...</p>
  {:else if error}
    <div class="error-message">{error}</div>
  {:else if poll && results}
    <div class="results-card">
      <h1>{poll.title}</h1>
      {#if poll.description}
        <p class="description">{poll.description}</p>
      {/if}

      <div class="poll-info">
        <p><strong>Vote Count:</strong> {poll.vote_count || 0} votes</p>
        {#if poll.expected}
          <p><strong>Expected:</strong> {poll.expected} participants</p>
        {/if}
      </div>

      <div class="results-section">
        <h2>Date Options & Votes</h2>

        <div class="result-item">
          <div class="date-label">{getDateLabel(poll.date1, poll.time1)}</div>
          <div class="vote-bar">
            <div
              class="vote-fill"
              style="width: {getPercentage(results.counts.date1, poll.vote_count || 1)}%"
            >
              {#if results.counts.date1 > 0}
                <span class="vote-text">{results.counts.date1}</span>
              {/if}
            </div>
          </div>
          <div class="vote-count">
            {results.counts.date1} vote{results.counts.date1 !== 1 ? 's' : ''} ({getPercentage(results.counts.date1, poll.vote_count || 1)}%)
          </div>
        </div>

        <div class="result-item">
          <div class="date-label">{getDateLabel(poll.date2, poll.time2)}</div>
          <div class="vote-bar">
            <div
              class="vote-fill"
              style="width: {getPercentage(results.counts.date2, poll.vote_count || 1)}%"
            >
              {#if results.counts.date2 > 0}
                <span class="vote-text">{results.counts.date2}</span>
              {/if}
            </div>
          </div>
          <div class="vote-count">
            {results.counts.date2} vote{results.counts.date2 !== 1 ? 's' : ''} ({getPercentage(results.counts.date2, poll.vote_count || 1)}%)
          </div>
        </div>

        <div class="result-item">
          <div class="date-label">{getDateLabel(poll.date3, poll.time3)}</div>
          <div class="vote-bar">
            <div
              class="vote-fill"
              style="width: {getPercentage(results.counts.date3, poll.vote_count || 1)}%"
            >
              {#if results.counts.date3 > 0}
                <span class="vote-text">{results.counts.date3}</span>
              {/if}
            </div>
          </div>
          <div class="vote-count">
            {results.counts.date3} vote{results.counts.date3 !== 1 ? 's' : ''} ({getPercentage(results.counts.date3, poll.vote_count || 1)}%)
          </div>
        </div>

        {#if results.counts.none > 0}
          <div class="result-item">
            <div class="date-label">No Preference</div>
            <div class="vote-bar">
              <div
                class="vote-fill"
                style="width: {getPercentage(results.counts.none, poll.vote_count || 1)}%"
              >
                {#if results.counts.none > 0}
                  <span class="vote-text">{results.counts.none}</span>
                {/if}
              </div>
            </div>
            <div class="vote-count">
              {results.counts.none} vote{results.counts.none !== 1 ? 's' : ''} ({getPercentage(results.counts.none, poll.vote_count || 1)}%)
            </div>
          </div>
        {/if}
      </div>

      <div class="back-link">
        <a href="/poll-vote?token={pollId}">← Back to Voting</a>
      </div>
    </div>
  {/if}
</div>

<style>
  .results-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .loading {
    text-align: center;
    color: #999;
    padding: 2rem;
  }

  .error-message {
    background: #ffebee;
    border: 1px solid #f0a9a9;
    color: #8d1f1f;
    padding: 1rem;
    border-radius: 6px;
    text-align: center;
  }

  .results-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  h1 {
    color: #340c46;
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
  }

  .description {
    color: #666;
    font-size: 1.1rem;
    margin: 0 0 1.5rem 0;
  }

  .poll-info {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .poll-info p {
    margin: 0.5rem 0;
    color: #666;
  }

  .results-section {
    margin: 2rem 0;
  }

  .results-section h2 {
    color: #340c46;
    margin: 0 0 1.5rem 0;
    font-size: 1.3rem;
  }

  .result-item {
    margin-bottom: 1.5rem;
  }

  .date-label {
    font-weight: 600;
    color: #340c46;
    margin-bottom: 0.5rem;
  }

  .vote-bar {
    background: #f0f0f0;
    border-radius: 6px;
    height: 40px;
    overflow: hidden;
    position: relative;
    margin-bottom: 0.5rem;
  }

  .vote-fill {
    background: linear-gradient(135deg, #06f, #63c);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: width 0.3s ease;
    min-width: 2px;
  }

  .vote-text {
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .vote-count {
    font-size: 0.9rem;
    color: #666;
  }

  .back-link {
    margin-top: 2rem;
    text-align: center;
  }

  .back-link a {
    color: #06f;
    text-decoration: none;
    font-weight: 600;
  }

  .back-link a:hover {
    text-decoration: underline;
  }
</style>
