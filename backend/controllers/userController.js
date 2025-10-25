import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { sanitizeInput } from '../utils/sanitizer.js';
import { hashPassword, generateToken } from "../utils/security.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFile = path.join(__dirname, '../data/users.json');

async function readUsers() {
  const data = await fs.readFile(usersFile, 'utf-8');
  return JSON.parse(data);
}

async function writeUsers(users) {
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2));
}

export async function registerUser(req, res) {
  let body = '';
  req.on('data', chunk => (body += chunk));

  req.on('end', async () => {
    const { name, email, password } = JSON.parse(body);

    const cleanName = sanitizeInput(name);
    const cleanEmail = sanitizeInput(email);
    const cleanPassword = sanitizeInput(password);

    if (!cleanName || !cleanEmail || !cleanPassword) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'All fields required' }));
      return;
    }

    const users = await readUsers();
    const userExists = users.find(u => u.email === cleanEmail);
    if (userExists) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User already exists' }));
      return;
    }

    const newUser = {
      id: `u${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      joinedGroups: [],
    };

    users.push(newUser);
    await writeUsers(users);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'User registered successfully', user: newUser }));
  });
}

export async function loginUser(req, res) {
  let body = '';
  req.on('data', chunk => (body += chunk));

  req.on('end', async () => {
    const { email, password } = JSON.parse(body);
    const users = await readUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid credentials' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Login successful', user }));
  });
}
