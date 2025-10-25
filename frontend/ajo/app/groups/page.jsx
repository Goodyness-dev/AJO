"use client";
import { useEffect, useState } from "react";
import { getGroups, createGroup } from "../api/api.js";

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [duration, setDuration] = useState("3 months");
  const creator = "user1@gmail.com"; // for now

  useEffect(() => {
    getGroups().then(setGroups);
  }, []);

  const handleCreate = async () => {
    const res = await createGroup({ name, frequency, duration, creator });
    alert(res.message);
    getGroups().then(setGroups);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Ajo Groups</h1>

      <div className="mb-4 flex gap-2">
        <input
          placeholder="Group Name"
          className="border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleCreate} className="bg-green-500 text-white px-4 rounded">
          Create
        </button>
      </div>

      <ul>
        {groups.map((g) => (
          <li key={g.id} className="border p-2 mb-2 rounded">
            <strong>{g.name}</strong> — {g.frequency}, {g.duration}
            <br />
            Members: {g.members.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}
