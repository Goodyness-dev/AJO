import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { eventEmitter } from '../events/eventsManger.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, '../data/groups.json');

async function readGroups() {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

async function writeGroups(groups) {
  await fs.writeFile(filePath, JSON.stringify(groups, null, 2));
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
      const { name, frequency, duration, creator } = JSON.parse(body);

      if (!name || !frequency || !duration || !creator) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Missing fields" }));
        return;
      }

      const groups = await readGroups();
      const newGroup = {
        id: Date.now(),
        name: name.trim(),
        frequency,
        duration,
        members: [creator.trim()],
        contributions: [],
        payouts: [],
        nextPayoutIndex
      };

      groups.push(newGroup);
      await writeGroups(groups);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Ajo group created", group: newGroup }));
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


export function handleJoinGroup(req, res) {
  let body = "";
  req.on('data', chunk => (body += chunk));
  req.on('end', async () => {
    try {
      const { groupId, userEmail } = JSON.parse(body);

      if (!groupId || !userEmail) {
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

      if (!group.members.includes(userEmail)) {
        group.members.push(userEmail);
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

export function handleContribute(req, res) {
  let body = "";
  req.on("data", chunk => (body += chunk));
  req.on("end", async () => {
    try {
      const { groupId, userEmail, amount } = JSON.parse(body);

      if (!groupId || !userEmail || !amount) {
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

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid amount" }));
        return;
      }

      if (!Array.isArray(group.contributions)) group.contributions = [];
      group.contributions.push({
        userEmail,
        amount: parsedAmount,
        date: new Date().toISOString()
      });

      await writeGroups(groups);


      eventEmitter.emit("update", {
  type: "contribution",
  message: `${userEmail} contributed ₦${amount} to ${group.name}`,
  groupId,
});
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        message: "Contribution added successfully",
        contributionCount: group.contributions.length
      }));
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
