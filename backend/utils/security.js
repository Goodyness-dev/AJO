import crypto from "crypto";

// Simple password hashing (SHA-256)
export function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Fake JWT-like token generator
export function generateToken(email) {
  const payload = {
    email,
    exp: Date.now() + 1000 * 60 * 60 * 2 // 2 hours expiry
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

// Token verification
export function verifyToken(token) {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
    if (Date.now() > decoded.exp) return null; // expired
    return decoded.email;
  } catch (err) {
    return null;
  }
}
