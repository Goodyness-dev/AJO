"use client";
import { useEffect, useState, useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { pixelArtNeutral } from "@dicebear/collection";
import { UserGroupIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [duration, setDuration] = useState("1 Month");
  const [creator, setCreator] = useState("");
  const [userId, setUserId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const [amount, setAmount] = useState(0)

  const avatar = useMemo(() => {
    return createAvatar(pixelArtNeutral, { size: 128 }).toDataUri();
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      if (storedUser.email) setCreator(storedUser.email);
      if (storedUser.id) setUserId(storedUser.id);
    }
  }, []);

  async function fetchGroups() {
    try {
      const res = await fetch("http://localhost:5000/groups");
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchGroups();
  }, []);

  async function handleCreate() {
    if (!creator) {
      alert("User info not loaded yet. Try again in a second.");
      return;
    }
  const payload = { name, frequency, duration, creator, amount: Number(amount) };
  console.log("📦 Sending payload:", payload); // 👈 Add this
    try {
      const url = `http://localhost:5000/groups/create`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log(data)
      if (res.ok) {
        await fetchGroups();
        setName("");
        setFrequency("");
        setDuration("");
        setAmount("");

        setShowForm(false);
             localStorage.setItem('group', JSON.stringify(data.group))
      } else {
        alert(data.message || "Failed to create group");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function joinGroup(groupId) {
    if (!userId) {
      alert("User not loaded");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, userId }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchGroups();
      } else {
        alert(data.message || "Failed to join group");
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="bg-[#121212] min-h-screen text-white">
      {/* Header */}
      <header className="bg-[#121212] p-4 border-b border-[#242323] flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ajo Groups</h1>
        <div className="flex items-center gap-4">
          <UserGroupIcon className="w-8 h-8 text-gray-300" />
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="bg-green-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow hover:shadow-pink-600/30"
          >
            {showForm ? "Close Form" : "Create Group"}
          </button>

          <div className="p-3 flex items-center border rounded-2xl hover:text-green-400" onClick={()=> router.push('./Personal')}>
            <User className="w-8 h-8 text-gray-300 hover:text-green-400"/>
            <p>Personal</p>
          </div>
        </div>
      </header>

      {/* Create Group Form */}
      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
          className="bg-[#3B3B3B] border border-zinc-700 rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-4 shadow-md shadow-zinc-900/30 m-6"
        >
          <input
            placeholder="Group Name"
            className="border border-zinc-700 bg-zinc-900 text-white placeholder-gray-400 p-2 rounded w-full focus:ring-2 focus:ring-pink-600 outline-none transition"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
         
           <label
        htmlFor="duration"
        className="text-xl">
          Frequency:
        </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="border border-zinc-700 bg-zinc-900 text-white p-2 rounded w-full md:w-1/3 cursor-pointer focus:ring-2 focus:ring-pink-600 outline-none transition"
          >
            <option value={"Daily"}>Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>


        <label
        htmlFor="duration"
        className="text-xl">
          Duration:
        </label>

          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="border border-zinc-700 bg-zinc-900 text-white p-2 rounded w-full md:w-1/3 cursor-pointer focus:ring-2 focus:ring-pink-600 outline-none transition"
          > 
            <option value={"1 Month"}>1 Month</option>
            <option value="3 months">3 Months</option>
            <option value="6 months">6 Months</option>
            <option value="1 year">1 Year</option>
          </select>
            
             <input
             type="number"
            placeholder="Amount to be contributed"
            className="border border-zinc-700 bg-zinc-900 text-white placeholder-gray-400 p-2 rounded w-full focus:ring-2 focus:ring-pink-600 outline-none transition"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            type="submit"
            className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2 rounded-lg transition-all duration-300 shadow hover:shadow-pink-600/30"
          >
            Create
          </button>
        </form>
      )}

      {/* Groups List */}
      <main className="p-6 min-hsc">
        {groups.length === 0 ? (
          <p className="text-gray-400">No groups yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((g, index) => (
              <li
                key={g.id || index}
                className="bg-black border border-zinc-700 rounded-xl overflow-hidden hover:ring-2 hover:ring-green-600 transition-all duration-300 cursor-pointer"
              >
            
                <div className="relative aspect-[3/2] overflow-hidden">
                  <img
                    src={g.avatarUrl}
                    alt={g.name}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent opacity-70" />
                </div>

                {/* Group Info */}
                <div className="p-4 space-y-2">
                  <h2 className="font-semibold text-lg text-white">{g.name}</h2>
                  <div className="flex justify-between text-gray-300 text-sm">
                    <p>Frequency: {g.frequency}</p>
                    <p>Duration: {g.duration}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (g.members.includes(userId)) {
                        router.push(`/group/${g.id}`);
                      } else {
                        joinGroup(g.id);
                      }
                    }}
                    className="mt-2 bg-green-600 hover:bg-pink-700 px-4 py-2 rounded-md text-sm text-white transition"
                  >
                    {g.members.includes(userId) ? "Open Group" : "Join Group"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
