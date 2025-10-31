import http from 'http';

import { handleRoutes } from './routes/router.js';
const PORT = 5000;

// Create the HTTP server
// Inside your server.js, before server.listen
const server = http.createServer((req, res) => {
  // CORS setup
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  handleRoutes(req, res);

});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
