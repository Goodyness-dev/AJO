"use client"
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import {useRouter} from 'next/navigation'
export default function Personal (){
const [groups, setGroups] = useState([])
const [userEmail, setUserEmail] = useState("")
const userdetails = JSON.parse(localStorage.getItem('user'))

useEffect(()=> {
   if(userdetails){
    setUserEmail(userdetails.email)
}
}, [])


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

  const details = groups.filter((g)=> g.members.includes(userEmail))
  const totalContributions = userdetails.wallet.transactions.reduce((sum ,t)=> sum + t.amount, 0)


    return(
        <div className="bg-[#0a0a0a] min-h-screen text-white p-6 md:p-10">
      {/* Header / Avatar Section */}
      <section className="flex items-center gap-5 border-b border-zinc-800 pb-6 mb-8">
      
        <div>
          <h1 className="text-2xl font-semibold">{userdetails.name}</h1>
          <p className="text-gray-400">{userdetails.email}</p>
          <p className="mt-2 text-pink-400 font-semibold">
            Wallet Balance: ₦{userdetails.wallet.balance.toLocaleString()}
          </p>
          <button >Deposit</button>
        </div>
      </section>

      {/* Personal Stats */}
      <section className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-md shadow-zinc-900/40">
          <p className="text-gray-400 mb-1">Total Contributions</p>
          <h2 className="text-2xl font-bold text-pink-500">
            ₦{totalContributions.toLocaleString()}
          </h2>
        </div>

        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-md shadow-zinc-900/40">
          <p className="text-gray-400 mb-1">Groups Joined</p>
          <h2 className="text-2xl font-bold">{details.length}</h2>
        </div>

        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-md shadow-zinc-900/40">
          <p className="text-gray-400 mb-1">Next Payout (Est.)</p>
          <h2 className="text-lg font-semibold text-gray-200">
            Dec 10, 2025
          </h2>
        </div>
      </section>

      {/* Groups Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Ajo Groups</h2>
        {details.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-5 ">
            {details.map((d) => (
              <div
                key={d.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-pink-600 transition-all duration-300 shadow-md shadow-zinc-900/30 mb-12"
              >
                <div className="flex justify-between items-center mt-13">
                  <h3 className="text-lg font-bold">{d.name}</h3>
                  <span className="text-sm text-gray-500">
                    {d.duration} • {d.frequency}
                  </span>
                </div>

                <div className="text-gray-400 space-y-1 mb-3">
                  <p>Total Members: {d.members.length}</p>
                  <p>
                    Total Contributed:{" "}
                    <span className="text-pink-500 font-semibold">
                      ₦{d.totalContributed}
                    </span>
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden mb-3">
                  <div
                    className="bg-pink-600 h-2 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        (d.totalContributed /
                          (d.members.length * d.amount)) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <p className="text-sm text-gray-500">
                  ₦{d.amount} contribution per member
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-10">
            You haven’t joined any groups yet.
          </p>
        )}
      </section>
    </div>
  );

       
    
}