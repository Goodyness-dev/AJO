import { handleRecordPayout, handleGetPayouts } from "../controllers/payoutController.js";

export function handlePayouts(req, res) {
  const { url, method } = req;

  if (url === "/payouts/record" && method === "POST") {
    return handleRecordPayout(req, res);
  }

  if (url === "/payouts/list" && method === "GET") {
    return handleGetPayouts(req, res);
  }

  res.writeHead(404);
  res.end(JSON.stringify({ message: "Payout route not found" }));
}
