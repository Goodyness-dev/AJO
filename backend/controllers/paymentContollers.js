import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "../data/payments.json");

// Read and write helpers
async function readPayments() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writePayments(data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Handle payment recording
export function handleRecordPayment(req, res) {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    try {
      const { groupId, userEmail, amount } = JSON.parse(body);

      if (!groupId || !userEmail || !amount) {
        res.writeHead(400);
        return res.end(JSON.stringify({ message: "Missing fields" }));
      }

      const payments = await readPayments();

      const newPayment = {
        id: Date.now(),
        groupId,
        userEmail,
        amount,
        date: new Date().toISOString(),
      };

      payments.push(newPayment);
      await writePayments(payments);

      res.writeHead(201);
      res.end(JSON.stringify({ message: "Payment recorded", payment: newPayment }));
    } catch (err) {
      res.writeHead(400);
      res.end(JSON.stringify({ message: "Invalid JSON" }));
    }
  });
}

// Handle getting all payments
export async function handleListPayments(req, res) {
  const payments = await readPayments();
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payments));
}
