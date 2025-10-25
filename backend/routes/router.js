import { handleUserRoutes } from './userRoutes.js';
import { handleGroups } from './groupRoutes.js';
import {handlePayment} from './paymentRoutes.js'
import { handlePayouts } from './payoutRoutes.js';
export function handleRoutes(req, res) {
  const { url } = req;

  if (url.startsWith('/users')) {
    handleUserRoutes(req, res);
    return;
  }
    if (url.startsWith('/groups')) {
    return handleGroups(req, res);
  }
  if(url.startsWith('/payment')){
    return handlePayment(req, res)
  }
  if( url.startsWith('/payouts')){
    return handlePayouts(req, res)
  }
    if (url === "/events") return handleEvents(req, res);
  if (url.startsWith("/admin")) return handleAdmin(req, res);
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Route not found' }));
}
