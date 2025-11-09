import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import https from "https";
import dotenv from "dotenv";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, '../data/groups.json');
const userPath = path.join(__dirname, '../data/users.json')
async function readGroups() {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

async function writeGroups(groups) {
  await fs.writeFile(filePath, JSON.stringify(groups, null, 2));
}
async function readUsers() {
  const data = await fs.readFile(userPath, 'utf-8')
  return JSON.parse(data)
}

async function writeUsers(users) {
  await fs.writeFile(userPath, JSON.stringify(users, null, 2));
}

export async function listGroups(req, res) {
  try {
    const groups = await readGroups();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(groups));
    return;
  } catch (err) {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Error reading groups', error: err.message }));
    }
  }
}


export function handleCreateGroup(req, res) {
  let body = "";
  req.on('data', chunk => (body += chunk));
  req.on('end', async () => {
    try {
      const { name, frequency, duration, creator, amount } = JSON.parse(body);

      if (!name || !frequency || !duration || !creator|| !amount) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Missing fields" }));
        return;
      }
      const avatarUrl = `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(name)}`;
      const groups = await readGroups();
       const nextPayoutIndex = 0;
      const newGroup = {
        id: Date.now(),
        name: name.trim(),
        frequency,
        duration,
        members: [creator.trim()],
        contributions: [],
        payouts: [],
        avatarUrl,
        nextPayoutIndex,
        startDate:Date.now(),
        amount
      };

      groups.push(newGroup);
      await writeGroups(groups);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Ajo group created", 
        group: newGroup }));
    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid JSON" }));
      }
    }
  });
}


export function handleJoinGroup(req, res) {
  let body = "";
  req.on('data', chunk => (body += chunk));
  req.on('end', async () => {
    try {
      const { groupId, userId } = JSON.parse(body);

      if (!groupId || !userId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Missing fields" }));
        return;
      }

      const groups = await readGroups();
      const group = groups.find(g => g.id === Number(groupId));

      if (!group) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Group not found" }));
        return;
      }

      if (!group.members.includes(userId)) {
        group.members.push(userId);
        await writeGroups(groups);
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Joined successfully", group }));
      return;
    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid JSON" }));
      }
    }
  });
}


const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export function handleContribute(req, res) {
  let body = "";

  req.on("data", (chunk) => (body += chunk));

  req.on("end", async () => {
    try {
      const { groupId, userEmail, amount, payWithPaystack } = JSON.parse(body);

      if (!groupId || !userEmail || amount == null) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Missing required fields" }));
      }

      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Invalid amount" }));
      }

      const groups = await readGroups();
      const users = await readUsers();

      const group = groups.find((g) => g.id === Number(groupId));
      if (!group) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Group not found" }));
      }

      const user = users.find((u) => u.email === userEmail);
      if (!user) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "User not found" }));
      }

      if (!user.wallet || typeof user.wallet.balance !== "number") {
        user.wallet = { balance: 0, transactions: [] };
      }

      
      if (user.wallet.balance < parsedAmount || payWithPaystack) {

        const params = JSON.stringify({
          email: userEmail,
          amount: parsedAmount * 100, // Paystack wants amount in Kobo
          currency: "NGN",
          metadata: {
            type: "group_contribution",
            groupId,
            userEmail,
          },
          callback_url: "http://localhost:5000/api/verify", 
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

        const paystackReq = https.request(options, (paystackRes) => {
          let data = "";
          paystackRes.on("data", (chunk) => (data += chunk));
          paystackRes.on("end", () => {
            const response = JSON.parse(data);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                message: "Redirect user to Paystack payment page",
                paystack: response,
              })
            );
          });
        });

        paystackReq.on("error", (error) => {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: error.message }));
        });

        paystackReq.write(params);
        paystackReq.end();

        return; 
      }

   
      user.wallet.balance -= parsedAmount;
      user.wallet.transactions.push({
        date: new Date().toISOString(),
        type: "contribution",
        amount: parsedAmount,
      });

      await writeUsers(users);

      if (!Array.isArray(group.contributions)) group.contributions = [];
      group.contributions.push({
        userEmail,
        amount: parsedAmount,
        date: new Date().toISOString(),
      });

      group.totalContributed = (group.totalContributed || 0) + parsedAmount;
      await writeGroups(groups);

      await recordTransaction(
        "contribution",
        userEmail,
        parsedAmount,
        `Contributed ₦${parsedAmount} to ${group.name}`
      );

      if (eventEmitter) {
        eventEmitter.emit("update", {
          type: "contribution",
          message: `${userEmail} contributed ₦${parsedAmount} to ${group.name}`,
          groupId,
        });
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Contribution added successfully",
          contributionCount: group.contributions.length,
          walletBalance: user.wallet.balance,
        })
      );
    } catch (err) {
      console.error(" Error handling contribution:", err);
      if (!res.headersSent) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid JSON or server error" }));
      }
    }
  });
}


export function handleVerify(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const reference = url.searchParams.get("reference");

  if (!reference) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Missing transaction reference" }));
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

  const paystackReq = https.request(options, (paystackRes) => {
    let data = "";
    paystackRes.on("data", (chunk) => (data += chunk));
    paystackRes.on("end", async () => {
      const response = JSON.parse(data);

      if (response.data && response.data.status === "success") {
        const { groupId, userEmail } = response.data.metadata;
        const amount = response.data.amount / 100;

        const groups = await readGroups();
        const users = await readUsers();

        const group = groups.find((g) => g.id === Number(groupId));
        const user = users.find((u) => u.email === userEmail);

        if (group && user) {
          if (!Array.isArray(group.contributions)) group.contributions = [];
          group.contributions.push({
            userEmail,
            amount,
            date: new Date().toISOString(),
            verifiedByPaystack: true,
          });
          group.totalContributed = (group.totalContributed || 0) + amount;

          user.wallet.transactions.push({
            date: new Date().toISOString(),
            type: "contribution",
            amount,
            reference,
            via: "Paystack",
          });

          await writeUsers(users);
          await writeGroups(groups);

          await recordTransaction(
            "contribution",
            userEmail,
            amount,
            `Paystack contribution of ₦${amount} to ${group.name}`
          );

          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({ message: "Payment verified and contribution recorded" })
          );
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Group or user not found" }));
        }
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Payment verification failed" }));
      }
    });
  });

  paystackReq.on("error", (error) => {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: error.message }));
  });

  paystackReq.end();
}


export function handleViewContributions(req, res) {
  let body = "";
  req.on("data", chunk => (body += chunk));
  req.on("end", async () => {
    try {
      const { groupId } = JSON.parse(body);

      if (!groupId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Missing groupId" }));
        return;
      }

      const groups = await readGroups();
      const group = groups.find(g => g.id === Number(groupId));

      if (!group) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Group not found" }));
        return;
      }

      const totalAmount = group.contributions.reduce((sum, c) => sum + c.amount, 0);

    
    return  res.end(JSON.stringify({
        message: "Group contributions fetched",
        totalAmount,
        contributions: group.contributions
      }));
      
    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Invalid JSON" }));
      }
    }
  });
}


export function handleUserTotal(req, res) {
  let body = "";
  req.on("data", chunk => (body += chunk));
  req.on("end", async () => {
    try {
      const { groupId, userEmail } = JSON.parse(body);

      if (!groupId || !userEmail) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Missing fields" }));
        return;
      }

      const groups = await readGroups();
      const group = groups.find(g => g.id === Number(groupId));

      if (!group) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Group not found" }));
        return;
      }

      const userContributions = group.contributions.filter(c => c.userEmail === userEmail);
      const total = userContributions.reduce((sum, c) => sum + c.amount, 0);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: "User contribution summary",
        total,
        contributions: userContributions
      }));
      return;
    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Invalid JSON" }));
      }
    }
  });
}


export function handlePayout(req, res) {
  let body = "";

  req.on("data", chunk => body += chunk);
  req.on("end", async () => {
    try {
      const { groupId, requesterEmail } = JSON.parse(body);

      if (!groupId || !requesterEmail) {
        res.writeHead(400);
        return res.end(JSON.stringify({ message: "Missing fields" }));
      }

      const groups = await readGroups();
      const group = groups.find(g => g.id === groupId);
      

      if (!group) {
        res.writeHead(404);
        return res.end(JSON.stringify({ message: "Group not found" }));
      }

      if (group.creator !== requesterEmail) {
        res.writeHead(403);
        return res.end(JSON.stringify({ message: "Only the group creator can process payouts" }));
      }

      const nextMember = group.members[group.nextPayoutIndex];
      if (!nextMember) {
        res.writeHead(400);
        return res.end(JSON.stringify({ message: "All members have been paid already!" }));
      }

      const users = await readUsers();
const receiver = users.find(u => u.email === nextMember);
if (receiver) {
  receiver.wallet = (receiver.wallet.balance || 0) + Number(newPayout.amount);
  await writeUsers(users);
}

      const totalAmount = group.contributions.reduce((sum, c) => sum + c.amount, 0);

      const newPayout = {
        userEmail: nextMember,
        amount: totalAmount,
        date: new Date().toISOString()
      };

    
      if (!group.payouts) group.payouts = [];
      group.payouts.push(newPayout);
      group.nextPayoutIndex++;

      await writeGroups(groups);
      eventEmitter.emit("update", {
  type: "payout",
  message: `${nextMember} just received a payout of ₦${newPayout.amount}`,
  groupId,
});


      res.writeHead(200);
      res.end(JSON.stringify({
        message: `Payout processed for ${nextMember}`,
        payout: newPayout,
        nextUp: group.members[group.nextPayoutIndex] || null
      }));

    } catch (err) {
      res.writeHead(400);
      res.end(JSON.stringify({ message: "Invalid JSON" }));
    }
  });
}


export function handleViewPayouts(req, res) {
  let body = "";

  req.on("data", chunk => body += chunk);
  req.on("end", async () => {
    try {
      const { groupId } = JSON.parse(body);
      const groups = await readGroups();
      const group = groups.find(g => g.id === groupId);

      if (!group) {
        res.writeHead(404);
        return res.end(JSON.stringify({ message: "Group not found" }));
      }

      res.writeHead(200);
      res.end(JSON.stringify({
        message: "Payout history",
        payouts: group.payouts || [],
        nextUp: group.members[group.nextPayoutIndex] || null
      }));

    } catch (err) {
      res.writeHead(400);
      res.end(JSON.stringify({ message: "Invalid JSON" }));
    }
  });
}



export async function handleCanAccess(req, res) {

  const url = new URL(req.url, `http://${req.headers.host}`)
  const groupId = Number(url.pathname.split("/")[2])
  const userId = url.searchParams.get("userId")

  
  const groups = await readGroups()

  const group = groups.find(g=> g.id === groupId)

  if(!group){
    res.writeHead(404, {"Content-Type": "application/json"})
    res.end(JSON.stringify({message: "Group npt found"}))
    return
  }

  const canAccess = group.members.includes(userId)
  res.writeHead(200, {"Content-Type": "application/json"})
  res.end(JSON.stringify({canAccess}))
}