import fs from "fs/promises";
import path from "path";
import https from "https"
import dotenv from "dotenv"
const usersPath = path.join("data", "users.json");


async function readUsers() {
  const data = await fs.readFile(usersPath, "utf8");
  return JSON.parse(data);
}

async function writeUsers(users) {
  await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
}
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
export async function handleWallet(req, res) {
  const { url, method } = req;

if (url === "/wallet/deposit" && method === "POST") {
  let body = "";
  req.on("data", chunk => (body += chunk));
  req.on("end", async () => {
    try {
      const { email, amount } = JSON.parse(body);
      if (!email || !amount) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Missing fields" }));
      }

      const paystackData = JSON.stringify({
        email,
        amount: amount * 100, 
        callback_url: "http://localhost:3000/wallet", 
      });

      const options = {
        hostname: "api.paystack.co",
        port: 443,
        path: "/transaction/initialize",
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      };

      const paystackReq = https.request(options, paystackRes => {
        let responseData = "";
        paystackRes.on("data", chunk => (responseData += chunk));
        paystackRes.on("end", () => {
          try {
            const result = JSON.parse(responseData);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(result));
          } catch (err) {
            console.error("Error parsing Paystack response:", err);
            res.writeHead(500);
            res.end(JSON.stringify({ message: "Paystack error" }));
          }
        });
      });

      paystackReq.on("error", err => {
        console.error("Paystack request failed:", err);
        res.writeHead(500);
        res.end(JSON.stringify({ message: "Paystack request failed" }));
      });

      paystackReq.write(paystackData);
      paystackReq.end();
    } catch (err) {
      console.error("Invalid JSON:", err);
      res.writeHead(400);
      res.end(JSON.stringify({ message: "Invalid request" }));
    }
  });
}else if (url === "/verify-payment" && method === "POST") {
  let body = "";
  req.on("data", chunk => (body += chunk));
  req.on("end", async () => {
    try {
      const { reference } = JSON.parse(body);
      if (!reference) {
        res.writeHead(400);
        return res.end(JSON.stringify({ message: "Missing reference" }));
      }

      const options = {
        hostname: "api.paystack.co",
        port: 443,
        path: `/transaction/verify/${reference}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      };

      const verifyReq = https.request(options, verifyRes => {
        let responseData = "";
        verifyRes.on("data", chunk => (responseData += chunk));
        verifyRes.on("end", async () => {
          const result = JSON.parse(responseData);
          if (result.data.status === "success") {
            const users = await readUsers();
            const user = users.find(u => u.email === result.data.customer.email);
            if (user) {
              if (!user.wallet) {
                user.wallet = { walletId: Date.now(), balance: 0, transactions: [] };
              }

              const amount = result.data.amount / 100;
              user.wallet.balance += amount;
              user.wallet.transactions.push({
                date: new Date().toISOString(),
                type: "deposit",
                amount,
              });

              await writeUsers(users);
              await recordTransaction("deposit", user.email, amount, "Paystack deposit");
            }
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(responseData);
        });
      });

      verifyReq.on("error", err => {
        console.error("Verification failed:", err);
        res.writeHead(500);
        res.end(JSON.stringify({ message: "Verification failed" }));
      });

      verifyReq.end();
    } catch (err) {
      console.error("Invalid verify JSON:", err);
      res.writeHead(400);
      res.end(JSON.stringify({ message: "Invalid request" }));
    }
  });
}





}
      
