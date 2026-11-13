import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * JWT Secret Resolution
 * Production enforces a strict, non-fallback secret.
 * Development uses the configured JWT_SECRET or outputs a clear security reminder.
 */
function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[SECURITY FATAL] JWT_SECRET environment variable is missing in production. " +
        "Set a cryptographically strong secret in your environment."
      );
    }
    // Development fallback with clear prefix
    return new TextEncoder().encode("dev_jwt_secret_portfolio_2026_super_secure_key_min32chars");
  }
  return new TextEncoder().encode(secret);
}

const key = getSecretKey();

export const AUTH_COOKIE_NAME = "portfolio_admin_token";

export interface TokenPayload {
  userId: string;
  username: string;
  role?: string;
  mustChangePassword?: boolean;
  [key: string]: unknown;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireAdminSession(): Promise<TokenPayload> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized: Admin session required");
  }
  return session;
}
