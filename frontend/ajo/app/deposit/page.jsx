"use client"
import React from "react";
import { useState } from "react";

export default function DepositPage(){
    const [amount, setAmount] = useState('')
    const userDetails = JSON.parse(localStorage.getItem('user'))
    const userEmail = userDetails?.email
    async function payment(amount){
            if (!amount || amount <= 0) return alert("Enter a valid amount");
       try{
            const res = await fetch("http://localhost:5000/wallet/deposit", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                email: userEmail,
                amount
            })
        })
        if(!res.ok){
          console.log("omo")
        }

        const data = await res.json()
        
      if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        alert("Payment initialization failed");
        console.error(data);
      }
    }catch(err){
             console.error("Error initializing payment:", err);
    }

    }
    return(

         <div className="bg-[#0a0a0a] min-h-screen flex flex-col justify-center items-center text-white">
      <h1 className="text-2xl mb-4">Deposit Funds</h1>

      <input
        type="number"
        placeholder="Enter amount (₦)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border border-zinc-700 bg-zinc-900 text-white p-2 rounded w-64"
      />

      <button
        onClick={() => payment(amount)}
        className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded mt-4 transition"
      >
        Deposit
      </button>
    </div>
    )
}