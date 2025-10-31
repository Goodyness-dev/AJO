import React from 'react';
const HeaderComponent = () => {
  return (
     <header className="bg-black text-gray-400 border-b border-gray-800">
      
    <div className="flex justify-between p-2">
      <h1 className="text-6xl text-gray-400">AJO</h1>

      <div className="text-3xl border border-gray-400 rounded-2xl p-4 text-gray-500">
        Sign up
      </div>
    </div>
   </header>
  );
}

export default HeaderComponent;
