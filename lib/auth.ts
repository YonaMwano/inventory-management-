import { cookies } from "next/headers";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { query, type Role, type User } from "./db";

const scryptAsync = promisify(scrypt);

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

const SESSION_COOKIE = "ims_session";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [salt, key] = stored.split(":");
    if (!salt || !key) return false;
    const derived = (await scryptAsync(password, salt, 64)) as Buffer;
    const keyBuffer = Buffer.from(key, "hex");
    if (keyBuffer.length !== derived.length) return false;
    return timingSafeEqual(derived, keyBuffer);
  } catch {
    return false;
  }
}

export async function createSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function destroySession() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
  } catch {
    // ignore
  }
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get(SESSION_COOKIE)?.value;
    if (!userId) return null;
    if (!process.env.DATABASE_URL) return null;
    const result = await query<User>(
      `SELECT id, email, name, role FROM users WHERE id = $1 AND "isActive" = true`,
      [userId]
    );
    if (!result.rows.length) return null;
    const u = result.rows[0];
    return { id: u.id, email: u.email, name: u.name, role: u.role };
  } catch (e) {
    console.error("getSession error:", e);
    return null;
  }
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export function canAccess(role: Role, allowed: Role[]) {
  if (role === "ADMIN") return true;
  return allowed.includes(role);
}

