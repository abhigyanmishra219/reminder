import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
}

// Ensure JWT_SECRET exists
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is not defined in .env.local file");
}

export function createToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { 
    expiresIn: '7d' 
  });
}

export function verifyToken(token: string | null | undefined): JwtPayload | null {
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET as string) as JwtPayload;
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return null;
  }
}

export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  return authHeader.trim();
}