import { useEffect, useState } from "react";

export default function WalletPage() {
  const [message, setMessage] = useState("Verifying payment...");
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");

    if (reference) {
      verifyPayment(reference);
    } else {
      setMessage("No payment reference found.");
    }
  }, []);

  async function verifyPayment(reference) {
    try {
      const res = await fetch("http://localhost:5000/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });

      const data = await res.json();

      if (data.data && data.data.status === "success") {
        setMessage("Payment successful ✅");
        updateWalletUI();
      } else {
        setMessage("Payment failed or not verified ❌");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error verifying payment.");
    }
  }

  async function updateWalletUI() {
    const userDetails = JSON.parse(localStorage.getItem("user"));
    const res = await fetch("http://localhost:5000/wallet/balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userDetails.email }),
    });
    const data = await res.json();
    setWallet(data.wallet);
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-2">Wallet</h1>
      <p>{message}</p>
      {wallet && <p>Balance: ₦{wallet.balance}</p>}
    </div>
  );
}
