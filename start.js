// Set PORT before importing the server
const port = process.env.PORT || '3000';
const host = process.env.HOST || '0.0.0.0';

process.env.PORT = port;
process.env.HOST = host;

// Import and start the server
try {
  await import('./dist/server.mjs');
} catch (error) {
  if (error.code === 'ERR_MODULE_NOT_FOUND' && error.url.includes('server.mjs')) {
    console.error('Failed to find dist/server.mjs. Make sure you have run "pnpm build"');
  }
  console.error('Server startup error:', error);
  process.exit(1);
}
