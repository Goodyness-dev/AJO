import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { recordTransaction } from "../controllers/transactionController.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "../data/payments.json");


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


export async function handleRecordPayment(req, res) {
  let body = "";
  req.on("data", (chunk) => (body += chunk));

  req.on("end", async () => {
    try {
      const { groupId, userEmail, amount } = JSON.parse(body);

      
      if (!groupId || !userEmail || amount == null) {
        res.writeHead(400);
        return res.end(JSON.stringify({ message: "Missing required fields" }));
      }

      const paymentAmount = Number(amount);
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        res.writeHead(400);
        return res.end(JSON.stringify({ message: "Invalid amount" }));
      }

     
      const payments = await readPayments();

      const newPayment = {
        id: Date.now(),
        groupId,
        userEmail,
        amount: paymentAmount,
        date: new Date().toISOString(),
      };

      payments.push(newPayment);
      await writePayments(payments);

    
      await recordTransaction("contribution", userEmail, paymentAmount, `Payment to group ${groupId}`);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Payment recorded", payment: newPayment }));
    } catch (err) {
      console.error("Error recording payment:", err);
      res.writeHead(400);
      res.end(JSON.stringify({ message: "Invalid JSON or server error" }));
    }
  });
}


export async function handleListPayments(req, res) {
  try {
    const payments = await readPayments();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(payments));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ message: "Failed to read payments" }));
  }
}
