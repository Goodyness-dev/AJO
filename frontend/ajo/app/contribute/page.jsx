"use client";
import { useState } from "react";

export default function ContributeForm() {
  const [amount, setAmount] = useState("");
  const user = JSON.parse(localStorage.getItem('user'))
  const userEmail = user?.email

  const group = JSON.parse(localStorage.getItem(group))
  const groupId =  group?.id
  async function handleContribute(e) {
    e.preventDefault();

    if (!groupId || !userEmail || !amount) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/groups/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          userEmail,
          amount: Number(amount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Something went wrong");
        return;
      }

      
      window.location.href = data.authorization_url;
    } catch (err) {
      console.error(err);
      alert("An error occurred while processing contribution");
    }
  }

  return (
    <form
      onSubmit={handleContribute}
      className="bg-[#3B3B3B] border border-zinc-700 rounded-xl p-6 flex flex-col gap-4 shadow-md shadow-zinc-900/30 max-w-lg mx-auto mt-10"
    >
      <h2 className="text-2xl text-white font-semibold text-center mb-2">
        Contribute to Group
      </h2>

      <input
        type="text"
        placeholder="Group ID"
        className="border border-zinc-700 bg-zinc-900 text-white p-2 rounded focus:ring-2 focus:ring-pink-600 outline-none transition"
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
      />

      <input
        type="email"
        placeholder="Your Email"
        className="border border-zinc-700 bg-zinc-900 text-white p-2 rounded focus:ring-2 focus:ring-pink-600 outline-none transition"
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
      />

      <input
        type="number"
        placeholder="Amount (₦)"
        className="border border-zinc-700 bg-zinc-900 text-white p-2 rounded focus:ring-2 focus:ring-pink-600 outline-none transition"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button
        type="submit"
        className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2 rounded-lg transition-all duration-300 shadow hover:shadow-pink-600/30"
      >
        Contribute
      </button>
    </form>
  );
}
