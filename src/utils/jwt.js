import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "jwt-secret-key";

if (!SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export function generateToken(payload) {
  const token = jwt.sign(payload, SECRET, { expiresIn: "1d" });
  return token;
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    console.log("JWT verification error:", err.message);
    return null;
  }
}
