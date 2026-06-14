<script lang="ts">
  import { onMount } from 'svelte';

  let isMenuOpen = $state(false);
  let isAuthenticated = $state(false);
  let showLoginModal = $state(false);
  let password = $state('');
  let loginLoading = $state(false);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'App', href: '/interests' },
    { label: 'Poll', href: '/poll' },
    { label: 'Dashboard', href: '/dashboard' }
  ];

  onMount(async () => {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      isAuthenticated = data.authenticated;
    } catch (e) {
      console.error('Error checking auth status:', e);
    }
  });

  async function handleLogin() {
    if (!password) return;
    loginLoading = true;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        isAuthenticated = true;
        showLoginModal = false;
        password = '';
      } else {
        alert('Invalid password');
      }
    } catch (e) {
      alert('Login failed');
    } finally {
      loginLoading = false;
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      isAuthenticated = false;
    } catch (e) {
      console.error('Logout failed:', e);
    }
  }
</script>

<header>
  <div class="header-content">
    <a href="/" class="logo">
      <img src="/images/DDA-logo.png" alt="Duck Dating Apps" class="logo-img" />
    </a>
    <nav class="nav-desktop">
      {#each navItems as item}
        <a href={item.href}>{item.label}</a>
      {/each}
      <div class="auth-button">
        {#if isAuthenticated}
          <button on:click={handleLogout} class="logout-btn">🚪 Logout</button>
        {:else}
          <button on:click={() => showLoginModal = true} class="login-btn">🔐 Login</button>
        {/if}
      </div>
    </nav>
    <button
      class="menu-toggle"
      on:click={() => isMenuOpen = !isMenuOpen}
      aria-label="Toggle menu"
    >
      ☰
    </button>
  </div>

  {#if isMenuOpen}
    <nav class="nav-mobile">
      {#each navItems as item}
        <a href={item.href} on:click={() => isMenuOpen = false}>{item.label}</a>
      {/each}
      <div class="auth-button-mobile">
        {#if isAuthenticated}
          <button on:click={handleLogout} class="logout-btn">🚪 Logout</button>
        {:else}
          <button on:click={() => showLoginModal = true} class="login-btn">🔐 Login</button>
        {/if}
      </div>
    </nav>
  {/if}

{#if showLoginModal}
  <div class="modal-overlay" on:click={() => showLoginModal = false}>
    <div class="modal" on:click|stopPropagation>
      <h2>Admin Login</h2>
      <form on:submit|preventDefault={handleLogin}>
        <input
          type="password"
          bind:value={password}
          placeholder="Enter admin password"
          disabled={loginLoading}
          autofocus
        />
        <button type="submit" disabled={loginLoading || !password}>
          {loginLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <button on:click={() => showLoginModal = false} class="close-btn">✕</button>
    </div>
  </div>
{/if}
</header>

<style>
  header {
    background: linear-gradient(135deg, #0066ff 0%, #6633cc 50%, #ff1493 100%);
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 1rem 2rem;
  }

  .logo {
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 60px;
  }

  .logo-img {
    height: 60px;
    width: auto;
    object-fit: contain;
    transition: transform 0.2s ease;
  }

  .logo:hover .logo-img {
    transform: scale(1.05);
  }

  .nav-desktop {
    display: flex;
    gap: 2rem;
    align-items: center;
  }

  .nav-desktop a {
    color: white;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
    transition: opacity 0.2s ease;
    text-transform: capitalize;
  }

  .nav-desktop a:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  .menu-toggle {
    display: none;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: white;
  }

  .nav-mobile {
    display: none;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem 2rem;
    background: rgba(0, 0, 0, 0.1);
  }

  .nav-mobile a {
    color: white;
    text-decoration: none;
    padding: 0.75rem;
    display: block;
    font-weight: 500;
  }

  .nav-mobile a:hover {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  .auth-button {
    margin-left: auto;
  }

  .login-btn,
  .logout-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.4);
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }

  .login-btn:hover,
  .logout-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.6);
  }

  .auth-button-mobile {
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    position: relative;
  }

  .modal h2 {
    margin: 0 0 1.5rem 0;
    color: #340c46;
    font-size: 1.5rem;
  }

  .modal form {
    display: flex;
    gap: 0.75rem;
  }

  .modal input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
  }

  .modal input:focus {
    outline: none;
    border-color: #340c46;
    box-shadow: 0 0 0 3px rgba(52, 12, 70, 0.1);
  }

  .modal button[type="submit"] {
    padding: 0.75rem 1.5rem;
    background: #340c46;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .modal button[type="submit"]:hover:not(:disabled) {
    background: #1a0623;
  }

  .modal button[type="submit"]:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #999;
    transition: color 0.2s ease;
  }

  .close-btn:hover {
    color: #333;
  }

  @media (max-width: 768px) {
    .nav-desktop {
      display: none;
    }

    .menu-toggle {
      display: block;
    }

    .nav-mobile {
      display: flex;
    }

    .auth-button {
      margin-left: 0;
    }
  }
</style>
