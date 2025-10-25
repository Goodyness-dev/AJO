"use client"
import { useState } from "react";
import React from 'react';
import {registerUser, loginUser} from '../api/api'

const page = () => {
    const[email, setEmail] = useState("")
    const [password, setPassword] =  useState("")
    const [isLogin , setIsLogin] =  useState(true)

    const handleSubmit = async (e: any)=> {
        e.preventDefault()
        const data = { email, password, name: "user"}
        const res = isLogin ? await loginUser(data) : await registerUser(data)
        alert(res.message)
    }

  return (
    <div>
    <form>
        <input type="text"
        placeholder=""
        value={email}
        onChange={(e)=> setEmail(e.target.value)}
        />
    
         <input type="text"
        placeholder=""
        value={password}
        onChange={(e)=> setPassword(e.target.value)}
        />
        <button>
            {isLogin ? "Login": "Register"}
        </button>
        <p onClick={()=> setIsLogin(!isLogin)}>
            {isLogin ? "New here ? Register" : "Already have an account ? Login"  }
        </p>
        </form>  
    </div>
  );
}

export default page;
