import { handleUserRoutes } from './userRoutes.js';
import { handleGroups } from './groupRoutes.js';
export function handleRoutes(req, res) {
  const { url } = req;

  if (url.startsWith('/users')) {
    handleUserRoutes(req, res);
    return;
  }
    if (url.startsWith('/groups')) {
    return handleGroups(req, res);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Route not found' }));
}
