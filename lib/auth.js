import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET
);

export async function createSession(user) {
  return await new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    storeId: user.storeId, // ✅ Added
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}