import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { recordTransaction } from "../controllers/transactionController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const payoutsFile = path.join(__dirname, "../data/payouts.json");
const groupsFile = path.join(__dirname, "../data/groups.json");

// Helpers
async function readJSON(file) {
  try {
    const data = await fs.readFile(file, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeJSON(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// ✅ Record payout
export async function handleRecordPayout(req, res) {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    try {
      const { groupId, amount } = JSON.parse(body); // added `amount`

      const groups = await readJSON(groupsFile);
      const payouts = await readJSON(payoutsFile);

      const group = groups.find((g) => g.id === groupId);
      if (!group) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Group not found" }));
      }

      // Find who’s next in line
      const previousPayouts = payouts.filter((p) => p.groupId === groupId);
      const nextIndex = previousPayouts.length % group.members.length;
      const nextReceiver = group.members[nextIndex];

      // Compute payout amount
      const payoutAmount = amount || (group.amountPerMember ? group.amountPerMember * group.members.length : 0);

      const newPayout = {
        id: Date.now(),
        groupId,
        receiver: nextReceiver,
        amount: payoutAmount,
        date: new Date().toISOString(),
        status: "completed",
      };

      payouts.push(newPayout);
      await writeJSON(payoutsFile, payouts);

      // ✅ Correct usage here
      await recordTransaction(
        "payout",
        nextReceiver.email,
        payoutAmount,
        `Payout from ${group.name}`
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Payout recorded", payout: newPayout }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Invalid JSON", error: err.message }));
    }
  });
}

// ✅ Get payout history
export async function handleGetPayouts(req, res) {
  const payouts = await readJSON(payoutsFile);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payouts));
}
