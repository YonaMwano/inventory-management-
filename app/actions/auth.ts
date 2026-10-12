"use server";

import { redirect } from "next/navigation";
import { query, createId, type User } from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
} from "@/lib/auth";

export type AuthState = {
  error?: string;
  success?: string;
};

export async function registerAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!name || name.length < 2) return { error: "Name must be at least 2 characters" };
  if (!email || !email.includes("@")) return { error: "Invalid email" };
  if (!password || password.length < 6) return { error: "Password must be at least 6 characters" };

  try {
    const existing = await query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (existing.rows.length > 0) {
      return { error: "Email already registered" };
    }

    const passwordHash = await hashPassword(password);
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM users`
    );
    const userCount = parseInt(countResult.rows[0]?.count || "0", 10);
    const role = userCount === 0 ? "ADMIN" : "SALES_STAFF";
    const id = createId();

    await query(
      `INSERT INTO users (id, email, "passwordHash", name, role, "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())`,
      [id, email, passwordHash, name, role]
    );

    await createSession(id);
  } catch (e) {
    console.error("Register error:", e);
    return { error: "Registration failed. Make sure the database tables exist in Neon." };
  }

  redirect("/dashboard");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Email and password are required" };

  try {
    const result = await query<User>(
      `SELECT id, email, name, role, "passwordHash", "isActive" FROM users WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];
    if (!user || !user.isActive) {
      return { error: "Invalid email or password" };
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return { error: "Invalid email or password" };
    }

    await createSession(user.id);
  } catch (e) {
    console.error("Login error:", e);
    return { error: "Login failed. Check database connection." };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
