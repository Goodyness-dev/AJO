import { registerUser, loginUser } from '../controllers/userController.js';

export async function handleUserRoutes(req, res) {
  const { url, method } = req;

  if (url === '/users/register' && method === 'POST') {
    await registerUser(req, res);
    return;
  }

  if (url === '/users/login' && method === 'POST') {
    await loginUser(req, res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'User route not found' }));
}
