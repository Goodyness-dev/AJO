"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PaystackButton } from "react-paystack";
import { Clock, Wallet, CalendarDays } from "lucide-react";

export default function GroupDashboard() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(5000); // default contribution amount
  const [progress, setProgress] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email;

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  // Fetch group details
  async function fetchGroup() {
    try {
      const res = await fetch("http://localhost:5000/groups");
      const data = await res.json();
      const found = data.find((g) => g.id === Number(id));
      setGroup(found);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGroup();
  }, [id]);

  if (loading) return <p className="text-gray-400 p-6">Loading group data...</p>;
  if (!group) return <p className="text-red-400 p-6">Group not found</p>;

  const totalMembers = group.members?.length || 0;
  const totalTarget = totalMembers * (Number(group.amount) || 0);
  const totalContributed =
    group.contributions?.reduce((sum, c) => sum + (Number(c.amount) || 0), 0) ||
    0;

  if (totalTarget) {
    setTimeout(() => setProgress((totalContributed / totalTarget) * 100), 300);
  }

  // 🟢 Paystack success callback
  const handlePaystackSuccess = async (reference) => {
    console.log("✅ Payment success:", reference);

    try {
      const res = await fetch(
        `http://localhost:5000/groups/${group.id}/contribute`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupId: group.id,
            userEmail,
            amount,
            reference: reference.reference,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        // Update UI
        setGroup((prev) => ({
          ...prev,
          contributions: [
            ...prev.contributions,
            { userEmail, amount, date: new Date().toISOString() },
          ],
          totalContributed: (prev.totalContributed || 0) + amount,
        }));
        alert("Contribution successful ✅");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error saving contribution:", err);
    }
  };

  // 🔴 If payment popup is closed
  const handlePaystackClose = () => {
    console.log("Payment closed ❌");
  };

  // 🧠 Paystack Config
  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: userEmail,
    amount: amount * 100, // Paystack expects amount in kobo
    publicKey,
  };

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen p-8">
      <header className="border-b border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold">{group.name}</h1>
        <p className="text-gray-400">
          {group.frequency} • {group.duration}
        </p>
      </header>

      {/* === Group Stats === */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800">
          <h2 className="text-lg text-gray-400 mb-2">Total Contributions</h2>
          <p className="text-3xl font-bold">
            ₦{totalContributed.toLocaleString()}
          </p>

          {/* Amount Input */}
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-3 w-full bg-zinc-800 text-white p-2 rounded border border-zinc-700"
            placeholder="Enter amount to contribute"
          />

          {/* Paystack Button */}
          <PaystackButton
            {...paystackConfig}
            text={`Contribute ₦${amount}`}
            onSuccess={handlePaystackSuccess}
            onClose={handlePaystackClose}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md mt-3 transition w-full"
          />
        </div>

        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800">
          <h2 className="text-lg text-gray-400 mb-2">Progress</h2>
          <div className="w-full bg-zinc-800 rounded-full h-3">
            <div
              className="bg-pink-600 h-3 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-gray-400 mt-2 text-sm">
            {progress.toFixed(1)}% of total target
          </p>
        </div>

        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800">
          <h2 className="text-lg text-gray-400 mb-2">Members</h2>
          <p className="text-xl font-semibold">{group.members.length}</p>
        </div>
      </div>

      {/* === Payout History === */}
      <section className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 mb-8">
        <h2 className="text-2xl font-semibold mb-4">💸 Payout History</h2>
        {group.payouts && group.payouts.length > 0 ? (
          <ul className="space-y-3">
            {group.payouts.map((p, i) => (
              <li
                key={i}
                className="flex justify-between bg-zinc-800 rounded-lg p-3 text-gray-300"
              >
                <span>{p.member}</span>
                <span>₦{p.amount.toLocaleString()}</span>
                <span className="text-gray-500 text-sm">
                  {new Date(p.date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No payouts yet.</p>
        )}
      </section>

      {/* === Contributions === */}
      <section className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
        <h2 className="text-2xl font-semibold mb-4">🧾 Recent Contributions</h2>
        {group.contributions && group.contributions.length > 0 ? (
          <ul className="space-y-3">
            {group.contributions.map((c, i) => (
              <li
                key={i}
                className="flex justify-between bg-zinc-800 rounded-lg p-3 text-gray-300"
              >
                <span>{c.userEmail}</span>
                <span>₦{c.amount.toLocaleString()}</span>
                <span className="text-gray-500 text-sm">
                  {new Date(c.date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No contributions yet.</p>
        )}
      </section>
    </div>
  );
}
