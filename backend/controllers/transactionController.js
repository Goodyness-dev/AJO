import fs from "fs/promises";
import path from "path";

const transactionsPath = path.join("data", "transactions.json");

async function readTransactions() {
  const data = await fs.readFile(transactionsPath, "utf8");
  return JSON.parse(data);
}

async function writeTransactions(transactions) {
  await fs.writeFile(transactionsPath, JSON.stringify(transactions, null, 2));
}

// record transaction
export async function recordTransaction(type, email, amount, details) {
  const transactions = await readTransactions();

  const newTransaction = {
    id: Date.now(),
    type, // "deposit" | "contribution" | "payout"
    email,
    amount,
    details,
    date: new Date().toISOString(),
  };

  transactions.push(newTransaction);
  await writeTransactions(transactions);
}

// get all user transactions
export async function handleTransactions(req, res) {
  const { url, method } = req;

  if (url === "/transactions" && method === "POST") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", async () => {
      try {
        const { email } = JSON.parse(body);
        const transactions = await readTransactions();
        const userTxns = transactions.filter(t => t.email === email);

        res.writeHead(200);
        res.end(JSON.stringify(userTxns));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ message: "Invalid JSON" }));
      }
    });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ message: "Transaction route not found" }));
  }
}
