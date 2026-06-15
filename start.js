import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the built server
const { handler } = await import('./dist/server.mjs');

const port = parseInt(process.env.PORT || '3000');
const host = process.env.HOST || '0.0.0.0';

const server = http.createServer(handler);

server.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});
