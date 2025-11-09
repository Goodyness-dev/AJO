"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
export default function AjoForm() {
    const router = useRouter()
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedin, setIsLoggedin] = useState(false);


  async function handleRegister(e) {
    e.preventDefault();
    try {
      const endpoint = isLoggedin ? "http://localhost:5000/users/login" : "http://localhost:5000/users/register";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();
      if(res.ok){
          router.push('/groups')
    
      localStorage.setItem('user', JSON.stringify(data.user))
      }
    
      return data;
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-black/60 border border-gray-800 backdrop-blur-lg rounded-2xl shadow-lg p-8 flex flex-col items-center gap-6"
      >
        <h2 className="text-3xl font-semibold text-cyan-400 tracking-wide">
          {isLoggedin ? "Welcome Back" : "Join AJO"}
        </h2>

   
        {!isLoggedin && (
          <input
            type="text"
            value={name}
            placeholder="John Doe"
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-900/80 text-white p-4 rounded-xl focus:ring-2 focus:ring-cyan-400 outline-none transition"
          />
        )}

        <input
          type="email"
          value={email}
          placeholder="johndoe@gmail.com"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-900/80 text-white p-4 rounded-xl focus:ring-2 focus:ring-cyan-400 outline-none transition"
        />

        <input
          type="password"
          value={password}
          placeholder="••••••••"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-gray-900/80 text-white p-4 rounded-xl focus:ring-2 focus:ring-cyan-400 outline-none transition"
        />

     
        <button
          type="submit"
          className={`w-full ${
            isLoggedin
              ? "bg-cyan-400 hover:bg-cyan-500"
              : "bg-cyan-300 hover:bg-amber-500"
          } text-black font-semibold py-3 rounded-xl transition-all duration-200 shadow-md`}
        >
          {isLoggedin ? "Log In" : "Sign Up"}
        </button>

        <p className="text-gray-400 text-sm mt-2">
          {isLoggedin ? "Don’t have an account?" : "Already have an account?"}
          <button
            type="button"
            onClick={() => setIsLoggedin(!isLoggedin)}
            className="text-cyan-400 underline ml-2 hover:text-cyan-300"
          >
            {isLoggedin ? "Sign up" : "Log in"}
          </button>
        </p>
      </form>
    </div>
  );
}
