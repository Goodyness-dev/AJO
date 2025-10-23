import http from 'http';
import { handleRoutes } from './routes/router.js';

const PORT = 5000;

// Create the HTTP server
const server = http.createServer((req, res) => handleRoutes(req, res));

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
