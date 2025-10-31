import { handleUserRoutes } from './userRoutes.js';
import { handleGroups } from './groupRoutes.js';
import { handlePayment } from './paymentRoutes.js';
import { handlePayouts } from './payoutRoutes.js';
import { handleAdmin } from './admin.js';
import { handleWallet } from '../controllers/walletController.js';
import { handleTransactions } from "../controllers/transactionController.js";
import { handleCanAccess } from '../controllers/groupController.js';

export function handleRoutes(req, res) {
  const { url } = req;

  if (url.startsWith('/users')) return handleUserRoutes(req, res);

  // 👇🏽 Move this ABOVE handleGroups
  if (req.url.startsWith("/groups/") && req.url.includes("/can-access")) {
    return handleCanAccess(req, res);
  }

  if (url.startsWith('/groups')) return handleGroups(req, res);

  if (url.startsWith('/payment')) return handlePayment(req, res);

  if (url.startsWith('/payouts')) return handlePayouts(req, res);

  if (url.startsWith("/wallet")) return handleWallet(req, res);

  if (url === "/events") return handleEvents(req, res);

  if (url.startsWith("/admin")) return handleAdmin(req, res);

  if (url.startsWith("/transactions")) return handleTransactions(req, res);

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Route not found' }));
}
